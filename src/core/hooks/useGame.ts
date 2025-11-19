import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  Game,
  GameHistory,
  SubmitActionRequest,
  Lobby,
  CreateLobbyRequest,
  UpdateLobbyRequest,
} from '../../types/game.types';
import type { ErrorResponse, PaginatedResponse } from '../../types/api.types';

/**
 * Game Management Hooks
 *
 * Provides React Query hooks for game operations including:
 * - Game state queries and mutations
 * - Lobby creation and management
 * - Quickplay matchmaking
 * - Rematch requests
 *
 * All mutation hooks automatically invalidate relevant queries to keep
 * the cache synchronized. Query hooks disable automatic refetching by
 * default since real-time updates come via WebSocket.
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
      const response = await apiClient.get<Game>(`/games/${ulid}`);
      return response.data;
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
      const response = await apiClient.get<Record<string, unknown>>(`/games/${ulid}/options`);
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Query hook for fetching game action history
 *
 * Fetches complete action history for game replay.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game history
 *
 * @example
 * ```typescript
 * const { data: history } = useGameHistory(apiClient, gameUlid);
 *
 * // Replay game moves
 * history?.actions.forEach((action, index) => {
 *   console.log(`Move ${index + 1}: ${action.action_type}`);
 * });
 * ```
 */
