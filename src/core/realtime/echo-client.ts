import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Declare global window for platform-agnostic window checks
declare const window: { location: { hostname: string }; Pusher?: typeof Pusher } | undefined;

/**
 * Configuration options for Laravel Echo client
 *
 * @remarks
 * Used to configure the Echo client for connecting to Laravel Reverb WebSocket server.
 * All options are optional and will use sensible defaults for production.
 *
 * @see {@link https://laravel.com/docs/broadcasting Laravel Broadcasting Documentation}
 */
export interface EchoConfig {
  /**
   * WebSocket host URL (defaults to current hostname on web)
   *
   * @example
   * ```ts
   * // Development
   * host: 'localhost'
   *
   * // Production
   * host: 'ws.gamerprotocol.io'
   * ```
   */
  host?: string;

  /**
   * WebSocket port (defaults to 6001)
   */
  wsPort?: number;

  /**
   * Force TLS/WSS connection (defaults to true in production)
   */
  forceTLS?: boolean;

  /**
   * Broadcasting auth endpoint (defaults to '/broadcasting/auth')
   *
   * @remarks
   * Must match the route configured on your Laravel backend
   */
  authEndpoint?: string;

  /**
   * Reverb application key (defaults to 'gamerprotocol-app-key')
   *
   * @remarks
   * Must match REVERB_APP_KEY in your backend .env file
   */
  appKey?: string;
}

/**
 * Setup Laravel Echo client for real-time WebSocket communication
 *
 * @param token - Authentication token for private channel authorization
 * @param config - Optional configuration overrides
 * @returns Configured Echo instance
 *
 * @remarks
 * Creates a Laravel Echo client configured to work with Laravel Reverb.
 * Uses Pusher protocol for compatibility with Reverb.
 *
 * This function must be called AFTER user authentication to provide a valid token.
 * The token is used to authorize access to private channels (game updates, lobby events).
 *
 * @example
 * ```ts
 * // Web/Electron (uses window.location.hostname)
 * import { setupEcho } from '@gamerprotocol/ui';
 *
 * const token = await authStorage.getToken();
 * if (token) {
 *   const echo = setupEcho(token);
 * }
 * ```
 *
 * @example
 * ```ts
 * // React Native (must provide host explicitly)
 * import { setupEcho } from '@gamerprotocol/ui/native';
 *
 * const token = await authStorage.getToken();
 * if (token) {
 *   const echo = setupEcho(token, {
 *     host: 'ws.gamerprotocol.io',
 *     forceTLS: true,
 *   });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Development with local backend
 * const echo = setupEcho(token, {
 *   host: 'localhost',
 *   wsPort: 6001,
 *   forceTLS: false,
 * });
 * ```
 */
export function setupEcho(token: string, config?: EchoConfig): Echo<'pusher'> {
  // Determine default host (web: current hostname, native: must be provided)
  const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const echoConfig = {
    broadcaster: 'pusher' as const,
    key: config?.appKey ?? 'gamerprotocol-app-key',
    wsHost: config?.host ?? defaultHost,
    wsPort: config?.wsPort ?? 6001,
    wssPort: config?.wsPort ?? 6001,
    forceTLS: config?.forceTLS ?? defaultHost !== 'localhost',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: config?.authEndpoint ?? '/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  };

  // Make Pusher available globally for Laravel Echo
  if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
  }

  return new Echo(echoConfig);
}
