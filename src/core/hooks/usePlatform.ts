import { useQuery } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { ApiStatus } from '../../types/platform.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * Platform & System Hooks
 *
 * Provides React Query hooks for accessing public platform information
 * and system status.
 *
 * @example
 * ```typescript
 * const { data: status } = useApiStatus(apiClient);
 * console.log(`System is ${status?.status}`);
 * ```
 */

/**
 * Query hook for fetching API system status
 *
 * Fetches the current operational status, version, and environment
 * information from the API.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for system status
 *
 * @example
 * ```typescript
 * const { data: status, isLoading } = useApiStatus(apiClient);
 *
 * if (status?.status === 'maintenance') {
 *   showMaintenanceBanner();
 * }
 * ```
 */
export function useApiStatus(apiClient: AxiosInstance) {
  return useQuery<ApiStatus, ErrorResponse>({
    queryKey: ['platform', 'status'],
    queryFn: async () => {
      const response = await apiClient.get<ApiStatus>('/status');
      return response.data;
    },
  });
}
