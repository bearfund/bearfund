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
export { useLogin, useSocialLogin, useRegister, useVerifyEmail, useLogout } from './useAuth';

export {
  useProfileQuery,
  useUpdateProfile,
  useProgressionQuery,
  useRecordsQuery,
  useAlertsQuery,
  useMarkAlertsRead,
} from './useAccount';

/**
 * System & Library Hooks
 *
 * React Query hooks for system health, configuration, feedback, and game library.
 */
export {
  useHealthQuery,
  useTimeQuery,
  useConfigQuery,
  useSubmitFeedback,
  useLibraryQuery,
  useGameTitleQuery,
  useGameRulesQuery,
  useGameEntitiesQuery,
} from './useSystem';

/**
 * Game Management Hooks
 *
 * React Query hooks for game operations, lobbies, matchmaking, and rematch.
 * All query hooks disable automatic refetching - use real-time hooks for live updates.
 */
export {
  useGameQuery,
  useGamesQuery,
  useGameOptions,
  useGameAction,
  useForfeitGame,
  useLobbiesQuery,
  useLobbyQuery,
  useCreateLobby,
  useJoinLobby,
  useRemoveLobbyPlayer,
  useDeleteLobby,
  useStartReadyCheck,
  useJoinQuickplay,
  useLeaveQuickplay,
  useRequestRematch,
  useAcceptRematch,
  useDeclineRematch,
} from './useGame';

/**
 * Billing & Subscription Hooks
 *
 * React Query hooks for subscription management and platform-specific billing.
 */
export {
  usePlansQuery,
  useSubscriptionStatus,
  useQuotas,
  useSubscribe,
  useCustomerPortal,
  useVerifyAppleReceipt,
  useVerifyGoogleReceipt,
  useVerifyTelegramReceipt,
} from './useBilling';
