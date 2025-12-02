import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  SystemHealth,
  SystemTime,
  SystemConfig,
  SubmitFeedbackRequest,
  FeedbackResponse,
  GameLibraryResponse,
  GameTitle,
  GameRules,
  GameEntities,
} from '../../types/system.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * System and library hooks for GamerProtocol API
 *
 * Provides React Query hooks for system operations including:
 * - Health checks and server time
 * - Platform configuration
 * - Feedback submission
 * - Game library browsing
 * - Game rules and entities
 *
 * @example
 * ```typescript
 * const { data: health } = useHealthQuery(apiClient);
 * const { data: config } = useConfigQuery(apiClient);
 * const { data: games } = useLibraryQuery(apiClient);
 * const { mutate: submitFeedback } = useSubmitFeedback(apiClient);
 * ```
 */

/**
 * System health check query hook
 *
 * Fetches API health status, version, and database connectivity.
 * This is a public endpoint useful for monitoring and status pages.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, refetchInterval, etc.)
 * @returns React Query query for system health data
 *
 * @example
 * ```typescript
 * const { data: health, isLoading } = useHealthQuery(apiClient);
 *
 * if (health) {
 *   console.log('API Status:', health.status);
 *   console.log('Version:', health.version);
 *   console.log('Database:', health.database);
 * }
 * ```
 *
 * @example With automatic refetching
 * ```typescript
 * const { data: health } = useHealthQuery(apiClient, {
 *   refetchInterval: 30000 // Refetch every 30 seconds
 * });
 * ```
 */
export function useHealthQuery(
  apiClient: AxiosInstance,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery<SystemHealth, ErrorResponse>({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const response = await apiClient.get<SystemHealth>('/system/health');
      return response.data;
    },
    ...options,
  });
}

/**
 * Server time query hook
 *
 * Fetches authoritative server time for synchronization purposes.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for server time data
 *
 * @example
 * ```typescript
 * const { data: time } = useTimeQuery(apiClient);
 *
 * if (time) {
 *   console.log('Unix timestamp:', time.timestamp);
 *   console.log('ISO 8601:', time.iso8601);
 *   console.log('Timezone:', time.timezone);
 * }
 * ```
 */
export function useTimeQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<SystemTime, ErrorResponse>({
    queryKey: ['system', 'time'],
    queryFn: async () => {
      const response = await apiClient.get<SystemTime>('/system/time');
      return response.data;
    },
    ...options,
  });
}

/**
 * Platform configuration query hook
 *
 * Fetches global platform configuration including features, supported games,
 * and limits. This is useful for dynamic UI configuration.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for platform configuration
 *
 * @example
 * ```typescript
 * const { data: config } = useConfigQuery(apiClient);
 *
 * if (config) {
 *   console.log('API Version:', config.api_version);
 *   console.log('Auth Providers:', config.features.authentication_providers);
 *   console.log('Max Concurrent Games:', config.limits.max_concurrent_games);
 *   config.supported_games.forEach(game => {
 *     console.log(`${game.name}: ${game.min_players}-${game.max_players} players`);
 *   });
 * }
 * ```
 */
export function useConfigQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<SystemConfig, ErrorResponse>({
    queryKey: ['system', 'config'],
    queryFn: async () => {
      const response = await apiClient.get<SystemConfig>('/system/config');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    ...options,
  });
}

/**
 * Submit feedback mutation hook
 *
 * Submits user feedback, bug reports, or feature requests to the platform.
 * Can be used by authenticated or anonymous users.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for feedback submission
 *
 * @example
 * ```typescript
 * const { mutate: submitFeedback, isPending } = useSubmitFeedback(apiClient);
 *
 * submitFeedback({
 *   type: 'bug',
 *   content: 'The game freezes when I make this move',
 *   email: 'user@example.com', // Required if not authenticated
 *   metadata: {
 *     url: window.location.href,
 *     user_agent: navigator.userAgent,
 *     app_version: '1.0.0'
 *   }
 * });
 * ```
 *
 * @example With success callback
 * ```typescript
 * submitFeedback(
 *   { type: 'feature', content: 'Please add dark mode' },
 *   {
 *     onSuccess: (feedback) => {
 *       console.log('Feedback submitted:', feedback.id);
 *       toast.success('Thank you for your feedback!');
 *     }
 *   }
 * );
 * ```
 */
