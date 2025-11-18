# Research: API Core Integration

**Feature**: 001-api-core-integration  
**Date**: 2025-11-18  
**Phase**: 0 (Research & Technical Decisions)

## Overview

This document consolidates technical research and decision-making for implementing the platform-agnostic API core layer of the @gamerprotocol/ui package. All decisions prioritize the Constitution's core principles: Platform Agnosticism, Type Safety, Zero Lock-in, Client Customization, and Cross-Platform Code Reuse.

---

## Decision 1: Axios Request Interceptor Pattern for Authentication

**Decision**: Use async request interceptors to inject authentication headers dynamically by calling `authStorage.getToken()` before each request.

**Rationale**:
- Platform-agnostic: Works identically across Web, React Native, Electron, and Telegram Mini Apps
- Async support: `authStorage.getToken()` returns Promise to support both sync (localStorage) and async (SecureStore) storage mechanisms
- Automatic: Developers don't need to manually add auth headers to every request
- Lazy evaluation: Token is retrieved fresh for each request, ensuring updates are immediately reflected

**Alternatives Considered**:
1. **Store token in Axios client instance**: Rejected because token updates wouldn't be automatically reflected; requires manual client recreation
2. **Pass token as parameter to every hook**: Rejected because it violates DRY principle and increases error potential across 78 functional requirements
3. **Use Axios defaults.headers**: Rejected because it doesn't support async retrieval and would require synchronous storage only

**Implementation Pattern**:
```typescript
axios.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Decision 2: React Query v5 Cache Invalidation Strategy

**Decision**: Use hierarchical query keys (`['user']`, `['game', ulid]`, `['lobbies']`) and explicit `invalidateQueries()` calls in mutation `onSuccess` callbacks.

**Rationale**:
- Hierarchical keys: Enable precise invalidation (e.g., `['game', specific-ulid]` vs all games)
- Explicit invalidation: Clear, testable, and predictable cache behavior
- React Query v5 best practice: Aligns with official documentation and community patterns
- Real-time ready: Prepare for WebSocket events to invalidate queries without refetching

**Alternatives Considered**:
1. **Optimistic updates**: Rejected for initial implementation due to complexity; will be future enhancement (noted in spec's Out of Scope)
2. **Automatic refetching with intervals**: Rejected because it conflicts with real-time WebSocket approach and wastes resources
3. **Flat query keys**: Rejected because it makes selective invalidation impossible (e.g., can't invalidate one game without affecting all)

**Implementation Pattern**:
```typescript
// Query
const useGameQuery = (ulid: string) => 
  useQuery(['game', ulid], () => fetchGame(ulid));

// Mutation invalidates specific game
const useGameAction = (ulid: string) => 
  useMutation(
    (action) => submitAction(ulid, action),
    {
      onSuccess: () => queryClient.invalidateQueries(['game', ulid])
    }
  );
