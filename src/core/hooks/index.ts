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
  useRefreshToken,
  useLogout,
} from './useAuth';

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
 * React Query hooks for game operations.
 * All query hooks disable automatic refetching - use real-time hooks for live updates.
 */
export {
  useGameQuery,
  useGamesQuery,
  useGameOptions,
  useGameActionsQuery,
  useGameAction,
  useGameOutcome,
  useConcedeGame,
  useAbandonGame,
  useForfeitGame, // Deprecated: use useConcedeGame
} from './useGame';

/**
 * Matchmaking Hooks
 *
 * React Query hooks for matchmaking operations including queue, lobbies, and proposals.
 * All query hooks disable automatic refetching - use real-time hooks for live updates.
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
} from './useMatchmaking';

/**
 * Economy & Transaction Hooks
 *
 * React Query hooks for virtual balance management, transactions, and subscriptions.
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
} from './useEconomy';
