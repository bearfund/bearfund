# Tasks: API Core Integration

**Feature**: 001-api-core-integration  
**Branch**: `001-api-core-integration`  
**Input**: Design documents from `/home/drewroberts/Code/ui/specs/001-api-core-integration/`

**Tests**: NOT included (not explicitly requested in specification - can add in future iteration if TDD approach desired)

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify package.json, tsconfig.json, and build configuration exist per plan.md
- [x] T002 Create src/types/ directory structure
- [x] T003 Create src/core/api/ directory structure
- [x] T004 Create src/core/hooks/ directory structure
- [x] T005 Create src/core/realtime/ directory structure
- [x] T006 Create src/index.ts main entry point
- [x] T007 Create src/native.ts React Native entry point

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Install peer dependencies: @tanstack/react-query@^5.59.0, axios@^1.7.7
- [x] T009 Install real-time dependencies: laravel-echo@^1.16.1, pusher-js@^8.4.0-rc2
- [x] T010 Configure TypeScript strict mode per plan.md (noImplicitAny, strictNullChecks, etc.)
- [x] T011 Setup tsup build configuration for dual CJS/ESM exports
- [x] T012 Create .eslintrc.json with TypeScript rules and no-unused-vars enforcement
- [x] T013 Create .prettierrc.json with 100 char line limit per constitution

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Type-Safe API Communication (Priority: P1) 🎯 MVP

**Goal**: Provide platform-agnostic type definitions for all API requests and responses to ensure type safety across all 4 platforms

**Independent Test**: Import types in TypeScript file, verify compilation succeeds with strict mode, check IntelliSense works

### Implementation for User Story 1

- [x] T014 [P] [US1] Create AuthStorage interface in src/types/auth.types.ts (FR-001)
- [x] T015 [P] [US1] Create User interface in src/types/auth.types.ts (FR-002)
- [x] T016 [P] [US1] Create AuthResponse interface (flat structure) in src/types/auth.types.ts (FR-003)
- [x] T017 [P] [US1] Create LoginRequest, RegisterRequest, VerifyRequest, SocialLoginRequest, UpdateProfileRequest interfaces in src/types/auth.types.ts (FR-013)
- [x] T018 [P] [US1] Create ApiResponse<T> generic interface in src/types/api.types.ts (FR-004)
- [x] T019 [P] [US1] Create PaginatedResponse<T> and PaginationMeta interfaces in src/types/api.types.ts (FR-005)
- [x] T020 [P] [US1] Create ErrorResponse interface in src/types/api.types.ts (FR-006)
- [x] T021 [P] [US1] Create Game interface with ulid, game_title, state, game_state, players in src/types/game.types.ts (FR-007)
- [x] T022 [P] [US1] Create GameState type ('pending' | 'active' | 'completed' | 'forfeited') in src/types/game.types.ts
- [x] T023 [P] [US1] Create GameAction, GameHistory, GameActionRequest, GameOptions interfaces in src/types/game.types.ts (FR-008)
- [x] T024 [P] [US1] Create Lobby, LobbyPlayer, LobbyPlayerStatus, CreateLobbyRequest, UpdateLobbyPlayerRequest interfaces in src/types/game.types.ts (FR-009)
- [x] T025 [P] [US1] Create QuickplayRequest, QuickplayAcceptRequest, RematchRequest interfaces in src/types/game.types.ts
- [x] T026 [P] [US1] Create SubscriptionPlan, BillingStatus, UsageQuotas, SubscribeRequest, SubscribeResponse, CustomerPortalResponse interfaces in src/types/billing.types.ts (FR-010)
- [x] T027 [P] [US1] Create PlatformReceiptRequest and PlatformReceiptResponse interfaces in src/types/billing.types.ts
- [x] T028 [P] [US1] Create GameEvent, LobbyEvent, GameEventType, LobbyEventType, ConnectionStatus interfaces in src/types/realtime.types.ts (FR-011)
- [x] T029 [P] [US1] Create GameEventPayload discriminated union types in src/types/realtime.types.ts
- [x] T030 [P] [US1] Create LobbyEventPayload discriminated union types in src/types/realtime.types.ts
- [x] T031 [P] [US1] Create ChannelSubscription interface in src/types/realtime.types.ts
- [x] T032 [US1] Create src/types/index.ts barrel file exporting all types (FR-012)
- [x] T033 [US1] Add JSDoc comments to all exported types per constitution (FR-010, SC-010)
- [x] T034 [US1] Compile TypeScript in strict mode and verify zero implicit any types (SC-001)

