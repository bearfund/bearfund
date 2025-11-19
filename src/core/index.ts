/**
 * Core barrel file
 *
 * Re-exports all platform-agnostic core functionality including
 * API client, authentication hooks, and utilities.
 *
 * @packageDocumentation
 */

/**
 * API Client
 */
export { setupAPIClient } from './api';

/**
 * Authentication Hooks
 */
export {
  useLogin,
  useSocialLogin,
  useRegister,
  useVerifyEmail,
  useLogout,
  useUserQuery,
  useUpdateProfile,
} from './hooks';

// TODO: Export game hooks, billing hooks, realtime utilities
