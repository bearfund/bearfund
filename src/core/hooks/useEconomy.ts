import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import type {
  UserBalance,
  Transaction,
  CashierRequest,
  CashierResponse,
  SubscriptionPlan,
  UserSubscription,
  SubscribeRequest,
  VerifyReceiptRequest,
  VerifyReceiptResponse,
} from '../../types/economy.types';
import type { ApiResponse, PaginatedResponse, ErrorResponse } from '../../types/api.types';

/**
 * Economy & Transaction Hooks
 *
 * Provides React Query hooks for virtual balance management and subscriptions including:
 * - Balance queries (tokens and chips)
 * - Transaction history
 * - Cashier operations (approved clients only)
 * - Subscription management
 * - Platform-specific receipt verification (Apple, Google, Telegram)
 *
 * All mutation hooks automatically invalidate balance and subscription queries
 * to keep state synchronized.
 *
 * @example
 * ```typescript
 * const { data: balance } = useBalanceQuery(apiClient);
 * const { data: transactions } = useTransactionsQuery(apiClient);
 * const { data: plans } = usePlansQuery(apiClient);
 * ```
 */

/**
 * Query hook for fetching user balance
 *
 * Fetches token and chip balances for the authenticated user
 * on the current client.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for user balance
 *
 * @example
 * ```typescript
 * const { data: balance, isLoading } = useBalanceQuery(apiClient);
 *
 * console.log(`Tokens: ${balance?.data.tokens.amount}`);
 * console.log(`Chips: ${balance?.data.chips.amount}`);
 * ```
 */
export function useBalanceQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<UserBalance>, ErrorResponse>({
    queryKey: ['economy', 'balance'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserBalance>>('/economy/balance');
      return response.data;
    },
    ...options,
  });
}

/**
 * Query hook for fetching transaction history
 *
 * Fetches paginated transaction history including both virtual balance
 * transactions and real payment transactions.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param params - Optional query parameters (page, per_page, limit)
 * @returns React Query query for transactions
 *
 * @example
 * ```typescript
 * const { data: transactions } = useTransactionsQuery(apiClient, { limit: 50 });
 *
 * transactions?.data.forEach(txn => {
 *   console.log(`${txn.transaction_type}: ${txn.amount} ${txn.currency_type}`);
 * });
 * ```
 */
export function useTransactionsQuery(
  apiClient: AxiosInstance,
  params?: { page?: number; per_page?: number; limit?: number }
) {
  return useQuery<PaginatedResponse<Transaction>, ErrorResponse>({
    queryKey: ['economy', 'transactions', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>(
        '/economy/transactions',
        {
          params,
        }
      );
      return response.data;
    },
  });
}

/**
 * Mutation hook for cashier operations
 *
 * Adds or removes tokens/chips from user balances. Only available to
 * approved client applications.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for cashier operations
 *
 * @example Approved client only
 * ```typescript
 * const { mutate: adjustBalance } = useCashier(apiClient);
 *
 * adjustBalance(
 *   {
 *     user_id: 123,
 *     currency_type: 'tokens',
 *     amount: 100,
 *     description: 'Daily bonus',
 *     metadata: {}
 *   },
 *   {
 *     onSuccess: (response) => {
 *       console.log(`New balance: ${response.data.new_balance}`);
 *     }
 *   }
 * );
 * ```
 */
export function useCashier(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CashierResponse>, ErrorResponse, CashierRequest>({
    mutationFn: async (data: CashierRequest) => {
      const response = await apiClient.post<ApiResponse<CashierResponse>>('/economy/cashier', data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'balance'] });
      await queryClient.invalidateQueries({ queryKey: ['economy', 'transactions'] });
    },
  });
}

/**
 * Query hook for fetching subscription plans
 *
 * Fetches list of available subscription plans with pricing and features.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query query for subscription plans
 *
 * @example
 * ```typescript
 * const { data: plans, isLoading } = usePlansQuery(apiClient);
 *
 * plans?.data.forEach(plan => {
 *   console.log(`${plan.name}: $${plan.price}/${plan.interval}`);
 *   console.log(`Features: ${plan.features.join(', ')}`);
 * });
 * ```
 */
export function usePlansQuery(apiClient: AxiosInstance) {
  return useQuery<ApiResponse<SubscriptionPlan[]>, ErrorResponse>({
    queryKey: ['economy', 'plans'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/economy/plans');
      return response.data;
    },
  });
}

/**
 * Query hook for fetching subscription status
 *
 * Fetches current subscription status for the authenticated user.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @param options - Optional query options (enabled, etc.)
 * @returns React Query query for subscription status
 *
 * @example
 * ```typescript
 * const { data: subscription } = useSubscriptionQuery(apiClient);
 *
 * console.log(`Plan: ${subscription?.data.plan_id}`);
 * console.log(`Status: ${subscription?.data.status}`);
 * console.log(`Period end: ${subscription?.data.current_period_end}`);
 * ```
 */
export function useSubscriptionQuery(apiClient: AxiosInstance, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<UserSubscription>, ErrorResponse>({
    queryKey: ['economy', 'subscription'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserSubscription>>('/economy/subscription');
      return response.data;
    },
    ...options,
  });
}

/**
 * Mutation hook for initiating subscription
 *
 * Starts subscription process and returns checkout URL. After
 * successful subscription, invalidates subscription query.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for subscription creation
 *
 * @example Web platform
 * ```typescript
 * const { mutate: subscribe, isLoading } = useSubscribe(apiClient);
 *
 * subscribe(
 *   { plan_id: 'pro_monthly', return_url: 'https://app.example.com/success' },
 *   {
 *     onSuccess: (response) => {
 *       // Redirect to checkout
 *       window.location.href = response.data.checkout_url;
 *     }
 *   }
 * );
 * ```
 */
export function useSubscribe(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ checkout_url: string }>, ErrorResponse, SubscribeRequest>({
    mutationFn: async (data: SubscribeRequest) => {
      const response = await apiClient.post<ApiResponse<{ checkout_url: string }>>(
        '/economy/subscribe',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'subscription'] });
    },
  });
}

/**
 * Mutation hook for canceling subscription
 *
 * Cancels the current subscription. Invalidates subscription query on success.
 *
 * @param apiClient - Configured Axios instance from setupAPIClient
 * @returns React Query mutation for subscription cancellation
 *
 * @example
 * ```typescript
 * const { mutate: cancelSubscription } = useCancelSubscription(apiClient);
 *
 * cancelSubscription(undefined, {
 *   onSuccess: () => {
 *     console.log('Subscription cancelled');
 *   }
 * });
 * ```
 */
export function useCancelSubscription(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ message: string }>, ErrorResponse, void>({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        '/economy/subscription/cancel'
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'subscription'] });
    },
  });
}

/**
 * Mutation hook for verifying Apple App Store receipts
 *
 * Verifies Apple in-app purchase receipt and updates subscription status.
 * Invalidates subscription and balance queries on success.
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
 *       console.log(`Valid until: ${response.data.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyAppleReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<VerifyReceiptResponse>, ErrorResponse, VerifyReceiptRequest>({
    mutationFn: async (data: VerifyReceiptRequest) => {
      const response = await apiClient.post<ApiResponse<VerifyReceiptResponse>>(
        '/economy/receipts/apple',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'subscription'] });
      await queryClient.invalidateQueries({ queryKey: ['economy', 'balance'] });
    },
  });
}

/**
 * Mutation hook for verifying Google Play receipts
 *
 * Verifies Google Play in-app purchase receipt and updates subscription status.
 * Invalidates subscription and balance queries on success.
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
 *       console.log(`Valid until: ${response.data.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyGoogleReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<VerifyReceiptResponse>, ErrorResponse, VerifyReceiptRequest>({
    mutationFn: async (data: VerifyReceiptRequest) => {
      const response = await apiClient.post<ApiResponse<VerifyReceiptResponse>>(
        '/economy/receipts/google',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'subscription'] });
      await queryClient.invalidateQueries({ queryKey: ['economy', 'balance'] });
    },
  });
}

/**
 * Mutation hook for verifying Telegram Mini App receipts
 *
 * Verifies Telegram payment receipt and updates subscription status.
 * Invalidates subscription and balance queries on success.
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
 *       console.log(`Valid until: ${response.data.expires_at}`);
 *     }
 *   }
 * );
 * ```
 */
export function useVerifyTelegramReceipt(apiClient: AxiosInstance) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<VerifyReceiptResponse>, ErrorResponse, VerifyReceiptRequest>({
    mutationFn: async (data: VerifyReceiptRequest) => {
      const response = await apiClient.post<ApiResponse<VerifyReceiptResponse>>(
        '/economy/receipts/telegram',
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['economy', 'subscription'] });
      await queryClient.invalidateQueries({ queryKey: ['economy', 'balance'] });
    },
  });
}