**Checkpoint**: Types complete and importable. Provides IntelliSense and compile-time checking immediately.

---

## Phase 4: User Story 2 - Authenticated API Client (Priority: P1)

**Goal**: Configured Axios client that automatically handles authentication headers and error responses

**Independent Test**: Create Axios instance with setupAPIClient, make request, verify headers injected correctly

### Implementation for User Story 2

- [x] T035 [US2] Create src/core/api/base-client.ts file
- [x] T036 [US2] Implement setupAPIClient() function accepting config with clientKey, authStorage, baseURL in src/core/api/base-client.ts (FR-014)
- [x] T037 [US2] Set default baseURL to https://api.gamerprotocol.io/v1/ in setupAPIClient (FR-015)
- [x] T038 [US2] Create Axios instance with baseURL from config in setupAPIClient (FR-023)
- [x] T039 [US2] Implement request interceptor to inject X-Client-Key header on all requests (FR-016)
- [x] T040 [US2] Implement async request interceptor to call authStorage.getToken() before each request (FR-018)
- [x] T041 [US2] Inject Authorization: Bearer [token] header when getToken() returns non-null token (FR-017)
- [x] T042 [US2] Implement response interceptor to catch 401 Unauthorized errors (FR-019)
- [x] T043 [US2] Call authStorage.clearToken() when 401 error caught (FR-020)
- [x] T044 [US2] Transform all API errors to ErrorResponse type in error interceptor (FR-021)
- [x] T045 [US2] Handle network errors (no response) by creating ErrorResponse with NETWORK_ERROR code (FR-022)
- [x] T046 [US2] Add error handling for authStorage.getToken() failures (log error, proceed without auth)
- [x] T047 [US2] Add debounce/flag to prevent multiple simultaneous clearToken() calls on concurrent 401s
- [x] T048 [US2] Validate baseURL format at setup time and throw clear error if invalid
- [x] T049 [US2] Add JSDoc comments to setupAPIClient() with parameter descriptions
- [x] T050 [US2] Create src/core/api/index.ts exporting setupAPIClient
- [x] T051 [US2] Export API client utilities from src/core/index.ts
- [x] T052 [US2] Verify headers inject correctly with mock authStorage (SC-002)
- [x] T053 [US2] Verify 401 triggers clearToken within 100ms (SC-003)

**Checkpoint**: API client complete. Ready for hook implementation.

---

## Phase 5: User Story 3 - Authentication Hooks (Priority: P1)

**Goal**: React Query hooks for authentication operations with token storage and cache management

**Independent Test**: Use useLogin hook in test component, verify token storage and cache updates occur

### Implementation for User Story 3

