# Data Model: API Core Integration

**Feature**: 001-api-core-integration  
**Date**: 2025-11-18  
**Status**: Design Phase

This document defines all TypeScript types, interfaces, and their relationships for the API core integration layer.

---

## Type Hierarchy Overview

```
Platform-Agnostic Interfaces (src/types/)
│
├── API Foundation (api.types.ts)
│   ├── ApiResponse<T>           # Wraps single resource responses
│   ├── PaginatedResponse<T>     # Wraps collection responses
│   ├── ErrorResponse            # Standardized error structure
│   └── PaginationMeta           # Pagination metadata
│
├── Authentication (auth.types.ts)
│   ├── AuthStorage              # Interface contract for token storage
│   ├── User                     # Authenticated user entity
│   ├── AuthResponse             # Login/register response (flat structure)
│   ├── LoginRequest             # Login credentials
│   ├── RegisterRequest          # Registration data
│   ├── VerifyRequest            # Email verification
│   └── SocialLoginRequest       # Social auth provider data
│
├── Game Entities (game.types.ts)
│   ├── Game                     # Game state entity
│   ├── GameState                # Enum: pending, active, completed, forfeited
│   ├── GameAction               # Player action in game
│   ├── GameHistory              # Action history for replay
│   ├── Lobby                    # Matchmaking lobby entity
│   ├── LobbyPlayer              # Player in lobby with status
│   ├── LobbyPlayerStatus        # Enum: waiting, ready, not_ready
│   ├── QuickplayRequest         # Quickplay matchmaking request
│   └── RematchRequest           # Rematch request entity
│
├── Billing Entities (billing.types.ts)
│   ├── SubscriptionPlan         # Plan entity (Free, Basic, Pro, etc.)
│   ├── BillingStatus            # User's current billing status
│   ├── UsageQuotas              # Rate limits and quotas
│   ├── PaymentMethod            # Saved payment method entity
│   ├── SubscribeRequest         # Subscription initiation
│   └── PlatformReceipt          # Apple/Google/Telegram receipt verification
│
└── Real-time Events (realtime.types.ts)
    ├── GameEvent                # Game-related WebSocket events
    ├── LobbyEvent               # Lobby-related WebSocket events
    ├── ConnectionStatus         # WebSocket connection state
    └── ChannelSubscription      # Channel subscription metadata
```

---

## 1. API Foundation Types

**Location**: `src/types/api.types.ts`

### 1.1 ApiResponse<T>
Wraps single resource API responses.

```typescript
/**
 * Standard API response wrapper for single resources
 * @template T - The type of the data payload
 */
export interface ApiResponse<T> {
  /** The response payload */
  data: T;
  
  /** Optional success message */
  message?: string;
}
```

**Usage Example**:
```typescript
// GET /v1/games/{ulid} returns ApiResponse<Game>
const response: ApiResponse<Game> = {
  data: {
    ulid: '01HQ...',
    game_title: 'validate-four',
    state: 'active',
    // ...
  }
};
```

### 1.2 PaginatedResponse<T>
Wraps collection API responses with pagination metadata.

```typescript
/**
 * Paginated API response wrapper for collections
 * @template T - The type of items in the collection
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  
  /** Pagination navigation links */
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  
  /** Pagination metadata */
  meta: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;       // First item number on page
  last_page: number;
  path: string;              // Base URL without query params
  per_page: number;
  to: number | null;         // Last item number on page
  total: number;             // Total items across all pages
}
```

**Usage Example**:
```typescript
// GET /v1/games returns PaginatedResponse<Game>
const response: PaginatedResponse<Game> = {
  data: [/* array of games */],
  links: {
    first: 'https://api.gamerprotocol.io/v1/games?page=1',
    last: 'https://api.gamerprotocol.io/v1/games?page=10',
    prev: null,
    next: 'https://api.gamerprotocol.io/v1/games?page=2'
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 10,
    path: 'https://api.gamerprotocol.io/v1/games',
    per_page: 20,
    to: 20,
    total: 200
  }
};
```

### 1.3 ErrorResponse
Standardized error response structure.

```typescript
/**
 * Standard error response structure
 * All API errors are transformed to this shape
 */
export interface ErrorResponse {
  /** Human-readable error message for display */
  message: string;
  
  /** Machine-readable error code (e.g., VALIDATION_ERROR, UNAUTHORIZED) */
  error_code?: string;
  
  /** Field-specific validation errors */
  errors?: Record<string, string[]>;
}
```

