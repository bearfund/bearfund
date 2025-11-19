import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type Echo from 'laravel-echo';

/**
 * Options for useRealtimeLobby hook
 *
 * @remarks
 * Controls real-time subscription behavior for lobby updates
 */
export interface UseRealtimeLobbyOptions {
  /**
   * Whether to enable real-time subscription (defaults to true)
   *
   * @remarks
   * Set to false to disable real-time updates (e.g., after leaving lobby)
   *
   * @example
   * ```ts
   * // Only subscribe when in lobby
   * const { isConnected } = useRealtimeLobby(lobbyUlid, {
   *   enabled: isInLobby
   * });
   * ```
   */
  enabled?: boolean;

  /**
   * Laravel Echo instance to use for subscription
   *
   * @remarks
   * Must be provided and configured with authentication token.
   * Use setupEcho() to create the Echo instance.
   *
   * @see {@link setupEcho}
   */
  echo: Echo<'pusher'>;
}

/**
 * Real-time lobby updates hook
 *
 * @param lobbyUlid - Lobby ULID to subscribe to
 * @param options - Configuration options including Echo instance
 * @returns Connection state and error information
 *
 * @remarks
 * Subscribes to real-time lobby updates via WebSocket private channel.
 * Automatically invalidates React Query cache when lobby events are received.
 *
 * **Events Handled**:
 * - `PlayerJoined`: Player joined lobby → invalidates ['lobby', ulid] and ['lobbies']
 * - `PlayerLeft`: Player left lobby → invalidates ['lobby', ulid] and ['lobbies']
 * - `PlayerStatusChanged`: Player ready status changed → invalidates ['lobby', ulid]
 * - `ReadyCheckStarted`: Host started ready check → invalidates ['lobby', ulid]
 * - `LobbyStarting`: Lobby transitioning to game → invalidates ['lobby', ulid] and ['lobbies']
 * - `LobbyCancelled`: Lobby was cancelled → invalidates ['lobby', ulid] and ['lobbies']
 *
 * **Channel**: `private-lobby.{lobbyUlid}`
 *
 * @example
 * ```tsx
 * // Web/Electron
 * import { setupEcho, useRealtimeLobby, useLobbyQuery } from '@gamerprotocol/ui';
 *
 * function LobbyRoom({ lobbyUlid }: { lobbyUlid: string }) {
 *   const token = await authStorage.getToken();
 *   const echo = setupEcho(token!);
 *
 *   const { data: lobby } = useLobbyQuery(lobbyUlid);
 *   const { isConnected, error } = useRealtimeLobby(lobbyUlid, { echo });
 *
 *   return (
 *     <div>
 *       {!isConnected && <div>Connecting to lobby...</div>}
 *       {error && <div>Connection error: {error}</div>}
 *       <LobbyUI lobby={lobby} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // React Native
 * import { setupEcho, useRealtimeLobby, useLobbyQuery } from '@gamerprotocol/ui/native';
 *
 * function LobbyScreen({ lobbyUlid }: { lobbyUlid: string }) {
 *   const token = await authStorage.getToken();
 *   const echo = setupEcho(token!, { host: 'ws.gamerprotocol.io', forceTLS: true });
 *
 *   const { data: lobby } = useLobbyQuery(lobbyUlid);
 *   const { isConnected } = useRealtimeLobby(lobbyUlid, { echo });
 *
 *   return (
 *     <View>
 *       {!isConnected && <Text>Connecting...</Text>}
 *       <LobbyComponent lobby={lobby} />
 *     </View>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Telegram Mini App
 * import { setupEcho, useRealtimeLobby, useLobbyQuery } from '@gamerprotocol/ui';
 *
 * function TelegramLobby({ lobbyUlid }: { lobbyUlid: string }) {
 *   const token = await authStorage.getToken();
 *   const echo = setupEcho(token!, {
 *     host: 'ws.gamerprotocol.io',
 *     forceTLS: true
 *   });
 *
 *   const { data: lobby } = useLobbyQuery(lobbyUlid);
 *   const { isConnected, error } = useRealtimeLobby(lobbyUlid, { echo });
 *
 *   if (!isConnected) return <div>Connecting...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return <div>Lobby: {lobby?.players.length} players</div>;
 * }
 * ```
 */
export function useRealtimeLobby(lobbyUlid: string, options: UseRealtimeLobbyOptions) {
  const { enabled = true, echo } = options;
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return undefined;
    }

    const channelName = `private-lobby.${lobbyUlid}`;

    try {
      // Subscribe to private lobby channel
      const channel = echo.private(channelName);

      // Listen for PlayerJoined event
      channel.listen('PlayerJoined', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
        void queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      });

      // Listen for PlayerLeft event
      channel.listen('PlayerLeft', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
        void queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      });

      // Listen for PlayerStatusChanged event
      channel.listen('PlayerStatusChanged', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
      });

      // Listen for ReadyCheckStarted event
      channel.listen('ReadyCheckStarted', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
      });

      // Listen for LobbyStarting event
      channel.listen('LobbyStarting', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
        void queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      });

      // Listen for LobbyCancelled event
      channel.listen('LobbyCancelled', () => {
        void queryClient.invalidateQueries({ queryKey: ['lobby', lobbyUlid] });
        void queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      });

      // Mark as connected after subscription
      setIsConnected(true);
      setError(null);

      // Cleanup: Leave channel on unmount
      return () => {
        echo.leave(channelName);
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
      return undefined;
    }
  }, [lobbyUlid, enabled, echo, queryClient]);

  return {
    isConnected,
    error,
  };
}
