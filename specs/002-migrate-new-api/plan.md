# Implementation Plan: Migrate to New API Structure

**Branch**: `002-migrate-new-api` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-migrate-new-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The goal is to migrate the codebase to the new v1 API structure defined in `/docs/api.md`, replacing the legacy implementation based on `/docs/old-api.md`. This involves updating the API client configuration to include the `X-Client-Key` header, refactoring TypeScript types to match the new JSON response envelopes (including pagination), and updating React Query hooks for Authentication, Matchmaking, and Games to use the new endpoints and real-time channels (`private-user.{username}`, `private-game.{ulid}`). Backwards compatibility is not required.

## Technical Context

**Language/Version**: TypeScript 5.6.3
**Primary Dependencies**: `axios`, `@tanstack/react-query`, `laravel-echo`, `pusher-js`
**Storage**: `AuthStorage` interface (platform-agnostic)
**Testing**: `vitest`
**Target Platform**: Web, React Native, Electron, Telegram Mini Apps
**Project Type**: Library / Package
**Performance Goals**: N/A
**Constraints**: Platform agnostic core logic
**Scale/Scope**: N/A

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Platform Agnosticism**: Passed. Spec enforces platform-agnostic core.
- **Type Safety**: Passed. Spec requires strict types matching API.
- **Client Customization**: N/A.
- **Zero Lock-in**: N/A.
- **Cross-Platform Code Reuse**: Passed.

## Project Structure

### Documentation (this feature)

```text
specs/002-migrate-new-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── api/             # Base client
│   ├── hooks/           # React Query hooks
│   └── realtime/        # Echo client
├── types/               # TypeScript interfaces
└── components/          # UI Components (not modified in this feature)
```

**Structure Decision**: Standard library structure as defined in Constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