```

---

## Decision 3: Laravel Echo with Pusher Protocol for Reverb Compatibility

**Decision**: Configure Laravel Echo with `pusher` broadcaster and provide WebSocket URL as configuration option.

**Rationale**:
- Laravel Reverb compatibility: Reverb implements Pusher protocol, so Laravel Echo with pusher broadcaster works seamlessly
- Battle-tested: Laravel Echo is production-proven for private channel authentication
- Framework alignment: Matches backend Laravel ecosystem (API is Laravel-based per docs/api-endpoints.md)
- Flexible configuration: Allows override of WebSocket host for development/staging environments

**Alternatives Considered**:
1. **Socket.io**: Rejected because it requires different backend implementation; Laravel Reverb uses Pusher protocol
2. **Native WebSocket API**: Rejected because it requires reimplementing channel subscription, authentication, and event handling that Laravel Echo provides
3. **Ably or PubNub**: Rejected because they're paid services; Laravel Reverb is self-hosted and free

**Implementation Pattern**:
```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export function setupEcho(token: string, options?: {
  host?: string;
  authEndpoint?: string;
}) {
  return new Echo({
    broadcaster: 'pusher',
    key: 'app-key', // Reverb app key
    wsHost: options?.host || window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    authEndpoint: options?.authEndpoint || '/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
```

---

## Decision 4: Error Transformation Strategy

**Decision**: Transform all Axios errors to `ErrorResponse` type in response interceptor with consistent structure: `{ message, error_code, errors? }`.

**Rationale**:
- Type safety: Consuming code can rely on consistent error shape
- Platform-agnostic: Error handling works identically across all platforms
- Testable: Mock errors have predictable structure in tests
- User-friendly: `message` is always present for displaying to users

**Alternatives Considered**:
1. **Pass through raw Axios errors**: Rejected because error shape varies (network errors vs API errors) and isn't type-safe
2. **Throw custom error classes**: Rejected because it complicates error handling in React components and isn't compatible with React Query's error handling
3. **Separate error types**: Rejected because it adds complexity without meaningful benefit

**Implementation Pattern**:
```typescript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      // API returned error response
      return Promise.reject(error.response.data as ErrorResponse);
    }
    // Network or other error
    return Promise.reject({
      message: error.message || 'Network error',
      error_code: 'NETWORK_ERROR',
    } as ErrorResponse);
  }
);
```

---

## Decision 5: AuthStorage Interface Contract Pattern

**Decision**: Define `AuthStorage` as platform-agnostic interface with async methods, allow clients to provide implementations.

**Rationale**:
- Platform agnosticism: Package doesn't depend on any specific storage mechanism
- Flexibility: Clients choose appropriate storage (localStorage, SecureStore, Keychain, etc.)
- Type safety: Interface enforces contract, preventing runtime errors
- Testability: Easy to mock in tests

**Alternatives Considered**:
1. **Provide default implementations**: Rejected because it would require platform detection and platform-specific dependencies
2. **Use localStorage directly**: Rejected because it only works on web, violating platform agnosticism
3. **Accept token as prop to every hook**: Rejected because it's error-prone and violates DRY principle

**Implementation Pattern**:
```typescript
// Package defines interface
export interface AuthStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}

// Web client implements
const webAuthStorage: AuthStorage = {
  getToken: async () => localStorage.getItem('auth_token'),
  setToken: async (token) => localStorage.setItem('auth_token', token),
  clearToken: async () => localStorage.removeItem('auth_token'),
};

// React Native client implements
import * as SecureStore from 'expo-secure-store';
const nativeAuthStorage: AuthStorage = {
  getToken: async () => await SecureStore.getItemAsync('auth_token'),
  setToken: async (token) => await SecureStore.setItemAsync('auth_token', token),
  clearToken: async () => await SecureStore.deleteItemAsync('auth_token'),
};
```

---

## Decision 6: React Query Hook Composition Pattern

**Decision**: Export individual hooks (not hook factories), accept parameters directly, use `useQueryClient` for cache access.

**Rationale**:
- React best practice: Hooks should be top-level, not conditionally called
- Developer experience: Simpler API, matches React Query conventions
- Type inference: TypeScript can infer types from parameters
- Zero Lock-in: Each hook is independently usable

**Alternatives Considered**:
1. **Hook factories**: Rejected because it adds indirection without benefit (e.g., `createGameHooks(client)`)
2. **Single mega-hook**: Rejected because it violates single responsibility and makes tree-shaking impossible
3. **Class-based API**: Rejected because it's not idiomatic React

**Implementation Pattern**:
```typescript
// Individual, composable hooks
export function useLogin() {
  const queryClient = useQueryClient();
  const { authStorage } = usePackageContext();
  
  return useMutation(
    (credentials: LoginRequest) => apiClient.post('/auth/login', credentials),
    {
      onSuccess: (data: AuthResponse) => {
        authStorage.setToken(data.token);
        queryClient.invalidateQueries(['user']);
      },
    }
  );
}

