/**
 * Authentication type definitions
 *
 * Platform-agnostic interfaces for authentication operations.
 * All types are designed to work identically across Web, React Native, Electron, and Telegram Mini Apps.
 *
 * @packageDocumentation
 */

/**
 * Platform-agnostic interface for authentication token storage.
 *
 * Implementations must be provided by consuming applications based on their platform:
 *
 * @example Web Implementation (localStorage)
 * ```typescript
 * const webAuthStorage: AuthStorage = {
 *   getToken: async () => localStorage.getItem('auth_token'),
 *   setToken: async (token) => localStorage.setItem('auth_token', token),
 *   clearToken: async () => localStorage.removeItem('auth_token'),
 * };
 * ```
 *
 * @example React Native Implementation (SecureStore)
 * ```typescript
 * import * as SecureStore from 'expo-secure-store';
 *
 * const nativeAuthStorage: AuthStorage = {
 *   getToken: async () => await SecureStore.getItemAsync('auth_token'),
 *   setToken: async (token) => await SecureStore.setItemAsync('auth_token', token),
 *   clearToken: async () => await SecureStore.deleteItemAsync('auth_token'),
 * };
 * ```
 */
export interface AuthStorage {
  /**
   * Retrieve authentication token from storage
   * @returns Promise resolving to token string or null if not found
   */
  getToken(): Promise<string | null>;

  /**
   * Persist authentication token to storage
   * @param token - The token string to store
   * @returns Promise that resolves when token is stored
   */
  setToken(token: string): Promise<void>;

  /**
   * Remove authentication token from storage
   * @returns Promise that resolves when token is removed
   */
  clearToken(): Promise<void>;
}

/**
 * User entity returned by authentication endpoints
 */
export interface User {
  /** Unique username identifier */
  username: string;

  /** User email address */
  email: string;

  /** Display name */
  name: string;

  /** Avatar URL (Cloudinary CDN) or null if not set */
  avatar: string | null;

  /** User biography/description or null if not set */
  bio: string | null;

  /** Social media links (key = platform, value = URL) or null if not set */
  social_links: Record<string, string> | null;

  /** Current player level */
  level: number;

  /** Total experience points */
  total_xp: number;

  /** ISO 8601 timestamp when account was created */
  member_since: string;
}

/**
 * Authentication response returned by login/register endpoints.
 *
 * Note: This is NOT wrapped in ApiResponse<T> - it's a flat structure
 * returned directly from /v1/auth/login and /v1/auth/social endpoints.
 */
export interface AuthResponse {
  /** Laravel Sanctum API token (format: "tokenId|hash") */
  token: string;

  /** Token type (always "Bearer") */
  token_type: string;

  /** Token expiration time in seconds */
  expires_in: number;

  /** Authenticated user data */
  user: User;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  /** User email address */
  email: string;

  /** User password */
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  /** Unique username (alphanumeric, underscore, hyphen only) */
  username: string;

  /** User email address */
  email: string;

  /** User password (minimum 8 characters) */
  password: string;

  /** Password confirmation (must match password) */
  password_confirmation: string;

  /** Display name (optional) */
  name?: string;
}

/**
 * Email verification request payload
 */
export interface VerifyRequest {
  /** Email verification token from verification email */
  token: string;
}

/**
 * Social login request payload
 */
export interface SocialLoginRequest {
  /** Provider name (e.g., 'google', 'apple', 'twitter', 'facebook') */
  provider: string;

  /** Access token from social provider */
  access_token: string;
}

/**
 * User profile update request payload
 */
export interface UpdateProfileRequest {
  /** Display name */
  name?: string;

  /** Username (unique identifier) */
  username?: string;

  /** User biography/description (max 500 chars) */
  bio?: string;

  /** Social media links (key = platform, value = URL) */
  social_links?: Record<string, string>;
}

/**
 * Title earned by the user
 */
export interface UserTitle {
  /** Title identifier */
  id: string | number;

  /** Title name */
  name: string;

  /** Title description */
  description?: string;
}

/**
 * Badge earned by the user
 */
export interface UserBadge {
  /** Badge identifier */
  id: string | number;

  /** Badge name */
  name: string;

  /** Badge description */
  description?: string;

  /** Badge icon URL */
  icon?: string;
}

/**
 * Achievement earned by the user
 */
export interface UserAchievement {
  /** Achievement identifier */
  id: string | number;

  /** Achievement name */
  name: string;

  /** Achievement description */
  description?: string;

  /** Date earned */
  earned_at?: string;
}

/**
 * Milestone reached by the user
 */
export interface UserMilestone {
  /** Milestone identifier */
  id: string | number;

  /** Milestone name */
  name: string;

  /** Milestone description */
  description?: string;

  /** Date reached */
  reached_at?: string;
}

/**
 * User progression data from /account/progression endpoint
 */
export interface UserProgression {
  /** Current player level */
  level: number;

  /** Current experience points */
  experience_points: number;

  /** Experience points needed for next level (null if max level) */
  next_level_xp: number | null;

  /** Progress percentage to next level (0-100) */
  progress_to_next_level: number;

  /** Titles earned by the user */
  titles: UserTitle[];

  /** Currently active title */
  active_title: UserTitle | null;

  /** Badges earned by the user */
  badges: UserBadge[];

  /** Achievements unlocked */
  achievements: UserAchievement[];

  /** Milestones reached */
  milestones: UserMilestone[];
}

/**
 * Per-game statistics from games_by_title array
 */
export interface GameStatistic {
  /** Game title key */
  title_key: string;

  /** Game display name */
  title_name: string;

  /** Games played for this title */
  games_played: number;

  /** Games won for this title */
  wins: number;

  /** Games lost for this title */
  losses: number;

  /** Games drawn for this title */
  draws: number;

  /** Win rate for this title */
  win_rate: number;
}

/**
 * User gameplay records from /account/records endpoint
 */
export interface UserRecords {
  /** Total games played across all titles */
  total_games: number;

  /** Total games won */
  games_won: number;

  /** Total games lost */
  games_lost: number;

  /** Total games drawn */
  games_drawn: number;

  /** Overall win rate (0.0 to 1.0) */
  win_rate: number;

  /** Current win streak */
  current_streak: number;

  /** Longest win streak ever */
  longest_win_streak: number;

  /** Total points earned */
  total_points: number;

  /** ELO ratings by game title key */
  elo_ratings: Record<string, number>;

  /** Global rank among all players */
  global_rank: number;

  /** Per-game statistics */
  games_by_title: GameStatistic[];

  /** Favorite game title key or null */
  favorite_game: string | null;
}

/**
 * User notification/alert types
 */
export type AlertType = string;

/**
 * User notification/alert from /account/alerts endpoint
 */
export interface Alert {
  /** Alert unique identifier (ULID) */
  ulid: string;

  /** Alert type */
  type: AlertType;

  /** Alert data payload specific to alert type */
  data: Record<string, unknown>;

  /** ISO 8601 timestamp when alert was read (null if unread) */
  read_at: string | null;

  /** ISO 8601 timestamp when alert was created */
  created_at: string;
}

/**
 * Paginated alerts response
 */
export interface AlertsResponse {
  /** Array of alerts */
  data: Alert[];

  /** Pagination links */
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };

  /** Pagination metadata */
  meta: {
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

/**
 * Mark alerts as read request payload for /account/alerts/read endpoint
 */
export interface MarkAlertsReadRequest {
  /** Array of alert ULIDs to mark as read */
  alert_ulids: string[];
}
