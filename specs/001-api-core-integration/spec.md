# Feature Specification: API Core Integration

**Feature Branch**: `001-api-core-integration`  
**Created**: 2025-11-18  
**Status**: Draft  
**Input**: User description: "API integration using the docs/api-endpoints.md and the structure of docs/api.md along with details from constitution.md for the src/core section of the package"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type-Safe API Communication (Priority: P1)

Developers using the @gamerprotocol/ui package need platform-agnostic type definitions for all API requests and responses to ensure type safety across web, React Native, Electron, and Telegram Mini App platforms.

**Why this priority**: Foundation for all API communication. Without proper type definitions, developers cannot safely consume the API layer, leading to runtime errors across all 4 platforms. This must exist before any hooks or components can be built.

**Independent Test**: Can be fully tested by importing types in a TypeScript file and verifying compilation succeeds with strict mode enabled. Delivers immediate value by providing IntelliSense and compile-time error checking.

**Acceptance Scenarios**:

1. **Given** a developer imports `AuthResponse` type, **When** they use it in their code, **Then** TypeScript provides autocomplete for `token` and `user` properties with correct types
2. **Given** a developer imports `ErrorResponse` type, **When** they handle API errors, **Then** TypeScript enforces the presence of `message` and `error_code` properties
3. **Given** a developer uses `AuthStorage` interface, **When** they implement it for their platform, **Then** TypeScript requires `getToken()`, `setToken()`, and `clearToken()` methods with correct signatures
4. **Given** all type files are created, **When** compiled with strict TypeScript, **Then** no implicit `any` types or compilation errors exist

---

### User Story 2 - Authenticated API Client (Priority: P1)

Developers need a configured Axios client that automatically handles authentication headers (X-Client-Key and Bearer token) and error responses without manual configuration for each request.

**Why this priority**: Core infrastructure required for all API calls. Without this, no API communication can occur. Must be platform-agnostic and handle auth token storage/retrieval across all platforms.

**Independent Test**: Can be fully tested by creating an Axios instance with the setupAPIClient function, making a request, and verifying headers are correctly injected. Delivers value by enabling API communication immediately.

**Acceptance Scenarios**:

1. **Given** a developer calls `setupAPIClient()` with clientKey and authStorage, **When** the client makes any request, **Then** `X-Client-Key` header is automatically included
2. **Given** authStorage has a valid token, **When** the client makes a request, **Then** `Authorization: Bearer [token]` header is automatically included
3. **Given** authStorage has no token, **When** the client makes a request, **Then** no Authorization header is sent
4. **Given** API returns 401 Unauthorized, **When** the response interceptor catches it, **Then** `authStorage.clearToken()` is called and the user is logged out
5. **Given** API returns any error, **When** the error interceptor processes it, **Then** it is transformed to an `ErrorResponse` type with message and error_code

---

### User Story 3 - Authentication Hooks (Priority: P1)

Developers need React Query hooks for authentication operations (login, logout, register, verify email) that handle token storage, cache invalidation, and provide loading/error states.

**Why this priority**: Authentication is the gateway to all user-specific features. Without auth hooks, users cannot log in or access protected resources. This is critical for any functional application.

**Independent Test**: Can be fully tested by using the useLogin hook in a test component, calling the mutation with credentials, and verifying token storage and cache updates occur. Delivers value by enabling user authentication immediately.

**Acceptance Scenarios**:

1. **Given** a developer calls `useLogin()` mutation, **When** login succeeds, **Then** `authStorage.setToken()` is called and `['user']` query is invalidated
2. **Given** a developer calls `useLogout()` mutation, **When** logout succeeds, **Then** `authStorage.clearToken()` is called and React Query cache is cleared
3. **Given** a developer uses `useUserQuery()`, **When** a valid token exists, **Then** user profile data is fetched and cached with key `['user']`
4. **Given** a developer calls `useSocialLogin()` with provider token, **When** social auth succeeds, **Then** token is stored and user query is invalidated
5. **Given** a developer calls `useRegister()`, **When** registration succeeds, **Then** success message is returned without storing token (verification required)
6. **Given** a developer calls `useVerifyEmail()` with verification token, **When** verification succeeds, **Then** auth token is stored and user query is populated

---

### User Story 4 - Game Management Hooks (Priority: P2)

Developers need React Query hooks for game operations (fetch game state, execute actions, manage lobbies, quickplay matchmaking) with proper cache invalidation and real-time readiness.

**Why this priority**: Core gameplay functionality depends on these hooks. While auth must come first (P1), game hooks are the primary business logic. Users cannot play games without these.

