/**
 * Economy and transaction type definitions
 *
 * Types for virtual balance management, transactions, and subscription management.
 * Platform-agnostic types that work across all supported platforms.
 *
 * @packageDocumentation
 */

/**
 * Currency balance structure
 */
export interface CurrencyBalance {
  /** Balance amount */
  amount: number;

  /** Currency type */
  currency_type: 'tokens' | 'chips';
}

/**
 * User balance response
 */
export interface UserBalance {
  /** Token balance */
  tokens: CurrencyBalance;

  /** Chip balance */
  chips: CurrencyBalance;
}

/**
 * Transaction types
 */
export type TransactionType =
  | 'credit'
  | 'debit'
  | 'balance_add'
  | 'balance_remove'
  | 'game_buy_in'
  | 'game_cash_out'
  | 'subscription_payment'
  | 'subscription_refund'
  | 'iap_purchase'
  | 'iap_refund'
  | 'payment';

/**
 * Currency types
 */
export type CurrencyType = 'tokens' | 'chips' | 'usd';

/**
 * Payment providers
 */
export type PaymentProvider = 'stripe' | 'google_play' | 'apple_store' | 'telegram';

/**
 * Transaction record
 */
export interface Transaction {
  /** Transaction identifier (ULID) */
  ulid: string;

  /** Transaction type */
  transaction_type: TransactionType;

  /** Currency type */
  currency_type: CurrencyType;

  /** Transaction amount */
  amount: number;

  /** Transaction description */
  description: string;

  /** Additional metadata */
  metadata: Record<string, unknown> | unknown[];

  /** Reference ID (e.g., payment intent ID) */
  reference_id: string | null;

  /** Reference type (e.g., 'payment_intent') */
  reference_type: string | null;

  /** ISO 8601 timestamp when transaction was created */
  created_at: string;
}

/**
 * Cashier request payload (approved clients only)
 */
export interface CashierRequest {
  /** User ID to adjust balance for */
  user_id: number;

  /** Currency type */
  currency_type: 'tokens' | 'chips';

  /** Amount to add or remove */
  amount: number;

  /** Transaction description */
  description: string;

  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Cashier response
 */
export interface CashierResponse {
  /** Transaction identifier */
  transaction_ulid: string;

  /** New balance after adjustment */
  new_balance: number;
}

/**
 * Subscription plan structure
 */
export interface SubscriptionPlan {
  /** Plan identifier */
  id: string;

  /** Plan name */
  name: string;

  /** Plan description */
  description: string;

  /** Price in dollars */
  price: number;

  /** Billing interval */
  interval: 'monthly' | 'annual';

  /** Plan features */
  features: string[];
}

/**
 * User subscription structure
 */
export interface UserSubscription {
  /** Subscription identifier (ULID) */
  ulid: string;

  /** Plan identifier */
  plan_id: string;

  /** Subscription status */
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';

  /** ISO 8601 timestamp when current period started */
  current_period_start: string;

  /** ISO 8601 timestamp when current period ends */
  current_period_end: string;

  /** ISO 8601 timestamp when subscription will cancel (null if not cancelling) */
  cancel_at: string | null;

  /** ISO 8601 timestamp when subscription was created */
  created_at: string;

  /** ISO 8601 timestamp when subscription was last updated */
  updated_at: string;
}

/**
 * Subscribe request payload
 */
export interface SubscribeRequest {
  /** Plan identifier */
  plan_id: string;

  /** Return URL after checkout */
  return_url?: string;
}

/**
 * Receipt verification request payload
 */
export interface VerifyReceiptRequest {
  /** Receipt data from platform */
  receipt_data: string;

  /** Product identifier */
  product_id: string;
}

/**
 * Receipt verification response
 */
export interface VerifyReceiptResponse {
  /** Expiration date (ISO 8601) */
  expires_at: string;

  /** Verification status */
  status: string;
}