**Usage Example**:
```typescript
// 422 Validation Error
const error: ErrorResponse = {
  message: 'The given data was invalid.',
  error_code: 'VALIDATION_ERROR',
  errors: {
    email: ['The email field is required.'],
    password: ['The password must be at least 8 characters.']
  }
};

// 401 Unauthorized
const error: ErrorResponse = {
  message: 'Unauthenticated.',
  error_code: 'UNAUTHORIZED'
};

// Network Error (transformed by interceptor)
const error: ErrorResponse = {
  message: 'Network request failed',
  error_code: 'NETWORK_ERROR'
};
```

---

## 2. Authentication Types

**Location**: `src/types/auth.types.ts`

### 2.1 AuthStorage Interface
Platform-agnostic contract for token persistence. Clients provide implementations.

```typescript
/**
 * Platform-agnostic interface for authentication token storage
 * Implementations must be provided by consuming applications
 * 
 * @example Web Implementation (localStorage)
 * ```typescript
 * const webAuthStorage: AuthStorage = {
 *   getToken: async () => localStorage.getItem('auth_token'),
 *   setToken: async (token) => localStorage.setItem('auth_token', token),
 *   clearToken: async () => localStorage.removeItem('auth_token'),
 * };
 * ```
 * 
 * @example React Native Implementation (SecureStore)
 * ```typescript
 * import * as SecureStore from 'expo-secure-store';
 * 
 * const nativeAuthStorage: AuthStorage = {
 *   getToken: async () => await SecureStore.getItemAsync('auth_token'),
 *   setToken: async (token) => await SecureStore.setItemAsync('auth_token', token),
 *   clearToken: async () => await SecureStore.deleteItemAsync('auth_token'),
 * };
 * ```
 */
export interface AuthStorage {
  /**
   * Retrieve authentication token
   * @returns Promise resolving to token string or null if not found
   */
  getToken(): Promise<string | null>;
  
  /**
   * Persist authentication token
   * @param token - The token string to store
   */
  setToken(token: string): Promise<void>;
  
  /**
   * Remove authentication token
   */
  clearToken(): Promise<void>;
}
```

### 2.2 User Entity
Authenticated user profile.

```typescript
/**
 * User entity returned by authentication endpoints
 */
export interface User {
  /** Unique username identifier */
  username: string;
  
  /** Display name */
  name: string;
  
  /** Avatar URL (Cloudinary CDN) */
  avatar: string | null;
  
  /** User biography/description */
  bio: string | null;
  
  /** Social media links */
  social_links: Record<string, string> | null;
}
```

### 2.3 AuthResponse
Login/register response (special flat structure, not wrapped in ApiResponse).

```typescript
/**
 * Authentication response returned by login/register endpoints
 * Note: This is NOT wrapped in ApiResponse<T> - it's a flat structure
 */
export interface AuthResponse {
  /** Laravel Sanctum API token */
  token: string;
  
  /** Authenticated user data */
  user: User;
}
```

### 2.4 Auth Request Types

```typescript
/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;
}

/**
 * Email verification request payload
 */
export interface VerifyRequest {
  token: string;
}

/**
 * Social login request payload
 */
export interface SocialLoginRequest {
  /** Provider name (e.g., 'google', 'apple', 'twitter') */
  provider: string;
  
  /** Access token from social provider */
  access_token: string;
}

/**
 * User profile update request payload
 */
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  social_links?: Record<string, string>;
}
```

---

## 3. Game Types

**Location**: `src/types/game.types.ts`

### 3.1 Game Entity

```typescript
/**
 * Game state entity
 */
export interface Game {
  /** Game ULID identifier */
  ulid: string;
  
  /** Game title slug (e.g., 'validate-four', 'checkers') */
  game_title: string;
  
  /** Current game state */
  state: GameState;
  
  /** Array of player usernames */
  players: string[];
  
  /** Username of current player whose turn it is */
  current_player: string | null;
  
  /** Username of winner (null if game not completed) */
  winner: string | null;
  
  /** Game-specific state data (varies by game_title) */
  game_state: Record<string, any>;
  
  /** Timestamp of last action */
  last_action_at: string | null;
  
  /** Game creation timestamp */
  created_at: string;
  
  /** Game completion timestamp */
  completed_at: string | null;
}

/**
 * Game state enum
 */
export type GameState = 'pending' | 'active' | 'completed' | 'forfeited';
```

### 3.2 Game Action Types

