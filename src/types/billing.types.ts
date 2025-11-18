/**
 * Billing and subscription type definitions
 * 
 * Types for subscription management, billing status, and usage tracking.
 * Platform-agnostic types that work across all supported platforms.
 * 
 * @packageDocumentation
 */

/** Valid billing statuses */
export type BillingStatus = 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';

/** Valid subscription plan tiers */
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

/**
 * Subscription plan structure.
 * 
 * Represents a subscription tier with pricing and limits.
 */
export interface SubscriptionPlan {
  /** Plan identifier (e.g., 'starter', 'professional') */
  id: string;

  /** Human-readable plan name */
  name: string;

  /** Plan description */
  description: string;

  /** Monthly price in cents (USD) */
  price_monthly: number;

  /** Annual price in cents (USD) */
  price_annual: number;

  /** Usage quotas and limits for this plan */
  quotas: UsageQuotas;

  /** Plan features list */
  features: string[];

  /** Whether this plan is currently available for purchase */
  is_available: boolean;
}

/**
 * Usage quotas structure.
 * 
 * Defines resource limits for a subscription plan or current usage.
 */
export interface UsageQuotas {
  /** Maximum API requests per month (null = unlimited) */
  api_requests_limit: number | null;

  /** Current API requests used this billing period */
  api_requests_used?: number;

  /** Maximum concurrent games allowed (null = unlimited) */
  max_concurrent_games: number | null;

  /** Current active games */
  concurrent_games_used?: number;

  /** Maximum storage in MB (null = unlimited) */
  storage_limit_mb: number | null;

  /** Current storage used in MB */
  storage_used_mb?: number;
}

/**
 * User subscription structure.
 * 
 * Represents the current subscription for a user.
 */
export interface UserSubscription {
  /** Subscription identifier (ULID) */
  ulid: string;

  /** Current plan tier */
  plan_tier: SubscriptionTier;

  /** Billing status */
  status: BillingStatus;

  /** Current billing period usage quotas */
  quotas: UsageQuotas;

  /** ISO 8601 timestamp when current billing period started */
  current_period_start: string;

  /** ISO 8601 timestamp when current billing period ends */
  current_period_end: string;

  /** ISO 8601 timestamp when subscription will cancel (null if not cancelling) */
  cancel_at: string | null;

  /** ISO 8601 timestamp when subscription was created */
  created_at: string;

  /** ISO 8601 timestamp when subscription was last updated */
  updated_at: string;
}

/**
 * Billing invoice structure.
 */
export interface Invoice {
  /** Invoice identifier (ULID) */
  ulid: string;

  /** Invoice amount in cents (USD) */
  amount: number;

  /** Invoice status */
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

  /** ISO 8601 timestamp when invoice was created */
  created_at: string;

  /** ISO 8601 timestamp when invoice is due */
  due_date: string;

  /** ISO 8601 timestamp when invoice was paid (null if not paid) */
  paid_at: string | null;

  /** Download URL for invoice PDF */
  invoice_pdf_url: string | null;
}

/**
 * Create subscription request payload.
 */
export interface CreateSubscriptionRequest {
  /** Plan tier to subscribe to */
  plan_tier: SubscriptionTier;

  /** Billing interval ('monthly' or 'annual') */
  billing_interval: 'monthly' | 'annual';

  /** Payment method identifier (Stripe payment method ID) */
  payment_method_id: string;
}

/**
 * Update subscription request payload.
 */
export interface UpdateSubscriptionRequest {
  /** New plan tier (triggers upgrade/downgrade) */
  plan_tier?: SubscriptionTier;

  /** New billing interval */
  billing_interval?: 'monthly' | 'annual';
}

/**
 * Cancel subscription request payload.
 */
export interface CancelSubscriptionRequest {
  /** When to cancel ('immediate' or 'period_end') */
  cancel_at: 'immediate' | 'period_end';

  /** Optional cancellation reason */
  reason?: string;
}