- [ ] T054 [US3] Create src/core/hooks/useAuth.ts file
- [ ] T055 [US3] Import setupAPIClient and get axios instance reference
- [ ] T056 [US3] Import useQueryClient for cache operations
- [ ] T057 [P] [US3] Implement useLogin() hook with useMutation for POST /v1/auth/login (FR-024)
- [ ] T058 [US3] Call authStorage.setToken(response.token) in useLogin onSuccess (FR-025)
- [ ] T059 [US3] Invalidate ['user'] query in useLogin onSuccess (FR-026)
- [ ] T060 [P] [US3] Implement useSocialLogin() hook with useMutation for POST /v1/auth/social (FR-027)
- [ ] T061 [US3] Call authStorage.setToken(response.token) in useSocialLogin onSuccess (FR-028)
- [ ] T062 [P] [US3] Implement useRegister() hook with useMutation for POST /v1/auth/register (FR-029)
- [ ] T063 [P] [US3] Implement useVerifyEmail() hook with useMutation for POST /v1/auth/verify (FR-030)
- [ ] T064 [US3] Call authStorage.setToken(response.token) in useVerifyEmail onSuccess (FR-031)
- [ ] T065 [P] [US3] Implement useLogout() hook with useMutation for POST /v1/auth/logout (FR-032)
- [ ] T066 [US3] Call authStorage.clearToken() in useLogout onSuccess (FR-033)
- [ ] T067 [US3] Call queryClient.clear() in useLogout onSuccess to reset all cache (FR-034)
- [ ] T068 [P] [US3] Implement useUserQuery() hook with useQuery for GET /v1/auth/user with key ['user'] (FR-035)
- [ ] T069 [P] [US3] Implement useUpdateProfile() hook with useMutation for PATCH /v1/auth/user (FR-036)
- [ ] T070 [US3] Invalidate ['user'] query in useUpdateProfile onSuccess (FR-037)
- [ ] T071 [US3] Ensure all auth hooks return typed ErrorResponse on failure (FR-038)
- [ ] T072 [US3] Verify all hooks expose isLoading, isError, error states (FR-039)
- [ ] T073 [US3] Add JSDoc comments to all auth hooks
- [ ] T074 [US3] Create src/core/hooks/index.ts exporting all hooks
- [ ] T075 [US3] Export hooks from src/core/index.ts
- [ ] T076 [US3] Verify auth hooks complete operations within 500ms of API response (SC-004)

**Checkpoint**: Authentication complete. Users can log in, register, and manage profiles.

---

## Phase 6: User Story 4 - Game Management Hooks (Priority: P2)

**Goal**: React Query hooks for game operations with cache invalidation and real-time readiness

**Independent Test**: Use useGameQuery to fetch game, useGameAction to make move, verify cache invalidation

### Implementation for User Story 4