```typescript
/**
 * Game action entity (for action history)
 */
export interface GameAction {
  /** Action ULID */
  ulid: string;
  
  /** Username of player who performed action */
  player: string;
  
  /** Action type/name */
  action: string;
  
  /** Action parameters (varies by game and action type) */
  parameters: Record<string, any>;
  
  /** Timestamp when action was executed */
  created_at: string;
}

/**
 * Game action history response
 */
export interface GameHistory {
  /** Game ULID */
  game_ulid: string;
  
  /** Ordered array of actions (oldest to newest) */
  actions: GameAction[];
}

/**
 * Game action request payload
 */
export interface GameActionRequest {
  /** Action type/name */
  action: string;
  
  /** Action parameters (varies by action type) */
  parameters?: Record<string, any>;
}

/**
 * Valid game options response (available actions)
 */
export interface GameOptions {
  /** Array of valid action names for current game state */
  valid_actions: string[];
  
  /** Additional metadata about available actions */
  metadata?: Record<string, any>;
}
```

### 3.3 Lobby Types

```typescript
/**
 * Matchmaking lobby entity
 */
export interface Lobby {
  /** Lobby ULID */
  ulid: string;
  
  /** Game title for this lobby */
  game_title: string;
  
  /** Username of lobby host */
  host_username: string;
  
  /** Array of players in lobby */
  players: LobbyPlayer[];
  
  /** Maximum number of players allowed */
  max_players: number;
  
  /** Whether lobby is public or private */
  is_public: boolean;
  
  /** Whether ready check is active */
  ready_check_active: boolean;
  
  /** Lobby creation timestamp */
  created_at: string;
}

/**
 * Player in lobby with status
 */
export interface LobbyPlayer {
  /** Player username */
  username: string;
  
  /** Player status in lobby */
  status: LobbyPlayerStatus;
  
  /** Timestamp when player joined */
  joined_at: string;
}

/**
 * Lobby player status enum
 */
export type LobbyPlayerStatus = 'waiting' | 'ready' | 'not_ready';

/**
 * Create lobby request payload
 */
export interface CreateLobbyRequest {
  game_title: string;
  is_public?: boolean;
  max_players?: number;
}

/**
 * Update lobby player request payload
 */
export interface UpdateLobbyPlayerRequest {
  status: LobbyPlayerStatus;
}
```

### 3.4 Quickplay & Rematch Types

```typescript
/**
 * Quickplay matchmaking request payload
 */
export interface QuickplayRequest {
  game_title: string;
}

/**
 * Quickplay accept request payload
 */
export interface QuickplayAcceptRequest {
  /** Match ULID received from quickplay event */
  match_ulid: string;
}

/**
 * Rematch request entity
 */
export interface RematchRequest {
  /** Rematch request ULID */
  ulid: string;
  
  /** Original game ULID */
  original_game_ulid: string;
  
  /** Username of player who initiated rematch */
  requester_username: string;
  
  /** Username of opponent */
  opponent_username: string;
  
  /** Request status */
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  
  /** Request creation timestamp */
  created_at: string;
  
  /** Expiration timestamp */
  expires_at: string;
}
```

---

## 4. Billing Types

**Location**: `src/types/billing.types.ts`

### 4.1 Subscription Plan

```typescript
/**
 * Subscription plan entity
 */
export interface SubscriptionPlan {
  /** Plan identifier */
  id: string;
  
  /** Plan name (e.g., 'Free', 'Basic', 'Pro') */
  name: string;
  
  /** Plan description */
  description: string;
  
  /** Price in cents (0 for free tier) */
  price_cents: number;
  
  /** Currency code (e.g., 'USD') */
  currency: string;
  
  /** Billing interval ('month', 'year', or null for free) */
  interval: 'month' | 'year' | null;
  
  /** Plan features/benefits */
  features: string[];
  
  /** Usage quotas for this plan */
  quotas: UsageQuotas;
}
```

### 4.2 Billing Status

```typescript
/**
 * User's current billing status
 */
export interface BillingStatus {
  /** Current plan level */
  plan_level: string;
  
  /** Whether user has active subscription */
  is_subscribed: boolean;
  
  /** Subscription renewal date (null if not subscribed) */
  renews_at: string | null;
  
  /** Whether subscription is set to cancel at period end */
  cancel_at_period_end: boolean;
  
  /** Current usage against quotas */
  current_usage: UsageQuotas;
  
  /** Stripe customer ID (null if not subscribed) */
  stripe_customer_id: string | null;
}
```

