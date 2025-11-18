# Quickstart Guide: API Core Integration

**Feature**: 001-api-core-integration  
**Package**: @gamerprotocol/ui  
**Version**: 0.2.0 (planned)

This guide helps you integrate the GamerProtocol API core layer into your application across all supported platforms.

---

## Installation

```bash
npm install @gamerprotocol/ui
# or
yarn add @gamerprotocol/ui
# or
pnpm add @gamerprotocol/ui
```

### Peer Dependencies

The package requires React and React Query as peer dependencies:

```bash
npm install react@^18.0.0 @tanstack/react-query@^5.59.0
```

---

## Platform Setup

### 1. Web (React)

**Step 1**: Install dependencies

```bash
npm install @gamerprotocol/ui axios laravel-echo pusher-js
```

**Step 2**: Create AuthStorage implementation (localStorage)

```typescript
// src/lib/auth-storage.ts
import type { AuthStorage } from '@gamerprotocol/ui';

export const webAuthStorage: AuthStorage = {
  getToken: async () => localStorage.getItem('auth_token'),
  setToken: async (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  clearToken: async () => {
    localStorage.removeItem('auth_token');
  },
};
```

**Step 3**: Setup API client and React Query

```typescript
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupAPIClient } from '@gamerprotocol/ui';
import { webAuthStorage } from './lib/auth-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Setup API client
setupAPIClient({
  baseURL: 'https://api.gamerprotocol.io/v1',
  clientKey: process.env.REACT_APP_CLIENT_KEY!,
  authStorage: webAuthStorage,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

**Step 4**: Use authentication hooks

```typescript
// src/components/LoginForm.tsx
import { useLogin } from '@gamerprotocol/ui';

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

**Step 5**: Setup WebSocket (optional, for real-time features)

```typescript
// src/lib/echo-client.ts
import { setupEcho } from '@gamerprotocol/ui';
import { webAuthStorage } from './auth-storage';

export async function initializeEcho() {
  const token = await webAuthStorage.getToken();
  
  if (!token) {
    throw new Error('No auth token available');
  }

  return setupEcho(token, {
    host: 'api.gamerprotocol.io',
    authEndpoint: 'https://api.gamerprotocol.io/broadcasting/auth',
  });
}
```

---

### 2. React Native (iOS/Android)

**Step 1**: Install dependencies

```bash
npm install @gamerprotocol/ui axios laravel-echo pusher-js expo-secure-store
# Note: Use @gamerprotocol/ui/native import path
```

**Step 2**: Create AuthStorage implementation (SecureStore)

```typescript
// src/lib/auth-storage.native.ts
import * as SecureStore from 'expo-secure-store';
import type { AuthStorage } from '@gamerprotocol/ui/native';

export const nativeAuthStorage: AuthStorage = {
  getToken: async () => {
    return await SecureStore.getItemAsync('auth_token');
  },
  setToken: async (token: string) => {
    await SecureStore.setItemAsync('auth_token', token);
  },
  clearToken: async () => {
    await SecureStore.deleteItemAsync('auth_token');
  },
};
```

**Step 3**: Setup API client

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupAPIClient } from '@gamerprotocol/ui/native';
import { nativeAuthStorage } from './src/lib/auth-storage.native';

const queryClient = new QueryClient();

