/**
 * Type definitions barrel file
 *
 * Re-exports all type definitions for convenient importing.
 *
 * @packageDocumentation
 */

// Auth types
export type {
  AuthStorage,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyRequest,
  SocialLoginRequest,
} from './auth.types';

// Account types
export type {
  UpdateProfileRequest,
  UserTitle,
  UserBadge,
  UserAchievement,
  UserMilestone,
  UserProgression,
  GameStatistic,
  UserRecords,
  Alert,
  AlertType,
  AlertsResponse,
  MarkAlertsReadRequest,
} from './account.types';

// System types
export type {
  SystemHealth,
  SystemTime,
  SystemConfig,
  FeedbackType,
  SubmitFeedbackRequest,
  FeedbackResponse,
  GameTitle,
  GameLibraryResponse,
  GameRules,
  GameEntities,
} from './system.types';

// API types
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  PaginationLinks,
  ErrorResponse,
} from './api.types';

// Game types
export type {
  Game,
  GameListItem,
  GamePlayer,
  GameAction,
  GameActionResponse,
  GameOptions,
  GameOutcome,
  SubmitActionRequest,
} from './game.types';

// Matchmaking types
export type {
  QueueSlot,
  JoinQueueRequest,
  QueueSlotResponse,
  Lobby,
  LobbyPlayerDetailed,
  LobbyHost,
  CreateLobbyRequest,
  JoinLobbyRequest,
  SeatPlayersRequest,
  InvitePlayersRequest,
  Proposal,
  CreateRematchRequest,
  CreateChallengeRequest,
  CreateProposalRequest,
  ProposalResponse,
  AcceptProposalResponse,
  DeclineProposalResponse,
} from './matchmaking.types';

// Billing types
export type {
  SubscriptionPlan,
  SubscriptionTier,
  BillingStatus,
  UsageQuotas,
  UserSubscription,
  Invoice,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
} from './billing.types';

// Real-time types
export type {
  RealtimeEventType,
  BaseEvent,
  GameCreatedPayload,
  GameUpdatedPayload,
  GameActionPayload,
  GameCompletedPayload,
  LobbyCreatedPayload,
  LobbyUpdatedPayload,
  LobbyPlayerJoinedPayload,
  LobbyPlayerLeftPayload,
  LobbyGameStartedPayload,
  UserProfileUpdatedPayload,
  NotificationPayload,
  GameCreatedEvent,
  GameUpdatedEvent,
  GameActionEvent,
  GameCompletedEvent,
  LobbyCreatedEvent,
  LobbyUpdatedEvent,
  LobbyPlayerJoinedEvent,
  LobbyPlayerLeftEvent,
  LobbyGameStartedEvent,
  UserProfileUpdatedEvent,
  NotificationEvent,
  RealtimeEvent,
  ChannelOptions,
} from './realtime.types';
