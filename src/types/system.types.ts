/**
 * System and library type definitions
 *
 * Types for system health, configuration, feedback, and game library endpoints.
 *
 * @packageDocumentation
 */

/**
 * System health check response
 */
export interface SystemHealth {
  /** System status */
  status: string;

  /** API version */
  version: string;

  /** Database connection status */
  database: string;

  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * Server time response
 */
export interface SystemTime {
  /** Unix timestamp in seconds */
  timestamp: number;

  /** ISO 8601 formatted time with timezone */
  iso8601: string;

  /** Timezone name */
  timezone: string;
}

/**
 * Platform configuration response
 */
export interface SystemConfig {
  /** API version */
  api_version: string;

  /** Platform name */
  platform_name: string;

  /** Platform features */
  features: {
    /** Available authentication providers */
    authentication_providers: string[];

    /** Real-time games supported */
    real_time_games: boolean;

    /** Turn-based games supported */
    turn_based_games: boolean;
  };

  /** Supported games list */
  supported_games: Array<{
    /** Game key/slug */
    key: string;

    /** Game display name */
    name: string;

    /** Minimum players */
    min_players: number;

    /** Maximum players */
    max_players: number;
  }>;

  /** Platform limits */
  limits: {
    /** Maximum concurrent games per user */
    max_concurrent_games: number;

    /** Action timeout in seconds */
    action_timeout_seconds: number;
  };
}

/**
 * Feedback submission types
 */
export type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

/**
 * Feedback submission request
 */
export interface SubmitFeedbackRequest {
  /** Client ID (optional if authenticated) */
  client_id?: number;

  /** Feedback type */
  type: FeedbackType;

  /** Feedback content */
  content: string;

  /** User email (required if not authenticated) */
  email?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Feedback submission response
 */
export interface FeedbackResponse {
  /** Feedback ID */
  id: number;

  /** Client ID */
  client_id: number;

  /** User ID (null if not authenticated) */
  user_id: number | null;

  /** User email */
  email: string;

  /** Feedback type */
  type: FeedbackType;

  /** Feedback content */
  content: string;

  /** Feedback status */
  status: string;

  /** Additional metadata */
  metadata: Record<string, unknown> | null;

  /** ISO 8601 timestamp when created */
  created_at: string;

  /** ISO 8601 timestamp when updated */
  updated_at: string;
}

/**
 * Game title information from library
 */
export interface GameTitle {
  /** Game key/slug */
  key: string;

  /** Game display name */
  name: string;

  /** Game description */
  description: string;

  /** Minimum players */
  min_players: number;

  /** Maximum players */
  max_players: number;

  /** Game pacing type */
  pacing: 'turn_based' | 'real_time';

  /** Complexity rating (1-10) */
  complexity: number;

  /** Thumbnail image URL */
  thumbnail: string;
}

/**
 * Game library list response
 */
export interface GameLibraryResponse {
  /** Array of game titles */
  data: GameTitle[];

  /** Total number of games */
  total: number;
}

/**
 * Game rules documentation
 */
export interface GameRules {
  /** Game title key */
  title_key: string;

  /** Game display name */
  name: string;

  /** Game objective */
  objective: string;

  /** Game setup description */
  setup: string;

  /** Turn structure description */
  turn_structure: string;

  /** Winning conditions */
  winning_conditions: string[];

  /** Special rules (game-specific) */
  special_rules: Record<string, string>;

  /** Time controls (optional) */
  time_controls?: Record<string, { initial: number; increment: number }>;
}

/**
 * Game entities (cards, units, pieces, etc.)
 */
export interface GameEntities {
  /** Entity data (structure varies by game) */
  data: Record<string, unknown>;

  /** Whether response is cacheable */
  cacheable: boolean;

  /** Cache duration in seconds */
  cache_duration_seconds: number;
}
