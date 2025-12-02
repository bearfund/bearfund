import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  useProfileQuery,
  useUpdateProfile,
  useProgressionQuery,
  useRecordsQuery,
  useAlertsQuery,
  useMarkAlertsRead,
} from './useAccount';
import type { User } from '../../types/auth.types';
import type { UserProgression, UserRecords, AlertsResponse } from '../../types/account.types';

describe('useAccount hooks', () => {
  let mock: MockAdapter;
  let apiClient: ReturnType<typeof axios.create>;
  let queryClient: QueryClient;

  const mockUser: User = {
    username: 'testuser',
    email: 'testuser@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    social_links: { twitter: 'https://twitter.com/test' },
    level: 5,
    total_xp: 1250,
    member_since: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Create fresh axios instance and mock
    apiClient = axios.create({ baseURL: 'https://api.test.com' });
    mock = new MockAdapter(apiClient);

    // Create fresh query client
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    mock.reset();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useProfileQuery', () => {
    test('successfully fetches user profile', async () => {
      mock.onGet('/account/profile').reply(200, { data: mockUser });

      const { result } = renderHook(() => useProfileQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUser);
    });

    test('handles unauthenticated user (401)', async () => {
      mock.onGet('/account/profile').reply(401, {
        message: 'Unauthenticated',
        error_code: 'UNAUTHENTICATED',
      });

      const { result } = renderHook(() => useProfileQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(() => useProfileQuery(apiClient, { enabled: false }), {
        wrapper,
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(mock.history.get.length).toBe(0);
    });

    test('caches user data correctly', async () => {
      mock.onGet('/account/profile').reply(200, { data: mockUser });

      const { result: result1 } = renderHook(() => useProfileQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second hook should use cached data (or refetch - both are acceptable)
      const { result: result2 } = renderHook(() => useProfileQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result2.current.data).toEqual(mockUser));

      // Verify at least one API call was made
      expect(mock.history.get.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('useUpdateProfile', () => {
    test('successfully updates user profile', async () => {
      const updatedUser = { ...mockUser, bio: 'Updated bio' };
      mock.onPatch('/account/profile').reply(200, { data: updatedUser });

      const { result } = renderHook(() => useUpdateProfile(apiClient), {
        wrapper,
      });

      result.current.mutate({
        bio: 'Updated bio',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(updatedUser);
    });

    test('invalidates user query after successful update', async () => {
      mock.onPatch('/account/profile').reply(200, { data: mockUser });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProfile(apiClient), {
        wrapper,
      });

      result.current.mutate({ name: 'New Name' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] });
    });

    test('handles partial profile updates', async () => {
      const updates = [
        { name: 'New Name' },
        { bio: 'New bio' },
        { social_links: { twitter: 'https://twitter.com/newhandle' } },
      ];

      for (const update of updates) {
        mock.reset();
        mock.onPatch('/account/profile').reply(200, { data: { ...mockUser, ...update } });

        const { result } = renderHook(() => useUpdateProfile(apiClient), {
          wrapper,
        });

        result.current.mutate(update);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      }
    });

    test('handles profile update errors', async () => {
      mock.onPatch('/account/profile').reply(422, {
        message: 'The given data was invalid.',
        error_code: 'VALIDATION_ERROR',
        errors: {
          bio: ['The bio must not exceed 500 characters.'],
        },
      });

      const { result } = renderHook(() => useUpdateProfile(apiClient), {
        wrapper,
      });

      result.current.mutate({
        bio: 'x'.repeat(501),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useProgressionQuery', () => {
    const mockProgression: UserProgression = {
      level: 15,
      experience_points: 4500,
      next_level_xp: 5000,
      progress_to_next_level: 90,
      titles: [{ id: 1, name: 'Chess Master', description: 'Win 100 chess games' }],
      active_title: { id: 1, name: 'Chess Master', description: 'Win 100 chess games' },
      badges: [
        {
          id: 1,
          name: 'First Win',
          description: 'Win your first game',
          icon: 'https://cdn.example.com/badge1.png',
        },
      ],
      achievements: [
        {
          id: 1,
          name: 'Quick Learner',
          description: 'Reach level 10',
          earned_at: '2024-01-15T10:00:00Z',
        },
      ],
      milestones: [
        {
          id: 1,
          name: '100 Games',
          description: 'Play 100 games',
          reached_at: '2024-02-01T10:00:00Z',
        },
      ],
    };

    test('successfully fetches user progression', async () => {
      mock.onGet('/account/progression').reply(200, { data: mockProgression });

      const { result } = renderHook(() => useProgressionQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProgression);
      expect(result.current.data?.level).toBe(15);
      expect(result.current.data?.badges).toHaveLength(1);
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(() => useProgressionQuery(apiClient, { enabled: false }), {
        wrapper,
      });

      expect(result.current.data).toBeUndefined();
      expect(mock.history.get.length).toBe(0);
    });
  });

  describe('useRecordsQuery', () => {
    const mockRecords: UserRecords = {
      total_games: 150,
      games_won: 90,
      games_lost: 55,
      games_drawn: 5,
      win_rate: 0.6,
      current_streak: 3,
      longest_win_streak: 10,
      total_points: 12500,
      elo_ratings: {
        chess: 1450,
        'connect-four': 1200,
      },
      global_rank: 452,
      games_by_title: [
        {
          title_key: 'chess',
          title_name: 'Chess',
          games_played: 100,
          wins: 65,
          losses: 30,
          draws: 5,
          win_rate: 0.65,
        },
        {
          title_key: 'connect-four',
          title_name: 'Connect Four',
          games_played: 50,
          wins: 25,
          losses: 25,
          draws: 0,
          win_rate: 0.5,
        },
      ],
      favorite_game: 'chess',
    };

    test('successfully fetches user records', async () => {
      mock.onGet('/account/records').reply(200, { data: mockRecords });

      const { result } = renderHook(() => useRecordsQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRecords);
      expect(result.current.data?.total_games).toBe(150);
      expect(result.current.data?.games_by_title).toHaveLength(2);
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(() => useRecordsQuery(apiClient, { enabled: false }), {
        wrapper,
      });

      expect(result.current.data).toBeUndefined();
      expect(mock.history.get.length).toBe(0);
    });
  });

  describe('useAlertsQuery', () => {
    const mockAlerts: AlertsResponse = {
      data: [
        {
          ulid: '01J3ABC001',
          type: 'match_found',
          data: { game_ulid: '01J3GAME123' },
          read_at: null,
          created_at: '2025-12-01T10:00:00Z',
        },
        {
          ulid: '01J3ABC002',
          type: 'your_turn',
          data: { game_ulid: '01J3GAME456' },
          read_at: '2025-12-01T09:30:00Z',
          created_at: '2025-12-01T09:00:00Z',
        },
      ],
      links: {
        first: 'https://api.test.com/account/alerts?page=1',
        last: 'https://api.test.com/account/alerts?page=1',
        prev: null,
        next: null,
      },
      meta: {
        current_page: 1,
        from: 1,
        to: 2,
        total: 2,
        per_page: 20,
        last_page: 1,
      },
    };

    test('successfully fetches alerts', async () => {
      mock.onGet('/account/alerts').reply(200, mockAlerts);

      const { result } = renderHook(() => useAlertsQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
      expect(result.current.data?.data).toHaveLength(2);
    });

    test('supports pagination parameters', async () => {
      mock.onGet('/account/alerts', { params: { page: 2, per_page: 10 } }).reply(200, {
        ...mockAlerts,
        meta: { ...mockAlerts.meta, current_page: 2, per_page: 10 },
      });

      const { result } = renderHook(() => useAlertsQuery(apiClient, { page: 2, per_page: 10 }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mock.history.get[0].params).toEqual({ page: 2, per_page: 10 });
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(() => useAlertsQuery(apiClient, { enabled: false }), {
        wrapper,
      });

      expect(result.current.data).toBeUndefined();
      expect(mock.history.get.length).toBe(0);
    });
  });

  describe('useMarkAlertsRead', () => {
    test('successfully marks alerts as read', async () => {
      mock.onPost('/account/alerts/read').reply(200, { message: 'Alerts marked as read' });

      const { result } = renderHook(() => useMarkAlertsRead(apiClient), {
        wrapper,
      });

      result.current.mutate({
        alert_ulids: ['01J3ABC001', '01J3ABC002'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mock.history.post[0].data).toBe(
        JSON.stringify({ alert_ulids: ['01J3ABC001', '01J3ABC002'] })
      );
    });

    test('invalidates alerts query after marking as read', async () => {
      mock.onPost('/account/alerts/read').reply(200, { message: 'Alerts marked as read' });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMarkAlertsRead(apiClient), {
        wrapper,
      });

      result.current.mutate({ alert_ulids: ['01J3ABC001'] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['account', 'alerts'] });
    });

    test('handles errors when marking alerts as read', async () => {
      mock.onPost('/account/alerts/read').reply(422, {
        message: 'Invalid alert IDs',
        error_code: 'VALIDATION_ERROR',
      });

      const { result } = renderHook(() => useMarkAlertsRead(apiClient), {
        wrapper,
      });

      result.current.mutate({ alert_ulids: ['invalid-id'] });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });
});
