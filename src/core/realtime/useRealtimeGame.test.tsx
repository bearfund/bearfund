/**
 * Tests for useRealtimeGame hook
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-call */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeGame } from './useRealtimeGame';
import type { UseRealtimeGameOptions } from './useRealtimeGame';
import React from 'react';

describe('useRealtimeGame', () => {
  let queryClient: QueryClient;
  let mockEcho: any;
  let mockChannel: any;
  let capturedEventHandlers: Map<string, Function>;

  beforeEach(() => {
    // Create fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Track event handlers
    capturedEventHandlers = new Map();

    // Create mock channel
    mockChannel = {
      listen: vi.fn((event: string, handler: Function) => {
        capturedEventHandlers.set(event, handler);
        return mockChannel;
      }),
    };

    // Create mock Echo instance
    mockEcho = {
      private: vi.fn((_channel: string) => mockChannel),
      leave: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Subscription', () => {
    test('subscribes to private-game channel with game ULID', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
        enabled: true,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockEcho.private).toHaveBeenCalledWith(`private-game.${gameUlid}`);
    });

    test('does not subscribe when enabled is false', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
        enabled: false,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockEcho.private).not.toHaveBeenCalled();
    });

    test('subscribes when enabled defaults to true', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockEcho.private).toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    test('listens for GameActionProcessed event', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockChannel.listen).toHaveBeenCalledWith('GameActionProcessed', expect.any(Function));
    });

    test('listens for GameCompleted event', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockChannel.listen).toHaveBeenCalledWith('GameCompleted', expect.any(Function));
    });

    test('listens for GameForfeited event', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(mockChannel.listen).toHaveBeenCalledWith('GameForfeited', expect.any(Function));
    });
  });

  describe('Cache Invalidation', () => {
    test('invalidates game query when GameActionProcessed event received', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      // Trigger the GameActionProcessed event
      const handler = capturedEventHandlers.get('GameActionProcessed');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['game', gameUlid],
      });
    });

    test('invalidates game query when GameCompleted event received', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      // Trigger the GameCompleted event
      const handler = capturedEventHandlers.get('GameCompleted');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['game', gameUlid],
      });
    });

    test('invalidates game query when GameForfeited event received', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      // Trigger the GameForfeited event
      const handler = capturedEventHandlers.get('GameForfeited');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['game', gameUlid],
      });
    });
  });

  describe('Connection State', () => {
    test('returns isConnected true when subscribed successfully', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const { result } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(result.current.isConnected).toBe(true);
    });

    test('returns isConnected false when not enabled', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
        enabled: false,
      };

      const { result } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(result.current.isConnected).toBe(false);
    });

    test('returns error null when no errors occur', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const { result } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(result.current.error).toBeNull();
    });

    test('returns error message when subscription fails', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const errorMockEcho = {
        private: vi.fn(() => {
          throw new Error('Connection failed');
        }),
        leave: vi.fn(),
      } as any;

      const options: UseRealtimeGameOptions = {
        echo: errorMockEcho,
      };

      const { result } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      expect(result.current.error).toBe('Connection failed');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('leaves channel on unmount', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const { unmount } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      unmount();

      expect(mockEcho.leave).toHaveBeenCalledWith(`private-game.${gameUlid}`);
    });

    test('does not leave channel if not subscribed', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
        enabled: false,
      };

      const { unmount } = renderHook(() => useRealtimeGame(gameUlid, options), { wrapper });

      unmount();

      expect(mockEcho.leave).not.toHaveBeenCalled();
    });
  });

  describe('Resubscription', () => {
    test('resubscribes when gameUlid changes', () => {
      const options: UseRealtimeGameOptions = {
        echo: mockEcho,
      };

      const { rerender } = renderHook(({ ulid }) => useRealtimeGame(ulid, options), {
        wrapper,
        initialProps: { ulid: '01HQXYZ123456789ABCDEFGHJ' },
      });

      expect(mockEcho.private).toHaveBeenCalledWith('private-game.01HQXYZ123456789ABCDEFGHJ');
      expect(mockEcho.private).toHaveBeenCalledTimes(1);

      // Change game ULID
      rerender({ ulid: '01HQXYZ987654321ZYXWVUTSRQ' });

      expect(mockEcho.leave).toHaveBeenCalledWith('private-game.01HQXYZ123456789ABCDEFGHJ');
      expect(mockEcho.private).toHaveBeenCalledWith('private-game.01HQXYZ987654321ZYXWVUTSRQ');
      expect(mockEcho.private).toHaveBeenCalledTimes(2);
    });

    test('resubscribes when enabled changes from false to true', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';

      const { rerender } = renderHook(
        ({ enabled }) => useRealtimeGame(gameUlid, { echo: mockEcho, enabled }),
        {
          wrapper,
          initialProps: { enabled: false },
        }
      );

      expect(mockEcho.private).not.toHaveBeenCalled();

      // Enable subscription
      rerender({ enabled: true });

      expect(mockEcho.private).toHaveBeenCalledWith(`private-game.${gameUlid}`);
    });

    test('unsubscribes when enabled changes from true to false', () => {
      const gameUlid = '01HQXYZ123456789ABCDEFGHJ';

      const { rerender, result } = renderHook(
        ({ enabled }) => useRealtimeGame(gameUlid, { echo: mockEcho, enabled }),
        {
          wrapper,
          initialProps: { enabled: true },
        }
      );

      expect(result.current.isConnected).toBe(true);

      // Disable subscription
      rerender({ enabled: false });

      expect(mockEcho.leave).toHaveBeenCalledWith(`private-game.${gameUlid}`);
      expect(result.current.isConnected).toBe(false);
    });
  });
});
