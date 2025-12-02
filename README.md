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
- `useSocialLogin(apiClient, authStorage)` - Social OAuth login (Google, Discord, Steam)
- `useRegister(apiClient)` - New user registration
- `useVerifyEmail(apiClient, authStorage)` - Email verification
- `useLogout(apiClient, authStorage)` - Logout and clear tokens

### Account Management

- `useProfileQuery(apiClient)` - Fetch current user profile
- `useUpdateProfile(apiClient)` - Update user profile
- `useProgressionQuery(apiClient)` - Get levels and XP across all games
- `useRecordsQuery(apiClient)` - Get gameplay records and statistics
- `useAlertsQuery(apiClient, options)` - Get user notifications (paginated)
- `useMarkAlertsRead(apiClient)` - Mark alerts as read

### Games

- `useGameQuery(apiClient, ulid)` - Fetch game by ULID
- `useGamesQuery(apiClient)` - Fetch paginated games list
- `useGameAction(apiClient, ulid)` - Execute game action
- `useGameOptions(apiClient, ulid)` - Get available game options
- `useGameHistory(apiClient, ulid)` - Get game action history
- `useForfeitGame(apiClient, ulid)` - Forfeit a game

### Lobbies

- `useLobbiesQuery(apiClient)` - Fetch available lobbies
- `useLobbyQuery(apiClient, ulid)` - Fetch lobby by ULID
- `useCreateLobby(apiClient)` - Create new lobby
- `useJoinLobby(apiClient, ulid)` - Join a lobby
- `useUpdateLobbyPlayer(apiClient, ulid, username)` - Update player status
- `useRemoveLobbyPlayer(apiClient, ulid, username)` - Remove player from lobby
- `useDeleteLobby(apiClient, ulid)` - Delete lobby
- `useStartReadyCheck(apiClient, ulid)` - Start ready check

### Matchmaking

- `useJoinQuickplay(apiClient)` - Join quickplay queue
- `useLeaveQuickplay(apiClient)` - Leave quickplay queue
- `useAcceptQuickplay(apiClient)` - Accept quickplay match
- `useRequestRematch(apiClient, ulid)` - Request rematch
- `useAcceptRematch(apiClient, requestId)` - Accept rematch
- `useDeclineRematch(apiClient, requestId)` - Decline rematch

### Billing

- `usePlansQuery(apiClient)` - Fetch subscription plans
- `useSubscriptionStatus(apiClient)` - Get current subscription
- `useQuotas(apiClient)` - Get usage quotas
- `useSubscribe(apiClient)` - Subscribe to plan (Stripe)
- `useCustomerPortal(apiClient)` - Open Stripe customer portal
- `useVerifyAppleReceipt(apiClient)` - Verify Apple IAP receipt
- `useVerifyGoogleReceipt(apiClient)` - Verify Google Play receipt
- `useVerifyTelegramReceipt(apiClient)` - Verify Telegram Stars payment

### Real-Time

- `setupEcho(token, config)` - Setup Laravel Echo WebSocket client
- `useRealtimeGame(gameUlid, options)` - Subscribe to game events
- `useRealtimeLobby(lobbyUlid, options)` - Subscribe to lobby events

## Type Definitions

All TypeScript types are exported for your use:

```typescript
import type {
  // Auth
  User,
  AuthStorage,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  // Account
  UserProgression,
  UserTitle,
  UserBadge,
  UserAchievement,
  UserMilestone,
  UserRecords,
  GameStatistic,
  Alert,
  AlertType,
  AlertsResponse,
  MarkAlertsReadRequest,
  // API
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  // Games
  Game,
  GameState,
  GameAction,
  Lobby,
  LobbyPlayer,
  // Billing
  SubscriptionPlan,
  BillingStatus,
  UsageQuotas,
  // Real-time
  GameEvent,
  LobbyEvent,
  ConnectionStatus,
} from '@gamerprotocol/ui';
```

## Documentation

For complete documentation, examples, and API reference, visit:

- [API Documentation](https://docs.gamerprotocol.io)
- [GitHub Repository](https://github.com/gamerprotocol/ui)
- [Quickstart Guide](./docs/quickstart.md)

## Requirements

- React 19.0.0 or higher
- TypeScript 5.0 or higher (recommended)
- React Native 0.70.0 or higher (for native platforms)

## Peer Dependencies

```json
{
  "@tanstack/react-query": "^5.59.0",
  "axios": "^1.7.7",
  "laravel-echo": "^1.16.1",
  "pusher-js": "^8.4.0-rc2"
}
```
