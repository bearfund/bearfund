/**
 * Data feed type definitions
 *
 * Types for real-time SSE streams and leaderboards.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  /** Player rank */
  rank: number;

  /** Player username */
  username: string;

  /** Player rating */
  rating: number;

  /** Total wins */
  wins: number;

  /** Total losses */
  losses: number;
}

/**
 * Leaderboard data
 */
export interface Leaderboard {
  /** Game title */
  game_title: string;

  /** Leaderboard entries */
  entries: LeaderboardEntry[];
}

/**
 * Response for leaderboard endpoint
 */
export interface LeaderboardResponse {
  data: Leaderboard;
}