export function useGameHistory(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<GameHistory, ErrorResponse>({
    queryKey: ['game', ulid, 'history'],
    queryFn: async () => {
      const response = await apiClient.get<GameHistory>(`/games/${ulid}/history`);
      return response.data;
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

  return useMutation<Game, ErrorResponse, SubmitActionRequest>({
    mutationFn: async (action: SubmitActionRequest) => {
      const response = await apiClient.post<Game>(`/games/${ulid}/action`, action);
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

  return useMutation<Game, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<Game>(`/games/${ulid}/forfeit`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['game', ulid] });
    },
  });
}

/**
 * Query hook for fetching available lobbies
 *
 * Fetches paginated list of public lobbies with optional filtering.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param params - Optional query parameters (page, per_page, game_title filter)
 * @returns React Query query for lobbies list
 *
 * @example
 * ```typescript
 * const { data: lobbies } = useLobbiesQuery(apiClient, { game_title: 'ValidateFour' });
 *
 * lobbies?.data.forEach(lobby => {
 *   console.log(`${lobby.name}: ${lobby.players.length}/${lobby.max_players}`);
 * });
 * ```
 */
export function useLobbiesQuery(
  apiClient: AxiosInstance,
  params?: { page?: number; per_page?: number; game_title?: string }
) {
  return useQuery<PaginatedResponse<Lobby>, ErrorResponse>({
    queryKey: ['lobbies', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Lobby>>('/games/lobbies', { params });
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Query hook for fetching a single lobby's details
 *
 * Fetches details of a specific lobby by ULID. Use useRealtimeLobby
 * hook for live updates when players join/leave.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for lobby details
 *
 * @example
 * ```typescript
 * const { data: lobby } = useLobbyQuery(apiClient, lobbyUlid);
 *
 * lobby?.players.forEach(player => {
 *   console.log(`${player.username}: ${player.status}`);
 * });
 * ```
 */
export function useLobbyQuery(
  apiClient: AxiosInstance,
  ulid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Lobby, ErrorResponse>({
    queryKey: ['lobby', ulid],
    queryFn: async () => {
      const response = await apiClient.get<Lobby>(`/games/lobbies/${ulid}`);
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Mutation hook for creating a lobby
 *
 * Creates a new private or public lobby and invalidates the lobbies
 * query to show it in the list.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for lobby creation
 *
 * @example
 * ```typescript
 * const { mutate: createLobby, isLoading } = useCreateLobby(apiClient);
 *
 * createLobby({
 *   game_title: 'ValidateFour',
 *   game_mode: 'standard',
 *   name: 'My Lobby',
 *   is_public: true,
 *   max_players: 2
 * });
 * ```
 */
export function useCreateLobby(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<Lobby, ErrorResponse, CreateLobbyRequest>({
    mutationFn: async (data: CreateLobbyRequest) => {
      const response = await apiClient.post<Lobby>('/games/lobbies', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });
}

/**
 * Mutation hook for joining a lobby
 *
 * Adds authenticated user to lobby as a player. Invalidates both the
 * specific lobby and lobbies list queries.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @returns React Query mutation for joining lobby
 *
 * @example
 * ```typescript
 * const { mutate: joinLobby } = useJoinLobby(apiClient, lobbyUlid);
 *
 * joinLobby();
 * ```
 */
export function useJoinLobby(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<Lobby, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<Lobby>(`/games/lobbies/${ulid}/players`);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });
}

/**
 * Mutation hook for updating player status in lobby
 *
 * Updates player's ready status. Invalidates the lobby query to reflect
 * the status change.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @param username - Player username to update
 * @returns React Query mutation for updating player status
 *
 * @example
 * ```typescript
 * const { mutate: updateStatus } = useUpdateLobbyPlayer(apiClient, lobbyUlid, 'johndoe');
 *
 * updateStatus({ status: 'ready' });
 * ```
 */
export function useUpdateLobbyPlayer(apiClient: AxiosInstance, ulid: string, username: string) {
  const queryClient = useQueryClient();

  return useMutation<Lobby, ErrorResponse, UpdateLobbyRequest>({
    mutationFn: async (data: UpdateLobbyRequest) => {
      const response = await apiClient.put<Lobby>(
        `/games/lobbies/${ulid}/players/${username}`,
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobby', ulid] });
    },
  });
}

/**
 * Mutation hook for removing player from lobby
 *
 * Kicks player from lobby (host only) or allows player to leave.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @param username - Player username to remove
 * @returns React Query mutation for removing player
 *
 * @example
 * ```typescript
 * const { mutate: removePlayer } = useRemoveLobbyPlayer(apiClient, lobbyUlid, 'johndoe');
 *
 * removePlayer();
 * ```
 */
export function useRemoveLobbyPlayer(apiClient: AxiosInstance, ulid: string, username: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, void>({
    mutationFn: async () => {
      await apiClient.delete(`/games/lobbies/${ulid}/players/${username}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });
}

/**
 * Mutation hook for deleting/leaving a lobby
 *
 * Deletes lobby if user is host, or leaves lobby if user is player.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @returns React Query mutation for deleting lobby
 *
 * @example
 * ```typescript
 * const { mutate: deleteLobby } = useDeleteLobby(apiClient, lobbyUlid);
 *
 * deleteLobby(undefined, {
 *   onSuccess: () => navigate('/lobbies')
 * });
 * ```
 */
export function useDeleteLobby(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, void>({
    mutationFn: async () => {
      await apiClient.delete(`/games/lobbies/${ulid}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    },
  });
}

/**
 * Mutation hook for starting ready check
 *
 * Initiates ready check for all players in lobby (host only).
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @returns React Query mutation for starting ready check
 *
 * @example
 * ```typescript
 * const { mutate: startReadyCheck } = useStartReadyCheck(apiClient, lobbyUlid);
 *
 * startReadyCheck();
 * ```
 */
export function useStartReadyCheck(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>(
        `/games/lobbies/${ulid}/ready-check`
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lobby', ulid] });
    },
  });
}

/**
 * Mutation hook for joining quickplay queue
 *
 * Enters matchmaking queue for quick public match.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for joining quickplay
 *
 * @example
 * ```typescript
 * const { mutate: joinQueue } = useJoinQuickplay(apiClient);
 *
 * joinQueue({
 *   game_title: 'ValidateFour',
 *   game_mode: 'standard'
 * });
 * ```
 */
export function useJoinQuickplay(apiClient: AxiosInstance) {
  return useMutation<
    { message: string },
    ErrorResponse,
    { game_title: string; game_mode?: string }
  >({
    mutationFn: async (data: { game_title: string; game_mode?: string }) => {
      const response = await apiClient.post<{ message: string }>('/games/quickplay', data);
      return response.data;
    },
  });
}

/**
 * Mutation hook for leaving quickplay queue
 *
 * Exits matchmaking queue before match is found.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for leaving quickplay
 *
 * @example
 * ```typescript
 * const { mutate: leaveQueue } = useLeaveQuickplay(apiClient);
 *
 * leaveQueue();
 * ```
 */
export function useLeaveQuickplay(apiClient: AxiosInstance) {
  return useMutation<void, ErrorResponse, void>({
    mutationFn: async () => {
      await apiClient.delete('/games/quickplay');
    },
  });
}

/**
 * Mutation hook for accepting quickplay match
 *
 * Confirms acceptance of found match within the time limit.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for accepting match
 *
 * @example
 * ```typescript
 * const { mutate: acceptMatch } = useAcceptQuickplay(apiClient);
 *
 * acceptMatch({ match_id: 'match_123' });
 * ```
 */
export function useAcceptQuickplay(apiClient: AxiosInstance) {
  return useMutation<{ message: string }, ErrorResponse, { match_id: string }>({
    mutationFn: async (data: { match_id: string }) => {
      const response = await apiClient.post<{ message: string }>('/games/quickplay/accept', data);
      return response.data;
    },
  });
}

/**
 * Mutation hook for requesting rematch
 *
 * Requests rematch with same opponent after game completion.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Game ULID identifier
 * @returns React Query mutation for rematch request
 *
 * @example
 * ```typescript
 * const { mutate: requestRematch } = useRequestRematch(apiClient, gameUlid);
 *
 * requestRematch();
 * ```
 */
export function useRequestRematch(apiClient: AxiosInstance, ulid: string) {
  return useMutation<{ request_id: string; message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ request_id: string; message: string }>(
        `/games/${ulid}/rematch`
      );
      return response.data;
    },
  });
}

/**
 * Mutation hook for accepting rematch
 *
 * Accepts a rematch request, creating a new game.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param requestId - Rematch request ID
 * @returns React Query mutation for accepting rematch
 *
 * @example
 * ```typescript
 * const { mutate: acceptRematch } = useAcceptRematch(apiClient, requestId);
 *
 * acceptRematch(undefined, {
 *   onSuccess: (game) => navigate(`/game/${game.ulid}`)
 * });
 * ```
 */
export function useAcceptRematch(apiClient: AxiosInstance, requestId: string) {
  return useMutation<Game, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<Game>(`/games/rematch/${requestId}/accept`);
      return response.data;
    },
  });
}

/**
 * Mutation hook for declining rematch
 *
 * Declines a rematch request.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param requestId - Rematch request ID
 * @returns React Query mutation for declining rematch
 *
 * @example
 * ```typescript
 * const { mutate: declineRematch } = useDeclineRematch(apiClient, requestId);
 *
 * declineRematch();
 * ```
 */
export function useDeclineRematch(apiClient: AxiosInstance, requestId: string) {
  return useMutation<{ message: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>(
        `/games/rematch/${requestId}/decline`
      );
      return response.data;
    },
  });
}
