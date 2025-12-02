import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  QueueSlotResponse,
  JoinQueueRequest,
  Lobby,
  CreateLobbyRequest,
  JoinLobbyRequest,
  SeatPlayersRequest,
  InvitePlayersRequest,
  ProposalResponse,
  CreateProposalRequest,
  AcceptProposalResponse,
  DeclineProposalResponse,
} from '../../types/matchmaking.types';
import type { ErrorResponse, PaginatedResponse, ApiResponse } from '../../types/api.types';

/**
 * Matchmaking hooks for GamerProtocol API
 *
 * Provides React Query hooks for matchmaking operations including:
 * - Queue management (join/leave quickplay matchmaking)
 * - Lobby operations (create, join, manage lobbies)
 * - Proposals (challenges and rematches)
 *
 * All mutation hooks automatically invalidate relevant queries to keep
 * the cache synchronized.
 *
 * @example
 * ```typescript
 * const { mutate: joinQueue } = useJoinQueue(apiClient);
 * const { data: lobbies } = useLobbiesQuery(apiClient);
 * const { mutate: createLobby } = useCreateLobby(apiClient);
 * ```
 */

// ============================================================================
// Queue Endpoints
// ============================================================================

/**
 * Mutation hook for joining matchmaking queue
 *
 * Enters the matchmaking queue for quick public match. Returns a queue slot
 * with ULID that can be used to leave the queue before a match is found.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for joining matchmaking queue
 *
 * @example
 * ```typescript
 * const { mutate: joinQueue, data } = useJoinQueue(apiClient);
 *
 * joinQueue({
 *   game_title: 'connect-four',
 *   mode_id: 1,
 *   skill_rating: 1500,
 *   preferences: { game_mode: 'blitz' }
 * }, {
 *   onSuccess: (response) => {
 *     console.log('Queued! Slot ULID:', response.data.ulid);
 *   }
 * });
 * ```
 */
export function useJoinQueue(apiClient: AxiosInstance) {
  return useMutation<QueueSlotResponse, ErrorResponse, JoinQueueRequest>({
    mutationFn: async (data: JoinQueueRequest) => {
      const response = await apiClient.post<QueueSlotResponse>('/matchmaking/queue', data);
      return response.data;
    },
  });
}

/**
 * Mutation hook for leaving matchmaking queue
 *
 * Exits the matchmaking queue before a match is found. Use the queue slot
 * ULID returned from useJoinQueue.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param queueSlotUlid - Queue slot ULID to cancel
 * @returns React Query mutation for leaving queue
 *
 * @example
 * ```typescript
 * const { mutate: leaveQueue } = useLeaveQueue(apiClient, queueSlotUlid);
 *
 * leaveQueue(undefined, {
 *   onSuccess: () => console.log('Left queue successfully')
 * });
 * ```
 */
export function useLeaveQueue(apiClient: AxiosInstance, queueSlotUlid: string) {
  return useMutation<QueueSlotResponse, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.delete<QueueSlotResponse>(
        `/matchmaking/queue/${queueSlotUlid}`
      );
      return response.data;
    },
  });
}

// ============================================================================
// Lobby Endpoints
// ============================================================================

/**
 * Query hook for fetching available lobbies
 *
 * Fetches paginated list of public lobbies with optional filtering by
 * game title and mode.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param params - Optional query parameters (page, per_page, game_title, mode_id)
 * @returns React Query query for lobbies list
 *
 * @example
 * ```typescript
 * const { data: lobbies } = useLobbiesQuery(apiClient, {
 *   game_title: 'hearts',
 *   mode_id: 2,
 *   page: 1,
 *   per_page: 20
 * });
 *
 * lobbies?.data.forEach(lobby => {
 *   console.log(`${lobby.game_title}: ${lobby.current_players}/${lobby.min_players}`);
 * });
 * ```
 */
export function useLobbiesQuery(
  apiClient: AxiosInstance,
  params?: { page?: number; per_page?: number; game_title?: string; mode_id?: number }
) {
  return useQuery<PaginatedResponse<Lobby>, ErrorResponse>({
    queryKey: ['matchmaking', 'lobbies', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Lobby>>('/matchmaking/lobbies', {
        params,
      });
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
    queryKey: ['matchmaking', 'lobby', ulid],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lobby>>(`/matchmaking/lobbies/${ulid}`);
      return response.data.data;
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
 *   game_title: 'hearts',
 *   mode_id: 2,
 *   is_public: true,
 *   min_players: 4,
 *   scheduled_at: '2025-11-22T20:00:00Z',
 *   invitees: [1, 2, 3]
 * });
 * ```
 */
export function useCreateLobby(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Lobby>, ErrorResponse, CreateLobbyRequest>({
    mutationFn: async (data: CreateLobbyRequest) => {
      const response = await apiClient.post<ApiResponse<Lobby>>('/matchmaking/lobbies', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobbies'] });
    },
  });
}

/**
 * Mutation hook for deleting/canceling a lobby
 *
 * Deletes lobby if user is host. Only the host can delete a lobby.
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
      await apiClient.delete(`/matchmaking/lobbies/${ulid}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobbies'] });
    },
  });
}

