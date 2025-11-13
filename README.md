# Open-Source React/TypeScript UI Package

The `gamerprotocol/ui` package will serve as the single, reliable source for all UI components, API communication logic, and real-time state management. It will be published publicly on NPM under the scope `@gamerprotocol/ui`.

## 1\. Root Structure & Dependencies

```
/gamerprotocol/ui
├── /src
│   ├── /api                     // 1. API Services & Hooks (Detailed below)
│   ├── /components              // 2. Platform-Agnostic UI & Game Components
│   ├── /design                  // 3. Tailwind & Theming Configuration
│   ├── /types                   // 4. Shared Typescript Interfaces
│   └── index.ts                 // Public export file
├── package.json                 // "name": "@gamerprotocol/ui"
├── tsconfig.json                // TypeScript config
└── tailwind.config.js           // Base Tailwind Configuration
```

## 2\. `/api` (The Bridge to GamerProtocol.io) - Detailed Service Structure

This is the most critical layer, handling two-factor authorization and data transformation. All API calls will rely on an underlying `axios` instance configured to automatically include the dynamic **Sanctum Bearer Token** and the static **`X-Interface-Key`**.

| Service File | Primary Functions (Hooks & Mutators) | API Endpoints Hit | Notes on Logic |
| :--- | :--- | :--- | :--- |
| **`useAuthService.ts`** | `login(creds)`: POST `/v1/sessions`<br>`logout()`: DELETE `/v1/sessions`<br>`useUser()`: GET `/v1/user` | `/v1/sessions`<br>`/v1/user` | **Login is unique:** Only requires `X-Interface-Key` and returns the Bearer Token. The hook manages token storage (localStorage/SecureStorage) and state. |
| **`useMatchService.ts`** | `useMatches()`: GET `/v1/matches`<br>`useMatch(ulid)`: GET `/v1/matches/{ulid}`<br>`createMatch(data)`: POST `/v1/matches` | `/v1/matches` | Central hook for fetching match lists and live match state. Uses **React Query** for caching and polling (or Reverb for real-time updates). |
| **`moveMutator.ts`** | `makeMove(ulid, moveData)`: POST `/v1/matches/{ulid}/moves` | `/v1/matches/{ulid}/moves` | A dedicated mutator function (e.g., using React Query's `useMutation`) that encapsulates the call to the move endpoint. |
| **`useReverbService.ts`** | `useGameChannel(ulid)`: Returns current game state. | N/A (WebSockets) | Manages the **Laravel Echo** connection. Subscribes to the `private-game.{ulid}` channel and updates the local state whenever a new `move.made` event is received. |
| **`useBillingService.ts`** | `useSubscription()`: GET `/v1/billing/subscription`<br>`useQuotas()`: GET `/v1/billing/quotas` | `/v1/billing/subscription`<br>`/v1/billing/quotas` | Reads usage data. Crucial for disabling the "New Game" button when a Free user has 3 strikes or a Member is out of quota. |

## 3\. `/components` (UI Components & Game Logic)

Components contain the platform-specific visual rendering logic but rely entirely on the data and state management provided by the `/api` services.

| Component / Folder | Responsibility | Logic Dependency |
| :--- | :--- | :--- |
| `primitives/` | **Platform Abstraction.** Core elements like `Button`, `Text`, `Modal`. These components must internally detect the environment (Web vs. React Native) and render the appropriate DOM element (`div`, `span`) or Native Component (`View`, `Text`). | None (Pure UI) |
| `game/GameShell.tsx` | The unified wrapper for all games. Manages the subscription to the `useReverbService` for the active `ulid`. | `useMatchService.useMatch()` |
| `game/HeartsGame.tsx` | **Feature Component.** Renders the game board based on the parsed `game_state` JSON. Handles card selection and calls `moveMutator.makeMove()` on play. | `useReverbService` |
| `ui/QuotaDisplay.tsx` | Renders the "3/3 Strikes Used" or "1,200/2,000 Matches Used" text. | `useBillingService.useQuotas()` |

## 4\. Cross-Platform Strategy

By separating platform-specific primitives from the shared logic, you maximize code reuse and minimize effort for new interfaces.

| Platform | Interface Key Usage | Code Reuse (Expected) | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Web Interface** | Unique key for `token-games-web`. | High (80-100%) | Uses Tailwind CSS directly. |
| **Electron App** | Unique key for `electron-desktop`. | Near-Total (95%) | Wraps the Web build; CSS/JS is fully reused. |
| **React Native (iOS/Android)** | Unique keys for `ios-mobile` and `android-mobile`. | Moderate (50-70%) | **API and State Logic (100%):** Imports all code from the `/api` folder. **UI Components (Needs Translation):** Primitives must map to `<View>`, `<Text>`. |
| **Telegram Mini App** | Unique key for `telegram-mini-app`. | High (80-100%) | The Telegram Mini App environment is essentially a browser, allowing direct use of the standard Web build and CSS. |
