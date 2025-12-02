# Research: Migrate to New API Structure

**Feature**: Migrate to New API Structure
**Status**: Complete
**Date**: 2025-12-01

## Decisions

### 1. API Client Configuration

- **Decision**: Update `base-client.ts` to enforce `X-Client-Key` header on all requests.
- **Rationale**: The new API documentation explicitly requires `X-Client-Key` for both public and authenticated endpoints to identify the client application.
- **Impact**: `setupAPIClient` configuration interface will need to include `clientKey`.

### 2. Endpoint Mapping

- **Decision**: Update all API hooks to use the new endpoint structure defined in `docs/api.md`.
- **Rationale**: Several endpoints have changed slightly (e.g., `/action` -> `/actions`, `/auth/user` -> `/account/profile`).
- **Changes**:
  - `POST /auth/login` -> `POST /v1/auth/login`
  - `GET /auth/user` -> `GET /v1/account/profile`
  - `POST /v1/games/{id}/action` -> `POST /v1/games/{ulid}/actions`
  - `GET /v1/games/lobbies` -> `GET /v1/matchmaking/lobbies`

### 3. Type Definitions

- **Decision**: Refactor `src/types` to match the JSON response structures in `docs/api.md`.
- **Rationale**: The response envelope has been standardized with `data`, `meta`, and `links` for paginated responses.
- **Changes**:
  - Update `User` type to include `level`, `xp`, `social_links`.
  - Update `Game` type to use `ulid` instead of `id`.
  - Create `PaginatedResponse<T>` interface.

### 4. Real-time Channels

- **Decision**: Use `private-user.{username}` and `private-game.{ulid}` channels.
- **Rationale**: Matches the "Real-Time Events" section of the new API docs.

## Unknowns & Clarifications

### Resolved

- **Auth Header**: Confirmed `Authorization: Bearer ...` is required alongside `X-Client-Key`.
- **Base URL**: Confirmed `https://api.gamerprotocol.io/v1` is the default base URL.
- **Idempotency**: Confirmed game actions require `Idempotency-Key` header (though implementation might be optional for now, we should support it).

### Open Questions

- None. The `docs/api.md` is comprehensive.

## Alternatives Considered

### Partial Migration

- **Option**: Only update broken endpoints.
- **Rejected**: The user explicitly requested to "update the codebase to the new api structure" and said "I don't need backwards compatibility". A full migration ensures consistency and prevents future bugs.

### Generating Client from OpenAPI

- **Option**: Use an OpenAPI generator tool.
- **Rejected**: The codebase already has a custom `base-client.ts` and hook structure. It's better to update the existing idiomatic TypeScript code than to replace it with auto-generated code that might not fit the project's patterns (React Query, etc.).