**Independent Test**: Can be fully tested by using useGameQuery hook to fetch a game, using useGameAction to make a move, and verifying cache invalidation occurs. Delivers value by enabling game state management.

**Acceptance Scenarios**:

1. **Given** a developer calls `useGameQuery(ulid)`, **When** game exists, **Then** game state is fetched and cached with key `['game', ulid]`
2. **Given** a developer calls `useGameAction(ulid)` mutation, **When** action succeeds, **Then** `['game', ulid]` query is invalidated to refetch updated state
3. **Given** a developer uses `useLobbiesQuery()`, **When** lobbies exist, **Then** lobby list is cached with key `['lobbies']`
4. **Given** a developer calls `useCreateLobby()` mutation, **When** lobby created, **Then** `['lobbies']` query is invalidated
5. **Given** a developer calls `useJoinQuickplay()` mutation, **When** queue joined, **Then** user is added to matchmaking queue
6. **Given** a developer uses `useGameOptions(ulid)`, **When** it's the user's turn, **Then** valid action options are returned
7. **Given** a developer calls `useForfeitGame(ulid)`, **When** forfeit succeeds, **Then** game is marked as completed and cache updated

---

### User Story 5 - Billing & Subscription Hooks (Priority: P2)

Developers need React Query hooks for subscription management (view plans, check quotas, subscribe, verify receipts) to enable monetization features across platforms.

**Why this priority**: Required for business model but not blocking core gameplay. Free users can play without subscriptions. This can be implemented after core auth and game functionality.

**Independent Test**: Can be fully tested by using usePlansQuery to fetch plans, useQuotas to check usage limits, and verifying proper data structure. Delivers value by enabling subscription features.

**Acceptance Scenarios**:

1. **Given** a developer uses `usePlansQuery()`, **When** plans are fetched, **Then** available subscription tiers with pricing are returned
2. **Given** a developer uses `useQuotas()`, **When** user is authenticated, **Then** current usage and limits (strikes for free, matches for member) are returned
3. **Given** a developer calls `useSubscribe()` mutation, **When** subscription initiated, **Then** Stripe checkout URL is returned
4. **Given** a developer calls `useVerifyAppleReceipt()`, **When** receipt is valid, **Then** subscription status is updated
5. **Given** a developer calls `useVerifyGoogleReceipt()`, **When** receipt is valid, **Then** subscription status is updated
6. **Given** a developer uses `useSubscriptionStatus()`, **When** user has active subscription, **Then** plan level, renewal date, and payment provider are returned

---

### User Story 6 - Real-Time WebSocket Integration (Priority: P3)

Developers need Laravel Echo client configuration and React hooks that subscribe to game/lobby channels for real-time updates, automatically invalidating React Query cache when events occur.

**Why this priority**: Enhances user experience with real-time updates but not critical for MVP. Games can function with polling or manual refresh. This is an optimization layer.

**Independent Test**: Can be fully tested by calling setupEcho, subscribing to a game channel, simulating an event, and verifying query invalidation occurs. Delivers value by enabling live game updates.

**Acceptance Scenarios**:

1. **Given** a developer calls `setupEcho(token)`, **When** Echo client initialized, **Then** connection to Reverb WebSocket server is established
2. **Given** a developer uses `useRealtimeGame(ulid)` hook, **When** GameActionProcessed event received, **Then** `['game', ulid]` query is invalidated
3. **Given** a developer uses `useRealtimeLobby(ulid)` hook, **When** PlayerJoined event received, **Then** `['lobbies']` query is invalidated
4. **Given** real-time hook is unmounted, **When** cleanup occurs, **Then** WebSocket channel subscription is cancelled
5. **Given** useRealtimeGame receives GameCompleted event, **When** game ends, **Then** game query is invalidated to show final state

---

### Edge Cases

- What happens when authStorage.getToken() throws an error? (Should log error and proceed without auth header)
- What happens when API returns 401 but authStorage.clearToken() fails? (Should still clear React Query cache and log error)
- What happens when network request fails completely (no response)? (Should return ErrorResponse with network error message)
- What happens when API returns malformed JSON? (Should be caught by error interceptor and transformed to ErrorResponse)
- What happens when a mutation succeeds but cache invalidation fails? (Should still complete mutation successfully, log cache error)
- What happens when multiple 401 errors occur simultaneously? (Should only call clearToken once, use debounce/flag)
- What happens when developer provides invalid baseURL? (Should validate URL format and throw clear error at setup time)
- What happens when WebSocket connection drops during a game? (Should expose connection status, allow retry logic)
- What happens when game action is submitted while previous action is still processing? (Should queue or reject with clear error)

