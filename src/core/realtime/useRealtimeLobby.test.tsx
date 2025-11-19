/**
 * Tests for useRealtimeLobby hook
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-call */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeLobby } from './useRealtimeLobby';
import type { UseRealtimeLobbyOptions } from './useRealtimeLobby';
import React from 'react';

describe('useRealtimeLobby', () => {
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
    test('subscribes to private-lobby channel with lobby ULID', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
        enabled: true,
      };

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(mockEcho.private).toHaveBeenCalledWith(`private-lobby.${lobbyUlid}`);
    });

    test('does not subscribe when enabled is false', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
        enabled: false,
      };

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(mockEcho.private).not.toHaveBeenCalled();
    });

    test('subscribes when enabled defaults to true', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(mockEcho.private).toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    test('listens for all 6 lobby events', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(mockChannel.listen).toHaveBeenCalledWith('PlayerJoined', expect.any(Function));
      expect(mockChannel.listen).toHaveBeenCalledWith('PlayerLeft', expect.any(Function));
      expect(mockChannel.listen).toHaveBeenCalledWith('PlayerStatusChanged', expect.any(Function));
      expect(mockChannel.listen).toHaveBeenCalledWith('ReadyCheckStarted', expect.any(Function));
      expect(mockChannel.listen).toHaveBeenCalledWith('LobbyStarting', expect.any(Function));
      expect(mockChannel.listen).toHaveBeenCalledWith('LobbyCancelled', expect.any(Function));
    });
  });

  describe('Cache Invalidation', () => {
    test('invalidates lobby and lobbies queries when PlayerJoined event received', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      // Trigger the PlayerJoined event
      const handler = capturedEventHandlers.get('PlayerJoined');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lobbies'],
      });
    });

    test('invalidates lobby and lobbies queries when PlayerLeft event received', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      // Trigger the PlayerLeft event
      const handler = capturedEventHandlers.get('PlayerLeft');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lobbies'],
      });
    });

    test('invalidates lobby query when PlayerStatusChanged event received', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      // Trigger the PlayerStatusChanged event
      const handler = capturedEventHandlers.get('PlayerStatusChanged');
      expect(handler).toBeDefined();
      handler!();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['lobby', lobbyUlid],
      });
      expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
        queryKey: ['lobbies'],
      });
    });
  });

  describe('Connection State', () => {
    test('returns isConnected true when subscribed successfully', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const { result } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(result.current.isConnected).toBe(true);
    });

    test('returns isConnected false when not enabled', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
        enabled: false,
      };

      const { result } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(result.current.isConnected).toBe(false);
    });

    test('returns error null when no errors occur', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const { result } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(result.current.error).toBeNull();
    });

    test('returns error message when subscription fails', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const errorMockEcho = {
        private: vi.fn(() => {
          throw new Error('Connection failed');
        }),
        leave: vi.fn(),
      } as any;

      const options: UseRealtimeLobbyOptions = {
        echo: errorMockEcho,
      };

      const { result } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      expect(result.current.error).toBe('Connection failed');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('leaves channel on unmount', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const { unmount } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      unmount();

      expect(mockEcho.leave).toHaveBeenCalledWith(`private-lobby.${lobbyUlid}`);
    });

    test('does not leave channel if not subscribed', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
        enabled: false,
      };

      const { unmount } = renderHook(() => useRealtimeLobby(lobbyUlid, options), { wrapper });

      unmount();

      expect(mockEcho.leave).not.toHaveBeenCalled();
    });
  });

  describe('Resubscription', () => {
    test('resubscribes when lobbyUlid changes', () => {
      const options: UseRealtimeLobbyOptions = {
        echo: mockEcho,
      };

      const { rerender } = renderHook(({ ulid }) => useRealtimeLobby(ulid, options), {
        wrapper,
        initialProps: { ulid: '01HQXYZ123456789ABCDEFGHJ' },
      });

      expect(mockEcho.private).toHaveBeenCalledWith('private-lobby.01HQXYZ123456789ABCDEFGHJ');
      expect(mockEcho.private).toHaveBeenCalledTimes(1);

      // Change game ULID
      rerender({ ulid: '01HQXYZ987654321ZYXWVUTSRQ' });

      expect(mockEcho.leave).toHaveBeenCalledWith('private-lobby.01HQXYZ123456789ABCDEFGHJ');
      expect(mockEcho.private).toHaveBeenCalledWith('private-lobby.01HQXYZ987654321ZYXWVUTSRQ');
      expect(mockEcho.private).toHaveBeenCalledTimes(2);
    });

    test('resubscribes when enabled changes from false to true', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';

      const { rerender } = renderHook(
        ({ enabled }) => useRealtimeLobby(lobbyUlid, { echo: mockEcho, enabled }),
        {
          wrapper,
          initialProps: { enabled: false },
        }
      );

      expect(mockEcho.private).not.toHaveBeenCalled();

      // Enable subscription
      rerender({ enabled: true });

      expect(mockEcho.private).toHaveBeenCalledWith(`private-lobby.${lobbyUlid}`);
    });

    test('unsubscribes when enabled changes from true to false', () => {
      const lobbyUlid = '01HQXYZ123456789ABCDEFGHJ';

      const { rerender, result } = renderHook(
        ({ enabled }) => useRealtimeLobby(lobbyUlid, { echo: mockEcho, enabled }),
        {
          wrapper,
          initialProps: { enabled: true },
        }
      );

      expect(result.current.isConnected).toBe(true);

      // Disable subscription
      rerender({ enabled: false });

      expect(mockEcho.leave).toHaveBeenCalledWith(`private-lobby.${lobbyUlid}`);
      expect(result.current.isConnected).toBe(false);
    });
  });
});
