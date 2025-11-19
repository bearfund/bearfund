import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type { SubscriptionPlan, UserSubscription, UsageQuotas } from '../../types/billing.types';
import type { ErrorResponse } from '../../types/api.types';

/**
 * Billing & Subscription Hooks
 *
 * Provides React Query hooks for subscription management including:
 * - Subscription plans and status queries
 * - Usage quotas tracking
 * - Stripe subscription management
 * - Platform-specific receipt verification (Apple, Google, Telegram)
 *
 * All mutation hooks automatically invalidate billing status queries
 * to keep usage quotas and subscription state synchronized.
 *
 * @example
 * ```typescript
 * const { data: plans } = usePlansQuery(apiClient);
 * const { data: status } = useSubscriptionStatus(apiClient);
 * const quotas = useQuotas(apiClient);
 * ```
 */

/**
 * Query hook for fetching subscription plans
 *
 * Fetches list of available subscription plans with pricing and features.
 * This is a public endpoint that doesn't require authentication.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for subscription plans
 *
 * @example
 * ```typescript
 * const { data: plans, isLoading } = usePlansQuery(apiClient);
 *
 * plans?.forEach(plan => {
 *   console.log(`${plan.name}: $${plan.price_cents / 100}/${plan.interval}`);
 *   console.log(`Features: ${plan.features.join(', ')}`);
 * });
 * ```
 */
export function usePlansQuery(apiClient: AxiosInstance) {
  return useQuery<SubscriptionPlan[], ErrorResponse>({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlan[]>('/billing/plans');
      return response.data;
    },
  });
}

/**
 * Query hook for fetching billing status
 *
 * Fetches current subscription status, plan level, and usage quotas
 * for the authenticated user.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for billing status
 *
 * @example
 * ```typescript
 * const { data: status } = useSubscriptionStatus(apiClient);
 *
 * console.log(`Plan: ${status?.plan_level}`);
 * console.log(`Status: ${status?.status}`);
 * console.log(`Games: ${status?.current_usage.games_played}/${status?.quotas.max_concurrent_games}`);
 * ```
 */
