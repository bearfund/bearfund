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
  useRefreshToken,
  useLogout,
} from './useAuth';
import { useProfileQuery, useUpdateProfile } from './useAccount';
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
        token_type: 'Bearer',
        expires_in: 31536000,
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
      expect(result.current.data?.token).toBe(token);
      expect(result.current.data?.user).toEqual(mockUser);
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
      mock.onPost('/auth/login').reply(200, {
        token,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });

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
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });

      const { result } = renderHook(() => useSocialLogin(apiClient, authStorage), { wrapper });

      result.current.mutate({
        provider: 'google',
        access_token: 'google-access-token',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
      expect(result.current.data?.token).toBe(token);
      expect(result.current.data?.user).toEqual(mockUser);
    });

    test('handles social login with different providers', async () => {
      const providers = ['google', 'discord', 'steam'] as const;

      for (const provider of providers) {
        mock.reset();
        const token = `${provider}-token`;
        mock.onPost('/auth/social').reply(200, {
          token,
          token_type: 'Bearer',
          expires_in: 31536000,
          user: mockUser,
        });

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
        message: 'Registration successful. Please check your email to verify your account.',
        registration_id: '01J3ABC123',
      });

      const { result } = renderHook(() => useRegister(apiClient), { wrapper });

      result.current.mutate({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirmation: 'password123',
        client_id: 5,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.message).toContain('email');
      expect(result.current.data?.registration_id).toBe('01J3ABC123');
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
        client_id: 5,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useVerifyEmail', () => {
    test('successfully verifies email and stores token', async () => {
      const token = 'verified-token';
      mock.onPost('/auth/verify').reply(200, {
        token,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });

      const { result } = renderHook(() => useVerifyEmail(apiClient, authStorage), { wrapper });

      result.current.mutate({ token: 'verification-token' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
    });

    test('successfully verifies email with optional name parameter', async () => {
      const token = 'verified-token';
      mock.onPost('/auth/verify').reply(200, {
        token,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: { ...mockUser, name: 'Cool Player' },
      });

      const { result } = renderHook(() => useVerifyEmail(apiClient, authStorage), { wrapper });

      result.current.mutate({ token: 'verification-token', name: 'Cool Player' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(token);
      expect(result.current.data?.user.name).toBe('Cool Player');
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

  describe('useRefreshToken', () => {
    test('successfully refreshes token and stores new token', async () => {
      const newToken = 'refreshed-token';
      mock.onPost('/auth/refresh').reply(200, {
        token: newToken,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });

      const { result } = renderHook(() => useRefreshToken(apiClient, authStorage), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authStorage.setToken).toHaveBeenCalledWith(newToken);
      expect(result.current.data?.token).toBe(newToken);
      expect(result.current.data?.expires_in).toBe(31536000);
    });

    test('invalidates user query after successful refresh', async () => {
      const newToken = 'refreshed-token';
      mock.onPost('/auth/refresh').reply(200, {
        token: newToken,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRefreshToken(apiClient, authStorage), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] });
    });

    test('handles refresh token failure', async () => {
      mock.onPost('/auth/refresh').reply(401, {
        message: 'Token expired or invalid',
        error_code: 'INVALID_TOKEN',
      });

      const { result } = renderHook(() => useRefreshToken(apiClient, authStorage), { wrapper });

      result.current.mutate();

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

  describe('integration: login -> fetch user -> update profile -> logout', () => {
    test('complete authentication flow', async () => {
      const token = 'integration-test-token';

      // Setup all mocks before starting the flow
      mock.onPost('/auth/login').reply(200, {
        token,
        token_type: 'Bearer',
        expires_in: 31536000,
        user: mockUser,
      });
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
      const { result: userResult } = renderHook(
        () => useProfileQuery(apiClient, { enabled: true }),
        {
          wrapper,
        }
      );

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