## Requirements *(mandatory)*

### Functional Requirements

#### Type Definitions (src/types/)

- **FR-001**: System MUST provide `AuthStorage` interface with `getToken()`, `setToken(token)`, and `clearToken()` methods, all returning Promises
- **FR-002**: System MUST provide `User` interface with username, name, avatar, and optional social_links properties
- **FR-003**: System MUST provide `AuthResponse` interface with flat structure containing token and user (not wrapped in data)
- **FR-004**: System MUST provide `ApiResponse<T>` generic interface with data property and optional message
- **FR-005**: System MUST provide `PaginatedResponse<T>` interface with data array, links (first, last, prev, next), and meta (pagination info)
- **FR-006**: System MUST provide `ErrorResponse` interface with message, error_code, and optional errors object for validation errors
- **FR-007**: System MUST provide `Game` interface with ulid, game_title, status, game_state (JSON object), players array, and timestamps
- **FR-008**: System MUST provide `GameActionRequest` interface with action_type and action_details properties
- **FR-009**: System MUST provide `LobbyDetails` interface with ulid, game_title, name, host, players, max_players, status, and optional settings
- **FR-010**: System MUST provide `SubscriptionPlan`, `SubscriptionStatus`, and `UsageQuotas` interfaces for billing operations
- **FR-011**: System MUST provide `GameEvent` and `LobbyEvent` interfaces for real-time event structures
- **FR-012**: All types MUST be exported from `src/types/index.ts` for convenient importing
- **FR-013**: System MUST provide request interfaces for all mutation operations (LoginRequest, RegisterRequest, CreateLobbyRequest, etc.)

#### Base API Client (src/core/api/base-client.ts)

- **FR-014**: System MUST export `setupAPIClient()` function accepting config object with clientKey, authStorage, and optional baseURL
- **FR-015**: System MUST set Axios baseURL to `https://api.gamerprotocol.io/v1/` by default, overrideable via config
- **FR-016**: System MUST inject `X-Client-Key` header on ALL requests using the clientKey from config
- **FR-017**: System MUST inject `Authorization: Bearer [token]` header on requests when authStorage.getToken() returns a token
- **FR-018**: System MUST call authStorage.getToken() asynchronously in request interceptor before each request
- **FR-019**: System MUST catch 401 Unauthorized responses in response interceptor
- **FR-020**: System MUST call authStorage.clearToken() when 401 error is caught
- **FR-021**: System MUST transform all API errors to ErrorResponse type with message and error_code properties
- **FR-022**: System MUST handle network errors (no response) by creating ErrorResponse with appropriate error_code
- **FR-023**: System MUST return configured AxiosInstance from setupAPIClient() for use by hooks

#### Authentication Hooks (src/core/hooks/useAuth.ts)

- **FR-024**: System MUST provide `useLogin()` hook returning UseMutationResult for POST /v1/auth/login
- **FR-025**: useLogin MUST call authStorage.setToken(response.token) on successful login
- **FR-026**: useLogin MUST invalidate `['user']` query after successful login
- **FR-027**: System MUST provide `useSocialLogin()` hook for POST /v1/auth/social with provider and access_token
- **FR-028**: useSocialLogin MUST call authStorage.setToken(response.token) on success
- **FR-029**: System MUST provide `useRegister()` hook for POST /v1/auth/register returning RegisterResponse (no token)
- **FR-030**: System MUST provide `useVerifyEmail()` hook for POST /v1/auth/verify
- **FR-031**: useVerifyEmail MUST call authStorage.setToken(response.token) on successful verification
- **FR-032**: System MUST provide `useLogout()` hook for POST /v1/auth/logout
- **FR-033**: useLogout MUST call authStorage.clearToken() on success
- **FR-034**: useLogout MUST call queryClient.clear() to reset all React Query cache on success
- **FR-035**: System MUST provide `useUserQuery()` hook for GET /v1/auth/user with query key `['user']`
- **FR-036**: System MUST provide `useUpdateProfile()` hook for PATCH /v1/auth/user
- **FR-037**: useUpdateProfile MUST invalidate `['user']` query on success
- **FR-038**: All auth hooks MUST return typed ErrorResponse on failure
- **FR-039**: All auth hooks MUST expose isLoading, isError, and error states from React Query

#### Game Hooks (src/core/hooks/useGame.ts)

