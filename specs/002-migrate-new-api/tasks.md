# Tasks: Migrate to New API Structure

**Input**: Design documents from `/specs/002-migrate-new-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 [P] Update API client configuration in src/core/api/base-client.ts to include X-Client-Key header
- [ ] T003 [P] Create PaginatedResponse interface in src/types/api.types.ts
- [ ] T004 [P] Update User interface in src/types/auth.types.ts to match new API structure
- [ ] T005 [P] Update Game interface in src/types/game.types.ts to match new API structure
- [ ] T006 [P] Create Lobby interface in src/types/game.types.ts
- [ ] T007 [P] Create GameAction interface in src/types/game.types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 [P] Remove legacy API code and types incompatible with v1 in src/core/api/
- [ ] T009 [P] Remove legacy API code and types incompatible with v1 in src/types/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication & Session Management (Priority: P1) 🎯 MVP

**Goal**: Users can securely log in and maintain sessions using the new v1 Auth endpoints.

**Independent Test**: Mock `/v1/auth/login` and verify `X-Client-Key` and `Authorization` headers in requests.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [ ] T010 [P] [US1] Create test for auth client in src/core/hooks/useAuth.test.tsx

### Implementation for User Story 1

- [ ] T011 [P] [US1] Update useLogin hook in src/core/hooks/useAuth.ts to use /v1/auth/login
- [ ] T012 [P] [US1] Update useLogout hook in src/core/hooks/useAuth.ts to use /v1/auth/logout
- [ ] T013 [P] [US1] Update useUserQuery hook in src/core/hooks/useAuth.ts to use /v1/account/profile
- [ ] T014 [US1] Ensure auth hooks use the new User type from src/types/auth.types.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Game Matchmaking & Gameplay (Priority: P1)

**Goal**: Users can find and play games using the new Matchmaking and Games namespaces.

**Independent Test**: Mock matchmaking queue and game action endpoints.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T015 [P] [US2] Create test for matchmaking hooks in src/core/hooks/useGame.test.tsx

### Implementation for User Story 2

- [ ] T016 [P] [US2] Update useLobbyListQuery hook in src/core/hooks/useGame.ts to use /v1/matchmaking/lobbies
- [ ] T017 [P] [US2] Create useJoinQueue mutation in src/core/hooks/useGame.ts using /v1/matchmaking/queue
- [ ] T018 [P] [US2] Update useGameQuery hook in src/core/hooks/useGame.ts to use /v1/games/{ulid}
- [ ] T019 [P] [US2] Update useGameAction mutation in src/core/hooks/useGame.ts to use /v1/games/{ulid}/actions
- [ ] T020 [US2] Ensure game hooks use the new Game and Lobby types from src/types/game.types.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Real-time Event Subscriptions (Priority: P2)

**Goal**: UI updates instantly via real-time event subscriptions.

**Independent Test**: Verify channel subscription names match `private-game.{ulid}` and `private-user.{username}`.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US3] Create test for realtime subscriptions in src/core/realtime/useRealtimeGame.test.tsx

### Implementation for User Story 3

- [ ] T022 [P] [US3] Update useRealtimeGame hook in src/core/realtime/useRealtimeGame.ts to subscribe to private-game.{ulid}
- [ ] T023 [P] [US3] Create useRealtimeUser hook in src/core/realtime/useRealtimeUser.ts to subscribe to private-user.{username}
- [ ] T024 [US3] Integrate useRealtimeUser hook into useAuth hook in src/core/hooks/useAuth.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Run type check to ensure no errors
- [ ] T026 [P] Run all tests to ensure everything passes
- [ ] T027 [P] Update documentation in docs/ if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Create test for auth client in src/core/hooks/useAuth.test.tsx"

# Launch all models for User Story 1 together:
Task: "Update useLogin hook in src/core/hooks/useAuth.ts to use /v1/auth/login"
Task: "Update useLogout hook in src/core/hooks/useAuth.ts to use /v1/auth/logout"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently
