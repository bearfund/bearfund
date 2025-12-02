import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  User,
  UpdateProfileRequest,
  UserProgression,
  UserRecords,
  AlertsResponse,
  MarkAlertsReadRequest,
} from '../../types/auth.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * Account management hooks for GamerProtocol API
 *
 * Provides React Query hooks for user account operations including:
 * - User profile fetching and updates
 * - Progression (levels and XP) tracking
 * - Gameplay records and statistics
 * - User alerts/notifications
 *
 * These hooks are separate from authentication hooks to maintain clear
 * separation between auth operations and account management.
 *
 * @example
 * ```typescript
 * const { data: user } = useProfileQuery(apiClient);
 * const { mutate: updateProfile } = useUpdateProfile(apiClient);
 * const { data: progression } = useProgressionQuery(apiClient);
 * const { data: records } = useRecordsQuery(apiClient);
 * const { data: alerts } = useAlertsQuery(apiClient);
 * const { mutate: markRead } = useMarkAlertsRead(apiClient);
 * ```
 */

/**
 * Current user profile query hook
 *
 * Fetches the currently authenticated user's profile information.
 * This query is automatically invalidated after login, social login,
 * email verification, and profile updates.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for current user profile data
 *
 * @example
 * ```typescript
 * const { data: user, isLoading, error } = useProfileQuery(apiClient);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 *
 * @example Platform-specific usage (React Native)
 * ```typescript
 * // Only fetch user if token exists
 * const { data: user } = useProfileQuery(apiClient, {
 *   enabled: !!token
 * });
 * ```
 */
export function useProfileQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<User, ErrorResponse>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>('/account/profile');
      return response.data.data;
    },
    ...options,
  });
}

/**
 * Profile update hook
 *
 * Updates the currently authenticated user's profile information and
 * automatically invalidates the user query to reflect changes.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for profile update operation
 *
 * @example
 * ```typescript
 * const { mutate: updateProfile, isLoading } = useUpdateProfile(apiClient);
 *
 * updateProfile({
 *   name: 'Johnny Doe',
 *   bio: 'Professional esports player',
 *   social_links: {
 *     twitter: 'https://twitter.com/johnnydoe'
 *   }
 * });
 * ```
 *
 * @example With success callback
 * ```typescript
 * updateProfile(
 *   { name: 'New Name' },
 *   {
 *     onSuccess: (updatedUser) => {
 *       console.log('Profile updated:', updatedUser);
 *     }
 *   }
 * );
 * ```
 */
export function useUpdateProfile(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<User, ErrorResponse, UpdateProfileRequest>({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.patch<{ data: User }>('/account/profile', data);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * User progression query hook
 *
 * Fetches the user's level, experience points, titles, badges, achievements, and milestones.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for user progression data
 *
 * @example
 * ```typescript
 * const { data: progression, isLoading } = useProgressionQuery(apiClient);
 *
 * if (progression) {
 *   console.log('Level:', progression.level);
 *   console.log('XP:', progression.experience_points);
 *   console.log('Progress to next:', progression.progress_to_next_level + '%');
 *   console.log('Titles:', progression.titles.length);
 *   console.log('Badges:', progression.badges.length);
 * }
 * ```
 */
export function useProgressionQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<UserProgression, ErrorResponse>({
    queryKey: ['account', 'progression'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserProgression }>('/account/progression');
      return response.data.data;
    },
    ...options,
  });
}

/**
 * User records query hook
 *
 * Fetches the user's gameplay records and statistics across all games.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for user records data
 *
 * @example
 * ```typescript
 * const { data: records, isLoading } = useRecordsQuery(apiClient);
 *
 * if (records) {
 *   console.log('Total games:', records.total_games);
 *   console.log('Win rate:', (records.win_rate * 100).toFixed(1) + '%');
 *   console.log('Current streak:', records.current_streak);
 *   console.log('Global rank:', records.global_rank);
 *   records.games_by_title.forEach(game => {
 *     console.log(`${game.title_name}: ${game.wins}W-${game.losses}L`);
 *   });
 * }
 * ```
 */
export function useRecordsQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<UserRecords, ErrorResponse>({
    queryKey: ['account', 'records'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserRecords }>('/account/records');
      return response.data.data;
    },
    ...options,
  });
}

/**
 * User alerts query hook
 *
 * Fetches paginated user notifications/alerts.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Query options including pagination parameters
 * @returns React Query query for alerts data
 *
 * @example
 * ```typescript
 * const { data: alerts, isLoading } = useAlertsQuery(apiClient, {
 *   page: 1,
 *   per_page: 20
 * });
 *
 * if (alerts) {
 *   const unreadCount = alerts.data.filter(a => !a.read_at).length;
 *   console.log('Unread alerts:', unreadCount);
 *   alerts.data.forEach(alert => {
 *     console.log(`[${alert.type}] Data:`, alert.data);
 *   });
 * }
 * ```
 */
export function useAlertsQuery(
  apiClient: AxiosInstance,
  options?: { page?: number; per_page?: number; enabled?: boolean }
) {
  const { page = 1, per_page = 20, enabled } = options ?? {};

  return useQuery<AlertsResponse, ErrorResponse>({
    queryKey: ['account', 'alerts', page, per_page],
    queryFn: async () => {
      const response = await apiClient.get<AlertsResponse>('/account/alerts', {
        params: { page, per_page },
      });
      return response.data;
    },
    enabled,
  });
}

/**
 * Mark alerts as read hook
 *
 * Marks specified alerts as read and invalidates the alerts query.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for marking alerts as read
 *
 * @example
 * ```typescript
 * const { mutate: markRead, isLoading } = useMarkAlertsRead(apiClient);
 *
 * // Mark specific alerts as read
 * markRead({ alert_ulids: ['01J3ABC...', '01J3DEF...'] });
 * ```
 *
 * @example With success callback
 * ```typescript
 * markRead(
 *   { alert_ulids: ['01J3ABC...'] },
 *   {
 *     onSuccess: () => {
 *       console.log('Alerts marked as read');
 *     }
 *   }
 * );
 * ```
 */
export function useMarkAlertsRead(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, MarkAlertsReadRequest>({
    mutationFn: async (data: MarkAlertsReadRequest) => {
      await apiClient.post('/account/alerts/read', data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account', 'alerts'] });
    },
  });
}
