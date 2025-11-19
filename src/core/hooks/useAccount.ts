import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { User, UpdateProfileRequest } from '../../types/auth.types';
import type {
  AccountStats,
  AccountLevel,
  AccountAlert,
  MarkAlertsReadRequest,
} from '../../types/account.types';
import type { ErrorResponse, PaginatedResponse } from '../../types/api.types';

/**
 * Account & User Stats Hooks
 *
 * Provides React Query hooks for accessing authenticated user's detailed
 * profile, statistics, levels, and notifications.
 *
 * @example
 * ```typescript
 * const { data: profile } = useAccountProfile(apiClient);
 * const { data: stats } = useAccountStats(apiClient);
 * ```
 */

/**
 * Query hook for fetching detailed user profile
 *
 * Fetches the currently authenticated user's full profile information.
 * This endpoint may return more detailed data than the basic auth user endpoint.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for user profile
 *
 * @example
 * ```typescript
 * const { data: profile } = useAccountProfile(apiClient);
 * console.log(profile?.bio);
 * ```
 */
export function useAccountProfile(apiClient: AxiosInstance) {
  return useQuery<User, ErrorResponse>({
    queryKey: ['me', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/me/profile');
      return response.data;
    },
  });
}

/**
 * Mutation hook for updating user profile
 *
 * Updates the user's profile and invalidates both the profile query
 * and the main auth user query to ensure consistency.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for profile update
 *
 * @example
 * ```typescript
 * const { mutate: updateProfile } = useUpdateAccountProfile(apiClient);
 * updateProfile({ bio: 'New bio' });
 * ```
 */
export function useUpdateAccountProfile(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<User, ErrorResponse, UpdateProfileRequest>({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.patch<User>('/me/profile', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Query hook for fetching user statistics
 *
 * Fetches the user's win/loss records, points, and rank.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for user stats
 *
 * @example
 * ```typescript
 * const { data: stats } = useAccountStats(apiClient);
 * console.log(`Wins: ${stats?.wins}`);
 * ```
 */
export function useAccountStats(apiClient: AxiosInstance) {
  return useQuery<AccountStats, ErrorResponse>({
    queryKey: ['me', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<AccountStats>('/me/stats');
      return response.data;
    },
  });
}

/**
 * Query hook for fetching user level and XP
 *
 * Fetches the user's current level, XP progress, and title.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for user level
 *
 * @example
 * ```typescript
 * const { data: level } = useAccountLevel(apiClient);
 * console.log(`Level ${level?.level} (${level?.progress_percent}%)`);
 * ```
 */
export function useAccountLevel(apiClient: AxiosInstance) {
  return useQuery<AccountLevel, ErrorResponse>({
    queryKey: ['me', 'level'],
    queryFn: async () => {
      const response = await apiClient.get<AccountLevel>('/me/levels');
      return response.data;
    },
  });
}

/**
 * Query hook for fetching user alerts
 *
 * Fetches paginated list of user notifications/alerts.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param page - Page number to fetch (default: 1)
 * @returns React Query query for alerts list
 *
 * @example
 * ```typescript
 * const { data: alerts } = useAccountAlerts(apiClient, 1);
 * ```
 */
export function useAccountAlerts(apiClient: AxiosInstance, page = 1) {
  return useQuery<PaginatedResponse<AccountAlert>, ErrorResponse>({
    queryKey: ['me', 'alerts', page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<AccountAlert>>('/me/alerts', {
        params: { page },
      });
      return response.data;
    },
  });
}

/**
 * Mutation hook for marking alerts as read
 *
 * Marks specific alerts or all alerts as read. Invalidates the alerts
 * query to reflect the updated status.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for marking alerts read
 *
 * @example
 * ```typescript
 * const { mutate: markRead } = useMarkAlertsRead(apiClient);
 * markRead({ alert_ids: ['ulid1', 'ulid2'] });
 * ```
 */
export function useMarkAlertsRead(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, MarkAlertsReadRequest>({
    mutationFn: async (data: MarkAlertsReadRequest) => {
      await apiClient.post('/me/alerts/mark-as-read', data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me', 'alerts'] });
    },
  });
}
