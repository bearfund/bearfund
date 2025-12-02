import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { type AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  useGameQuery,
  useGamesQuery,
  useGameAction,
  useConcedeGame,
  useGameOptions,
} from './useGame';
import type {
  Game,
  GameListItem,
  SubmitActionRequest,
  PaginatedResponse,
  ErrorResponse,
} from '../../types';

describe('useGame hooks', () => {
  let apiClient: AxiosInstance;
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    apiClient = axios.create({ baseURL: 'http://localhost/api' });
    mock = new MockAdapter(apiClient);
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
    vi.clearAllMocks();
  });

  const mockGame: Game = {
    ulid: '01HQ5X9K3G2YM4N6P7Q8R9S0T1',
    game_title: 'connect-four',
    status: 'active',
    turn_number: 5,
    winner_id: null,
    players: [
      {
        ulid: '01J3PLY1...',
        username: 'player1',
        name: 'Player One',
        position_id: 0,
        color: 'red',
        avatar: 'https://cdn.gamerprotocol.io/avatars/player1.jpg',
      },
      {
        ulid: '01J3PLY2...',
        username: 'player2',
        name: 'Player Two',
        position_id: 1,
        color: 'yellow',
        avatar: 'https://cdn.gamerprotocol.io/avatars/player2.jpg',
      },
    ],
    game_state: {
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
      ],
      move_count: 5,
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockPaginationLinks = {
    first: 'http://localhost/api/v1/resource?page=1',
    last: 'http://localhost/api/v1/resource?page=1',
    prev: null,
    next: null,
  };

  describe('useGameQuery', () => {
    test('fetches game successfully', async () => {
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1').reply(200, { data: mockGame });

      const { result } = renderHook(() => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockGame);
      expect(result.current.data?.status).toBe('active');
      expect(result.current.data?.players).toHaveLength(2);
    });

    test('handles 404 for non-existent game', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Game not found',
        errors: undefined,
      };
      mock.onGet('/games/invalid-ulid').reply(404, errorResponse);

      const { result } = renderHook(() => useGameQuery(apiClient, 'invalid-ulid'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 404');
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1', { enabled: false }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });

    test('uses correct query key for caching', async () => {
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1').reply(200, { data: mockGame });

      const { result: result1 } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      const { result: result2 } = renderHook(
        () => useGameQuery(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result2.current.data).toEqual(mockGame);
      expect(mock.history.get.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('useGamesQuery', () => {
    test('fetches games list successfully', async () => {
      const mockResponse: PaginatedResponse<GameListItem> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
      expect(result.current.data?.data[0]).toEqual(mockGame);
      expect(result.current.data?.meta.total).toBe(1);
    });

    test('supports status filter parameter', async () => {
      const mockResponse: PaginatedResponse<GameListItem> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: 1,
          to: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games', { params: { status: 'active' } }).reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient, { status: 'active' }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mock.history.get[0].params).toEqual({ status: 'active' });
    });

    test('supports pagination parameters', async () => {
      const mockResponse: PaginatedResponse<GameListItem> = {
        data: [mockGame],
        links: mockPaginationLinks,
        meta: {
          current_page: 2,
          from: 11,
          to: 11,
          per_page: 10,
          total: 11,
          last_page: 2,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient, { page: 2, per_page: 10 }), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.meta.current_page).toBe(2);
      expect(mock.history.get[0].params).toEqual({ page: 2, per_page: 10 });
    });

    test('handles empty games list', async () => {
      const mockResponse: PaginatedResponse<GameListItem> = {
        data: [],
        links: mockPaginationLinks,
        meta: {
          current_page: 1,
          from: null,
          to: null,
          per_page: 10,
          total: 0,
          last_page: 1,
          path: '/games',
        },
      };
      mock.onGet('/games').reply(200, mockResponse);

      const { result } = renderHook(() => useGamesQuery(apiClient), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(0);
      expect(result.current.data?.meta.total).toBe(0);
    });
  });

  describe('useGameAction', () => {
    test('submits action successfully', async () => {
      const updatedGame = { ...mockGame, current_turn: '01J3PLY2' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(200, { data: updatedGame });

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action_type: 'DROP_PIECE',
        action_details: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toEqual(updatedGame);
      expect(mock.history.post[0].data).toBe(JSON.stringify(actionRequest));
    });

    test('invalidates game query on success', async () => {
      const updatedGame = { ...mockGame, current_turn: '01J3PLY2' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(200, { data: updatedGame });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action_type: 'DROP_PIECE',
        action_details: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['game', '01HQ5X9K3G2YM4N6P7Q8R9S0T1'],
      });
    });

    test('handles invalid action error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Invalid action',
        errors: { action_type: ['Action not allowed in current state'] },
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(400, errorResponse);

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action_type: 'INVALID_ACTION',
        action_details: {},
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 400');
    });

    test('handles not your turn error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Not your turn',
        errors: undefined,
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/actions').reply(403, errorResponse);

      const { result } = renderHook(() => useGameAction(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      const actionRequest: SubmitActionRequest = {
        action_type: 'DROP_PIECE',
        action_details: { column: 3 },
      };

      result.current.mutate(actionRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 403');
    });
  });

  describe('useConcedeGame', () => {
    test('concedes game successfully', async () => {
      const mockResponse = {
        message: 'Game conceded successfully',
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(200, mockResponse);

      const { result } = renderHook(() => useConcedeGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.message).toBe('Game conceded successfully');
    });

    test('invalidates game query on concede', async () => {
      const mockResponse = { message: 'Game conceded successfully' };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(200, mockResponse);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useConcedeGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['game', '01HQ5X9K3G2YM4N6P7Q8R9S0T1'],
      });
    });

    test('handles already completed game error', async () => {
      const errorResponse: ErrorResponse = {
        message: 'Game already completed',
        errors: undefined,
      };
      mock.onPost('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/concede').reply(400, errorResponse);

      const { result } = renderHook(() => useConcedeGame(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Request failed with status code 400');
    });
  });

  describe('useGameOptions', () => {
    test('fetches game options successfully', async () => {
      const mockOptions = {
        valid_actions: ['place_piece', 'forfeit'],
        valid_columns: [0, 1, 2, 3, 4, 5, 6],
      };
      mock.onGet('/games/01HQ5X9K3G2YM4N6P7Q8R9S0T1/options').reply(200, { data: mockOptions });

      const { result } = renderHook(() => useGameOptions(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOptions);
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(
        () => useGameOptions(apiClient, '01HQ5X9K3G2YM4N6P7Q8R9S0T1', { enabled: false }),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          ),
        }
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mock.history.get.length).toBe(0);
    });
  });
});