export function useSubmitFeedback(apiClient: AxiosInstance) {
  return useMutation<FeedbackResponse, ErrorResponse, SubmitFeedbackRequest>({
    mutationFn: async (data: SubmitFeedbackRequest) => {
      const response = await apiClient.post<FeedbackResponse>('/system/feedback', data);
      return response.data;
    },
  });
}

/**
 * Game library query hook
 *
 * Fetches the complete list of available games from the public catalog.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game library
 *
 * @example
 * ```typescript
 * const { data: library, isLoading } = useLibraryQuery(apiClient);
 *
 * if (library) {
 *   console.log('Total games:', library.total);
 *   library.data.forEach(game => {
 *     console.log(`${game.name}: ${game.description}`);
 *     console.log(`  Players: ${game.min_players}-${game.max_players}`);
 *     console.log(`  Complexity: ${game.complexity}/10`);
 *   });
 * }
 * ```
 */
export function useLibraryQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<GameLibraryResponse, ErrorResponse>({
    queryKey: ['library'],
    queryFn: async () => {
      const response = await apiClient.get<GameLibraryResponse>('/library');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
    ...options,
  });
}

/**
 * Game details query hook
 *
 * Fetches detailed information for a specific game title.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param gameTitle - Game title key (e.g., 'chess', 'connect-four')
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game details
 *
 * @example
 * ```typescript
 * const { data: game } = useGameTitleQuery(apiClient, 'chess');
 *
 * if (game) {
 *   console.log(game.name); // "Chess"
 *   console.log(game.description);
 *   console.log(game.pacing); // "turn_based"
 * }
 * ```
 */
export function useGameTitleQuery(
  apiClient: AxiosInstance,
  gameTitle: string,
  options?: { enabled?: boolean }
) {
  return useQuery<{ data: GameTitle }, ErrorResponse>({
    queryKey: ['library', gameTitle],
    queryFn: async () => {
      const response = await apiClient.get<{ data: GameTitle }>(`/library/${gameTitle}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!gameTitle && (options?.enabled ?? true),
  });
}

/**
 * Game rules query hook
 *
 * Fetches complete rule documentation for a specific game.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param gameTitle - Game title key (e.g., 'chess', 'connect-four')
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game rules
 *
 * @example
 * ```typescript
 * const { data: rules } = useGameRulesQuery(apiClient, 'chess');
 *
 * if (rules) {
 *   console.log('Objective:', rules.data.objective);
 *   console.log('Setup:', rules.data.setup);
 *   console.log('Winning conditions:', rules.data.winning_conditions);
 *   console.log('Special rules:', rules.data.special_rules);
 * }
 * ```
 */
export function useGameRulesQuery(
  apiClient: AxiosInstance,
  gameTitle: string,
  options?: { enabled?: boolean }
) {
  return useQuery<{ data: GameRules }, ErrorResponse>({
    queryKey: ['library', gameTitle, 'rules'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: GameRules }>(`/library/${gameTitle}/rules`);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // Consider fresh for 30 minutes
    enabled: !!gameTitle && (options?.enabled ?? true),
  });
}

/**
 * Game entities query hook
 *
 * Fetches game entities (cards, units, pieces, etc.) for a specific game.
 * Response structure varies by game type.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param gameTitle - Game title key (e.g., 'chess', 'connect-four')
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for game entities
 *
 * @example
 * ```typescript
 * const { data: entities } = useGameEntitiesQuery(apiClient, 'chess');
 *
 * if (entities) {
 *   console.log('Cacheable:', entities.cacheable);
 *   console.log('Cache duration:', entities.cache_duration_seconds);
 *   console.log('Entity data:', entities.data);
 * }
 * ```
 */
export function useGameEntitiesQuery(
  apiClient: AxiosInstance,
  gameTitle: string,
  options?: { enabled?: boolean }
) {
  return useQuery<GameEntities, ErrorResponse>({
    queryKey: ['library', gameTitle, 'entities'],
    queryFn: async () => {
      const response = await apiClient.get<GameEntities>(`/library/${gameTitle}/entities`);
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // Consider fresh for 1 hour (entities rarely change)
    enabled: !!gameTitle && (options?.enabled ?? true),
  });
}
