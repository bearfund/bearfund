import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type Echo from 'laravel-echo';

/**
 * Options for useRealtimeGame hook
 *
 * @remarks
 * Controls real-time subscription behavior for game updates
 */
export interface UseRealtimeGameOptions {
  /**
   * Whether to enable real-time subscription (defaults to true)
   *
   * @remarks
   * Set to false to disable real-time updates (e.g., when game is completed)
   *
   * @example
   * ```ts
   * // Only subscribe for active games
   * const { isConnected } = useRealtimeGame(gameUlid, {
   *   enabled: game?.state === 'active'
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
 * Real-time game updates hook
 *
 * @param gameUlid - Game ULID to subscribe to
 * @param options - Configuration options including Echo instance
 * @returns Connection state and error information
 *
 * @remarks
 * Subscribes to real-time game updates via WebSocket private channel.
 * Automatically invalidates React Query cache when game events are received.
 *
 * **Events Handled**:
 * - `GameActionProcessed`: Player performed an action → invalidates ['game', ulid]
 * - `GameCompleted`: Game finished → invalidates ['game', ulid]
 * - `GameForfeited`: Player forfeited → invalidates ['game', ulid]
 *
 * **Channel**: `private-game.{gameUlid}`
 *
 * @example
 * ```tsx
 * // Web/Electron
 * import { setupEcho, useRealtimeGame, useGameQuery } from '@gamerprotocol/ui';
 *
 * function GameBoard({ gameUlid }: { gameUlid: string }) {
 *   const token = await authStorage.getToken();
 *   const echo = setupEcho(token!);
 *
 *   const { data: game } = useGameQuery(gameUlid);
 *   const { isConnected, error } = useRealtimeGame(gameUlid, {
 *     echo,
 *     enabled: game?.state !== 'completed'
 *   });
 *
 *   return (
 *     <div>
 *       {!isConnected && <div>Connecting to real-time updates...</div>}
 *       {error && <div>Connection error: {error}</div>}
 *       <GameUI game={game} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // React Native
 * import { setupEcho, useRealtimeGame, useGameQuery } from '@gamerprotocol/ui/native';
 *
 * function GameScreen({ gameUlid }: { gameUlid: string }) {
 *   const token = await authStorage.getToken();
 *   const echo = setupEcho(token!, { host: 'ws.gamerprotocol.io', forceTLS: true });
 *
 *   const { data: game } = useGameQuery(gameUlid);
 *   const { isConnected } = useRealtimeGame(gameUlid, { echo });
 *
 *   return (
 *     <View>
 *       {!isConnected && <Text>Connecting...</Text>}
 *       <GameComponent game={game} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useRealtimeGame(gameUlid: string, options: UseRealtimeGameOptions) {
  const { enabled = true, echo } = options;
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return undefined;
    }

    const channelName = `private-game.${gameUlid}`;

    try {
      // Subscribe to private game channel
      const channel = echo.private(channelName);

      // Listen for GameActionProcessed event
      channel.listen('GameActionProcessed', () => {
        void queryClient.invalidateQueries({ queryKey: ['game', gameUlid] });
      });

      // Listen for GameCompleted event
      channel.listen('GameCompleted', () => {
        void queryClient.invalidateQueries({ queryKey: ['game', gameUlid] });
      });

      // Listen for GameForfeited event
      channel.listen('GameForfeited', () => {
        void queryClient.invalidateQueries({ queryKey: ['game', gameUlid] });
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
  }, [gameUlid, enabled, echo, queryClient]);

  return {
    isConnected,
    error,
  };
}