### 4.3 Usage Quotas

```typescript
/**
 * Rate limits and usage quotas
 */
export interface UsageQuotas {
  /** Maximum concurrent games allowed */
  max_concurrent_games: number;
  
  /** Maximum API requests per hour */
  api_requests_per_hour: number;
  
  /** Whether advanced features are enabled */
  advanced_features_enabled: boolean;
  
  /** Additional quota fields (varies by plan) */
  [key: string]: number | boolean;
}
```

### 4.4 Billing Request Types

```typescript
/**
 * Subscribe request payload
 */
export interface SubscribeRequest {
  /** Plan ID to subscribe to */
  plan_id: string;
  
  /** Optional payment method ID (Stripe) */
  payment_method_id?: string;
}

/**
 * Subscribe response (returns Stripe checkout URL)
 */
export interface SubscribeResponse {
  /** Stripe Checkout session URL */
  checkout_url: string;
  
  /** Session ID for tracking */
  session_id: string;
}

/**
 * Stripe customer portal response
 */
export interface CustomerPortalResponse {
  /** Stripe customer portal URL */
  portal_url: string;
}

/**
 * Platform receipt verification request
 */
export interface PlatformReceiptRequest {
  /** Receipt data (base64 for Apple, purchase token for Google) */
  receipt_data: string;
  
  /** Product ID purchased */
  product_id: string;
}

/**
 * Platform receipt verification response
 */
export interface PlatformReceiptResponse {
  /** Whether receipt is valid */
  is_valid: boolean;
  
  /** Plan level unlocked */
  plan_level: string;
  
  /** Subscription expiration date */
  expires_at: string;
}
```

### 4.5 Payment Method (Future)

```typescript
/**
 * Saved payment method entity
 * Note: Not yet implemented - documented for future use
 */
export interface PaymentMethod {
  /** Payment method ID */
  id: string;
  
  /** Type (e.g., 'card', 'paypal') */
  type: string;
  
  /** Last 4 digits (for cards) */
  last_four: string;
  
  /** Card brand (e.g., 'visa', 'mastercard') */
  brand: string | null;
  
  /** Expiration month */
  exp_month: number | null;
  
  /** Expiration year */
  exp_year: number | null;
  
  /** Whether this is default payment method */
  is_default: boolean;
}
```

---

## 5. Real-time Event Types

**Location**: `src/types/realtime.types.ts`

### 5.1 Game Events

```typescript
/**
 * WebSocket event types for game channels
 */
export type GameEventType =
  | 'GameActionProcessed'
  | 'GameCompleted'
  | 'GameForfeited'
  | 'PlayerJoined'
  | 'PlayerLeft';

/**
 * Base game event structure
 */
export interface GameEvent {
  /** Event type */
  type: GameEventType;
  
  /** Game ULID */
  game_ulid: string;
  
  /** Event payload (varies by event type) */
  payload: GameEventPayload;
  
  /** Event timestamp */
  timestamp: string;
}

/**
 * Game event payloads (discriminated union)
 */
export type GameEventPayload =
  | GameActionProcessedPayload
  | GameCompletedPayload
  | GameForfeitedPayload
  | PlayerJoinedPayload
  | PlayerLeftPayload;

export interface GameActionProcessedPayload {
  /** Username of player who performed action */
  player: string;
  
  /** Action executed */
  action: string;
  
  /** Updated game state */
  game_state: Record<string, any>;
  
  /** Next player's turn */
  next_player: string | null;
}

export interface GameCompletedPayload {
  /** Winner username */
  winner: string;
  
  /** Final game state */
  final_state: Record<string, any>;
  
  /** Completion timestamp */
  completed_at: string;
}

export interface GameForfeitedPayload {
  /** Username of player who forfeited */
  forfeiter: string;
  
  /** Winner by forfeit */
  winner: string;
}

export interface PlayerJoinedPayload {
  /** Username of player who joined */
  username: string;
}

export interface PlayerLeftPayload {
  /** Username of player who left */
  username: string;
  
  /** Reason for leaving */
  reason?: string;
}
```

### 5.2 Lobby Events