// Usage (simple, no factory needed)
const { mutate: login, isLoading } = useLogin();
```

---

## Decision 7: TypeScript Strict Mode Configuration

**Decision**: Enable all strict mode flags in tsconfig.json: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, etc.

**Rationale**:
- Type safety principle: Enforces zero implicit `any` types (Success Criteria SC-001)
- Platform reliability: Catches errors at compile time across all 4 platforms
- Developer experience: IntelliSense and autocomplete work correctly
- Future-proof: Easier to maintain and refactor

**Alternatives Considered**:
1. **Gradual strictness**: Rejected because it allows implicit `any` to slip through initially
2. **Loose mode**: Rejected because it violates Constitution Principle II (Type Safety)

**Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Decision 8: Real-Time Hook Subscription Lifecycle

**Decision**: Use React `useEffect` for channel subscription/cleanup, expose `enabled` option to control subscription, invalidate queries on events (not direct state updates).

**Rationale**:
- React lifecycle: useEffect handles mount/unmount automatically
- Performance: `enabled` option prevents unnecessary connections
- Cache consistency: Invalidating queries keeps React Query as single source of truth
- Testability: Easy to mock Echo client and verify invalidation calls

**Alternatives Considered**:
1. **Direct state updates**: Rejected because it bypasses React Query cache and creates inconsistency
2. **Manual subscription management**: Rejected because it's error-prone and violates React patterns
3. **Always-on subscriptions**: Rejected because it wastes resources for inactive components

**Implementation Pattern**:
```typescript
export function useRealtimeGame(ulid: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (options?.enabled === false) return;
    
    const channel = echo.private(`game.${ulid}`);
    
    channel
      .listen('GameActionProcessed', () => {
        queryClient.invalidateQueries(['game', ulid]);
      })
      .listen('GameCompleted', () => {
        queryClient.invalidateQueries(['game', ulid]);
      });
    
    setIsConnected(true);
    
    return () => {
      channel.stopListening('GameActionProcessed');
      channel.stopListening('GameCompleted');
      echo.leave(`game.${ulid}`);
      setIsConnected(false);
    };
  }, [ulid, options?.enabled]);
  
  return { isConnected, error };
}
```

---

## Technology Stack Summary

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| TypeScript | ^5.6.3 | Type system | Strict mode for type safety principle |
| Axios | ^1.7.7 | HTTP client | Interceptor support, battle-tested, platform-agnostic |
| React Query | ^5.59.0 | State management | Industry standard for server state, caching, invalidation |
| Laravel Echo | ^1.16.1 | WebSocket client | Laravel ecosystem alignment, private channel auth |
| Pusher.js | ^8.4.0-rc2 | WebSocket transport | Reverb compatibility (Pusher protocol) |
| Jest | ^29.0.0 | Test runner | React Testing Library compatibility |
| MSW | ^2.0.0 | API mocking | Request interception for tests |

---

## Best Practices Applied

1. **Async/Await Everywhere**: All storage operations return Promises for platform compatibility
2. **TypeScript Generics**: `ApiResponse<T>` and `PaginatedResponse<T>` for type inference
3. **Single Responsibility**: Each hook does one thing (e.g., `useLogin` vs `useRegister`)
4. **Explicit Error Handling**: All errors transformed to `ErrorResponse` type
5. **JSDoc Comments**: All exported functions documented (per Development Standards)
6. **Hierarchical Query Keys**: Enable precise cache invalidation
7. **Interface Segregation**: Small, focused interfaces (e.g., `AuthStorage` has only 3 methods)
8. **Dependency Injection**: `AuthStorage` injected via context, not hardcoded
9. **React Hooks Rules**: No conditional hooks, no hooks in loops, proper dependency arrays
10. **Tree-Shaking Friendly**: Named exports, no barrel file re-exports at package level

---

## Open Questions: RESOLVED

All technical unknowns from specification have been resolved through research:

1. ✅ **Auth header injection pattern**: Async request interceptor
2. ✅ **Cache invalidation strategy**: Hierarchical keys + explicit invalidation
3. ✅ **WebSocket library choice**: Laravel Echo with Pusher protocol
4. ✅ **Error handling approach**: Transform all to ErrorResponse type
5. ✅ **Storage abstraction**: AuthStorage interface contract
6. ✅ **Hook composition pattern**: Individual hooks, useQueryClient access
7. ✅ **TypeScript configuration**: Full strict mode enabled
8. ✅ **Real-time subscription lifecycle**: useEffect with enabled option

---

## Next Steps

**Phase 1**: Design & Contracts
1. Create `data-model.md` documenting all TypeScript interfaces and their relationships
2. Generate OpenAPI specs in `contracts/` for auth, games, billing, realtime
3. Write `quickstart.md` with setup instructions for all 4 platforms
4. Update agent context with technology choices

**Phase 2**: Task Breakdown (via `/speckit.tasks`)
1. Break down 78 functional requirements into actionable tasks
2. Prioritize by user story (P1 types/client/auth, P2 games/billing, P3 realtime)
3. Create checklist for constitution compliance verification
