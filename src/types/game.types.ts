/**
 * Game-related type definitions
 *
 * Types for game management, game states, actions, history, and lobbies.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/** Valid game states */
export type GameState = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

/** Valid lobby states */
export type LobbyState = 'open' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Core game resource structure.
 *
 * Represents a single game instance with all metadata.
 */
export interface Game {
  /** Unique game identifier (ULID) */
  ulid: string;

  /** Game title slug (e.g., 'validate-four', 'test-game') */
  game_title: string;

  /** Current game state */
  state: GameState;

  /** Game metadata as JSON object (schema varies by game type) */
  metadata: Record<string, unknown>;

  /** Number of players in the game */
  player_count: number;

  /** Username of game winner (null if not completed) */
  winner_username: string | null;

  /** ISO 8601 timestamp when game started (null if not started) */
  started_at: string | null;

  /** ISO 8601 timestamp when game completed (null if not completed) */
  completed_at: string | null;

  /** ISO 8601 timestamp when game was created */
  created_at: string;

  /** ISO 8601 timestamp when game was last updated */
  updated_at: string;
}

/**
 * Game action/move structure.
 *
 * Represents a single player action within a game.
 */
export interface GameAction {
  /** Unique action identifier (ULID) */
  ulid: string;

  /** Game this action belongs to */
  game_ulid: string;

  /** Username of player who performed the action */
  username: string;

  /** Action type (e.g., 'move', 'play_card', 'end_turn') */
  action_type: string;

  /** Action payload as JSON object (schema varies by action type) */
  payload: Record<string, unknown>;

  /** ISO 8601 timestamp when action was performed */
  created_at: string;
}

/**
 * Game history entry structure.
 *
 * Represents a complete game record with final state.
 */
export interface GameHistory {
  /** Unique game identifier (ULID) */
  ulid: string;

  /** Game title slug */
  game_title: string;

  /** Final game state (typically 'completed' or 'cancelled') */
  state: GameState;

  /** Game metadata */
  metadata: Record<string, unknown>;

  /** Number of players who participated */
  player_count: number;

  /** Username of winner (null if no winner) */
  winner_username: string | null;

  /** ISO 8601 timestamp when game started */
  started_at: string | null;

  /** ISO 8601 timestamp when game completed */
  completed_at: string | null;

  /** ISO 8601 timestamp when record was created */
  created_at: string;
}

/**
 * Game lobby structure.
 *
 * Represents a multiplayer game lobby where players can join before game starts.
 */
export interface Lobby {
  /** Unique lobby identifier (ULID) */
  ulid: string;

  /** Game title for this lobby */
  game_title: string;

  /** Current lobby state */
  state: LobbyState;

  /** Maximum number of players allowed */
  max_players: number;

  /** Current number of players in lobby */
  current_players: number;

  /** Username of lobby creator/host */
  host_username: string;

  /** Lobby configuration/settings as JSON object */
  settings: Record<string, unknown>;

  /** Game ULID once lobby transitions to 'in-progress' (null before game starts) */
  game_ulid: string | null;

  /** ISO 8601 timestamp when lobby was created */
  created_at: string;

  /** ISO 8601 timestamp when lobby was last updated */
  updated_at: string;
}

/**
 * Create game request payload.
 */
export interface CreateGameRequest {
  /** Game title slug to create */
  game_title: string;

  /** Optional game metadata/configuration */
  metadata?: Record<string, unknown>;
}

/**
 * Update game request payload.
 */
export interface UpdateGameRequest {
  /** New game state */
  state?: GameState;

  /** Updated metadata */
  metadata?: Record<string, unknown>;

  /** Winner username (set when marking game as completed) */
  winner_username?: string;
}

/**
 * Submit game action request payload.
 */
export interface SubmitActionRequest {
  /** Action type identifier */
  action_type: string;

  /** Action payload */
  payload: Record<string, unknown>;
}

/**
 * Create lobby request payload.
 */
export interface CreateLobbyRequest {
  /** Game title for the lobby */
  game_title: string;

  /** Maximum number of players */
  max_players: number;

  /** Lobby configuration/settings */
  settings?: Record<string, unknown>;
}

/**
 * Update lobby request payload.
 */
export interface UpdateLobbyRequest {
  /** New lobby state */
  state?: LobbyState;

  /** Updated settings */
  settings?: Record<string, unknown>;
}
