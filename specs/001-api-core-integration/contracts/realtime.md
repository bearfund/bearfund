# WebSocket Real-time Events Contract

**Protocol**: Laravel Echo with Pusher Protocol  
**Transport**: WebSocket (ws:// or wss://)  
**Authentication**: Bearer token via `/broadcasting/auth` endpoint

---

## Connection Setup

### 1. Echo Client Configuration

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'app-key',                     // Reverb app key
  wsHost: 'api.gamerprotocol.io',     // WebSocket host
  wsPort: 6001,                        // Reverb port
  wssPort: 6001,                       // Reverb SSL port
  forceTLS: true,                      // Use wss:// in production
  disableStats: true,                  // Disable Pusher stats
  authEndpoint: '/broadcasting/auth',  // Laravel auth endpoint
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,  // User token
      'X-Client-Key': clientKey,         // Client API key
    },
  },
});
```

### 2. Channel Subscription Pattern

**Private Channel Format**: `private-{resource}.{ulid}`

Examples:
- Game channel: `private-game.01HQ...`
- Lobby channel: `private-lobby.01HQ...`

---

## Game Channel Events

**Channel**: `private-game.{gameUlid}`

### Event: GameActionProcessed
Broadcast when a player action is successfully processed.

```typescript
{
  type: 'GameActionProcessed',
  game_ulid: '01HQ...',
  payload: {
    player: 'johndoe',              // Username who performed action
    action: 'drop_piece',           // Action type
    game_state: {                   // Updated game state
      board: [[...], ...],
      currentPlayerUlid: '01HQ...',
      // ... game-specific state
    },
    next_player: 'janedoe'          // Next player's turn
  },
  timestamp: '2025-11-18T10:30:00Z'
}
```

### Event: GameCompleted
Broadcast when a game is completed.

```typescript
{
  type: 'GameCompleted',
  game_ulid: '01HQ...',
  payload: {
    winner: 'johndoe',              // Winner username
    final_state: {                  // Final game state
      board: [[...], ...],
      // ... game-specific final state
    },
    completed_at: '2025-11-18T10:35:00Z'
  },
  timestamp: '2025-11-18T10:35:00Z'
}
```

### Event: GameForfeited
Broadcast when a player forfeits.

```typescript
{
  type: 'GameForfeited',
  game_ulid: '01HQ...',
  payload: {
    forfeiter: 'johndoe',           // Player who forfeited
    winner: 'janedoe'               // Winner by forfeit
  },
  timestamp: '2025-11-18T10:32:00Z'
}
```

### Event: PlayerJoined
Broadcast when a player joins the game (multiplayer games).

```typescript
{
  type: 'PlayerJoined',
  game_ulid: '01HQ...',
  payload: {
    username: 'player3'
  },
  timestamp: '2025-11-18T10:28:00Z'
}
```

### Event: PlayerLeft
Broadcast when a player disconnects or leaves.

```typescript
{
  type: 'PlayerLeft',
  game_ulid: '01HQ...',
  payload: {
    username: 'player3',
    reason: 'disconnected'          // Optional reason
  },
  timestamp: '2025-11-18T10:33:00Z'
}
```

---

## Lobby Channel Events

**Channel**: `private-lobby.{lobbyUlid}`

### Event: PlayerJoined
Broadcast when a player joins the lobby.

```typescript
{
  type: 'PlayerJoined',
  lobby_ulid: '01HQ...',
  payload: {
    username: 'newplayer',
    player_count: 3,                // Current player count
    max_players: 4                  // Max allowed
  },
  timestamp: '2025-11-18T10:25:00Z'
}
```

### Event: PlayerLeft
Broadcast when a player leaves the lobby.

```typescript
{
  type: 'PlayerLeft',
  lobby_ulid: '01HQ...',
  payload: {
    username: 'oldplayer',
    player_count: 2                 // Remaining players
  },
  timestamp: '2025-11-18T10:26:00Z'
}
```

### Event: PlayerStatusChanged
Broadcast when a player changes ready status.

```typescript
{
  type: 'PlayerStatusChanged',
  lobby_ulid: '01HQ...',
  payload: {
    username: 'johndoe',
    new_status: 'ready',            // 'waiting' | 'ready' | 'not_ready'
    ready_count: 2,                 // Players marked ready
    total_players: 3
  },
  timestamp: '2025-11-18T10:27:00Z'
}
```

### Event: ReadyCheckStarted
Broadcast when host initiates ready check.

```typescript
{
  type: 'ReadyCheckStarted',
  lobby_ulid: '01HQ...',
  payload: {
    duration_seconds: 30,           // Ready check duration
    expires_at: '2025-11-18T10:28:00Z'
  },
  timestamp: '2025-11-18T10:27:30Z'
}
```

### Event: LobbyStarting
Broadcast when all players ready and game is starting.

```typescript
{
  type: 'LobbyStarting',
  lobby_ulid: '01HQ...',
  payload: {
    game_ulid: '01HQ...',           // Created game ULID
    countdown_seconds: 3            // Countdown before start
  },
  timestamp: '2025-11-18T10:28:00Z'
}
```

### Event: LobbyCancelled
Broadcast when lobby is cancelled or disbanded.

```typescript
{
  type: 'LobbyCancelled',
  lobby_ulid: '01HQ...',
  payload: {
    reason: 'Host disbanded lobby'  // Cancellation reason
  },
  timestamp: '2025-11-18T10:29:00Z'
}
```

---

## Connection Management

### Connection States

```typescript
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
```

### Subscription Metadata

```typescript
interface ChannelSubscription {
  channel_name: string;           // e.g., 'private-game.01HQ...'
  is_subscribed: boolean;         // Successfully subscribed
  status: ConnectionStatus;       // Current connection state
  error: Error | null;            // Error if connection failed
}
```

---

## Usage Examples

### Subscribe to Game Channel

```typescript
const channel = echo.private(`game.${gameUlid}`);

