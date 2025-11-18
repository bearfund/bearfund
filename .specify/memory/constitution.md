<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0
Change Type: MINOR (Initial constitution creation)

Modified Principles: N/A (Initial creation)
Added Sections:
  - Platform Agnosticism
  - Type Safety & Contracts
  - Client Customization
  - Zero Lock-in Architecture
  - Cross-Platform Code Reuse

Templates Status:
  ⚠ .specify/templates/plan-template.md - Review needed for alignment
  ⚠ .specify/templates/spec-template.md - Review needed for alignment
  ⚠ .specify/templates/tasks-template.md - Review needed for alignment

Follow-up TODOs: None
-->

# @gamerprotocol/ui Package Constitution

## Core Principles

### I. Platform Agnosticism

All core logic (API, state management, real-time) MUST be 100% platform-independent.
UI components MUST separate rendering from logic using the `.tsx` (base), `.web.tsx` 
(web/electron), and `.native.tsx` (React Native) pattern. Platform-specific code MUST 
NOT exist in shared modules (`src/core`, `src/types`).

**Rationale**: This package serves 4 distinct platforms (Web, React Native, Electron, 
Telegram Mini Apps). Maximizing code reuse (target: 80%+ for logic layer) reduces 
maintenance burden and ensures consistent behavior across all platforms.

### II. Type Safety & Contracts

Strict TypeScript MUST be enforced with no implicit `any` types. All API contracts MUST 
be defined as interfaces in `src/types/`. Every exported function MUST have explicit 
return types. Platform-agnostic contracts (e.g., `AuthStorage`) MUST be defined as 
interfaces allowing custom client implementations.

**Rationale**: Type safety prevents runtime errors across 4 platforms and ensures API 
contract compliance. Abstract interfaces enable platform-specific implementations while 
maintaining type safety.

### III. Client Customization

Components MUST support theming via Tailwind semantic tokens (not hardcoded colors). 
Headless alternatives MUST be provided for maximum flexibility. All components MUST 
support slot props for custom UI injection. Root elements MUST accept and spread 
`className` (web) or `style` (native) props for client overrides.

**Rationale**: This is a shared package consumed by multiple clients with different 
branding needs. Clients must be able to customize appearance without forking the package.

### IV. Zero Lock-in Architecture

Headless hooks MUST be usable independently of styled components. Clients MUST be able 
to bypass all UI and use only the data/logic layer. React Query hooks MUST be exported 
separately from components. The package MUST NOT enforce any specific UI framework 
beyond React.

**Rationale**: Different clients have different UI needs. Some may use the full 
component library, others only the API hooks. The package must serve both use cases.

### V. Cross-Platform Code Reuse

The API layer, React Query hooks, type definitions, and business logic MUST achieve 
100% code reuse across all platforms. UI components MUST achieve minimum 50% code reuse 
via shared base components and platform-specific renderers. Platform detection MUST 
happen at the component level, not in shared logic.

**Rationale**: Minimizing platform-specific code reduces bugs and maintenance. Each 
platform-specific line of code is a potential source of divergence.

## Architecture Requirements

### Directory Structure

The following structure MUST be maintained:

```
/src
├── /types              # 100% platform-agnostic TypeScript contracts
├── /core
│   ├── /api           # Platform-agnostic Axios client & config
│   ├── /hooks         # Platform-agnostic React Query hooks
│   └── /realtime      # Platform-agnostic WebSocket (Laravel Echo)
├── /components
│   ├── /Provider      # Package initialization
│   ├── /primitives    # Base UI with .tsx/.web.tsx/.native.tsx
│   ├── /lobby         # Lobby components
│   ├── /game          # Game components
│   └── /user          # User components
├── index.ts            # Web/Electron exports
└── native.ts           # React Native exports
```

### Technology Stack

**Required Dependencies**:
- `@tanstack/react-query` - State management and caching
- `axios` - HTTP client
- `laravel-echo` - WebSocket client
- `pusher-js` - WebSocket transport

**Peer Dependencies**:
- `react` (^18.0.0) - Required
- `react-native` (>=0.70.0) - Optional

**Build Tools**:
- TypeScript (^5.6.0)
- tsup (dual CJS/ESM output)
- ESLint & Prettier

### API Client Requirements

The base API client (`src/core/api/base-client.ts`) MUST:
1. Accept `clientKey`, `authStorage`, and optional `baseURL` configuration
2. Inject `X-Client-Key` header on ALL requests
3. Inject `Authorization: Bearer [token]` using async `authStorage.getToken()`
4. Catch 401 errors, call `authStorage.clearToken()`, and clear React Query cache
5. Transform all errors to `ErrorResponse` type

### React Query Hook Standards

All hooks MUST follow these rules:
1. Use hierarchical query keys: `['user']`, `['game', ulid]`, `['lobbies']`
2. Invalidate related queries on mutation success
3. Return typed `ErrorResponse` on errors
4. Disable `refetchInterval` for real-time-updated resources
5. Call `authStorage.setToken()` after login/verification
6. Call `authStorage.clearToken()` and `queryClient.clear()` on logout

### Component Pattern Requirements

All UI components MUST follow the Hybrid Pattern:
1. **Base File** (`.tsx`): Props interface, shared logic, NO rendering
2. **Web File** (`.web.tsx`): HTML elements, Tailwind classes, className spreading
3. **Native File** (`.native.tsx`): RN primitives, StyleSheet, style spreading

Headless components MUST:
1. Export the hook separately (e.g., `useLobbyList()`)
2. Accept `children` render prop with data/loading state
3. Render NO UI themselves

## Development Standards

### Code Quality

TypeScript strict mode MUST be enabled. No unused variables or parameters. No implicit 
returns. Line length SHOULD NOT exceed 100 characters. Single quotes, semicolons, and 
ES5 trailing commas MUST be used (enforced via Prettier).

### Documentation

All exported functions MUST have JSDoc comments. Complex types MUST include usage 
examples. The README MUST document platform-specific setup for all 4 target platforms.

### Testing

All React Query hooks MUST have unit tests. All API client functionality MUST be 
tested with mocked Axios. Integration tests MUST verify the auth flow and real-time 
event handling.

### Versioning

Semantic versioning (semver) MUST be followed:
- MAJOR: Breaking API changes, removed exports, incompatible upgrades
- MINOR: New features, new exports, backward-compatible additions
- PATCH: Bug fixes, documentation, refactoring

## Governance

This constitution supersedes all other development practices. All code reviews MUST 
verify compliance with these principles. Amendments to this constitution require:
1. Documentation of the rationale
2. Impact assessment on existing code
3. Migration plan if breaking changes required

Complexity MUST be justified. Features MUST align with at least one core principle.
When principles conflict, prioritize in this order: Type Safety, Platform Agnosticism,
Zero Lock-in, Client Customization, Code Reuse.

All pull requests MUST pass TypeScript strict checks, ESLint, and tests before merge.

**Version**: 1.0.0 | **Ratified**: 2025-11-18 | **Last Amended**: 2025-11-18
