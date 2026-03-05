# @ensemble-ens/react

Drop-in React components and headless hooks for ENS operations — search, profile, register, transfer, records, and more.

## Quickstart

```bash
npm install @ensemble-ens/react
```

```tsx
import '@ensemble-ens/react/styles.css';
import { ENSemble } from '@ensemble-ens/react';

<ENSemble apiUrl="https://your-ens-api.workers.dev" connectButton={<YourConnectButton />} />
```

The `<ENSemble />` component provides a complete ENS dashboard with profile card, name search, record editing, ownership management, and registration support — all powered by your deployed ENS Agent API.

## Prerequisites

Your app must provide these context providers (peer dependencies):

- `WagmiProvider` — Ethereum wallet hooks
- `QueryClientProvider` — React Query for data fetching
- `RainbowKitProvider` — (optional) wallet connection UI

## Config Props

| Prop | Type | Description |
|------|------|-------------|
| `apiUrl` | `string` | **Required.** Base URL of your ENS Agent API Worker |
| `apiKey` | `string` | Optional API key for authenticated endpoints (commit, register, etc.) |
| `features` | `ENSFeature[]` | Subset of features to enable. Defaults to all |
| `theme` | `ENSembleTheme` | CSS custom property overrides (`--ens-accent`, etc.) |
| `className` | `string` | CSS class for the wrapper element |
| `connectButton` | `ReactNode` | Your wallet connect button (rendered when disconnected) |
| `chainButton` | `ReactNode` | Your chain switcher button (rendered in profile header) |
| `onTransactionSuccess` | `() => void` | Called after a successful on-chain transaction |

## Hooks

### `useENSemble()`

Composite hook — returns everything in one call:

```tsx
const { config, client, profile, search, signing, chat } = useENSemble();
```

### `useENSProfile()`

Profile and name list fetching for the connected wallet.

```tsx
const { profile, nameList, isLoading, error, refresh, selectName, isConnected, address, network } = useENSProfile();
```

### `useENSSearch()`

Debounced ENS name availability search with auto-profile for taken names.

```tsx
const { query, setQuery, result, isSearching, error, clear } = useENSSearch();
```

### `useWalletSigning()`

Wagmi transaction signing with receipt polling and timeout handling.

```tsx
const { signTransaction, isPending, error } = useWalletSigning();
const result = await signTransaction({ to, data, value });
// result: { hash, status: 'success' | 'reverted' | 'submitted' }
```

### `useChatBridge()`

Ref-based bridge for injecting prompts into a chat panel without re-renders.

```tsx
const { sendPrompt, sendAction } = useChatBridge();
sendPrompt('Register myname.eth');
```

## Components

| Component | Description |
|-----------|-------------|
| `<ENSemble />` | Drop-in dashboard with provider + profile card + signing overlay |
| `<ENSembleChat />` | Optional ChatKit wrapper for AI-powered ENS chat |
| `<ENSProfileCard />` | Profile card with search, records, ownership, expiry editing |
| `<ENSNameList />` | Standalone list of owned ENS names with expiry badges |
| `<CountdownTimer />` | Commit-reveal countdown with progress bar |
| `<RegistrationProgress />` | Step indicator for commit → wait → register → done |
| `<RegistrationSuccess />` | Toast banner for successful registration |
| `<SigningOverlay />` | Inline overlay during wallet signing |
| `<ErrorBoundary />` | Error boundary with retry button |

## API Client

The `ENSembleClient` class provides a typed HTTP client for all Worker API endpoints:

```tsx
import { ENSembleClient } from '@ensemble-ens/react';

const client = new ENSembleClient('https://your-api.workers.dev', 'optional-api-key');

const profile = await client.profile('vitalik.eth', 'mainnet');
const check = await client.check('myname', 'sepolia');
const { session_id, tx } = await client.commit('myname', ownerAddr, '1y', 'sepolia');
```

## Theming

Override CSS custom properties via the `theme` prop or a parent CSS rule:

```tsx
<ENSemble
  apiUrl="..."
  theme={{
    '--ens-accent': '#e040fb',
    '--ens-bg-raised': '#1a1a2e',
    '--ens-text': '#ffffff',
  }}
/>
```

Or in CSS:

```css
.my-app {
  --ens-accent: #e040fb;
  --ens-bg-raised: #1a1a2e;
  --ens-text: #ffffff;
}
```

## License

MIT
