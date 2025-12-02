import { useQuery } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { LeaderboardResponse } from '../../types/feed.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * Data Feed Hooks
 *
 * Provides React Query hooks for leaderboards and real-time data feeds.
 * SSE (Server-Sent Events) streams should be handled separately using EventSource API.
 *
 * @example
 * ```typescript
 * const { data: leaderboard } = useLeaderboardQuery(apiClient, 'chess');
 * ```
 */

/**
 * Query hook for fetching game leaderboard
 *
 * Fetches the leaderboard for a specific game title with rankings,
 * ratings, and win/loss records.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param gameTitle - Game title slug (e.g., 'chess', 'connect-four')
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for leaderboard data
 *
 * @example
 * ```typescript
 * const { data: leaderboard, isLoading } = useLeaderboardQuery(apiClient, 'chess');
 *
 * leaderboard?.data.entries.forEach(entry => {
 *   console.log(`${entry.rank}. ${entry.username} - ${entry.rating}`);
 * });
 * ```
 *
 * @example With filtering
 * ```typescript
 * const { data: leaderboard } = useLeaderboardQuery(
 *   apiClient,
 *   'chess',
 *   { enabled: isAuthenticated }
 * );
 * ```
 */
export function useLeaderboardQuery(
  apiClient: AxiosInstance,
  gameTitle: string,
  options?: { enabled?: boolean }
) {
  return useQuery<LeaderboardResponse, ErrorResponse>({
    queryKey: ['feeds', 'leaderboard', gameTitle],
    queryFn: async () => {
      const response = await apiClient.get<LeaderboardResponse>(`/feeds/leaderboards/${gameTitle}`);
      return response.data;
    },
    ...options,
  });
}

/**
 * SSE Stream Helper Types
 *
 * For implementing Server-Sent Event streams, use the native EventSource API
 * or a compatible library. Example:
 *
 * @example Using EventSource for game feed
 * ```typescript
 * const setupGameFeed = (apiClient: AxiosInstance, gameTitle?: string) => {
 *   const baseUrl = apiClient.defaults.baseURL || '';
 *   const token = apiClient.defaults.headers.common['Authorization'];
 *   const clientKey = apiClient.defaults.headers.common['X-Client-Key'];
 *
 *   const params = gameTitle ? `?title_key=${gameTitle}` : '';
 *   const url = `${baseUrl}/feeds/games${params}`;
 *
 *   const eventSource = new EventSource(url, {
 *     withCredentials: true,
 *     headers: {
 *       'Authorization': token,
 *       'X-Client-Key': clientKey
 *     }
 *   });
 *
 *   eventSource.addEventListener('game-update', (event) => {
 *     const data = JSON.parse(event.data);
 *     console.log('Game update:', data);
 *   });
 *
 *   return eventSource;
 * };
 * ```
 *
 * @example Using EventSource for wins feed
 * ```typescript
 * const setupWinsFeed = (apiClient: AxiosInstance) => {
 *   const baseUrl = apiClient.defaults.baseURL || '';
 *   const url = `${baseUrl}/feeds/wins`;
 *
 *   const eventSource = new EventSource(url, {
 *     withCredentials: true
 *   });
 *
 *   eventSource.addEventListener('win-announcement', (event) => {
 *     const data = JSON.parse(event.data);
 *     console.log('Win announcement:', data);
 *   });
 *
 *   return eventSource;
 * };
 * ```
 *
 * @example Using EventSource for tournaments feed
 * ```typescript
 * const setupTournamentFeed = (apiClient: AxiosInstance) => {
 *   const baseUrl = apiClient.defaults.baseURL || '';
 *   const url = `${baseUrl}/feeds/tournaments`;
 *
 *   const eventSource = new EventSource(url, {
 *     withCredentials: true
 *   });
 *
 *   eventSource.addEventListener('tournament-update', (event) => {
 *     const data = JSON.parse(event.data);
 *     console.log('Tournament update:', data);
 *   });
 *
 *   return eventSource;
 * };
 * ```
 *
 * Available SSE endpoints:
 * - `/feeds/games` - Stream public game activity
 * - `/feeds/wins` - Stream win announcements
 * - `/feeds/tournaments` - Stream tournament progress
 * - `/feeds/challenges` - Stream challenge activity
 * - `/feeds/achievements` - Stream achievement unlocks
 *
 * All SSE endpoints support query parameters for filtering.
 */
