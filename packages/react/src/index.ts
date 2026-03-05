/* ── @ensemble-ens/react ── */

// Types
export type {
  ENSExpiry,
  ENSProfile,
  ENSNameEntry,
  ENSNameList,
  ENSCheckResult,
  TxParams,
  TxResult,
  SearchResult,
  RegistrationStep,
  ENSFeature,
  ENSembleConfig,
  ENSembleTheme,
  ApiOk,
  ApiErr,
  ApiResponse,
} from './types';

// API Client
export { ENSembleClient } from './client/api';

// Provider
export { ENSembleProvider, useENSembleContext } from './ENSembleProvider';
export type { ENSembleProviderProps } from './ENSembleProvider';

// Drop-in component
export { ENSemble } from './ENSemble';
export type { ENSembleProps } from './ENSemble';

// Optional ChatKit wrapper
export { ENSembleChat } from './ENSembleChat';
export type { ENSembleChatProps } from './ENSembleChat';

// Hooks
export { useENSemble } from './hooks/useENSemble';
export { useENSProfile } from './hooks/useENSProfile';
export type { UseENSProfileReturn } from './hooks/useENSProfile';
export { useENSSearch } from './hooks/useENSSearch';
export type { UseENSSearchReturn } from './hooks/useENSSearch';
export { useWalletSigning } from './hooks/useWalletSigning';
export type { UseWalletSigningReturn } from './hooks/useWalletSigning';
export { useChatBridge, useChatBridgeRegister, ChatBridgeContext } from './hooks/useChatBridge';
export type { ChatBridgeMethods, UseChatBridgeReturn } from './hooks/useChatBridge';

// Utilities
export { chainToNetwork, truncAddr, expiryBadgeClass } from './utils';

// Components
export { ENSProfileCard } from './components/ENSProfileCard';
export type { ENSProfileCardProps } from './components/ENSProfileCard';
export { ENSNameList as ENSNameListComponent } from './components/ENSNameList';
export { CountdownTimer } from './components/CountdownTimer';
export { RegistrationProgress } from './components/RegistrationProgress';
export { RegistrationSuccess } from './components/RegistrationSuccess';
export { SigningOverlay } from './components/SigningOverlay';
export { ErrorBoundary } from './components/ErrorBoundary';