- **FR-040**: System MUST provide `useGameQuery(ulid)` hook for GET /v1/games/{gameUlid} with query key `['game', ulid]`
- **FR-041**: System MUST provide `useGamesQuery()` hook for GET /v1/games returning paginated game list
- **FR-042**: System MUST provide `useGameAction(ulid)` hook for POST /v1/games/{gameUlid}/action
- **FR-043**: useGameAction MUST invalidate `['game', ulid]` query on successful action
- **FR-044**: System MUST provide `useGameOptions(ulid)` hook for GET /v1/games/{gameUlid}/options
- **FR-045**: System MUST provide `useForfeitGame(ulid)` hook for POST /v1/games/{gameUlid}/forfeit
- **FR-046**: useForfeitGame MUST invalidate `['game', ulid]` query on success
- **FR-047**: System MUST provide `useLobbiesQuery()` hook for GET /v1/games/lobbies with query key `['lobbies']`
- **FR-048**: System MUST provide `useLobbyQuery(ulid)` hook for GET /v1/games/lobbies/{lobby_ulid}
- **FR-049**: System MUST provide `useCreateLobby()` hook for POST /v1/games/lobbies
- **FR-050**: useCreateLobby MUST invalidate `['lobbies']` query on success
- **FR-051**: System MUST provide `useJoinQuickplay()` hook for POST /v1/games/quickplay
- **FR-052**: System MUST provide `useLeaveQuickplay()` hook for DELETE /v1/games/quickplay
- **FR-053**: System MUST provide `useAcceptQuickplay()` hook for POST /v1/games/quickplay/accept
- **FR-054**: All game queries MUST disable refetchInterval (rely on WebSocket for updates)
- **FR-055**: All game hooks MUST return typed responses matching API contracts

#### Billing Hooks (src/core/hooks/useBilling.ts)

- **FR-056**: System MUST provide `usePlansQuery()` hook for GET /v1/billing/plans
- **FR-057**: System MUST provide `useSubscriptionStatus()` hook for GET /v1/billing/status
- **FR-058**: System MUST provide `useQuotas()` hook for GET /v1/billing/status returning usage quotas
- **FR-059**: System MUST provide `useSubscribe()` hook for POST /v1/billing/subscribe returning Stripe checkout URL
- **FR-060**: System MUST provide `useVerifyAppleReceipt()` hook for POST /v1/billing/apple/verify
- **FR-061**: System MUST provide `useVerifyGoogleReceipt()` hook for POST /v1/billing/google/verify
- **FR-062**: System MUST provide `useVerifyTelegramReceipt()` hook for POST /v1/billing/telegram/verify
- **FR-063**: All billing hooks MUST use appropriate query keys for caching

#### Real-Time Layer (src/core/realtime/)

- **FR-064**: System MUST provide `setupEcho(token, options?)` function in src/core/realtime/echo-client.ts
- **FR-065**: setupEcho MUST configure Laravel Echo with pusher broadcaster compatible with Reverb
- **FR-066**: setupEcho MUST use provided token for private channel authorization
- **FR-067**: setupEcho MUST accept optional host and authEndpoint in options parameter
- **FR-068**: System MUST provide `useRealtimeGame(ulid, options?)` hook for game channel subscriptions
- **FR-069**: useRealtimeGame MUST subscribe to `private-game.{ulid}` channel when enabled
- **FR-070**: useRealtimeGame MUST listen for GameActionProcessed, GameCompleted, and TurnChanged events
- **FR-071**: useRealtimeGame MUST call queryClient.invalidateQueries(['game', ulid]) when events received
- **FR-072**: useRealtimeGame MUST cleanup channel subscription on component unmount
- **FR-073**: useRealtimeGame MUST return isConnected status and error state
- **FR-074**: System MUST provide `useRealtimeLobby(ulid, options?)` hook for lobby channel subscriptions
- **FR-075**: useRealtimeLobby MUST subscribe to `private-lobby.{ulid}` channel when enabled
- **FR-076**: useRealtimeLobby MUST listen for PlayerJoined, PlayerLeft, ReadyCheckStarted events
- **FR-077**: useRealtimeLobby MUST invalidate `['lobbies']` query when events received
- **FR-078**: Both real-time hooks MUST accept enabled boolean in options to control subscription

### Key Entities

