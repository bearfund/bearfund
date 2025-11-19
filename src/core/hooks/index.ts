/**
 * Hooks barrel file
 *
 * Re-exports all React Query hooks.
 *
 * @packageDocumentation
 */

/**
 * Authentication Hooks
 *
 * React Query hooks for GamerProtocol API authentication operations.
 * All hooks automatically handle token storage and cache management.
 */
export {
  useLogin,
  useSocialLogin,
  useRegister,
  useVerifyEmail,
  useLogout,
  useUserQuery,
  useUpdateProfile,
} from './useAuth';

// TODO: Will export useGames, useBilling, etc.