- [ ] T077 [US4] Create src/core/hooks/useGame.ts file
- [ ] T078 [P] [US4] Implement useGameQuery(ulid) hook with useQuery for GET /v1/games/{gameUlid} with key ['game', ulid] (FR-040)
- [ ] T079 [P] [US4] Implement useGamesQuery() hook with useQuery for GET /v1/games returning paginated list (FR-041)
- [ ] T080 [P] [US4] Implement useGameAction(ulid) hook with useMutation for POST /v1/games/{gameUlid}/action (FR-042)
- [ ] T081 [US4] Invalidate ['game', ulid] query in useGameAction onSuccess (FR-043)
- [ ] T082 [P] [US4] Implement useGameOptions(ulid) hook with useQuery for GET /v1/games/{gameUlid}/options (FR-044)
- [ ] T083 [P] [US4] Implement useGameHistory(ulid) hook with useQuery for GET /v1/games/{gameUlid}/history
- [ ] T084 [P] [US4] Implement useForfeitGame(ulid) hook with useMutation for POST /v1/games/{gameUlid}/forfeit (FR-045)
- [ ] T085 [US4] Invalidate ['game', ulid] query in useForfeitGame onSuccess (FR-046)
- [ ] T086 [P] [US4] Implement useLobbiesQuery() hook with useQuery for GET /v1/games/lobbies with key ['lobbies'] (FR-047)
- [ ] T087 [P] [US4] Implement useLobbyQuery(ulid) hook with useQuery for GET /v1/games/lobbies/{lobby_ulid} with key ['lobby', ulid] (FR-048)
- [ ] T088 [P] [US4] Implement useCreateLobby() hook with useMutation for POST /v1/games/lobbies (FR-049)
- [ ] T089 [US4] Invalidate ['lobbies'] query in useCreateLobby onSuccess (FR-050)
- [ ] T090 [P] [US4] Implement useJoinLobby(ulid) hook with useMutation for POST /v1/games/lobbies/{lobby_ulid}/players
- [ ] T091 [US4] Invalidate ['lobby', ulid] and ['lobbies'] in useJoinLobby onSuccess
- [ ] T092 [P] [US4] Implement useUpdateLobbyPlayer(ulid) hook with useMutation for PUT /v1/games/lobbies/{lobby_ulid}/players/{username}
- [ ] T093 [US4] Invalidate ['lobby', ulid] in useUpdateLobbyPlayer onSuccess
- [ ] T094 [P] [US4] Implement useRemoveLobbyPlayer(ulid) hook with useMutation for DELETE /v1/games/lobbies/{lobby_ulid}/players/{username}
- [ ] T095 [P] [US4] Implement useStartReadyCheck(ulid) hook with useMutation for POST /v1/games/lobbies/{lobby_ulid}/ready-check
- [ ] T096 [P] [US4] Implement useDeleteLobby(ulid) hook with useMutation for DELETE /v1/games/lobbies/{lobby_ulid}
- [ ] T097 [P] [US4] Implement useJoinQuickplay() hook with useMutation for POST /v1/games/quickplay (FR-051)
- [ ] T098 [P] [US4] Implement useLeaveQuickplay() hook with useMutation for DELETE /v1/games/quickplay (FR-052)
- [ ] T099 [P] [US4] Implement useAcceptQuickplay() hook with useMutation for POST /v1/games/quickplay/accept (FR-053)
- [ ] T100 [P] [US4] Implement useRequestRematch(ulid) hook with useMutation for POST /v1/games/{gameUlid}/rematch
- [ ] T101 [P] [US4] Implement useAcceptRematch(requestId) hook with useMutation for POST /v1/games/rematch/{requestId}/accept
- [ ] T102 [P] [US4] Implement useDeclineRematch(requestId) hook with useMutation for POST /v1/games/rematch/{requestId}/decline
- [ ] T103 [US4] Disable refetchInterval on all game queries (rely on WebSocket) (FR-054)
- [ ] T104 [US4] Ensure all game hooks return typed responses matching API contracts (FR-055)
- [ ] T105 [US4] Add JSDoc comments to all game hooks
- [ ] T106 [US4] Export game hooks from src/core/hooks/index.ts
- [ ] T107 [US4] Verify game action mutations invalidate cache within 200ms (SC-005)

**Checkpoint**: Game management complete. Users can play games, join lobbies, use matchmaking.

---

## Phase 7: User Story 5 - Billing & Subscription Hooks (Priority: P2)

**Goal**: React Query hooks for subscription management to enable monetization across platforms

**Independent Test**: Use usePlansQuery to fetch plans, useQuotas to check limits, verify data structure

### Implementation for User Story 5

