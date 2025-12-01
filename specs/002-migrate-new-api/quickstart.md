# Quickstart: Using the New API Structure

## 1. Setup API Client

Initialize the API client with your `clientKey` and `authStorage` implementation.

```typescript
import { setupAPIClient } from '@gamerprotocol/ui';

const client = setupAPIClient({
  clientKey: 'YOUR_CLIENT_KEY', // Required for v1 API
  authStorage: {
    getToken: async () => localStorage.getItem('token'),
    setToken: async (token) => localStorage.setItem('token', token),
    clearToken: async () => localStorage.removeItem('token'),
  },
});
```

## 2. Authentication

Use the `useAuth` hook to handle login.

```typescript
import { useAuth } from '@gamerprotocol/ui';

const { login } = useAuth();

const handleLogin = async () => {
  await login.mutateAsync({
    email: 'user@example.com',
    password: 'password123',
  });
};
```

## 3. Playing a Game

Join a queue and play a game using the new hooks.

```typescript
import { useMatchmaking, useGame } from '@gamerprotocol/ui';

// Join Queue
const { joinQueue } = useMatchmaking();
await joinQueue.mutateAsync({
  game_title: 'chess',
  mode_id: 1,
  skill_rating: 1200,
});

// In Game
const { game, submitAction } = useGame(gameUlid);

const makeMove = async (from: string, to: string) => {
  await submitAction.mutateAsync({
    action: 'MOVE_PIECE',
    parameters: { from, to },
  });
};
```

## 4. Real-time Updates

The hooks automatically handle real-time subscriptions.

- `useAuth` subscribes to `private-user.{username}`
- `useGame` subscribes to `private-game.{ulid}`

Ensure your `Echo` instance is configured correctly in the provider.
