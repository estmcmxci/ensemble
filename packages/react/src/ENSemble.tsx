import { useRef, type ReactNode } from 'react';
import { ENSembleProvider } from './ENSembleProvider';
import { useENSProfile } from './hooks/useENSProfile';
import { useChatBridge, ChatBridgeContext, type ChatBridgeMethods } from './hooks/useChatBridge';
import { ENSProfileCard } from './components/ENSProfileCard';
import { ENSembleChat } from './ENSembleChat';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ENSembleConfig, ENSembleTheme } from './types';

interface ENSembleContentProps {
  className?: string;
  connectButton?: ReactNode;
  chainButton?: ReactNode;
  onTransactionSuccess?: () => void;
  chatApiUrl?: string;
  chatDomainKey?: string;
  chatTheme?: Record<string, unknown>;
  children?: ReactNode;
}

function ENSembleContent({
  className,
  connectButton,
  chainButton,
  onTransactionSuccess,
  chatApiUrl,
  chatDomainKey,
  chatTheme,
  children,
}: ENSembleContentProps) {
  const { profile, nameList, isLoading, isConnected, refresh, selectName } = useENSProfile();
  const { sendPrompt } = useChatBridge();

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <ENSProfileCard
        profile={profile}
        nameList={nameList}
        isLoading={isLoading}
        isConnected={isConnected}
        onSendPrompt={sendPrompt}
        onSelectName={selectName}
        onRefresh={refresh}
        connectButton={connectButton}
        chainButton={chainButton}
      />
      {chatApiUrl && chatDomainKey && (
        <ENSembleChat
          chatApiUrl={chatApiUrl}
          domainKey={chatDomainKey}
          ensNames={nameList?.names ?? []}
          isWalletConnected={isConnected}
          onTransactionSuccess={onTransactionSuccess ?? refresh}
          chatTheme={chatTheme}
        />
      )}
      {children}
    </div>
  );
}

export interface ENSembleProps extends ENSembleConfig {
  className?: string;
  theme?: ENSembleTheme;
  connectButton?: ReactNode;
  chainButton?: ReactNode;
  onTransactionSuccess?: () => void;
  /** ChatKit API URL — enables the chat panel when provided */
  chatApiUrl?: string;
  /** ChatKit domain key — required alongside chatApiUrl */
  chatDomainKey?: string;
  /** ChatKit theme object */
  chatTheme?: Record<string, unknown>;
  children?: ReactNode;
}

export function ENSemble({
  apiUrl,
  apiKey,
  features,
  className,
  theme,
  connectButton,
  chainButton,
  onTransactionSuccess,
  chatApiUrl,
  chatDomainKey,
  chatTheme,
  children,
}: ENSembleProps) {
  const style = theme
    ? Object.fromEntries(Object.entries(theme).filter(([, v]) => v !== undefined))
    : undefined;

  const bridgeRef = useRef<ChatBridgeMethods | null>(null);

  return (
    <ENSembleProvider apiUrl={apiUrl} apiKey={apiKey} features={features}>
      <ChatBridgeContext.Provider value={bridgeRef}>
        <ErrorBoundary>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, ...style }}>
            <ENSembleContent
              className={className}
              connectButton={connectButton}
              chainButton={chainButton}
              onTransactionSuccess={onTransactionSuccess}
              chatApiUrl={chatApiUrl}
              chatDomainKey={chatDomainKey}
              chatTheme={chatTheme}
            >
              {children}
            </ENSembleContent>
          </div>
        </ErrorBoundary>
      </ChatBridgeContext.Provider>
    </ENSembleProvider>
  );
}
