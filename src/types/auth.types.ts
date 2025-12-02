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

  /** Client ID for the application */
  client_id: number;

  /** Display name (optional) */
  name?: string;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  /** Success message */
  message: string;

  /** Registration ULID identifier */
  registration_id: string;
}

/**
 * Email verification request payload
 */
export interface VerifyRequest {
  /** Email verification token from verification email */
  token: string;

  /** Display name (optional, can be set during verification) */
  name?: string;
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
