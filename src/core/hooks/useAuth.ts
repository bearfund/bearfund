import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  AuthStorage,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  VerifyRequest,
  UpdateProfileRequest,
} from '../../types/auth.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * Authentication hooks for GamerProtocol API
 *
 * Provides React Query hooks for authentication operations including:
 * - Login (email/password and social)
 * - Registration and email verification
 * - User profile management
 * - Logout with cache clearing
 *
 * All hooks automatically handle token storage via the provided AuthStorage
 * implementation and invalidate relevant queries on success.
 *
 * @example
 * ```typescript
 * const { mutate: login, isLoading } = useLogin(apiClient, authStorage);
 * login({ email: 'user@example.com', password: 'pass123' });
 * ```
 */

/**
 * Login hook using email and password
 *
 * Authenticates user with email/password credentials and stores the
 * authentication token automatically.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param authStorage - Token storage implementation
 * @returns React Query mutation for login operation
 *
 * @example
 * ```typescript
 * const { mutate: login, isLoading, error } = useLogin(apiClient, authStorage);
 *
 * login(
 *   { email: 'user@example.com', password: 'SecurePass123!' },
 *   {
 *     onSuccess: (data) => console.log('Logged in:', data.user),
 *     onError: (error) => console.error('Login failed:', error.message)
 *   }
 * );
 * ```
 */
export function useLogin(apiClient: AxiosInstance, authStorage: AuthStorage) {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ErrorResponse, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      await authStorage.setToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Social login hook for OAuth providers
 *
 * Authenticates user with social provider access token (Google, Apple, Twitter, etc.)
 * and stores the authentication token automatically.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param authStorage - Token storage implementation
 * @returns React Query mutation for social login operation
 *
 * @example
 * ```typescript
 * const { mutate: socialLogin } = useSocialLogin(apiClient, authStorage);
 *
 * // After obtaining access token from OAuth provider
 * socialLogin({
 *   provider: 'google',
 *   access_token: 'ya29.a0AfH6SMBx...'
 * });
 * ```
 */
export function useSocialLogin(apiClient: AxiosInstance, authStorage: AuthStorage) {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ErrorResponse, SocialLoginRequest>({
    mutationFn: async (credentials: SocialLoginRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/social', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      await authStorage.setToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * User registration hook
 *
 * Creates a pending registration and sends verification email. Does not
 * return a token - user must verify email via useVerifyEmail hook.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for registration operation
 *
 * @example
 * ```typescript
 * const { mutate: register, isLoading } = useRegister(apiClient);
 *
 * register({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
 *   password_confirmation: 'SecurePass123!',
 *   name: 'John Doe'
 * });
 * ```
 */
export function useRegister(apiClient: AxiosInstance) {
  return useMutation<{ message: string }, ErrorResponse, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<{ message: string }>('/auth/register', data);
      return response.data;
    },
  });
}

/**
 * Email verification hook
 *
 * Validates email verification token, creates user account, and returns
 * authentication token which is stored automatically.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param authStorage - Token storage implementation
 * @returns React Query mutation for email verification operation
 *
 * @example
 * ```typescript
 * const { mutate: verify } = useVerifyEmail(apiClient, authStorage);
 *
 * // After user clicks verification link and you extract the token
 * verify({
 *   token: 'verification-token-from-email'
 * });
 * ```
 */
export function useVerifyEmail(apiClient: AxiosInstance, authStorage: AuthStorage) {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ErrorResponse, VerifyRequest>({
    mutationFn: async (data: VerifyRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/verify', data);
      return response.data;
    },
    onSuccess: async (data) => {
      await authStorage.setToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Logout hook
 *
 * Revokes current API token on server, clears local token storage, and
 * resets all cached queries to ensure clean logout state.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param authStorage - Token storage implementation
 * @returns React Query mutation for logout operation
 *
 * @example
 * ```typescript
 * const { mutate: logout } = useLogout(apiClient, authStorage);
 *
 * logout(undefined, {
 *   onSuccess: () => {
 *     // All queries cleared, token removed
 *     navigate('/login');
 *   }
 * });
 * ```
 */
export function useLogout(apiClient: AxiosInstance, authStorage: AuthStorage) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>('/auth/logout');
      return response.data;
    },
    onSuccess: async () => {
      await authStorage.clearToken();
      queryClient.clear();
    },
  });
}

/**
 * Current user query hook
 *
 * Fetches the currently authenticated user's profile information.
 * This query is automatically invalidated after login, social login,
 * email verification, and profile updates.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for current user data
 *
 * @example
 * ```typescript
 * const { data: user, isLoading, error } = useUserQuery(apiClient);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 *
 * @example Platform-specific usage (React Native)
 * ```typescript
 * // Only fetch user if token exists
 * const { data: user } = useUserQuery(apiClient, {
 *   enabled: !!token
 * });
 * ```
 */
export function useUserQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<User, ErrorResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/user');
      return response.data;
    },
    ...options,
  });
}

/**
 * Profile update hook
 *
 * Updates the currently authenticated user's profile information and
 * automatically invalidates the user query to reflect changes.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for profile update operation
 *
 * @example
 * ```typescript
 * const { mutate: updateProfile, isLoading } = useUpdateProfile(apiClient);
 *
 * updateProfile({
 *   name: 'Johnny Doe',
 *   bio: 'Professional esports player',
 *   social_links: {
 *     twitter: 'https://twitter.com/johnnydoe'
 *   }
 * });
 * ```
 */
export function useUpdateProfile(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<User, ErrorResponse, UpdateProfileRequest>({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.patch<User>('/auth/user', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
