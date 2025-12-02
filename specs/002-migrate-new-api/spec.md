# Feature Specification: Migrate to New API Structure

**Feature Branch**: `002-migrate-new-api`
**Created**: 2025-12-01
**Status**: Draft
**Input**: User description: "The codebase was created to interact with the api structure in /docs/old-api.md but the 3rd party api has changed endpoints & responses as outlined in /docs/api.md. Create the spec to update the codebase to the new api structure. I don't need backwards compatibility"

## User Scenarios & Testing

### User Story 1 - Authentication & Session Management (Priority: P1)

As a developer, I need the authentication client to correctly interact with the new v1 Auth endpoints so that users can securely log in and maintain sessions.

**Why this priority**: Authentication is the gateway to all other features. Without it, no other API calls will work.

**Independent Test**: Can be tested by mocking the `/v1/auth/login` endpoint and verifying the `X-Client-Key` and `Authorization` headers are present in subsequent requests.

**Acceptance Scenarios**:

1. **Given** a user with valid credentials, **When** they call `login()`, **Then** the system stores the returned Bearer token and User object.
2. **Given** an authenticated user, **When** they make an API request, **Then** the request includes both `Authorization: Bearer ...` and `X-Client-Key` headers.
3. **Given** an expired session (401 response), **When** an API request fails, **Then** the system automatically clears the stored token.

---

### User Story 2 - Game Matchmaking & Gameplay (Priority: P1)

As a developer, I need the game hooks to use the new Matchmaking and Games namespaces so that users can find and play games.

**Why this priority**: Core value proposition of the application.

**Independent Test**: Can be tested by mocking the matchmaking queue and game action endpoints.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they call `joinQueue()`, **Then** a POST request is sent to `/v1/matchmaking/queue`.
2. **Given** an active game, **When** a user submits a move, **Then** a POST request is sent to `/v1/games/{ulid}/actions` with an idempotency key.
3. **Given** a game list request, **When** data is returned, **Then** it matches the new `PaginatedResponse<Game>` structure.

---

### User Story 3 - Real-time Event Subscriptions (Priority: P2)

As a developer, I need the realtime client to subscribe to the correct private channels so that the UI updates instantly.

**Why this priority**: Essential for multiplayer game experience.

**Independent Test**: Can be tested by verifying channel subscription names match the new pattern `private-game.{ulid}`.

**Acceptance Scenarios**:

1. **Given** an active game, **When** the game hook mounts, **Then** it subscribes to `private-game.{ulid}`.
2. **Given** a user session, **When** the auth hook mounts, **Then** it subscribes to `private-user.{username}`.

### Edge Cases

- **Network Failure**: How does the system behave if the API is unreachable? (Should retry or show error)
- **Invalid Token**: What happens if the stored token is malformed? (Should clear and redirect to login)
- **Rate Limiting**: How does the client handle 429 Too Many Requests? (Should respect Retry-After header)
- **Concurrent Actions**: What happens if a user clicks "Move" twice? (Idempotency key should prevent duplicate actions)

## Requirements

### Functional Requirements

- **FR-001**: System MUST use `https://api.gamerprotocol.io/v1` as the base URL.
- **FR-002**: All API requests MUST include the `X-Client-Key` header.
- **FR-003**: Authenticated requests MUST include the `Authorization: Bearer [token]` header.
- **FR-004**: The `User` type definition MUST match the structure in `/docs/api.md` (including `username`, `level`, `xp`).
- **FR-005**: The `Game` type definition MUST match the structure in `/docs/api.md` (using `ulid` instead of `id`).
- **FR-006**: Authentication hooks MUST use `/v1/auth/login`, `/v1/auth/register`, and `/v1/auth/logout`.
- **FR-007**: Matchmaking hooks MUST use `/v1/matchmaking/queue` and `/v1/matchmaking/lobbies`.
- **FR-008**: Game action hooks MUST use `/v1/games/{ulid}/actions` and support idempotency keys.
- **FR-009**: Realtime client MUST subscribe to `private-user.{username}` for user events (MatchFound, ChallengeReceived).
- **FR-010**: Realtime client MUST subscribe to `private-game.{ulid}` for game events (ActionProcessed, GameCompleted).
- **FR-011**: All legacy API code and types incompatible with v1 MUST be removed.

### Key Entities

- **User**: Represents the player identity. Key attributes: `username`, `email`, `level`, `xp`, `avatar`.
- **Game**: Represents a game instance. Key attributes: `ulid`, `status`, `current_turn`, `players`, `state`.
- **Lobby**: Represents a pre-game staging area. Key attributes: `ulid`, `host`, `game_title`, `mode`.
- **Action**: Represents a player move. Key attributes: `action_id`, `action`, `parameters`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of data structures in the codebase match the JSON response structures defined in the API documentation.
- **SC-002**: Static analysis and type validation passes with 0 errors.
- **SC-003**: Automated test suite passes for all updated API clients and hooks.
- **SC-004**: All API requests observed in tests contain the required authentication headers.

## Assumptions

- The `X-Client-Key` will be provided via configuration to the API client setup.
- The `AuthStorage` interface remains unchanged (getToken, setToken, clearToken).
- The underlying WebSocket technology (Pusher/Reverb) remains compatible with `laravel-echo`.