export function useSubscriptionStatus(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<UserSubscription, ErrorResponse>({
    queryKey: ['billing', 'status'],
    queryFn: async () => {
      const response = await apiClient.get<UserSubscription>('/billing/status');
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook for accessing usage quotas
 *
 * Returns current usage quotas from the billing status query. This is a
 * convenience hook that extracts quotas from the status query.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns Usage quotas object or undefined if not loaded
 *
 * @example
 * ```typescript
 * const quotas = useQuotas(apiClient);
 *
 * if (quotas) {
 *   const canPlayMore = quotas.current_usage.games_played < quotas.max_concurrent_games;
 *   const apiLimitReached = quotas.current_usage.api_requests >= quotas.api_requests_per_hour;
 * }
 * ```
 *
 * @example Platform-specific usage
 * ```typescript
 * // React Native - check quotas before starting game
 * const quotas = useQuotas(apiClient);
 * const canStartGame = quotas?.max_concurrent_games > currentGames;
 * ```
 */
export function useQuotas(apiClient: AxiosInstance): UsageQuotas | undefined {
  const { data: status } = useSubscriptionStatus(apiClient);
  return status?.quotas;
}

/**
 * Mutation hook for initiating subscription
 *
 * Starts subscription process and returns Stripe checkout URL. After
 * successful subscription, invalidates billing status to refresh quotas.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for subscription creation
 *
 * @example Web platform
 * ```typescript
 * const { mutate: subscribe, isLoading } = useSubscribe(apiClient);
 *
 * subscribe(
 *   { plan_id: 'pro_monthly' },
 *   {
 *     onSuccess: (response) => {
 *       // Redirect to Stripe checkout
 *       window.location.href = response.checkout_url;
 *     }
 *   }
 * );
 * ```
 */
export function useSubscribe(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<
    { checkout_url: string },
    ErrorResponse,
    { plan_id: string; return_url?: string }
  >({
    mutationFn: async (data: { plan_id: string; return_url?: string }) => {
      const response = await apiClient.post<{ checkout_url: string }>('/billing/subscribe', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}

/**
 * Mutation hook for getting customer portal URL
 *
 * Fetches Stripe customer portal URL for subscription management
 * (cancel, update payment method, view invoices, etc.).
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for portal URL retrieval
 *
 * @example Web platform
 * ```typescript
 * const { mutate: getPortalUrl, isLoading } = useCustomerPortal(apiClient);
 *
 * getPortalUrl(undefined, {
 *   onSuccess: (response) => {
 *     window.location.href = response.portal_url;
 *   }
 * });
 * ```
 */
export function useCustomerPortal(apiClient: AxiosInstance) {
  return useMutation<{ portal_url: string }, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.get<{ portal_url: string }>('/billing/manage');
      return response.data;
    },
  });
}

/**
 * Mutation hook for verifying Apple App Store receipts
 *
 * Verifies Apple in-app purchase receipt and updates subscription status.
 * Invalidates billing status query on success.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for Apple receipt verification
 *
 * @example iOS platform
 * ```typescript
 * const { mutate: verifyApple, isLoading } = useVerifyAppleReceipt(apiClient);
 *
 * // After successful purchase from StoreKit
 * verifyApple(
 *   { receipt_data: base64Receipt, product_id: 'com.gamerprotocol.pro' },
 *   {
 *     onSuccess: (response) => {
 *       console.log(`Subscription valid until: ${response.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyAppleReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<
    { expires_at: string; status: string },
    ErrorResponse,
    { receipt_data: string; product_id: string }
  >({
    mutationFn: async (data: { receipt_data: string; product_id: string }) => {
      const response = await apiClient.post<{ expires_at: string; status: string }>(
        '/billing/apple/verify',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}

/**
 * Mutation hook for verifying Google Play receipts
 *
 * Verifies Google Play in-app purchase receipt and updates subscription status.
 * Invalidates billing status query on success.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for Google receipt verification
 *
 * @example Android platform
 * ```typescript
 * const { mutate: verifyGoogle, isLoading } = useVerifyGoogleReceipt(apiClient);
 *
 * // After successful purchase from Google Play Billing
 * verifyGoogle(
 *   {
 *     receipt_data: purchaseToken,
 *     product_id: 'com.gamerprotocol.pro'
 *   },
 *   {
 *     onSuccess: (response) => {
 *       console.log(`Subscription valid until: ${response.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyGoogleReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<
    { expires_at: string; status: string },
    ErrorResponse,
    { receipt_data: string; product_id: string }
  >({
    mutationFn: async (data: { receipt_data: string; product_id: string }) => {
      const response = await apiClient.post<{ expires_at: string; status: string }>(
        '/billing/google/verify',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}

/**
 * Mutation hook for verifying Telegram Mini App receipts
 *
 * Verifies Telegram payment receipt and updates subscription status.
 * Invalidates billing status query on success.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for Telegram receipt verification
 *
 * @example Telegram Mini App platform
 * ```typescript
 * const { mutate: verifyTelegram, isLoading } = useVerifyTelegramReceipt(apiClient);
 *
 * // After successful payment via Telegram
 * verifyTelegram(
 *   {
 *     receipt_data: telegramPaymentInfo,
 *     product_id: 'gp_pro_monthly'
 *   },
 *   {
 *     onSuccess: (response) => {
 *       console.log(`Subscription valid until: ${response.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyTelegramReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<
    { expires_at: string; status: string },
    ErrorResponse,
    { receipt_data: string; product_id: string }
  >({
    mutationFn: async (data: { receipt_data: string; product_id: string }) => {
      const response = await apiClient.post<{ expires_at: string; status: string }>(
        '/billing/telegram/verify',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
    },
  });
}
