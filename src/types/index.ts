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
} from './auth.types';

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
  GameState,
  GameAction,
  GameHistory,
  Lobby,
  LobbyState,
  CreateGameRequest,
  UpdateGameRequest,
  SubmitActionRequest,
  CreateLobbyRequest,
  UpdateLobbyRequest,
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

// Platform types
export type { ApiStatus } from './platform.types';

// Account types
export type {
  AccountStats,
  AccountLevel,
  AccountAlert,
  MarkAlertsReadRequest,
} from './account.types';