```typescript
/**
 * WebSocket event types for lobby channels
 */
export type LobbyEventType =
  | 'PlayerJoined'
  | 'PlayerLeft'
  | 'PlayerStatusChanged'
  | 'ReadyCheckStarted'
  | 'LobbyStarting'
  | 'LobbyCancelled';

/**
 * Base lobby event structure
 */
export interface LobbyEvent {
  /** Event type */
  type: LobbyEventType;
  
  /** Lobby ULID */
  lobby_ulid: string;
  
  /** Event payload (varies by event type) */
  payload: LobbyEventPayload;
  
  /** Event timestamp */
  timestamp: string;
}

/**
 * Lobby event payloads (discriminated union)
 */
export type LobbyEventPayload =
  | LobbyPlayerJoinedPayload
  | LobbyPlayerLeftPayload
  | LobbyPlayerStatusChangedPayload
  | LobbyReadyCheckStartedPayload
  | LobbyStartingPayload
  | LobbyCancelledPayload;

export interface LobbyPlayerJoinedPayload {
  username: string;
  player_count: number;
  max_players: number;
}

export interface LobbyPlayerLeftPayload {
  username: string;
  player_count: number;
}

export interface LobbyPlayerStatusChangedPayload {
  username: string;
  new_status: LobbyPlayerStatus;
  ready_count: number;
  total_players: number;
}

export interface LobbyReadyCheckStartedPayload {
  /** Ready check duration in seconds */
  duration_seconds: number;
  
  /** Expiration timestamp */
  expires_at: string;
}

export interface LobbyStartingPayload {
  /** Game ULID that was created */
  game_ulid: string;
  
  /** Countdown before redirect/start */
  countdown_seconds: number;
}

export interface LobbyCancelledPayload {
  /** Reason for cancellation */
  reason: string;
}
```

### 5.3 Connection Management

```typescript
/**
 * WebSocket connection status
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Channel subscription metadata
 */
export interface ChannelSubscription {
  /** Channel name (e.g., 'private-game.01HQ...') */
  channel_name: string;
  
  /** Whether successfully subscribed */
  is_subscribed: boolean;
  
  /** Connection status */
  status: ConnectionStatus;
  
  /** Error if connection failed */
  error: Error | null;
}
```

---

## Type Relationships & Dependencies

### Core Dependencies
```
ErrorResponse ← (used by all modules for error handling)
ApiResponse<T> ← (used by all modules for single resource responses)
PaginatedResponse<T> ← (used by collections: games list, lobbies list, alerts)
```

### Authentication Flow
```
LoginRequest → AuthResponse → User
                ↓
          AuthStorage.setToken()
                ↓
     (Token injected via Axios interceptor)
```

### Game Flow
```
Lobby → LobbyPlayer → Game → GameAction
  ↓                              ↓
LobbyEvent              GameEvent (WebSocket)
  ↓
Game creation
```

### Billing Flow
```
SubscriptionPlan → SubscribeRequest → SubscribeResponse (Stripe checkout)
                                            ↓
                                  (Webhook processes payment)
                                            ↓
                                    BillingStatus updated
```

### Real-time Flow
```
Game/Lobby → WebSocket Channel → GameEvent/LobbyEvent
                                         ↓
                                React Query Cache Invalidation
```

---

## Validation Rules

### Type Safety Requirements
- ✅ All types use explicit typing (no `any` except for `game_state` which is game-specific)
- ✅ Enums use string literal unions for type safety
- ✅ Optional fields use `?:` notation
- ✅ Null values explicitly typed as `Type | null`
- ✅ All timestamps are ISO 8601 strings
- ✅ All ULIDs are strings (validated by backend)

### Naming Conventions
- ✅ Interfaces: PascalCase (e.g., `GameAction`, `AuthStorage`)
- ✅ Type aliases: PascalCase (e.g., `GameState`, `ConnectionStatus`)
- ✅ Fields: snake_case (matching Laravel API responses)
- ✅ Methods: camelCase (TypeScript convention)

### Documentation Requirements
- ✅ All exported types have JSDoc comments
- ✅ Interface properties documented with inline comments
- ✅ Complex types include usage examples
- ✅ Platform-specific implementations shown in AuthStorage docs

---

## Next Steps

**Phase 1 Continuation**:
1. ✅ Data model complete
2. ⏳ Generate OpenAPI contracts in `contracts/` directory
3. ⏳ Create `quickstart.md` with platform-specific setup guides

**Phase 2 (via /speckit.tasks)**:
1. Implement types in `src/types/` directory (5 files)
2. Implement API client in `src/core/api/`
3. Implement React Query hooks in `src/core/hooks/`
4. Implement real-time client in `src/core/realtime/`
5. Write comprehensive tests for all modules
