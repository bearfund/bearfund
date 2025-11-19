/**
 * Core barrel file
 *
 * Re-exports all platform-agnostic core functionality including
 * API client, authentication hooks, game hooks, and billing hooks.
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

/**
 * Game Management Hooks
 */
export {
  useGameQuery,
  useGamesQuery,
  useGameOptions,
  useGameHistory,
  useGameAction,
  useForfeitGame,
  useLobbiesQuery,
  useLobbyQuery,
  useCreateLobby,
  useJoinLobby,
  useUpdateLobbyPlayer,
  useRemoveLobbyPlayer,
  useDeleteLobby,
  useStartReadyCheck,
  useJoinQuickplay,
  useLeaveQuickplay,
  useAcceptQuickplay,
  useRequestRematch,
  useAcceptRematch,
  useDeclineRematch,
} from './hooks';

/**
 * Billing & Subscription Hooks
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
} from './hooks';

/**
 * Real-time WebSocket Integration
 */
export { setupEcho, useRealtimeGame, useRealtimeLobby } from './realtime';

export type { EchoConfig, UseRealtimeGameOptions, UseRealtimeLobbyOptions } from './realtime';
