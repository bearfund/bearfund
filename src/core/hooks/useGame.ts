import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { Game, SubmitActionRequest } from '../../types/game.types';
import type { ErrorResponse, PaginatedResponse, ApiResponse } from '../../types/api.types';

/**
 * Game Management Hooks
 *
 * Provides React Query hooks for game operations including:
 * - Game state queries and mutations
 * - Game action submission (moves, turns)
 * - Game forfeiture
 *
 * All mutation hooks automatically invalidate relevant queries to keep
 * the cache synchronized. Query hooks disable automatic refetching by
 * default since real-time updates come via WebSocket.
 *
 * For matchmaking operations (lobbies, queues, proposals), see useMatchmaking.ts
 *
 * @example
 * ```typescript
 * const { data: game } = useGameQuery(apiClient, gameUlid);
 * const { mutate: makeMove } = useGameAction(apiClient, gameUlid);
 * makeMove({ action_type: 'drop_piece', action_details: { column: 3 } });
 * ```
 */

/**
 * Query hook for fetching a single game's state
 *
 * Fetches current state of a specific game by ULID. Automatic refetching
 * is disabled by default - use useRealtimeGame hook for live updates.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game state
 *
 * @example
 * ```typescript
 * const { data: game, isLoading } = useGameQuery(apiClient, '01ARZ3NDEKTSV4RRFFQ69G5FAV');
 *
 * if (game) {
 *   console.log(`Game state: ${game.state}`);
 *   console.log(`Current turn: ${game.game_state.current_turn}`);
 * }
 * ```
 */
export function useGameQuery(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Game, ErrorResponse>({
    queryKey: ['game', ulid],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Game>>(`/games/${ulid}`);
      return response.data.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Query hook for fetching user's games list
 *
 * Fetches paginated list of authenticated user's active and recent games.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param params - Optional query parameters (page, per_page, status filter)
 * @returns React Query query for games list
 *
 * @example
 * ```typescript
 * const { data: gamesPage } = useGamesQuery(apiClient, { page: 1, per_page: 20, status: 'active' });
 *
 * gamesPage?.data.forEach(game => {
 *   console.log(`${game.game_title}: ${game.state}`);
 * });
 * ```
 */
export function useGamesQuery(
  apiClient: AxiosInstance,
  params?: { page?: number; per_page?: number; status?: string }
) {
  return useQuery<PaginatedResponse<Game>, ErrorResponse>({
    queryKey: ['games', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Game>>('/games', { params });
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Query hook for fetching valid game actions
 *
 * Fetches list of valid actions for current game state.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game options
 *
 * @example
 * ```typescript
 * const { data: options } = useGameOptions(apiClient, gameUlid);
 *
 * // Display valid moves to user
 * options?.valid_actions.forEach(action => {
 *   console.log(`Valid action: ${action.action_type}`);
 * });
 * ```
 */
export function useGameOptions(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Record<string, unknown>, ErrorResponse>({
    queryKey: ['game', ulid, 'options'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
        `/games/${ulid}/options`
      );
      return response.data.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Mutation hook for executing game actions
 *
 * Submits a player action to the game engine and invalidates the game
 * query to trigger a refetch of the updated state.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @returns React Query mutation for game actions
 *
 * @example
 * ```typescript
 * const { mutate: makeMove, isLoading } = useGameAction(apiClient, gameUlid);
 *
 * makeMove({
 *   action_type: 'drop_piece',
 *   action_details: { column: 3 }
 * });
 * ```
 */
export function useGameAction(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Game>, ErrorResponse, SubmitActionRequest>({
    mutationFn: async (action: SubmitActionRequest) => {
      const response = await apiClient.post<ApiResponse<Game>>(`/games/${ulid}/actions`, action);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
    },
  });
}

/**
 * Mutation hook for forfeiting a game
 *
 * Concedes the game, awarding win to opponent, and invalidates the
 * game query to reflect the updated state.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @returns React Query mutation for forfeit operation
 *
 * @example
 * ```typescript
 * const { mutate: forfeit } = useForfeitGame(apiClient, gameUlid);
 *
 * forfeit(undefined, {
 *   onSuccess: () => navigate('/games')
 * });
 * ```
 */
export function useForfeitGame(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Game>, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Game>>(`/games/${ulid}/concede`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
    },
  });
}
