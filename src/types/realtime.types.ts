/**
 * Real-time event type definitions
 *
 * Types for WebSocket events via Laravel Echo and Pusher.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

import type { Game, GameAction, Lobby } from './game.types';
import type { User } from './auth.types';

/** All possible real-time event types */
export type RealtimeEventType =
  | 'game.created'
  | 'game.updated'
  | 'game.action'
  | 'game.completed'
  | 'lobby.created'
  | 'lobby.updated'
  | 'lobby.player-joined'
  | 'lobby.player-left'
  | 'lobby.game-started'
  | 'user.profile-updated'
  | 'notification.new';

/**
 * Base event structure for all real-time events.
 *
 * @template T - The event payload type
 */
export interface BaseEvent<T> {
  /** Event type identifier */
  event: RealtimeEventType;

  /** Event payload data */
  data: T;

  /** ISO 8601 timestamp when event was emitted */
  timestamp: string;
}

/**
 * Game created event payload.
 * Emitted when a new game is created.
 */
export interface GameCreatedPayload {
  /** The newly created game */
  game: Game;
}

/**
 * Game updated event payload.
 * Emitted when game state or metadata changes.
 */
export interface GameUpdatedPayload {
  /** The updated game */
  game: Game;

  /** Fields that changed (optional) */
  changed_fields?: string[];
}

/**
 * Game action event payload.
 * Emitted when a player performs an action in a game.
 */
export interface GameActionPayload {
  /** The game action that was performed */
  action: GameAction;

  /** The game this action belongs to */
  game: Game;
}

/**
 * Game completed event payload.
 * Emitted when a game reaches completion.
 */
export interface GameCompletedPayload {
  /** The completed game */
  game: Game;

  /** Username of the winner (null if no winner) */
  winner_username: string | null;
}

/**
 * Lobby created event payload.
 * Emitted when a new lobby is created.
 */
export interface LobbyCreatedPayload {
  /** The newly created lobby */
  lobby: Lobby;
}

/**
 * Lobby updated event payload.
 * Emitted when lobby state or settings change.
 */
export interface LobbyUpdatedPayload {
  /** The updated lobby */
  lobby: Lobby;

  /** Fields that changed (optional) */
  changed_fields?: string[];
}

/**
 * Lobby player joined event payload.
 * Emitted when a player joins a lobby.
 */
export interface LobbyPlayerJoinedPayload {
  /** The lobby that was joined */
  lobby: Lobby;

  /** The user who joined */
  user: User;
}

/**
 * Lobby player left event payload.
 * Emitted when a player leaves a lobby.
 */
export interface LobbyPlayerLeftPayload {
  /** The lobby that was left */
  lobby: Lobby;

  /** Username of user who left */
  username: string;
}

/**
 * Lobby game started event payload.
 * Emitted when a lobby transitions to a game.
 */
export interface LobbyGameStartedPayload {
  /** The lobby that started */
  lobby: Lobby;

  /** The game that was created */
  game: Game;
}

/**
 * User profile updated event payload.
 * Emitted when a user updates their profile.
 */
export interface UserProfileUpdatedPayload {
  /** The updated user */
  user: User;

  /** Fields that changed (optional) */
  changed_fields?: string[];
}

/**
 * Notification event payload.
 * Emitted for various system notifications.
 */
export interface NotificationPayload {
  /** Notification identifier (ULID) */
  ulid: string;

  /** Notification type (e.g., 'game_invite', 'achievement_unlocked') */
  type: string;

  /** Notification title */
  title: string;

  /** Notification body/message */
  message: string;

  /** Optional action data as JSON */
  action_data?: Record<string, unknown>;

  /** ISO 8601 timestamp when notification was created */
  created_at: string;
}

/**
 * Typed real-time events for each event type.
 * Use these when subscribing to specific event types.
 */
export type GameCreatedEvent = BaseEvent<GameCreatedPayload>;
export type GameUpdatedEvent = BaseEvent<GameUpdatedPayload>;
export type GameActionEvent = BaseEvent<GameActionPayload>;
export type GameCompletedEvent = BaseEvent<GameCompletedPayload>;
export type LobbyCreatedEvent = BaseEvent<LobbyCreatedPayload>;
export type LobbyUpdatedEvent = BaseEvent<LobbyUpdatedPayload>;
export type LobbyPlayerJoinedEvent = BaseEvent<LobbyPlayerJoinedPayload>;
export type LobbyPlayerLeftEvent = BaseEvent<LobbyPlayerLeftPayload>;
export type LobbyGameStartedEvent = BaseEvent<LobbyGameStartedPayload>;
export type UserProfileUpdatedEvent = BaseEvent<UserProfileUpdatedPayload>;
export type NotificationEvent = BaseEvent<NotificationPayload>;

/**
 * Union type of all possible real-time events.
 * Use this when handling events generically.
 */
export type RealtimeEvent =
  | GameCreatedEvent
  | GameUpdatedEvent
  | GameActionEvent
  | GameCompletedEvent
  | LobbyCreatedEvent
  | LobbyUpdatedEvent
  | LobbyPlayerJoinedEvent
  | LobbyPlayerLeftEvent
  | LobbyGameStartedEvent
  | UserProfileUpdatedEvent
  | NotificationEvent;

/**
 * Echo channel subscription options.
 *
 * Configuration for Laravel Echo channel subscriptions.
 */
export interface ChannelOptions {
  /** Channel name (e.g., 'games.{game_ulid}', 'lobbies.{lobby_ulid}') */
  channel: string;

  /** Channel type ('private', 'presence', or 'public') */
  type: 'private' | 'presence' | 'public';

  /** Whether to automatically rejoin on disconnect */
  autoRejoin?: boolean;
}