- [ ] T108 [US5] Create src/core/hooks/useBilling.ts file
- [ ] T109 [P] [US5] Implement usePlansQuery() hook with useQuery for GET /v1/billing/plans with key ['billing', 'plans'] (FR-056)
- [ ] T110 [P] [US5] Implement useSubscriptionStatus() hook with useQuery for GET /v1/billing/status with key ['billing', 'status'] (FR-057)
- [ ] T111 [P] [US5] Implement useQuotas() hook returning current_usage from billing status query (FR-058)
- [ ] T112 [P] [US5] Implement useSubscribe() hook with useMutation for POST /v1/billing/subscribe (FR-059)
- [ ] T113 [US5] Invalidate ['billing', 'status'] in useSubscribe onSuccess
- [ ] T114 [P] [US5] Implement useCustomerPortal() hook with useMutation for GET /v1/billing/manage
- [ ] T115 [P] [US5] Implement useVerifyAppleReceipt() hook with useMutation for POST /v1/billing/apple/verify (FR-060)
- [ ] T116 [US5] Invalidate ['billing', 'status'] in useVerifyAppleReceipt onSuccess
- [ ] T117 [P] [US5] Implement useVerifyGoogleReceipt() hook with useMutation for POST /v1/billing/google/verify (FR-061)
- [ ] T118 [US5] Invalidate ['billing', 'status'] in useVerifyGoogleReceipt onSuccess
- [ ] T119 [P] [US5] Implement useVerifyTelegramReceipt() hook with useMutation for POST /v1/billing/telegram/verify (FR-062)
- [ ] T120 [US5] Invalidate ['billing', 'status'] in useVerifyTelegramReceipt onSuccess
- [ ] T121 [US5] Ensure all billing hooks use appropriate query keys (FR-063)
- [ ] T122 [US5] Add JSDoc comments to all billing hooks
- [ ] T123 [US5] Export billing hooks from src/core/hooks/index.ts

**Checkpoint**: Billing complete. Subscriptions work across Stripe, Apple, Google, Telegram platforms.

---

## Phase 8: User Story 6 - Real-Time WebSocket Integration (Priority: P3)

**Goal**: Laravel Echo client and React hooks for real-time game/lobby updates via WebSocket

**Independent Test**: Call setupEcho, subscribe to channel, simulate event, verify query invalidation

### Implementation for User Story 6

- [ ] T124 [US6] Create src/core/realtime/echo-client.ts file
- [ ] T125 [US6] Implement setupEcho(token, options?) function (FR-064)
- [ ] T126 [US6] Configure Laravel Echo with pusher broadcaster for Reverb compatibility (FR-065)
- [ ] T127 [US6] Use provided token for private channel authorization in Echo config (FR-066)
- [ ] T128 [US6] Accept optional host and authEndpoint in options parameter (FR-067)
- [ ] T129 [US6] Set default wsHost, wsPort, forceTLS, disableStats per research.md decisions
- [ ] T130 [US6] Export setupEcho from src/core/realtime/index.ts
- [ ] T131 [US6] Create src/core/realtime/useRealtimeGame.ts file
- [ ] T132 [US6] Implement useRealtimeGame(ulid, options?) hook (FR-068)
- [ ] T133 [US6] Subscribe to private-game.{ulid} channel when enabled (FR-069)
- [ ] T134 [US6] Listen for GameActionProcessed, GameCompleted, GameForfeited events (FR-070)
- [ ] T135 [US6] Call queryClient.invalidateQueries(['game', ulid]) when events received (FR-071)
- [ ] T136 [US6] Implement useEffect cleanup to call echo.leave() on unmount (FR-072)
- [ ] T137 [US6] Return isConnected status and error state from hook (FR-073)
- [ ] T138 [US6] Accept enabled boolean in options to control subscription (FR-078)
- [ ] T139 [US6] Create src/core/realtime/useRealtimeLobby.ts file
- [ ] T140 [US6] Implement useRealtimeLobby(ulid, options?) hook (FR-074)
- [ ] T141 [US6] Subscribe to private-lobby.{ulid} channel when enabled (FR-075)
- [ ] T142 [US6] Listen for PlayerJoined, PlayerLeft, PlayerStatusChanged, ReadyCheckStarted, LobbyStarting, LobbyCancelled events (FR-076)
- [ ] T143 [US6] Invalidate ['lobbies'] and ['lobby', ulid] queries when events received (FR-077)
- [ ] T144 [US6] Implement useEffect cleanup for lobby channel subscription
- [ ] T145 [US6] Return isConnected and error state from useRealtimeLobby
- [ ] T146 [US6] Add connection state change handlers for error tracking
- [ ] T147 [US6] Add authentication error handling (4001 error code)
- [ ] T148 [US6] Add JSDoc comments to setupEcho and real-time hooks
- [ ] T149 [US6] Export real-time hooks from src/core/realtime/index.ts
- [ ] T150 [US6] Export realtime utilities from src/core/index.ts
- [ ] T151 [US6] Verify WebSocket events invalidate queries within 100ms (SC-006)

