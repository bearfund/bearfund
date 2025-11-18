# 💻 Specification 1: API & Core Logic Implementation

**Goal:** Create the robust, reusable, and platform-agnostic core layer of the package. This layer is responsible for all data contracts, API communication, caching, and real-time event handling.

**Dependencies:** `axios`, `@tanstack/react-query`, `laravel-echo`, `pusher-js` (or pure WebSocket compatible with Reverb).

---

## 1. 📂 TypeScript Data Contracts (`src/types`)

Create the following files under `src/types/` to enforce strict type-safety across all platforms.

### `src/types/auth.types.ts`

| Interface/Type | Specification | Details |
| :--- | :--- | :--- |
| **`AuthStorage`** | **The platform-agnostic contract for storing and retrieving the user token.** | `getToken(): Promise<string \| null>`: Retrieves Bearer token. `setToken(token: string): Promise<void>`: Stores the token. `clearToken(): Promise<void>`: Removes the token. |
| `LoginRequest` | Request body for standard login. | `{ email: string, password: string }` |
| `AuthResponse` | Flat response body for login/verify endpoints. | `{ token: string, user: User }` |

### `src/types/api.types.ts`

| Interface/Type | Specification | Details |
| :--- | :--- | :--- |
| **`User`** | Represents the basic user profile. | `{ username: string, name: string, avatar: string, social_links: any \| null }` |
| `ApiResponse<T>` | Standard response wrapper for single resources. | `{ data: T, message?: string }` |
| `PaginatedResponse<T>` | Wrapper for collections (e.g., Games, Alerts). | Defines `data: T[]`, `links`, and `meta` properties. |
| `ErrorResponse` | Defines the structure for all API error bodies. | `{ message: string, error_code: string, errors?: { [key: string]: string[] } }` |

### `src/types/game.types.ts`

Define structures for core game entities (expand this list as needed).

| Interface/Type | Specification | Details |
| :--- | :--- | :--- |
| `Game` | Core game state and details. | Includes `ulid`, `status`, `game_state`, `players`. |
| `GameActionRequest` | Payload for `POST /v1/games/{gameUlid}/action`. | `{ action_type: string, action_details: any }` |
| `LobbyDetails` | Structure for a single lobby. | Includes `ulid`, `game_title`, `host`, `players`, `status`. |

---

## 2. ⚙️ Base API Client (`src/core/api/base-client.ts`)

This file must contain the universal Axios configuration.

| Component | Specification | Details |
| :--- | :--- | :--- |
| **`setupAPIClient(config)`** | **Input:** `{ clientKey: string, authStorage: AuthStorage }`. **Output:** Configured Axios instance. | Primary export. Called once by the Provider. |
| **Base URL** | Set Axios `baseURL` to `/v1/`. | All endpoints use this base path. |
| **Request Interceptor (Client Key)** | Inject the static header: `X-Client-Key: [API Key]`. | Required for all requests. |
| **Request Interceptor (Bearer)** | Use `authStorage.getToken()` to asynchronously inject `Authorization: Bearer [Token]`. | Required for authenticated endpoints. |
| **Response Interceptor (401)** | Must catch **401 Unauthorized** errors. Upon catching, call `authStorage.clearToken()` to ensure a clean logout state. |

---

## 3. 🔑 React Query Hooks (`src/core/hooks`)

Implement the following hooks, ensuring they use the defined types and manage the cache lifecycle.

### `src/core/hooks/useAuth.ts`

| Hook | Purpose | API Call | Cache Management |
| :--- | :--- | :--- | :--- |
| **`useLogin()`** | Standard login mutation. | `POST /auth/login` | On success, must call `authStorage.setToken(response.token)` and invalidate the `['user']` query. |
| **`useLogout()`** | Standard logout mutation. | `POST /auth/logout` | On success, must call `authStorage.clearToken()` and fully reset the React Query client cache. |
| **`useUserQuery()`** | Fetch user profile. | `GET /auth/user` | Uses `['user']` as the query key. |

### `src/core/hooks/useGame.ts`

| Hook | Purpose | API Call | Cache Management |
| :--- | :--- | :--- | :--- |
| **`useGameAction(ulid)`** | Executes a player's move. | `POST /v1/games/{gameUlid}/action` | On success, must call `queryClient.invalidateQueries(['game', ulid])` to re-fetch the new state. |
| **`useGameQuery(ulid)`** | Fetches active game state. | `GET /v1/games/{gameUlid}` | Uses `['game', ulid]` as the query key. |
| **`useLobbyListQuery()`** | Fetches available lobbies. | `GET /v1/games/lobbies` | Uses `['lobbies']` as the query key. |

---

## 4. 🔗 Real-Time Layer (`src/core/realtime`)

Use **Laravel Echo** to connect to the Laravel Reverb WebSocket server.

### `src/core/realtime/echo-client.ts`

| Component | Specification | Details |
| :--- | :--- | :--- |
| **`setupEcho(token: string)`** | Initializes and returns the Laravel Echo instance. | Must be configured to use the Bearer token for private channel authorization. |

### `src/core/hooks/useRealtimeGame.ts`

| Hook | Purpose | Logic |
| :--- | :--- | :--- |
| **`useRealtimeGame(ulid)`** | Manages WebSocket subscription for a single game. | Uses `useEffect` to: 1. Subscribe to the private channel `private-game.{ulid}`. 2. Bind listeners for events like `GameActionProcessed`. 3. On event receipt, call `queryClient.invalidateQueries(['game', ulid])` to trigger a silent background refresh of the game state. |

---