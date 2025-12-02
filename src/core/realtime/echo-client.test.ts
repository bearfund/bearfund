/**
 * Tests for Laravel Echo client setup
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupEcho } from './echo-client';
import type { EchoConfig } from './echo-client';

// Track the config passed to Echo constructor
let capturedEchoConfig: any = null;

// Mock laravel-echo
vi.mock('laravel-echo', () => {
  const MockEcho = vi.fn(function (this: any, config) {
    capturedEchoConfig = config;
    this.private = vi.fn((_channel: string) => ({
      listen: vi.fn(),
    }));
    this.leave = vi.fn();
  });

  return {
    default: MockEcho,
  };
});

// Mock pusher-js
vi.mock('pusher-js', () => {
  return {
    default: vi.fn(),
  };
});

describe('setupEcho', () => {
  const mockToken = 'test-auth-token';

  beforeEach(() => {
    // Reset captured config
    capturedEchoConfig = null;

    // Mock window object for web environment
    global.window = {
      location: { hostname: 'localhost' },
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    test('creates Echo instance with default configuration', () => {
      const echo = setupEcho(mockToken);

      expect(echo).toBeDefined();
      expect(capturedEchoConfig.broadcaster).toBe('pusher');
      expect(capturedEchoConfig.key).toBe('gamerprotocol-app-key');
    });

    test('uses window.location.hostname as default host in web environment', () => {
      global.window = {
        location: { hostname: 'example.com' },
      } as any;

      setupEcho(mockToken);

      expect(capturedEchoConfig.wsHost).toBe('example.com');
    });

    test('uses localhost as default host when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      global.window = undefined;

      setupEcho(mockToken);

      expect(capturedEchoConfig.wsHost).toBe('localhost');

      global.window = originalWindow;
    });

    test('accepts custom host configuration', () => {
      const config: EchoConfig = {
        host: 'ws.custom.com',
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.wsHost).toBe('ws.custom.com');
    });

    test('accepts custom wsPort configuration', () => {
      const config: EchoConfig = {
        wsPort: 8080,
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.wsPort).toBe(8080);
      expect(capturedEchoConfig.wssPort).toBe(8080);
    });

    test('sets forceTLS to true for non-localhost hosts', () => {
      const config: EchoConfig = {
        host: 'ws.production.com',
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.forceTLS).toBe(true);
    });

    test('sets forceTLS to false for localhost by default', () => {
      const config: EchoConfig = {
        host: 'localhost',
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.forceTLS).toBe(false);
    });

    test('allows overriding forceTLS', () => {
      const config: EchoConfig = {
        host: 'localhost',
        forceTLS: true,
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.forceTLS).toBe(true);
    });

    test('accepts custom authEndpoint configuration', () => {
      const config: EchoConfig = {
        authEndpoint: '/api/broadcasting/auth',
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.authEndpoint).toBe('/api/broadcasting/auth');
    });

    test('uses default authEndpoint when not provided', () => {
      setupEcho(mockToken);

      expect(capturedEchoConfig.authEndpoint).toBe('/broadcasting/auth');
    });

    test('accepts custom appKey configuration', () => {
      const config: EchoConfig = {
        appKey: 'custom-app-key',
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.key).toBe('custom-app-key');
    });

    test('includes Authorization Bearer token in auth headers', () => {
      const token = 'my-secure-token';
      setupEcho(token);

      expect(capturedEchoConfig.auth.headers.Authorization).toBe(`Bearer ${token}`);
    });

    test('sets disableStats to true', () => {
      setupEcho(mockToken);

      expect(capturedEchoConfig.disableStats).toBe(true);
    });

    test('sets enabledTransports to ws and wss', () => {
      setupEcho(mockToken);

      expect(capturedEchoConfig.enabledTransports).toEqual(['ws', 'wss']);
    });
  });

  describe('Pusher Integration', () => {
    test('assigns Pusher to window when window is defined', () => {
      global.window = {
        location: { hostname: 'localhost' },
      } as any;

      setupEcho(mockToken);

      // @ts-expect-error - Pusher is added dynamically
      expect(global.window.Pusher).toBeDefined();
    });

    test('does not throw when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      global.window = undefined;

      expect(() => setupEcho(mockToken)).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('Platform-Specific Configurations', () => {
    test('Web/Electron: uses current hostname and auto-detects TLS', () => {
      global.window = {
        location: { hostname: 'app.gamerprotocol.io' },
      } as any;

      setupEcho(mockToken);

      expect(capturedEchoConfig.wsHost).toBe('app.gamerprotocol.io');
      expect(capturedEchoConfig.forceTLS).toBe(true);
    });

    test('React Native: requires explicit host configuration', () => {
      // @ts-expect-error - Testing undefined window (React Native scenario)
      global.window = undefined;

      const config: EchoConfig = {
        host: 'ws.gamerprotocol.io',
        forceTLS: true,
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.wsHost).toBe('ws.gamerprotocol.io');
      expect(capturedEchoConfig.forceTLS).toBe(true);
    });

    test('Development: allows insecure connections to localhost', () => {
      const config: EchoConfig = {
        host: 'localhost',
        wsPort: 6001,
        forceTLS: false,
      };

      setupEcho(mockToken, config);

      expect(capturedEchoConfig.wsHost).toBe('localhost');
      expect(capturedEchoConfig.wsPort).toBe(6001);
      expect(capturedEchoConfig.forceTLS).toBe(false);
    });
  });
});
