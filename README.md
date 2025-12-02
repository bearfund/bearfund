# @gamerprotocol/ui

Cross-platform TypeScript SDK for [GamerProtocol.io](https://gamerprotocol.io) API integration. Build gaming applications on Web, React Native (iOS/Android), Electron, and Telegram Mini Apps with a unified, type-safe interface.

## Features

- **Type-Safe** - Full TypeScript support with strict type checking and IntelliSense
- **Platform-Agnostic** - Works identically across Web, React Native, Electron, and Telegram
- **React Query Powered** - Automatic caching, invalidation, and refetching
- **Real-Time Ready** - Laravel Echo integration for WebSocket game events
- **Game Management** - Complete hooks for games, lobbies, matchmaking, and actions
- **Billing Integration** - Subscription management with Stripe, Apple IAP, Google Play, and Telegram
- **Authentication** - Email, social login, and token management
- **Zero Lock-in** - Direct API client access for custom implementations

## Installation

```bash
npm install @gamerprotocol/ui @tanstack/react-query axios
# or
yarn add @gamerprotocol/ui @tanstack/react-query axios
# or
pnpm add @gamerprotocol/ui @tanstack/react-query axios
```

### React Native

```bash
npm install @gamerprotocol/ui @tanstack/react-query axios laravel-echo pusher-js
```

## Quick Start

### 1. Setup API Client

```typescript
import { setupAPIClient, type AuthStorage } from '@gamerprotocol/ui';

// Web/Electron - localStorage
const authStorage: AuthStorage = {
  getToken: async () => localStorage.getItem('auth_token'),
  setToken: async (token) => localStorage.setItem('auth_token', token),
  clearToken: async () => localStorage.removeItem('auth_token'),
};

// React Native - AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const authStorage: AuthStorage = {
  getToken: async () => await AsyncStorage.getItem('auth_token'),
  setToken: async (token) => await AsyncStorage.setItem('auth_token', token),
  clearToken: async () => await AsyncStorage.removeItem('auth_token'),
};

const apiClient = setupAPIClient({
  clientKey: process.env.GAMERPROTOCOL_CLIENT_KEY!,
  authStorage,
});
```

### 2. Setup React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### 3. Use Authentication Hooks

```typescript
import { useLogin, useUserQuery } from '@gamerprotocol/ui';

function LoginForm() {
  const loginMutation = useLogin(apiClient, authStorage);

  const handleLogin = async () => {
    await loginMutation.mutateAsync({
      email: 'player@example.com',
      password: 'securepassword',
    });
  };

  return (
    <button onClick={handleLogin} disabled={loginMutation.isPending}>
      {loginMutation.isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}

function UserProfile() {
  const { data: user, isLoading } = useProfileQuery(apiClient);

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {user?.username}!</div>;
}
```

### 4. Use Game Hooks

```typescript
import { useGameQuery, useGameAction } from '@gamerprotocol/ui';

function GameBoard({ gameUlid }: { gameUlid: string }) {
  const { data: game } = useGameQuery(apiClient, gameUlid);
  const gameActionMutation = useGameAction(apiClient, gameUlid);

  const makeMove = async (position: number) => {
    await gameActionMutation.mutateAsync({ position });
  };

  return (
    <div>
      <h2>{game?.game_title}</h2>
      <div>State: {game?.state}</div>
      {/* Your game board UI */}
    </div>
  );
}
```

### 5. Setup Real-Time Updates (Optional)

```typescript
import { setupEcho, useRealtimeGame } from '@gamerprotocol/ui';

function RealtimeGame({ gameUlid }: { gameUlid: string }) {
  const token = await authStorage.getToken();
  const echo = setupEcho(token!);

  const { isConnected, error } = useRealtimeGame(gameUlid, { echo });

  return (
    <div>
      {!isConnected && <div>Connecting to game...</div>}
      {error && <div>Connection error: {error}</div>}
      <GameBoard gameUlid={gameUlid} />
    </div>
  );
}
```

## Platform-Specific Examples

### Web / Electron

```typescript
import { setupAPIClient } from '@gamerprotocol/ui';

const authStorage = {
  getToken: async () => localStorage.getItem('auth_token'),
  setToken: async (token) => localStorage.setItem('auth_token', token),
  clearToken: async () => localStorage.removeItem('auth_token'),
};

const apiClient = setupAPIClient({
  clientKey: process.env.GAMERPROTOCOL_CLIENT_KEY!,
  authStorage,
});
```

### React Native (iOS/Android)

```typescript
import { setupAPIClient } from '@gamerprotocol/ui/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authStorage = {
  getToken: async () => await AsyncStorage.getItem('auth_token'),
  setToken: async (token) => await AsyncStorage.setItem('auth_token', token),
  clearToken: async () => await AsyncStorage.removeItem('auth_token'),
};

const apiClient = setupAPIClient({
  clientKey: process.env.GAMERPROTOCOL_CLIENT_KEY!,
  authStorage,
});
```

### Telegram Mini Apps

```typescript
import { setupAPIClient } from '@gamerprotocol/ui';

// Telegram's cloud storage
const authStorage = {
  getToken: async () => {
    return new Promise((resolve) => {
      Telegram.WebApp.CloudStorage.getItem('auth_token', (error, value) => {
        resolve(error ? null : value);
      });
    });
  },
  setToken: async (token) => {
    return new Promise<void>((resolve) => {
      Telegram.WebApp.CloudStorage.setItem('auth_token', token, () => resolve());
    });
  },
  clearToken: async () => {
    return new Promise<void>((resolve) => {
      Telegram.WebApp.CloudStorage.removeItem('auth_token', () => resolve());
    });
  },
};

const apiClient = setupAPIClient({
  clientKey: process.env.GAMERPROTOCOL_CLIENT_KEY!,
  authStorage,
});
```

## Available Hooks

### Authentication

- `useLogin(apiClient, authStorage)` - Email/password login
- `useSocialLogin(apiClient, authStorage)` - Social OAuth login (Google, Apple, Telegram)
- `useRegister(apiClient)` - New user registration
- `useVerifyEmail(apiClient, authStorage)` - Email verification
- `useRefreshToken(apiClient, authStorage)` - Refresh authentication token
- `useLogout(apiClient, authStorage)` - Logout and clear tokens

### Account Management

- `useProfileQuery(apiClient)` - Fetch current user profile
- `useUpdateProfile(apiClient)` - Update user profile (name, username, bio, social links)
- `useProgressionQuery(apiClient)` - Get levels, XP, titles, badges, and achievements
- `useRecordsQuery(apiClient)` - Get gameplay records and statistics
- `useAlertsQuery(apiClient, options)` - Get user notifications (paginated)
- `useMarkAlertsRead(apiClient)` - Mark alerts as read

### System & Library

- `useHealthQuery(apiClient, options)` - Check API health, version, and database status
- `useTimeQuery(apiClient, options)` - Get authoritative server time for synchronization
- `useConfigQuery(apiClient, options)` - Fetch platform configuration and supported games
- `useSubmitFeedback(apiClient)` - Submit bug reports or feature requests
- `useLibraryQuery(apiClient, options)` - Get game catalog with titles and metadata
- `useGameTitleQuery(apiClient, gameTitle, options)` - Get detailed game information
- `useGameRulesQuery(apiClient, gameTitle, options)` - Get complete game rules documentation
- `useGameEntitiesQuery(apiClient, gameTitle, options)` - Get game entities (cards, pieces, etc.)

### Games

- `useGameQuery(apiClient, ulid, options)` - Fetch game state by ULID
- `useGamesQuery(apiClient, options)` - List user's active and recent games (paginated)
- `useGameAction(apiClient, ulid)` - Submit game action (move, turn) with idempotency
- `useGameActionsQuery(apiClient, ulid, options)` - Get complete action/move history
- `useGameOptions(apiClient, ulid, options)` - Get valid actions for current turn
- `useGameOutcome(apiClient, ulid, options)` - Get game outcome and results
- `useConcedeGame(apiClient, ulid)` - Concede game
- `useAbandonGame(apiClient, ulid)` - Abandon game (higher penalty)
- `useForfeitGame(apiClient, ulid)` - Alias for `useConcedeGame` (deprecated)

### Matchmaking

#### Queue

- `useJoinQueue(apiClient)` - Join matchmaking queue
- `useLeaveQueue(apiClient, queueSlotUlid)` - Leave queue

#### Lobbies

- `useLobbiesQuery(apiClient, options)` - List public lobbies with filtering
- `useLobbyQuery(apiClient, ulid, options)` - Get lobby details
- `useCreateLobby(apiClient)` - Create new lobby
- `useDeleteLobby(apiClient, ulid)` - Cancel lobby (host only)
- `useStartReadyCheck(apiClient, ulid)` - Initiate ready check (host only)
- `useSeatPlayers(apiClient, ulid)` - Assign player positions (host only)
- `useInvitePlayers(apiClient, ulid)` - Invite players to lobby (host only)
- `useJoinLobby(apiClient, ulid, username)` - Accept/join lobby
- `useRemoveLobbyPlayer(apiClient, ulid, username)` - Kick player (host only)

#### Proposals (Challenges & Rematches)

- `useCreateProposal(apiClient)` - Create rematch or challenge
- `useAcceptProposal(apiClient, proposalUlid)` - Accept proposal
- `useDeclineProposal(apiClient, proposalUlid)` - Decline proposal

### Economy

- `useBalanceQuery(apiClient, options)` - Get user's token/chip balance for current client
- `useTransactionsQuery(apiClient, options)` - Get transaction history (virtual + real payments)
- `useCashier(apiClient)` - Add/remove tokens or chips (approved clients only)
- `usePlansQuery(apiClient)` - List subscription plans
- `useSubscriptionQuery(apiClient, options)` - Get current subscription status
- `useSubscribe(apiClient)` - Start subscription
- `useCancelSubscription(apiClient)` - Cancel subscription
- `useVerifyAppleReceipt(apiClient)` - Verify Apple In-App Purchase receipt
- `useVerifyGoogleReceipt(apiClient)` - Verify Google Play receipt
- `useVerifyTelegramReceipt(apiClient)` - Verify Telegram Stars payment

### Data Feeds

- `useLeaderboardQuery(apiClient, gameTitle, options)` - Get game leaderboard with rankings

### Competitions (Tournaments)

- `useCompetitionsQuery(apiClient, options)` - List active tournaments (paginated)
- `useTournamentQuery(apiClient, tournamentId, options)` - Get tournament details
- `useEnterTournament(apiClient)` - Register for tournament
- `useTournamentStructureQuery(apiClient, tournamentId, options)` - Get tournament format rules
- `useTournamentBracketQuery(apiClient, tournamentId, options)` - Get tournament bracket
- `useTournamentStandingsQuery(apiClient, tournamentId, options)` - Get current standings

### Real-Time

- `setupEcho(token, config)` - Setup Laravel Echo WebSocket client
- `useRealtimeGame(gameUlid, options)` - Subscribe to game events (ActionProcessed, GameCompleted)
- `useRealtimeLobby(lobbyUlid, options)` - Subscribe to lobby events (PlayerJoined, ReadyCheck)

## Type Definitions

All TypeScript types are exported for your use:

```typescript
import type {
  // Authentication
  AuthStorage,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyRequest,
  SocialLoginRequest,

  // Account Management
  UpdateProfileRequest,
  UserTitle,
  UserBadge,
  UserAchievement,
  UserMilestone,
  UserProgression,
  GameStatistic,
  UserRecords,
  Alert,
  AlertType,
  AlertsResponse,
  MarkAlertsReadRequest,

  // System & Library
  SystemHealth,
  SystemTime,
  SystemConfig,
  FeedbackType,
  SubmitFeedbackRequest,
  FeedbackResponse,
  GameTitle,
  GameLibraryResponse,
  GameRules,
  GameEntities,

  // API Response Wrappers
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  PaginationLinks,
  ErrorResponse,

  // Games
  Game,
  GameListItem,
  GamePlayer,
  GameAction,
  GameActionResponse,
  GameOptions,
  GameOutcome,
  SubmitActionRequest,

  // Matchmaking
  QueueSlot,
  JoinQueueRequest,
  QueueSlotResponse,
  Lobby,
  LobbyPlayerDetailed,
  LobbyHost,
  CreateLobbyRequest,
  JoinLobbyRequest,
  SeatPlayersRequest,
  InvitePlayersRequest,
  Proposal,
  CreateRematchRequest,
  CreateChallengeRequest,
  CreateProposalRequest,
  ProposalResponse,
  AcceptProposalResponse,
  DeclineProposalResponse,

  // Economy
  CurrencyBalance,
  UserBalance,
  TransactionType,
  CurrencyType,
  PaymentProvider,
  Transaction,
  CashierRequest,
  CashierResponse,
  SubscriptionPlan,
  UserSubscription,
  SubscribeRequest,
  VerifyReceiptRequest,
  VerifyReceiptResponse,

  // Data Feeds
  LeaderboardEntry,
  Leaderboard,
  LeaderboardResponse,

  // Competitions (Tournaments)
  TournamentFormat,
  TournamentStatus,
  TournamentCurrency,
  Tournament,
  TournamentEntry,
  TournamentStructure,
  BracketMatch,
  BracketRound,
  TournamentBracket,
  TournamentStanding,
  TournamentStandings,
  TournamentsResponse,
  TournamentResponse,
  TournamentEntryResponse,
  TournamentStructureResponse,
  TournamentBracketResponse,
  TournamentStandingsResponse,

  // Real-Time Events
  RealtimeEventType,
  BaseEvent,
  GameCreatedPayload,
  GameUpdatedPayload,
  GameActionPayload,
  GameCompletedPayload,
  LobbyCreatedPayload,
  LobbyUpdatedPayload,
  LobbyPlayerJoinedPayload,
  LobbyPlayerLeftPayload,
  LobbyGameStartedPayload,
  UserProfileUpdatedPayload,
  NotificationPayload,
  GameCreatedEvent,
  GameUpdatedEvent,
  GameActionEvent,
  GameCompletedEvent,
  LobbyCreatedEvent,
  LobbyUpdatedEvent,
  LobbyPlayerJoinedEvent,
  LobbyPlayerLeftEvent,
  LobbyGameStartedEvent,
  UserProfileUpdatedEvent,
  NotificationEvent,
  RealtimeEvent,
  ChannelOptions,
} from '@gamerprotocol/ui';
```

## Documentation

For complete documentation, examples, and API reference, visit:

- [API Documentation](https://docs.gamerprotocol.io)
- [GitHub Repository](https://github.com/gamerprotocol/ui)
- [Quickstart Guide](./docs/quickstart.md)

## Requirements

- **React**: 19.0.0 or higher
- **TypeScript**: 5.9 or higher (recommended)
- **React Native**: 0.70.0 or higher (optional, for native platforms)

## Dependencies

The package includes these dependencies:

```json
{
  "@tanstack/react-query": "^5.90.11",
  "axios": "^1.13.2",
  "laravel-echo": "^2.2.6",
  "pusher-js": "^8.4.0-rc2"
}
```