channel
  .listen('GameActionProcessed', (event) => {
    console.log('Action processed:', event);
    // Invalidate React Query cache
    queryClient.invalidateQueries(['game', gameUlid]);
  })
  .listen('GameCompleted', (event) => {
    console.log('Game completed:', event);
    // Invalidate and show completion UI
    queryClient.invalidateQueries(['game', gameUlid]);
  });
```

### Subscribe to Lobby Channel

```typescript
const channel = echo.private(`lobby.${lobbyUlid}`);

channel
  .listen('PlayerJoined', (event) => {
    console.log('Player joined:', event.payload.username);
    queryClient.invalidateQueries(['lobby', lobbyUlid]);
  })
  .listen('LobbyStarting', (event) => {
    console.log('Game starting:', event.payload.game_ulid);
    // Redirect to game
    navigate(`/game/${event.payload.game_ulid}`);
  });
```

### Cleanup on Unmount

```typescript
useEffect(() => {
  const channel = echo.private(`game.${gameUlid}`);
  
  channel.listen('GameActionProcessed', handleAction);
  
  return () => {
    channel.stopListening('GameActionProcessed');
    echo.leave(`game.${gameUlid}`);
  };
}, [gameUlid]);
```

---

## Error Handling

### Authentication Errors

```typescript
echo.connector.pusher.connection.bind('error', (error) => {
  if (error.error.data.code === 4001) {
    // Authentication failed - token invalid
    console.error('WebSocket auth failed:', error);
    // Trigger re-login flow
  }
});
```

### Connection Errors

```typescript
echo.connector.pusher.connection.bind('state_change', (states) => {
  console.log('Connection state:', states.current);
  // States: connecting, connected, unavailable, disconnected
});
```

---

## Best Practices

1. **Always Cleanup**: Use `echo.leave()` in cleanup functions to prevent memory leaks
2. **Invalidate Queries**: Don't update state directly - invalidate React Query cache instead
3. **Handle Reconnection**: Laravel Echo automatically reconnects, ensure event listeners persist
4. **Error Boundaries**: Wrap WebSocket components in error boundaries
5. **Graceful Degradation**: UI should work without WebSocket (polling fallback)
6. **Subscribe on Mount**: Subscribe in `useEffect`, not during render
7. **One Subscription Per Channel**: Avoid duplicate subscriptions to same channel

---

## TypeScript Event Discriminated Union

```typescript
type GameEventType =
  | 'GameActionProcessed'
  | 'GameCompleted'
  | 'GameForfeited'
  | 'PlayerJoined'
  | 'PlayerLeft';

type LobbyEventType =
  | 'PlayerJoined'
  | 'PlayerLeft'
  | 'PlayerStatusChanged'
  | 'ReadyCheckStarted'
  | 'LobbyStarting'
  | 'LobbyCancelled';

interface BaseEvent<T extends string, P> {
  type: T;
  game_ulid?: string;
  lobby_ulid?: string;
  payload: P;
  timestamp: string;
}

type GameEvent =
  | BaseEvent<'GameActionProcessed', GameActionProcessedPayload>
  | BaseEvent<'GameCompleted', GameCompletedPayload>
  | BaseEvent<'GameForfeited', GameForfeitedPayload>
  | BaseEvent<'PlayerJoined', PlayerJoinedPayload>
  | BaseEvent<'PlayerLeft', PlayerLeftPayload>;

// See data-model.md for full payload type definitions
```

---

## Rate Limits

- **Max Concurrent Connections**: 10 per user (across all devices)
- **Max Subscriptions Per Connection**: 100 channels
- **Message Rate Limit**: 1000 messages/minute per connection
- **Reconnection Backoff**: Exponential backoff (1s, 2s, 4s, 8s, max 60s)

---

## Platform Compatibility

| Platform | Support | Notes |
|----------|---------|-------|
| Web | ✅ Full | Native WebSocket support |
| React Native | ✅ Full | Requires polyfills for Buffer/process |
| Electron | ✅ Full | Native WebSocket support |
| Telegram Mini Apps | ✅ Full | WebSocket over HTTPS required |

---

## Next Steps

**Implementation**:
1. Create `src/core/realtime/echo-client.ts` with `setupEcho()` function
2. Create `src/core/realtime/useRealtimeGame.ts` hook
3. Create `src/core/realtime/useRealtimeLobby.ts` hook
4. Add WebSocket event type definitions to `src/types/realtime.types.ts`
5. Write tests with mocked Echo client
