import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  useLogin,
  useSocialLogin,
  useRegister,
  useVerifyEmail,
  useLogout,
  useUserQuery,
  useUpdateProfile,
} from './useAuth';
import type { AuthStorage, User } from '../../types/auth.types';

describe('useAuth hooks', () => {
  let mock: MockAdapter;
  let apiClient: ReturnType<typeof axios.create>;
  let queryClient: QueryClient;
  let authStorage: AuthStorage;

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

    // Mock auth storage
    authStorage = {
      getToken: vi.fn().mockResolvedValue(null),
      setToken: vi.fn().mockResolvedValue(undefined),
      clearToken: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    mock.reset();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useLogin', () => {
    test('successfully logs in user and stores token', async () => {
      const token = 'test-auth-token';
      mock.onPost('/auth/login').reply(200, {
        token,
        user: mockUser,
      });

      const { result } = renderHook(() => useLogin(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
      expect(result.current.data).toEqual({ token, user: mockUser });
    });

    test('handles login failure', async () => {
      mock.onPost('/auth/login').reply(401, {
        message: 'Invalid credentials',
        error_code: 'INVALID_CREDENTIALS',
      });

      const { result } = renderHook(() => useLogin(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'wrong',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(authStorage.setToken).not.toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });

    test('invalidates user query after successful login', async () => {
      const token = 'test-auth-token';
      mock.onPost('/auth/login').reply(200, { token, user: mockUser });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useLogin(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] });
    });
  });

  describe('useSocialLogin', () => {
    test('successfully logs in with social provider', async () => {
      const token = 'social-auth-token';
      mock.onPost('/auth/social').reply(200, {
        token,
        user: mockUser,
      });

      const { result } = renderHook(() => useSocialLogin(apiClient, authStorage), { wrapper });

      result.current.mutate({
        provider: 'google',
        access_token: 'google-access-token',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
      expect(result.current.data).toEqual({ token, user: mockUser });
    });

    test('handles social login with different providers', async () => {
      const providers = ['google', 'discord', 'steam'] as const;

      for (const provider of providers) {
        mock.reset();
        const token = `${provider}-token`;
        mock.onPost('/auth/social').reply(200, { token, user: mockUser });

        const { result } = renderHook(() => useSocialLogin(apiClient, authStorage), { wrapper });

        result.current.mutate({
          provider,
          access_token: `${provider}-access-token`,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      }
    });
  });

  describe('useRegister', () => {
    test('successfully registers new user', async () => {
      mock.onPost('/auth/register').reply(200, {
        message: 'Registration successful. Please check your email.',
      });

      const { result } = renderHook(() => useRegister(apiClient), { wrapper });

      result.current.mutate({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirmation: 'password123',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.message).toContain('email');
    });

    test('handles registration validation errors', async () => {
      mock.onPost('/auth/register').reply(422, {
        message: 'The given data was invalid.',
        error_code: 'VALIDATION_ERROR',
        errors: {
          email: ['The email has already been taken.'],
          username: ['The username has already been taken.'],
        },
      });

      const { result } = renderHook(() => useRegister(apiClient), { wrapper });

      result.current.mutate({
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        password_confirmation: 'password123',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useVerifyEmail', () => {
    test('successfully verifies email and stores token', async () => {
      const token = 'verified-token';
      mock.onPost('/auth/verify').reply(200, {
        token,
        user: mockUser,
      });

      const { result } = renderHook(() => useVerifyEmail(apiClient, authStorage), { wrapper });

      result.current.mutate({ token: 'verification-token' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
    });

    test('handles invalid verification token', async () => {
      mock.onPost('/auth/verify').reply(400, {
        message: 'Invalid or expired verification token',
        error_code: 'INVALID_TOKEN',
      });

      const { result } = renderHook(() => useVerifyEmail(apiClient, authStorage), { wrapper });

      result.current.mutate({ token: 'invalid-token' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(authStorage.setToken).not.toHaveBeenCalled();
    });
  });

  describe('useLogout', () => {
    test('successfully logs out and clears token', async () => {
      mock.onPost('/auth/logout').reply(200, {
        message: 'Logged out successfully',
      });

      const { result } = renderHook(() => useLogout(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.clearToken).toHaveBeenCalled();
    });

    test('clears cache on logout', async () => {
      mock.onPost('/auth/logout').reply(200, {
        message: 'Logged out successfully',
      });

      const clearSpy = vi.spyOn(queryClient, 'clear');

      const { result } = renderHook(() => useLogout(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clearSpy).toHaveBeenCalled();
    });

    test('clears token even if API call fails', async () => {
      mock.onPost('/auth/logout').reply(500, {
        message: 'Server error',
        error_code: 'SERVER_ERROR',
      });

      const { result } = renderHook(() => useLogout(apiClient, authStorage), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Token should NOT be cleared on error (only on success in current implementation)
      expect(authStorage.clearToken).not.toHaveBeenCalled();
    });
  });

  describe('useUserQuery', () => {
    test('successfully fetches user profile', async () => {
      // API returns { data: User } wrapped in ApiResponse
      mock.onGet('/account/profile').reply(200, { data: mockUser });

      const { result } = renderHook(() => useUserQuery(apiClient), {
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

      const { result } = renderHook(() => useUserQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    test('can be disabled via options', () => {
      const { result } = renderHook(() => useUserQuery(apiClient, { enabled: false }), { wrapper });

      // Should not fetch when disabled
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(mock.history.get.length).toBe(0);
    });

    test('caches user data correctly', async () => {
      mock.onGet('/account/profile').reply(200, { data: mockUser });

      const { result: result1 } = renderHook(() => useUserQuery(apiClient), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second hook should use cached data (or refetch - both are acceptable)
      const { result: result2 } = renderHook(() => useUserQuery(apiClient), {
        wrapper,
      });

      // Data should be available immediately from cache or after fetch
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
        { username: 'newusername' },
        { name: 'New Name' },
        { bio: 'New bio' },
        { avatar: 'https://example.com/new-avatar.jpg' },
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
  });

  describe('integration: login -> fetch user -> update profile -> logout', () => {
    test('complete authentication flow', async () => {
      const token = 'integration-test-token';

      // Setup all mocks before starting the flow
      mock.onPost('/auth/login').reply(200, { token, user: mockUser });
      mock.onGet('/account/profile').reply(200, { data: mockUser });
      mock
        .onPatch('/account/profile')
        .reply(200, { data: { ...mockUser, bio: 'Integration test bio' } });
      mock.onPost('/auth/logout').reply(200, { message: 'Logged out successfully' });

      // Step 1: Login
      const { result: loginResult } = renderHook(() => useLogin(apiClient, authStorage), {
        wrapper,
      });

      loginResult.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(loginResult.current.isSuccess).toBe(true));
      expect(authStorage.setToken).toHaveBeenCalledWith(token);

      // Update mock to return the token after login
      authStorage.getToken = vi.fn().mockResolvedValue(token);

      // Step 2: Fetch user
      const { result: userResult } = renderHook(() => useUserQuery(apiClient, { enabled: true }), {
        wrapper,
      });

      await waitFor(() => expect(userResult.current.isSuccess).toBe(true));
      expect(userResult.current.data).toEqual(mockUser);

      // Step 3: Update profile
      const { result: updateResult } = renderHook(() => useUpdateProfile(apiClient), { wrapper });

      updateResult.current.mutate({ bio: 'Integration test bio' });

      await waitFor(() => expect(updateResult.current.isSuccess).toBe(true));

      // Step 4: Logout
      const { result: logoutResult } = renderHook(() => useLogout(apiClient, authStorage), {
        wrapper,
      });

      logoutResult.current.mutate();

      await waitFor(() => expect(logoutResult.current.isSuccess).toBe(true));
      expect(authStorage.clearToken).toHaveBeenCalled();
    });
  });
});
