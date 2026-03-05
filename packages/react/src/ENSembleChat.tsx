import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useAccount } from 'wagmi';
import { useWalletSigning } from './hooks/useWalletSigning';
import { useChatBridgeRegister } from './hooks/useChatBridge';
import { CountdownTimer } from './components/CountdownTimer';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { SigningOverlay } from './components/SigningOverlay';
import { RegistrationProgress } from './components/RegistrationProgress';
import type { ENSNameEntry, RegistrationStep } from './types';

export interface ENSembleChatProps {
  /** ChatKit API URL */
  chatApiUrl: string;
  /** ChatKit domain key */
  domainKey: string;
  /** Owned ENS names for contextual prompts */
  ensNames?: ENSNameEntry[];
  /** Whether wallet is connected */
  isWalletConnected?: boolean;
  /** Called after a successful transaction */
  onTransactionSuccess?: () => void;
  /** ChatKit theme object (passed to useChatKit) */
  chatTheme?: Record<string, unknown>;
  /** ChatKit greeting text */
  greeting?: string;
  /** Composer placeholder text */
  placeholder?: string;
}

/**
 * ENSembleChat — Full ChatKit-powered chat panel with wallet signing,
 * registration progress, countdown timer, and session persistence.
 */
export function ENSembleChat({
  chatApiUrl,
  domainKey,
  ensNames = [],
  isWalletConnected = false,
  onTransactionSuccess,
  chatTheme,
  greeting = 'How can I help?',
  placeholder = 'Ask me anything about ENS...',
}: ENSembleChatProps) {
  const { address: connectedAddress, chainId } = useAccount();
  const { signTransaction, isPending: isSigningTx } = useWalletSigning();
  const registerBridge = useChatBridgeRegister();
  const [countdown, setCountdown] = useState<{ waitSeconds: number } | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{ name: string } | null>(null);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('idle');
  const [isConversationActive, setIsConversationActive] = useState(() => {
    try { return !!sessionStorage.getItem('ens_chatkit_thread'); } catch { return false; }
  });
  const fetchCountRef = useRef(0);

  const THREAD_KEY = 'ens_chatkit_thread';
  const PENDING_TX_KEY = 'ens_pending_tx';
  const [savedThreadId] = useState<string | null>(() => {
    try { return sessionStorage.getItem(THREAD_KEY); } catch { return null; }
  });
  const [pendingTxResume] = useState<string | null>(() => {
    try {
      const val = sessionStorage.getItem(PENDING_TX_KEY);
      if (val) sessionStorage.removeItem(PENDING_TX_KEY);
      return val;
    } catch { return null; }
  });

  const prompts = useMemo(() => {
    if (!isWalletConnected) {
      return [
        { label: 'Search for a .eth name', prompt: 'Is myname.eth available?' },
        { label: 'Learn how ENS works', prompt: 'What is ENS and how does it work?' },
        { label: 'Walk me through registration', prompt: 'How do I register an ENS name?' },
      ];
    }
    if (ensNames.length === 0) {
      return [
        { label: 'Search for a .eth name', prompt: 'Is myname.eth available?' },
        { label: 'Register my first name', prompt: 'Help me register a new .eth name' },
        { label: 'Show my ENS names', prompt: 'Show all ENS names for my connected wallet' },
      ];
    }
    return [
      { label: 'Show my ENS names', prompt: 'Show all ENS names for my connected wallet' },
      { label: 'Register another name', prompt: 'Help me register a new .eth name' },
      { label: 'Update my records', prompt: 'I want to update text records on my ENS name' },
    ];
  }, [isWalletConnected, ensNames.length]);

  const customFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) => {
      fetchCountRef.current++;
      if (!isConversationActive && fetchCountRef.current > 1) {
        setIsConversationActive(true);
      }
      const headers = new Headers(init?.headers);
      if (connectedAddress) headers.set('X-Wallet-Address', connectedAddress);
      if (chainId) headers.set('X-Chain-Id', String(chainId));
      return fetch(input, { ...init, headers });
    },
    [connectedAddress, chainId, isConversationActive],
  );

  const { control, sendCustomAction, sendUserMessage } = useChatKit({
    api: {
      url: chatApiUrl,
      domainKey,
      fetch: customFetch as typeof fetch,
    },
    initialThread: savedThreadId,
    onThreadChange: (e: { threadId: string | null }) => {
      try {
        if (e.threadId) sessionStorage.setItem(THREAD_KEY, e.threadId);
        else sessionStorage.removeItem(THREAD_KEY);
      } catch { /* storage unavailable */ }
    },
    theme: chatTheme,
    startScreen: {
      greeting,
      prompts,
    },
    header: {
      enabled: false,
    },
    composer: {
      placeholder,
    },
    onClientTool: async (invocation: { name: string; params: Record<string, unknown> }) => {
      if (invocation.name === 'sign_transaction') {
        const tx = invocation.params.tx as { to: string; data?: string; value?: string } | undefined;
        if (!tx) return { success: false, error: 'No transaction data' };

        const opType = invocation.params.operation_type as string | undefined;
        const opDescription = invocation.params.operation as string | undefined;
        if (opType === 'commit' || opType === 'register') {
          setRegistrationStep(opType);
        }

        try {
          sessionStorage.setItem(PENDING_TX_KEY, opDescription || opType || 'transaction');
        } catch { /* storage unavailable */ }

        try {
          const { hash, status } = await signTransaction(tx);

          try { sessionStorage.removeItem(PENDING_TX_KEY); } catch { /* */ }

          const waitSeconds = invocation.params.wait_seconds as number | undefined;
          if (waitSeconds && waitSeconds > 0 && status !== 'submitted') {
            setCountdown({ waitSeconds });
            setRegistrationStep('waiting');
          }

          if (opType === 'register' && status !== 'submitted') {
            setRegistrationSuccess({ name: opDescription || 'your name' });
            setRegistrationStep('complete');
          }

          if (onTransactionSuccess) setTimeout(onTransactionSuccess, 3000);

          return { success: true, tx_hash: hash, status };
        } catch (err) {
          try { sessionStorage.removeItem(PENDING_TX_KEY); } catch { /* */ }
          const message = err instanceof Error ? err.message : 'Transaction rejected';
          setRegistrationStep('idle');
          return { success: false, error: message };
        }
      }

      return { success: false, error: `Unknown client tool: ${invocation.name}` };
    },
  });

  useEffect(() => {
    registerBridge({
      sendPrompt: (text: string) => sendUserMessage({ text }),
      sendAction: (action: { type: string; payload?: Record<string, unknown> }) => sendCustomAction(action),
    });
  }, [registerBridge, sendUserMessage, sendCustomAction]);

  const hasSentResumeRef = useRef(false);
  useEffect(() => {
    if (pendingTxResume && savedThreadId && !hasSentResumeRef.current) {
      hasSentResumeRef.current = true;
      const t = setTimeout(() => {
        sendUserMessage({
          text: `I just signed the transaction in my wallet and returned. Please verify whether the operation (${pendingTxResume}) completed successfully on-chain.`,
        });
        if (onTransactionSuccess) setTimeout(onTransactionSuccess, 3000);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [pendingTxResume, savedThreadId, sendUserMessage, onTransactionSuccess]);

  const handleCountdownComplete = useCallback(() => {
    setCountdown(null);
    sendCustomAction({ type: 'countdown_complete', payload: {} });
  }, [sendCustomAction]);

  const handleDismissSuccess = useCallback(() => {
    setRegistrationSuccess(null);
    setRegistrationStep('idle');
  }, []);

  return (
    <div className={`ens-chat-panel${isConversationActive ? ' ens-chat-panel--active' : ''}`}>
      <SigningOverlay visible={isSigningTx} />
      <RegistrationProgress step={registrationStep} />

      {countdown && (
        <div className="ens-chat-banner">
          <CountdownTimer waitSeconds={countdown.waitSeconds} onComplete={handleCountdownComplete} />
        </div>
      )}

      {registrationSuccess && (
        <div className="ens-chat-banner">
          <RegistrationSuccess name={registrationSuccess.name} onDismiss={handleDismissSuccess} />
        </div>
      )}

      <ChatKit control={control} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