- **AuthStorage**: Platform-agnostic interface for token persistence (localStorage on web, SecureStore on native)
- **User**: Basic user profile with username, name, avatar, and optional social links
- **Game**: Complete game state including ulid, status, players, and game-specific state JSON
- **Lobby**: Pre-game gathering space with host, players, settings, and ready status
- **Subscription**: User's current plan level, payment provider, and renewal information
- **Quota**: Usage limits based on plan tier (strikes for free, match count for member)
- **GameEvent**: Real-time event for game state changes (action processed, turn changed, game completed)
- **LobbyEvent**: Real-time event for lobby changes (player joined/left, ready check)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All TypeScript types compile with strict mode enabled and zero implicit `any` types
- **SC-002**: API client successfully injects authentication headers on 100% of requests when token exists
- **SC-003**: 401 errors trigger token cleanup and cache reset within 100ms of response
- **SC-004**: Authentication hooks complete login/logout operations and update cache within 500ms of API response
- **SC-005**: Game action mutations invalidate cache and trigger refetch within 200ms of success
- **SC-006**: Real-time WebSocket events invalidate affected queries within 100ms of event receipt
- **SC-007**: All hooks expose proper loading/error states compatible with React Query's API
- **SC-008**: Package exports achieve 100% platform-agnostic code in src/core and src/types directories
- **SC-009**: Zero runtime errors when using hooks across web, React Native, Electron, and Telegram Mini App environments
- **SC-010**: All exported functions have JSDoc comments with parameter descriptions and return types
- **SC-011**: Integration tests verify complete auth flow (login → token storage → authenticated request → logout) completes successfully
- **SC-012**: Integration tests verify game action flow (fetch game → execute action → cache invalidation → refetch) completes successfully

## Assumptions

1. **API Base URL**: Default to `https://api.gamerprotocol.io/v1/` but allow override for development/staging environments
2. **Token Format**: Assumes Laravel Sanctum token format (numeric ID prefix with pipe separator) but treats as opaque string
3. **Error Codes**: API returns consistent error_code strings for error categorization (VALIDATION_ERROR, AUTH_ERROR, etc.)
4. **WebSocket Host**: Reverb WebSocket server runs on same domain as API unless explicitly configured
5. **Auth Persistence**: Clients will provide platform-specific AuthStorage implementations (package only defines interface)
6. **React Query Version**: Package uses React Query v5.x API and clients use compatible version
7. **Network Conditions**: Assumes stable network for real-time connections; reconnection logic handled by Laravel Echo
8. **Concurrent Requests**: Multiple simultaneous API requests are safe; Axios handles request queueing internally
9. **Token Expiration**: 401 errors indicate token expiration/invalidity; no separate expiry check needed
10. **Cache Strategy**: React Query's default staleTime and cacheTime are acceptable; clients can override per-query if needed

## Dependencies

1. **axios**: ^1.7.7 - HTTP client for API communication
2. **@tanstack/react-query**: ^5.59.0 - State management and caching
3. **laravel-echo**: ^1.16.1 - WebSocket client for real-time updates
4. **pusher-js**: ^8.4.0-rc2 - Transport layer for Laravel Echo (Reverb compatible)
5. **react**: ^18.0.0 - Peer dependency, required by all hooks
6. **typescript**: ^5.6.3 - Dev dependency for type checking

## Out of Scope

The following are explicitly NOT included in this feature specification:

1. **UI Components**: No React components or UI layer (separate feature)
2. **Platform-Specific Storage**: No implementation of AuthStorage for any platform (client responsibility)
3. **Provider Component**: Package provider that initializes API client and Echo (separate feature)
4. **Testing Utilities**: No testing helpers or mock factories (future enhancement)
5. **Retry Logic**: No automatic retry for failed requests beyond React Query defaults
6. **Offline Support**: No offline queue or cache persistence (future enhancement)
7. **Request Cancellation**: No explicit cancellation API beyond React Query's built-in functionality
8. **Rate Limiting**: No client-side rate limiting or throttling
9. **Analytics/Logging**: No telemetry or usage tracking built into hooks
10. **Optimistic Updates**: No optimistic UI updates for mutations (future enhancement)
11. **Public Endpoints**: No hooks for public endpoints (status, titles, leaderboards) - will be added in separate feature
12. **Rematch System**: No hooks for rematch requests/responses (future enhancement)
13. **Game History**: No hooks for fetching game replay/history (future enhancement)
14. **Alert Management**: No hooks for user alerts/notifications (future enhancement)

## Notes

- This specification focuses solely on the `src/core` and `src/types` directories as requested
- All code must be 100% platform-agnostic per Constitution Principle I
- Strict TypeScript compliance per Constitution Principle II (no implicit any)
- Hooks must be independently usable per Constitution Principle IV (Zero Lock-in)
- All type definitions follow the API contracts in docs/api-endpoints.md
- Real-time layer provides foundation for live updates but games can function without it
- React Query query keys follow hierarchical pattern for precise cache invalidation
- Error handling is centralized in base API client for consistency
- Constitution versioning requirements apply: this is a MINOR version bump (new features, backward compatible)
