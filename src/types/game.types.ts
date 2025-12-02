/**
 * Game-related type definitions
 *
 * Types for game management, game states, actions, history, and lobbies.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/**
 * Player in a game instance (full detail)
 */
export interface GamePlayer {
  /** Unique player identifier in this game context */
  ulid: string;

  /** Username */
  username: string;

  /** Display name */
  name: string;

  /** Position/seat number */
  position_id: number;

  /** Assigned color/side */
  color: string;

  /** Avatar URL */
  avatar: string;
}

/**
 * Core game resource structure.
 *
 * Represents a single game instance with all metadata.
 */
export interface Game {
  /** Unique game identifier (ULID) */
  ulid: string;

  /** Game title slug (e.g., 'connect-four', 'chess') */
  game_title: string;

  /** Current game status */
  status: 'active' | 'completed' | 'pending';

  /** Current turn number */
  turn_number: number;

  /** Winner's user ID (null if game not completed or draw) */
  winner_id: number | null;

  /** List of participants */
  players: GamePlayer[];

  /** Game-specific state (board, moves, etc.) */
  game_state: Record<string, unknown>;

  /** ISO 8601 timestamp when game was created */
  created_at: string;

  /** ISO 8601 timestamp when game was last updated */
  updated_at: string;
}

/**
 * Minimal game info for lists
 */
export interface GameListItem {
  /** Unique game identifier (ULID) */
  ulid: string;

  /** Game title slug */
  game_title: string;

  /** Current game status */
  status: 'active' | 'completed' | 'pending';

  /** Current turn number */
  turn_number: number;

  /** Winner's user ID (null if not completed or draw) */
  winner_id: number | null;

  /** Player info */
  players: GamePlayer[];

  /** Game-specific state */
  game_state: Record<string, unknown>;

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

  /** Turn number when action was performed */
  turn_number: number;

  /** Action type (e.g., 'DROP_PIECE', 'MOVE_PIECE') */
  action_type: string;

  /** Action parameters/details as JSON object */
  action_details: Record<string, unknown>;

  /** Player who performed the action */
  player: {
    ulid: string;
    username: string;
    name: string;
    position_id: number;
    color: string;
    avatar: string;
  };

  /** Action status */
  status: 'processed';

  /** ISO 8601 timestamp when action was created */
  created_at: string;
}

/**
 * Action response after submission
 */
export interface GameActionResponse {
  /** Whether action was successful */
  success: boolean;

  /** Action summary */
  action: {
    ulid: string;
    summary: string;
  };

  /** Updated game state */
  game: {
    ulid: string;
    status: 'active' | 'completed' | 'pending';
    game_state: Record<string, unknown>;
    winner_ulid: string | null;
    is_draw: boolean;
    outcome_type: string | null;
    outcome_details: Record<string, unknown> | null;
  };

  /** Context and state changes */
  context: {
    state_changes: Record<string, unknown>[];
    available_actions: Record<string, unknown>[];
  };

  /** Outcome if game completed */
  outcome: Record<string, unknown> | null;

  /** Next action deadline */
  next_action_deadline: string;

  /** Timeout information */
  timeout: Record<string, unknown> | null;
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
 * Game options/valid actions response
 */
export interface GameOptions {
  /** List of available actions with valid parameters */
  options: Array<{
    action: string;
    valid_parameters: Record<string, unknown>;
  }>;

  /** Whether it's the authenticated user's turn */
  is_your_turn: boolean;

  /** Current game phase */
  phase: string;

  /** Turn deadline (ISO 8601) */
  deadline: string;

  /** Time limit in seconds */
  timelimit_seconds: number;
}

/**
 * Game outcome response
 */
export interface GameOutcome {
  /** Game ULID */
  game_ulid: string;

  /** Game status */
  status: 'completed';

  /** Outcome type */
  outcome_type: 'win' | 'resignation' | 'timeout' | 'draw';

  /** Winner information (null if draw) */
  winner: {
    ulid: string;
    username: string;
  } | null;

  /** Whether game was a draw */
  is_draw: boolean;

  /** When game completed (ISO 8601) */
  completed_at: string;

  /** Game duration in seconds */
  duration_seconds: number;

  /** Final scores per player */
  final_scores: unknown[];

  /** XP awarded per player */
  xp_awarded: unknown[];

  /** Rewards earned */
  rewards: unknown[];
}

/**
 * Submit game action request payload.
 */
export interface SubmitActionRequest {
  /** Action type (e.g., 'DROP_PIECE', 'MOVE_PIECE') */
  action_type: string;

  /** Action parameters/details as JSON object */
  action_details: Record<string, unknown>;
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
