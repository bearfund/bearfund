import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  Game,
  GameListItem,
  GameAction,
  GameActionResponse,
  GameOptions,
  GameOutcome,
  SubmitActionRequest,
} from '../../types/game.types';
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
 * @param params - Optional query parameters (page, per_page, status, limit)
 * @returns React Query query for games list
 *
 * @example
 * ```typescript
 * const { data: gamesPage } = useGamesQuery(apiClient, { status: 'active', limit: 20 });
 *
 * gamesPage?.data.forEach(game => {
 *   console.log(`${game.game_title}: ${game.status}`);
 * });
 * ```
 */
export function useGamesQuery(
  apiClient: AxiosInstance,
  params?: { page?: number; per_page?: number; status?: string; limit?: number }
) {
  return useQuery<PaginatedResponse<GameListItem>, ErrorResponse>({
    queryKey: ['games', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<GameListItem>>('/games', { params });
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Query hook for fetching valid game actions
 *
 * Fetches list of valid actions and options for current game state.
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
 * if (options?.is_your_turn) {
 *   options.options.forEach(action => {
 *     console.log(`Valid action: ${action.action}`);
 *   });
 * }
 * ```
 */
export function useGameOptions(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<GameOptions, ErrorResponse>({
    queryKey: ['game', ulid, 'options'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GameOptions>>(`/games/${ulid}/options`);
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
 * query to trigger a refetch of the updated state. Supports idempotency
 * keys to prevent duplicate submissions.
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
 *   action_type: 'DROP_PIECE',
 *   action_details: { column: 3 }
 * });
 * ```
 */
export function useGameAction(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<GameActionResponse>, ErrorResponse, SubmitActionRequest>({
    mutationFn: async (action: SubmitActionRequest) => {
      const response = await apiClient.post<ApiResponse<GameActionResponse>>(
        `/games/${ulid}/actions`,
        action
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

/**
 * Query hook for fetching game action history
 *
 * Fetches complete timeline of all actions taken in a game.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for action history
 *
 * @example
 * ```typescript
 * const { data: actions } = useGameActionsQuery(apiClient, gameUlid);
 *
 * actions?.data.forEach(action => {
 *   console.log(`Turn ${action.turn_number}: ${action.action_type}`);
 * });
 * ```
 */
export function useGameActionsQuery(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<GameAction[]>, ErrorResponse>({
    queryKey: ['game', ulid, 'actions'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GameAction[]>>(`/games/${ulid}/actions`);
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Mutation hook for conceding a game
 *
 * Concedes the game (resignation), awarding win to opponent. Returns a simple
 * message confirmation. To get the full outcome, use useGameOutcome.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @returns React Query mutation for concede operation
 *
 * @example
 * ```typescript
 * const { mutate: concede } = useConcedeGame(apiClient, gameUlid);
 *
 * concede(undefined, {
 *   onSuccess: (response) => {
 *     console.log(response.message); // "Game conceded successfully"
 *     navigate('/games');
 *   }
 * });
 * ```
 */
export function useConcedeGame(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>(`/games/${ulid}/concede`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

/**
 * Mutation hook for abandoning a game
 *
 * Abandons the game (higher penalty than concede), awarding win to opponent.
 * Returns a simple message confirmation.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @returns React Query mutation for abandon operation
 *
 * @example
 * ```typescript
 * const { mutate: abandon } = useAbandonGame(apiClient, gameUlid);
 *
 * abandon(undefined, {
 *   onSuccess: () => navigate('/games')
 * });
 * ```
 */
export function useAbandonGame(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>(`/games/${ulid}/abandon`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

/**
 * Query hook for fetching game outcome
 *
 * Fetches the final outcome and results of a completed game.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game outcome
 *
 * @example
 * ```typescript
 * const { data: outcome } = useGameOutcome(apiClient, gameUlid);
 *
 * if (outcome?.data) {
 *   console.log(`Outcome: ${outcome.data.outcome_type}`);
 *   console.log(`Winner: ${outcome.data.winner?.username}`);
 * }
 * ```
 */
export function useGameOutcome(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<ApiResponse<GameOutcome>, ErrorResponse>({
    queryKey: ['game', ulid, 'outcome'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GameOutcome>>(`/games/${ulid}/outcome`);
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * @deprecated Use useConcedeGame instead
 */
export function useForfeitGame(apiClient: AxiosInstance, ulid: string) {
  return useConcedeGame(apiClient, ulid);
}