**Checkpoint**: Real-time complete. Games and lobbies update live via WebSocket events.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T152 [P] Update src/index.ts to export all types, hooks, and utilities for web/Electron
- [ ] T153 [P] Update src/native.ts to export all types, hooks, and utilities for React Native
- [ ] T154 [P] Verify all exported functions have JSDoc comments (SC-010)
- [ ] T155 [P] Run TypeScript compiler in strict mode and verify zero errors (SC-001)
- [ ] T156 [P] Verify 100% platform-agnostic code in src/core and src/types (SC-008)
- [ ] T157 [P] Add missing error handling for edge cases documented in spec.md
- [ ] T158 [P] Add package.json exports field for dual CJS/ESM support
- [ ] T159 [P] Verify package builds successfully with tsup
- [ ] T160 [P] Create README.md with installation and basic usage examples
- [ ] T161 [P] Validate quickstart.md examples work for all 4 platforms (SC-011)
- [ ] T162 Code review and refactoring for consistency
- [ ] T163 Performance audit - verify mutation/invalidation timings meet success criteria
- [ ] T164 Security audit - verify token handling follows best practices
- [ ] T165 Final integration test: login → token storage → authenticated request → logout flow (SC-011)
- [ ] T166 Final integration test: fetch game → execute action → cache invalidation → refetch flow (SC-012)
- [ ] T167 Update CHANGELOG.md with feature additions for v0.2.0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed)
  - OR sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Types)**: Can start after Foundational - **BLOCKS US2** (API client needs types)
- **User Story 2 (P1 - API Client)**: Depends on US1 types - **BLOCKS US3-US6** (all hooks need client)
- **User Story 3 (P1 - Auth Hooks)**: Depends on US1 types + US2 client - No other story dependencies
- **User Story 4 (P2 - Game Hooks)**: Depends on US1 types + US2 client - Independent of US3/US5
- **User Story 5 (P2 - Billing Hooks)**: Depends on US1 types + US2 client - Independent of US3/US4
- **User Story 6 (P3 - Real-time)**: Depends on US1 types + US2 client + US4 game hooks - Must be last

### Critical Path (MVP)

For MVP, implement in this order:
1. **Phase 1**: Setup (T001-T007)
2. **Phase 2**: Foundational (T008-T013)
3. **Phase 3**: User Story 1 - Types (T014-T034) ← Foundation for everything
4. **Phase 4**: User Story 2 - API Client (T035-T053) ← Enables API communication
5. **Phase 5**: User Story 3 - Auth Hooks (T054-T076) ← MVP complete with auth

**Stop here for MVP** - Users can authenticate and manage profiles.

### Post-MVP Priorities

After MVP, add features by priority:
- **P2 Stories**: US4 (Game Hooks) + US5 (Billing Hooks) - can be done in parallel
- **P3 Story**: US6 (Real-time) - enhancement layer on top of game hooks

### Parallel Opportunities

**Within Setup (Phase 1)**:
- All tasks T002-T007 can run in parallel after T001

**Within Foundational (Phase 2)**:
- T008-T009 can run in parallel
- T010-T013 can run in parallel after T008-T009

**Within User Story 1 (Types)**:
- T014-T031 (all type files) can run in parallel
- T032 (index.ts) depends on T014-T031
- T033-T034 (docs/validation) can run in parallel after T032

**Within User Story 2 (API Client)**:
- Sequential by nature (building one client)

**Within User Story 3 (Auth Hooks)**:
- T057, T060, T062, T063, T065, T068, T069 (hook definitions) can run in parallel
- Cache invalidation tasks depend on their respective hook tasks