// Setup API client
setupAPIClient({
  baseURL: 'https://api.gamerprotocol.io/v1',
  clientKey: process.env.EXPO_PUBLIC_CLIENT_KEY!,
  authStorage: nativeAuthStorage,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

**Step 4**: Use hooks (same API as web)

```typescript
// src/screens/LoginScreen.tsx
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useLogin } from '@gamerprotocol/ui/native';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();

  const handleLogin = () => {
    login({ email, password });
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} disabled={isPending} />
      {error && <Text>{error.message}</Text>}
    </View>
  );
}
```

---

### 3. Electron (Desktop)

**Step 1**: Install dependencies (same as Web)

```bash
npm install @gamerprotocol/ui axios laravel-echo pusher-js
```

**Step 2**: Use electron-store for secure storage

```bash
npm install electron-store
```

```typescript
// src/lib/auth-storage.electron.ts
import Store from 'electron-store';
import type { AuthStorage } from '@gamerprotocol/ui';

const store = new Store({ encryptionKey: 'your-encryption-key' });

export const electronAuthStorage: AuthStorage = {
  getToken: async () => store.get('auth_token') as string | null,
  setToken: async (token: string) => {
    store.set('auth_token', token);
  },
  clearToken: async () => {
    store.delete('auth_token');
  },
};
```

**Step 3**: Setup (same as Web, use electronAuthStorage)

```typescript
import { setupAPIClient } from '@gamerprotocol/ui';
import { electronAuthStorage } from './lib/auth-storage.electron';

setupAPIClient({
  baseURL: 'https://api.gamerprotocol.io/v1',
  clientKey: process.env.CLIENT_KEY!,
  authStorage: electronAuthStorage,
});
```

---

### 4. Telegram Mini Apps

**Step 1**: Install dependencies (same as Web)

```bash
npm install @gamerprotocol/ui axios laravel-echo pusher-js
```

**Step 2**: Use Telegram CloudStorage for auth

```typescript
// src/lib/auth-storage.telegram.ts
import type { AuthStorage } from '@gamerprotocol/ui';

// Telegram WebApp API
const WebApp = (window as any).Telegram?.WebApp;

export const telegramAuthStorage: AuthStorage = {
  getToken: async () => {
    return new Promise((resolve) => {
      WebApp.CloudStorage.getItem('auth_token', (error: any, value: string) => {
        if (error) {
          console.error('CloudStorage error:', error);
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
  },
  
  setToken: async (token: string) => {
    return new Promise((resolve, reject) => {
      WebApp.CloudStorage.setItem('auth_token', token, (error: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  },
  
  clearToken: async () => {
    return new Promise((resolve, reject) => {
      WebApp.CloudStorage.removeItem('auth_token', (error: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  },
};
```

**Step 3**: Setup (same as Web)

```typescript
import { setupAPIClient } from '@gamerprotocol/ui';
import { telegramAuthStorage } from './lib/auth-storage.telegram';

setupAPIClient({
  baseURL: 'https://api.gamerprotocol.io/v1',
  clientKey: process.env.CLIENT_KEY!,
  authStorage: telegramAuthStorage,
});
```

---

## Common Usage Examples

### Authentication Flow

```typescript
import { useLogin, useLogout, useAuthUser } from '@gamerprotocol/ui';

function AuthExample() {
  const { mutate: login } = useLogin();
  const { mutate: logout } = useLogout();
  const { data: user, isLoading } = useAuthUser();

  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    return <button onClick={() => login({ email: '...', password: '...' })}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Game Management

```typescript
import { useGames, useGame, useGameAction } from '@gamerprotocol/ui';

function GamesList() {
  const { data, isLoading } = useGames({ status: 'active' });

  if (isLoading) return <div>Loading games...</div>;

  return (
    <ul>
      {data?.data.map((game) => (
        <li key={game.ulid}>{game.game_title} - {game.state}</li>
      ))}
    </ul>
  );
}

function GameBoard({ gameUlid }: { gameUlid: string }) {
  const { data: game } = useGame(gameUlid);
  const { mutate: executeAction } = useGameAction(gameUlid);

  const handleMove = (column: number) => {
    executeAction({
      action: 'drop_piece',
      parameters: { column },
    });
  };

  return (
    <div>
      <h1>Game: {game?.data.game_title}</h1>
      {/* Render game board */}
      <button onClick={() => handleMove(0)}>Drop in column 0</button>
    </div>
  );
}
```

### Real-time Updates

```typescript
import { useRealtimeGame } from '@gamerprotocol/ui';

function GameWithRealtime({ gameUlid }: { gameUlid: string }) {
  const { data: game } = useGame(gameUlid);
  const { isConnected } = useRealtimeGame(gameUlid, { enabled: true });

  return (
    <div>
      <div>Connection: {isConnected ? '🟢 Live' : '🔴 Offline'}</div>
      {/* Game renders automatically update when WebSocket events invalidate cache */}
      <pre>{JSON.stringify(game?.data.game_state, null, 2)}</pre>
    </div>
  );
}
```

### Lobby Management

```typescript
import { useLobbies, useCreateLobby, useJoinLobby } from '@gamerprotocol/ui';

function LobbyBrowser() {
  const { data: lobbies } = useLobbies({ game_title: 'validate-four' });
  const { mutate: createLobby } = useCreateLobby();
  const { mutate: joinLobby } = useJoinLobby();

  return (
    <div>
      <button onClick={() => createLobby({ game_title: 'validate-four' })}>
        Create Lobby
      </button>
      
      <ul>
        {lobbies?.data.map((lobby) => (
          <li key={lobby.ulid}>
            {lobby.game_title} - {lobby.players.length}/{lobby.max_players}
            <button onClick={() => joinLobby(lobby.ulid)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Billing & Subscriptions

```typescript
import { useBillingStatus, useSubscriptionPlans, useSubscribe } from '@gamerprotocol/ui';

function SubscriptionManager() {
  const { data: status } = useBillingStatus();
  const { data: plans } = useSubscriptionPlans();
  const { mutate: subscribe } = useSubscribe();

  return (
    <div>
      <p>Current Plan: {status?.data.plan_level}</p>
      
      <h2>Available Plans</h2>
      {plans?.data.map((plan) => (
        <div key={plan.id}>
          <h3>{plan.name} - ${plan.price_cents / 100}/month</h3>
          <button onClick={() => subscribe({ plan_id: plan.id })}>
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing

### Setup MSW for API Mocking

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('https://api.gamerprotocol.io/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-token',
        user: {
          username: 'testuser',
          name: 'Test User',
          avatar: null,
          bio: null,
          social_links: null,
        },
      })
    );
  }),
];
```

### Test Component with React Query

```typescript
// src/components/__tests__/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test('login form submits successfully', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  );

  // Test implementation
});
```

---

## Troubleshooting

### Common Issues

**Issue**: "No auth token available" error  
**Solution**: Ensure `authStorage.getToken()` returns valid token before using authenticated hooks

**Issue**: CORS errors in development  
**Solution**: Add proxy in `package.json` or use proper CORS headers on API server

**Issue**: WebSocket connection fails  
**Solution**: Check firewall, ensure WSS (not WS) in production, verify auth token is valid

**Issue**: Type errors with `any`  
**Solution**: Enable `strict: true` in `tsconfig.json`, all types are exported from package

---

## Next Steps

1. Explore type definitions: `import type { Game, User, Lobby } from '@gamerprotocol/ui'`
2. Read API documentation: `docs/api-endpoints.md`
3. Review data model: `specs/001-api-core-integration/data-model.md`
4. Check OpenAPI contracts: `specs/001-api-core-integration/contracts/*.yaml`

---

## Support

- **Documentation**: https://docs.gamerprotocol.io
- **GitHub Issues**: https://github.com/gamerprotocol/ui/issues
- **Discord**: https://discord.gg/gamerprotocol
