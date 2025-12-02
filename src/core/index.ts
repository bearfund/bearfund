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
export { useLogin, useSocialLogin, useRegister, useVerifyEmail, useLogout } from './hooks';

/**
 * Account Management Hooks
 */
export {
  useProfileQuery,
  useUpdateProfile,
  useProgressionQuery,
  useRecordsQuery,
  useAlertsQuery,
  useMarkAlertsRead,
} from './hooks';

/**
 * System & Library Hooks
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
} from './hooks';

/**
 * Game Management Hooks
 */
export {
  useGameQuery,
  useGamesQuery,
  useGameOptions,
  useGameAction,
  useForfeitGame,
} from './hooks';

/**
 * Matchmaking Hooks
 */
export {
  useJoinQueue,
  useLeaveQueue,
  useLobbiesQuery,
  useLobbyQuery,
  useCreateLobby,
  useDeleteLobby,
  useStartReadyCheck,
  useSeatPlayers,
  useInvitePlayers,
  useJoinLobby,
  useRemoveLobbyPlayer,
  useCreateProposal,
  useAcceptProposal,
  useDeclineProposal,
} from './hooks';

/**
 * Economy & Transaction Hooks
 */
export {
  useBalanceQuery,
  useTransactionsQuery,
  useCashier,
  usePlansQuery,
  useSubscriptionQuery,
  useSubscribe,
  useCancelSubscription,
  useVerifyAppleReceipt,
  useVerifyGoogleReceipt,
  useVerifyTelegramReceipt,
} from './hooks';

/**
 * Real-time WebSocket Integration
 */
export { setupEcho, useRealtimeGame, useRealtimeLobby } from './realtime';

export type { EchoConfig, UseRealtimeGameOptions, UseRealtimeLobbyOptions } from './realtime';
