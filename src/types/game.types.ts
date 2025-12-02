/**
 * Game-related type definitions
 *
 * Types for game management, game states, actions, history, and lobbies.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/**
 * Player in a game instance
 */
export interface GamePlayer {
  /** Unique player identifier in this game context */
  ulid: string;

  /** Internal user ID */
  user_id: number;

  /** Username */
  username: string;

  /** Assigned color/side (optional) */
  color?: string;

  /** Whether it is this player's turn */
  is_current_turn: boolean;

  /** Whether this player won */
  is_winner: boolean;
}

/**
 * Core game resource structure.
 *
 * Represents a single game instance with all metadata.
 */
export interface Game {
  /** Unique game identifier (ULID) */
  ulid: string;

  /** Game title (e.g., 'Connect Four', 'Chess') */
  title: string;

  /** Game mode (e.g., 'Standard') */
  mode: string;

  /** Current game status */
  status: 'active' | 'completed' | 'pending';

  /** ULID of player whose turn it is */
  current_turn: string;

  /** List of participants */
  players: GamePlayer[];

  /** Game-specific state (board, moves) */
  state: Record<string, unknown>;

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
  /** Unique action identifier */
  action_id: string;

  /** Game this action belongs to */
  game_ulid: string;

  /** Player ULID who performed the action */
  player_ulid: string;

  /** Action type (e.g., 'DROP_PIECE', 'MOVE_PIECE') */
  action: string;

  /** Action parameters as JSON object */
  parameters: Record<string, unknown>;

  /** Action status */
  status: 'queued' | 'processed';

  /** ISO 8601 timestamp when action was created */
  created_at: string;

  /** ISO 8601 timestamp when action was processed (optional) */
  timestamp?: string;
}

/**
 * Player in a lobby
 */
export interface LobbyPlayer {
  /** User ID */
  user_id: number;

  /** Username */
  username: string;

  /** Player status in lobby */
  status: 'accepted' | 'pending';

  /** How player joined */
  source: 'host' | 'invited';
}

/**
 * Game mode details
 */
export interface GameMode {
  /** Mode ID */
  id: number;

  /** Mode slug */
  slug: string;

  /** Mode display name */
  name: string;
}

/**
 * User summary for host
 */
export interface UserSummary {
  /** User ID */
  id: number;

  /** Username */
  username: string;
}

/**
 * Game lobby structure.
 *
 * Represents a multiplayer game lobby where players can join before game starts.
 */
export interface Lobby {
  /** Unique lobby identifier (ULID) */
  ulid: string;

  /** The user who created the lobby */
  host: UserSummary;

  /** The game being played */
  game_title: string;

  /** Game mode details */
  mode: GameMode;

  /** Visibility */
  is_public: boolean;

  /** Minimum players required */
  min_players: number;

  /** Lobby status */
  status: 'pending' | 'active';

  /** List of players in the lobby */
  players: LobbyPlayer[];

  /** Scheduled start time (optional) */
  scheduled_at?: string;

  /** ISO 8601 timestamp when lobby was created */
  created_at: string;
}

/**
 * Submit game action request payload.
 */
export interface SubmitActionRequest {
  /** Action type (e.g., 'DROP_PIECE', 'MOVE_PIECE') */
  action: string;

  /** Action parameters as JSON object */
  parameters: Record<string, unknown>;
}

/**
 * Join matchmaking queue request payload.
 */
export interface JoinQueueRequest {
  /** Game title slug (e.g., 'connect-four') */
  game_title: string;

  /** Game mode slug (e.g., 'standard', 'ranked') */
  mode: string;
}

/**
 * Create lobby request payload.
 */
export interface CreateLobbyRequest {
  /** Game title slug */
  game_title: string;

  /** Game mode slug */
  mode: string;

  /** Whether lobby is publicly visible */
  is_public: boolean;

  /** Minimum players required to start */
  min_players: number;

  /** Optional scheduled start time (ISO 8601) */
  scheduled_at?: string;
}