**Within User Story 4 (Game Hooks)**:
- T078-T102 (hook definitions) can run in parallel
- T103-T107 (validation/docs) run after hooks complete

**Within User Story 5 (Billing Hooks)**:
- T109-T119 (hook definitions) can run in parallel
- T121-T123 (validation/docs) run after hooks complete

**Within User Story 6 (Real-time)**:
- T124-T130 (setupEcho) and T131-T138 (useRealtimeGame) and T139-T145 (useRealtimeLobby) can run in parallel
- T146-T151 (error handling/docs) run after core implementation

**Within Polish (Phase 9)**:
- T152-T161 (all documentation/export tasks) can run in parallel
- T162-T167 (review/testing) run sequentially at end

---

## Parallel Example: User Story 1 (Types)

If you have 5 developers, they can work simultaneously:

```bash
# Developer 1
git checkout -b feature/us1-auth-types
# Work on T014-T017 (auth.types.ts)

# Developer 2
git checkout -b feature/us1-api-types
# Work on T018-T020 (api.types.ts)

# Developer 3
git checkout -b feature/us1-game-types
# Work on T021-T025 (game.types.ts)

# Developer 4
git checkout -b feature/us1-billing-types
# Work on T026-T027 (billing.types.ts)

# Developer 5
git checkout -b feature/us1-realtime-types
# Work on T028-T031 (realtime.types.ts)

# After all complete, one developer does T032 (index.ts)
# Then T033-T034 (docs/validation) can be done by anyone
```

---

## Implementation Strategy

### MVP First (Recommended)

**Goal**: Ship authentication functionality ASAP

1. Complete Phase 1 (Setup) - 1 day
2. Complete Phase 2 (Foundational) - 1 day
3. Complete Phase 3 (User Story 1 - Types) - 2 days
4. Complete Phase 4 (User Story 2 - API Client) - 2 days
5. Complete Phase 5 (User Story 3 - Auth Hooks) - 3 days
6. Run minimal polish tasks (T152-T155, T160-T161) - 1 day

**Total MVP**: ~10 days for functional authentication system

### Post-MVP Increments

**Increment 2**: Add game management (P2)
- Phase 6 (User Story 4 - Game Hooks) - 5 days

**Increment 3**: Add billing (P2)
- Phase 7 (User Story 5 - Billing Hooks) - 3 days

**Increment 4**: Add real-time (P3)
- Phase 8 (User Story 6 - Real-time) - 4 days

**Final Polish**: Phase 9 remaining tasks - 2 days

**Total Complete Feature**: ~24 days

---

## Task Validation Checklist

✅ All tasks follow format: `- [ ] [ID] [P?] [Story] Description with file path`  
✅ Tasks organized by user story for independent implementation  
✅ Each user story has independent test criteria  
✅ Dependencies clearly documented  
✅ Parallel opportunities identified  
✅ MVP scope defined (US1-US3)  
✅ File paths specified for all implementation tasks  
✅ All 78 functional requirements mapped to tasks  
✅ Constitution compliance built into tasks (strict mode, JSDoc, platform-agnostic)  
✅ Success criteria validation tasks included  

---

## Summary

**Total Tasks**: 167  
**MVP Tasks**: T001-T076 (76 tasks)  
**Post-MVP Tasks**: T077-T167 (91 tasks)

**Task Distribution**:
- Setup: 7 tasks
- Foundational: 6 tasks (BLOCKS all stories)
- User Story 1 (Types): 21 tasks
- User Story 2 (API Client): 19 tasks
- User Story 3 (Auth): 23 tasks ← **MVP ends here**
- User Story 4 (Games): 31 tasks
- User Story 5 (Billing): 16 tasks
- User Story 6 (Real-time): 28 tasks
- Polish: 16 tasks

**Parallel Opportunities**: 50+ tasks marked [P] can run in parallel

**MVP Delivery**: Authentication system ready in ~10 days  
**Full Feature**: All 6 user stories in ~24 days
