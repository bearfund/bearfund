# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2024-01-XX

### Added

#### Core Infrastructure

- **API Client** (`setupAPIClient`): Platform-agnostic Axios-based HTTP client with automatic authentication
  - X-Client-Key header injection for interface identification
  - Bearer token authentication with automatic header injection
  - 401 error handling with automatic token clearing and cache invalidation
  - Debounced multiple concurrent 401 responses (100ms window)
  - Platform-agnostic through `AuthStorage` interface abstraction
  - TypeScript strict mode with full type safety

#### Authentication System (8 hooks)

- `useLogin`: Email/password authentication with automatic token storage
- `useSocialLogin`: OAuth social login (Google, Discord, Steam)
- `useRegister`: New user registration
- `useVerifyEmail`: Email verification with magic links
- `useLogout`: Logout with token clearing and cache invalidation
- `useUserQuery`: Fetch current authenticated user profile
- `useUpdateProfile`: Update user profile (username, avatar, bio, social links)
- `useForgotPassword`: Password reset request

#### Game Management (20+ hooks)

- **Game Queries**:
  - `useGameQuery`: Fetch single game by ULID with automatic caching
  - `useGamesQuery`: Paginated games list with filtering (status, game_title, opponent)
  - `useGameOptions`: Get available actions for current game state
  - `useGameHistory`: Get game action/move history
- **Game Mutations**:
  - `useGameAction`: Execute game action with automatic cache invalidation
  - `useForfeitGame`: Forfeit active game
- **Lobby Management**:
  - `useLobbiesQuery`: List available lobbies with filtering
  - `useLobbyQuery`: Fetch single lobby details
  - `useCreateLobby`: Create new game lobby
  - `useJoinLobby`: Join existing lobby
  - `useUpdateLobbyPlayer`: Update player status in lobby
  - `useRemoveLobbyPlayer`: Remove player from lobby
  - `useDeleteLobby`: Delete lobby
  - `useStartReadyCheck`: Initiate ready check for lobby
- **Matchmaking**:
  - `useJoinQuickplay`: Join quickplay matchmaking queue
  - `useLeaveQuickplay`: Leave quickplay queue
  - `useAcceptQuickplay`: Accept matched game
  - `useRequestRematch`: Request rematch after game ends
  - `useAcceptRematch`: Accept rematch request
  - `useDeclineRematch`: Decline rematch request

#### Billing & Subscriptions (8 hooks)

- **Queries**:
  - `usePlansQuery`: Fetch available subscription plans
  - `useBillingStatusQuery`: Get current subscription status
  - `useQuotas`: Get usage quotas (games played, concurrent games, etc.)
- **Stripe Integration**:
  - `useSubscribe`: Subscribe to plan via Stripe
  - `useCustomerPortal`: Open Stripe customer portal
- **Mobile IAP Verification**:
  - `useVerifyAppleReceipt`: Verify Apple In-App Purchase receipt
  - `useVerifyGoogleReceipt`: Verify Google Play receipt
  - `useVerifyTelegramReceipt`: Verify Telegram Stars payment

#### Real-Time WebSocket Integration

- **Echo Client** (`setupEcho`): Laravel Echo configuration for Pusher/Reverb
  - Automatic host detection (web: window.location.hostname, native: config.host)
  - Forced TLS for production domains (non-localhost)
  - Platform-specific Pusher library injection (web vs native)
  - Bearer token authentication for private channels
- **Game Events** (`useRealtimeGame`):
  - Subscribe to `private-game.{ulid}` channel
  - Auto-invalidate game cache on events: `GameAction`, `GameForfeited`, `GameEnded`
  - Connection state tracking (connected/disconnected)
  - Automatic cleanup on unmount
- **Lobby Events** (`useRealtimeLobby`):
  - Subscribe to `private-lobby.{ulid}` channel
  - Auto-invalidate on: `PlayerJoined`, `PlayerLeft`, `PlayerStatusChanged`, `ReadyCheckStarted`, `ReadyCheckCompleted`, `LobbyDeleted`
  - Lobby + lobbies list cache invalidation strategy
  - Connection state and error tracking

#### Type System

- **100+ TypeScript interfaces** for complete type safety:
  - Authentication: `User`, `LoginRequest`, `RegisterRequest`, `AuthResponse`, `SocialProvider`
  - Games: `Game`, `GameState`, `GameAction`, `GameOption`, `GameFilters`
  - Lobbies: `Lobby`, `LobbyPlayer`, `LobbyFilters`, `ReadyCheck`
  - Billing: `SubscriptionPlan`, `BillingStatus`, `UsageQuotas`, `SubscriptionLevel`
  - API: `ApiResponse<T>`, `PaginatedResponse<T>`, `ErrorResponse`, `AuthStorage`
  - Real-time: `EchoConfig`, `ConnectionStatus`, `RealtimeOptions`
- **Strict TypeScript** configuration with zero compilation errors

#### Platform Support

- **Web** (React 19+): localStorage for tokens
- **React Native** (iOS/Android): AsyncStorage/SecureStore support via `/native` import
- **Electron**: electron-store compatibility
- **Telegram Mini Apps**: CloudStorage integration examples

#### Developer Experience

- **JSDoc Coverage**: All exported functions include comprehensive documentation with examples
- **Dual Module Support**: CJS and ESM builds with proper package.json exports
- **Tree-shakeable**: ES modules allow dead code elimination
- **Source Maps**: Generated for all builds for easier debugging
- **TypeScript Definitions**: `.d.ts` and `.d.mts` files for both module formats

### Changed

- **React 19 Support**: Upgraded from React 18 to React 19.2.0
- **React Native 0.82**: Updated React Native support to 0.82.1
- **Laravel Echo**: Updated to 1.19.0 (from 1.16.1)
- **Pusher JS**: Updated to 8.4.0-rc2

### Testing

- **74 tests** with 100% pass rate
- **Test Coverage**: 39% statements, 85% branches, 17% functions
- **Test Suites**:
  - API Client: 21 tests (401 handling, debouncing, token injection, error transformation)
  - Echo Client: 19 tests (configuration, platform detection, Pusher integration)
  - Realtime Game Hook: 18 tests (subscription, events, cache invalidation, cleanup)
  - Realtime Lobby Hook: 16 tests (subscription, events, cache invalidation, cleanup)
- **Vitest + jsdom**: Modern testing setup with React Testing Library

### Documentation

- **README.md**: Comprehensive guide with installation and usage examples for all platforms
- **Quickstart Guide**: Platform-specific setup instructions (Web, React Native, Electron, Telegram)
- **API Documentation**: Complete hook reference with TypeScript examples
- **Type Exports**: All types exported for consumer use

### Infrastructure

- **Build System**: tsup for fast dual CJS/ESM builds (~1.7s total)
- **Linting**: ESLint with TypeScript rules, zero errors
- **Formatting**: Prettier with consistent code style
- **CI Scripts**: `npm run check` validates types, lint, format, and tests

## [0.1.0] - 2024-01-XX

### Added

- Initial project setup
- Package configuration and tooling
- Project structure and workspace configuration

[Unreleased]: https://github.com/gamerprotocol/ui/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/gamerprotocol/ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/gamerprotocol/ui/releases/tag/v0.1.0
