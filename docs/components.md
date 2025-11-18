# 🎨 Specification 2: UI & Component Implementation

**Goal:** Implement the component architecture that separates UI rendering from core logic, supports Tailwind/HTML and React Native primitives, and enables deep client customization via slots and theming.

**Pattern:** Hybrid Component Pattern (Styled + Headless) with `.web.tsx` / `.native.tsx` separation.

---

## 1. 📦 The Package Provider (`src/components/Provider`)

| Component | Specification | Role |
| :--- | :--- | :--- |
| **`MyPackageProvider`** | **Inputs:** `clientKey: string`, `authStorage: AuthStorage` implementation, optional `queryClient`. | This is the client's entry point. |
| **Initialization** | Must initialize the **Axios client** and the **Laravel Echo client** using the provided inputs and make them available to the shared hooks. |
| **Wrapping** | Must wrap children with **React Query's `QueryClientProvider`**. |

---

## 2. 🧩 Component Architecture Rules

All major components (e.g., `LobbyCard`, `UserProfile`, `GameActionForm`) must follow this structure:

| File | Purpose | Implementation Rules |
| :--- | :--- | :--- |
| **`[Component].tsx` (Base)** | **Shared Logic & Props.** | Contains NO rendering code. Exports the component and its primary interface (e.g., `LobbyCardProps`). Handles all event handlers and state management logic derived from shared hooks. |
| **`[Component].web.tsx` (Web/Electron)** | **Tailwind/HTML Renderer.** | Uses standard HTML elements (`div`, `span`). Implements the component structure using **Tailwind CSS utility classes**. |
| **`[Component].native.tsx` (React Native)** | **Native Renderer.** | Uses React Native primitives (`<View>`, `<Text>`, `<TouchableOpacity>`). Implements styling using `StyleSheet.create()` or a compatible RN styling library. |

---

## 3. 🎨 Component Flexibility & Styling Rules

The following rules ensure client customization is frictionless:

### A. Theming and Overrides

| Rule | Requirement | Customization Level |
| :--- | :--- | :--- |
| **Semantic Tailwind** | In `.web.tsx` files, **AVOID** hardcoded values (e.g., `#FF0000`). Use themeable classes like `text-primary-game`, `bg-lobby-open`, and `shadow-2xl`. | Ensures clients can modify the entire look via their `tailwind.config.js` file. |
| **Root Prop Spread** | Every component's root element must accept and spread: **Web:** `className` and standard HTML props. **Native:** `style` and standard `View` props. | Allows clients to apply ad-hoc, instance-level styling overrides. |

### B. Composition via Slots

| Rule | Requirement | Customization Impact |
| :--- | :--- | :--- |
| **Action Slots** | For elements like buttons, icons, or complex controls, use **slot props** (e.g., `actionSlot?: React.ReactNode`, `footerSlot?: React.ReactNode`). | Allows clients to publish their own highly customized components into the library's layout wrappers. |

---

## 4. 🪶 Headless Component Implementation (Advanced Customization)

Implement the Headless Pattern for at least the **Lobby List** feature to demonstrate the highest level of customization control.

| Feature | Components/Hooks | Logic |
| :--- | :--- | :--- |
| **Lobby List** | **`useLobbyList()`** (from Spec 1) | Provides data/status. |
| | **`LobbyListHeadless`** | Accepts a `render` prop: `render: (lobbies: LobbyDetails[]) => React.ReactNode`. **Renders NO UI.** Simply calls the render prop with the data from the hook. |
| | **`LobbyList`** (Styled) | The default component that consumes the headless component/hook and renders the `LobbyCard` components. |

**Expected Client Use (Headless):**

```tsx
// Client code bypasses all your UI and uses the raw data/logic
import { useLobbyList, LobbyListHeadless } from 'your-package-name';

const MyCustomList = () => (
  <LobbyListHeadless>
    {(lobbies) => (
      <ul className="client-specific-grid">
        {lobbies.map(lobby => (
          // Client renders their own component with their own styling
          <ClientLobbyItem key={lobby.ulid} lobby={lobby} />
        ))}
      </ul>
    )}
  </LobbyListHeadless>
);