/**
 * Mutation hook for initiating ready check
 *
 * Starts a ready check for all players in the lobby (host only).
 * Returns the updated lobby with ready check status.
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

  return useMutation<ApiResponse<Lobby>, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<Lobby>>(
        `/matchmaking/lobbies/${ulid}/ready-check`
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
    },
  });
}

/**
 * Mutation hook for seating players
 *
 * Assigns seat positions to players in the lobby (host only).
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @returns React Query mutation for seating players
 *
 * @example
 * ```typescript
 * const { mutate: seatPlayers } = useSeatPlayers(apiClient, lobbyUlid);
 *
 * seatPlayers({
 *   seats: {
 *     'player1': 0,
 *     'player2': 1,
 *     'player3': 2,
 *     'player4': 3
 *   }
 * });
 * ```
 */
export function useSeatPlayers(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Lobby>, ErrorResponse, SeatPlayersRequest>({
    mutationFn: async (data: SeatPlayersRequest) => {
      const response = await apiClient.post<ApiResponse<Lobby>>(
        `/matchmaking/lobbies/${ulid}/seat`,
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
    },
  });
}

/**
 * Mutation hook for inviting players to lobby
 *
 * Sends invitations to specified users (host only).
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @returns React Query mutation for inviting players
 *
 * @example
 * ```typescript
 * const { mutate: invitePlayers } = useInvitePlayers(apiClient, lobbyUlid);
 *
 * invitePlayers({
 *   user_ids: [1, 2, 3]
 * });
 * ```
 */
export function useInvitePlayers(apiClient: AxiosInstance, ulid: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Lobby>, ErrorResponse, InvitePlayersRequest>({
    mutationFn: async (data: InvitePlayersRequest) => {
      const response = await apiClient.post<ApiResponse<Lobby>>(
        `/matchmaking/lobbies/${ulid}/players`,
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
    },
  });
}

/**
 * Mutation hook for joining/accepting a lobby
 *
 * Adds authenticated user to lobby as a player. Can be used to join a
 * public lobby or accept an invitation to a private lobby.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param ulid - Lobby ULID identifier
 * @param username - Player username joining the lobby
 * @returns React Query mutation for joining lobby
 *
 * @example
 * ```typescript
 * const { mutate: joinLobby } = useJoinLobby(apiClient, lobbyUlid, 'myusername');
 *
 * joinLobby({ status: 'accepted' });
 * ```
 */
export function useJoinLobby(apiClient: AxiosInstance, ulid: string, username: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Lobby>, ErrorResponse, JoinLobbyRequest>({
    mutationFn: async (data: JoinLobbyRequest) => {
      const response = await apiClient.put<ApiResponse<Lobby>>(
        `/matchmaking/lobbies/${ulid}/players/${username}`,
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobbies'] });
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
      await apiClient.delete(`/matchmaking/lobbies/${ulid}/players/${username}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobby', ulid] });
      await queryClient.invalidateQueries({ queryKey: ['matchmaking', 'lobbies'] });
    },
  });
}

// ============================================================================
// Proposal Endpoints (Challenges & Rematches)
// ============================================================================

/**
 * Mutation hook for creating a proposal
 *
 * Creates a rematch request or challenge to another player. For rematches,
 * provide the original game ULID. For challenges, provide opponent username
 * and game details.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for creating proposal
 *
 * @example Rematch
 * ```typescript
 * const { mutate: createProposal } = useCreateProposal(apiClient);
 *
 * createProposal({
 *   type: 'rematch',
 *   original_game_ulid: '01J3GAME123'
 * });
 * ```
 *
 * @example Challenge
 * ```typescript
 * createProposal({
 *   type: 'casual',
 *   opponent_username: 'player2',
 *   title_slug: 'checkers',
 *   mode_id: 3,
 *   game_settings: {}
 * });
 * ```
 */
export function useCreateProposal(apiClient: AxiosInstance) {
  return useMutation<ProposalResponse, ErrorResponse, CreateProposalRequest>({
    mutationFn: async (data: CreateProposalRequest) => {
      const response = await apiClient.post<ProposalResponse>('/matchmaking/proposals', data);
      return response.data;
    },
  });
}

/**
 * Mutation hook for accepting a proposal
 *
 * Accepts a rematch request or challenge from another player. Creates a
 * new game and returns the game ULID.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param proposalUlid - Proposal ULID identifier
 * @returns React Query mutation for accepting proposal
 *
 * @example
 * ```typescript
 * const { mutate: acceptProposal } = useAcceptProposal(apiClient, proposalUlid);
 *
 * acceptProposal(undefined, {
 *   onSuccess: (response) => {
 *     console.log('Game created:', response.data.new_game_ulid);
 *     navigate(`/games/${response.data.new_game_ulid}`);
 *   }
 * });
 * ```
 */
export function useAcceptProposal(apiClient: AxiosInstance, proposalUlid: string) {
  return useMutation<AcceptProposalResponse, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<AcceptProposalResponse>(
        `/matchmaking/proposals/${proposalUlid}/accept`
      );
      return response.data;
    },
  });
}

/**
 * Mutation hook for declining a proposal
 *
 * Declines a rematch request or challenge from another player.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param proposalUlid - Proposal ULID identifier
 * @returns React Query mutation for declining proposal
 *
 * @example
 * ```typescript
 * const { mutate: declineProposal } = useDeclineProposal(apiClient, proposalUlid);
 *
 * declineProposal();
 * ```
 */
export function useDeclineProposal(apiClient: AxiosInstance, proposalUlid: string) {
  return useMutation<DeclineProposalResponse, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<DeclineProposalResponse>(
        `/matchmaking/proposals/${proposalUlid}/decline`
      );
      return response.data;
    },
  });
}
