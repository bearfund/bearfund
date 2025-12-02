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
  VerifyRequest,
  SocialLoginRequest,
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
} from './auth.types';

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
  GamePlayer,
  GameAction,
  Lobby,
  LobbyPlayer,
  GameMode,
  UserSummary,
  CreateLobbyRequest,
  SubmitActionRequest,
  JoinQueueRequest,
} from './game.types';

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
