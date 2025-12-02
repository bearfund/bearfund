/**
 * Competition Hooks
 * API Namespace: Competitions
 *
 * Tournament management, brackets, and standings.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  TournamentsResponse,
  TournamentResponse,
  TournamentEntryResponse,
  TournamentStructureResponse,
  TournamentBracketResponse,
  TournamentStandingsResponse,
} from '../../types/competition.types';

/**
 * List active tournaments
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Query options for pagination
 * @returns Query result with tournaments list
 *
 * @example
 * ```tsx
 * const { data: tournaments } = useCompetitionsQuery(apiClient);
 * ```
 */
export function useCompetitionsQuery(
  apiClient: AxiosInstance,
  options?: UseQueryOptions<TournamentsResponse> & {
    page?: number;
    per_page?: number;
  }
) {
  const { page, per_page, ...queryOptions } = options ?? {};

  return useQuery<TournamentsResponse>({
    queryKey: ['competitions', { page, per_page }],
    queryFn: async () => {
      const params = new globalThis.URLSearchParams();
      if (page) params.append('page', page.toString());
      if (per_page) params.append('per_page', per_page.toString());

      const response = await apiClient.get<TournamentsResponse>(
        `/competitions${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    },
    ...queryOptions,
  });
}

/**
 * Get tournament details
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param tournamentId - Tournament ULID
 * @param options - Query options
 * @returns Query result with tournament details
 *
 * @example
 * ```tsx
 * const { data: tournament } = useTournamentQuery(apiClient, '01J3TOUR...');
 * ```
 */
export function useTournamentQuery(
  apiClient: AxiosInstance,
  tournamentId: string,
  options?: UseQueryOptions<TournamentResponse>
) {
  return useQuery<TournamentResponse>({
    queryKey: ['competitions', tournamentId],
    queryFn: async () => {
      const response = await apiClient.get<TournamentResponse>(`/competitions/${tournamentId}`);
      return response.data;
    },
    enabled: !!tournamentId,
    ...options,
  });
}

/**
 * Register for tournament
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns Mutation to enter a tournament
 *
 * @example
 * ```tsx
 * const { mutate: enterTournament } = useEnterTournament(apiClient);
 *
 * enterTournament('01J3TOUR...', {
 *   onSuccess: (data) => {
 *     console.log('Entered tournament:', data.data.tournament_ulid);
 *   }
 * });
 * ```
 */
export function useEnterTournament(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<TournamentEntryResponse, Error, string>({
    mutationFn: async (tournamentId: string) => {
      const response = await apiClient.post<TournamentEntryResponse>(
        `/competitions/${tournamentId}/enter`
      );
      return response.data;
    },
    onSuccess: (_data, tournamentId) => {
      // Invalidate tournament details to refresh participant count
      void queryClient.invalidateQueries({ queryKey: ['competitions', tournamentId] });
      // Invalidate tournaments list
      void queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}

/**
 * Get tournament structure and format rules
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param tournamentId - Tournament ULID
 * @param options - Query options
 * @returns Query result with tournament structure
 *
 * @example
 * ```tsx
 * const { data: structure } = useTournamentStructureQuery(apiClient, '01J3TOUR...');
 * ```
 */
export function useTournamentStructureQuery(
  apiClient: AxiosInstance,
  tournamentId: string,
  options?: UseQueryOptions<TournamentStructureResponse>
) {
  return useQuery<TournamentStructureResponse>({
    queryKey: ['competitions', tournamentId, 'structure'],
    queryFn: async () => {
      const response = await apiClient.get<TournamentStructureResponse>(
        `/competitions/${tournamentId}/structure`
      );
      return response.data;
    },
    enabled: !!tournamentId,
    ...options,
  });
}

/**
 * Get tournament bracket
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param tournamentId - Tournament ULID
 * @param options - Query options
 * @returns Query result with tournament bracket
 *
 * @example
 * ```tsx
 * const { data: bracket } = useTournamentBracketQuery(apiClient, '01J3TOUR...');
 *
 * // Access bracket rounds and matches
 * bracket?.data.rounds.forEach(round => {
 *   console.log(`Round ${round.round_number}:`, round.matches);
 * });
 * ```
 */
export function useTournamentBracketQuery(
  apiClient: AxiosInstance,
  tournamentId: string,
  options?: UseQueryOptions<TournamentBracketResponse>
) {
  return useQuery<TournamentBracketResponse>({
    queryKey: ['competitions', tournamentId, 'bracket'],
    queryFn: async () => {
      const response = await apiClient.get<TournamentBracketResponse>(
        `/competitions/${tournamentId}/bracket`
      );
      return response.data;
    },
    enabled: !!tournamentId,
    ...options,
  });
}

/**
 * Get tournament standings
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param tournamentId - Tournament ULID
 * @param options - Query options
 * @returns Query result with tournament standings
 *
 * @example
 * ```tsx
 * const { data: standings } = useTournamentStandingsQuery(apiClient, '01J3TOUR...');
 *
 * // Display leaderboard
 * standings?.data.standings.map(standing => (
 *   <div key={standing.username}>
 *     #{standing.rank} {standing.username} - {standing.wins}W / {standing.losses}L
 *   </div>
 * ));
 * ```
 */
export function useTournamentStandingsQuery(
  apiClient: AxiosInstance,
  tournamentId: string,
  options?: UseQueryOptions<TournamentStandingsResponse>
) {
  return useQuery<TournamentStandingsResponse>({
    queryKey: ['competitions', tournamentId, 'standings'],
    queryFn: async () => {
      const response = await apiClient.get<TournamentStandingsResponse>(
        `/competitions/${tournamentId}/standings`
      );
      return response.data;
    },
    enabled: !!tournamentId,
    ...options,
  });
}
