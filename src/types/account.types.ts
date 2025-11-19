/**
 * User Account & Stats type definitions
 *
 * Types for user profile, statistics, levels, and notifications.
 *
 * @packageDocumentation
 */

/**
 * Account Statistics structure
 */
export interface AccountStats {
  /** Total games played across all titles */
  games_played: number;

  /** Total wins */
  wins: number;

  /** Total losses */
  losses: number;

  /** Current rank points/ELO */
  points: number;

  /** Global rank position (null if unranked) */
  rank: number | null;
}

/**
 * Account Level & XP Progress structure
 */
export interface AccountLevel {
  /** Current level number */
  level: number;

  /** Current XP amount */
  current_xp: number;

  /** XP required for next level */
  next_level_xp: number;

  /** Progress percentage (0-100) */
  progress_percent: number;

  /** Title associated with current level */
  title: string;
}

/**
 * Account Alert/Notification structure
 */
export interface AccountAlert {
  /** Unique alert identifier (ULID) */
  ulid: string;

  /** Alert type (system, game, achievement, etc.) */
  type: string;

  /** Alert title */
  title: string;

  /** Alert message body */
  message: string;

  /** Additional data associated with alert */
  data: Record<string, unknown> | null;

  /** Timestamp when alert was read (null if unread) */
  read_at: string | null;

  /** ISO 8601 timestamp when alert was created */
  created_at: string;
}

/**
 * Request payload for marking alerts as read
 */
export interface MarkAlertsReadRequest {
  /** Array of alert ULIDs to mark as read, or 'all' to mark all */
  alert_ids: string[] | 'all';
}
