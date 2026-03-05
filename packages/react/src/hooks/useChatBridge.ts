import { createContext, useContext, useCallback, type MutableRefObject } from 'react';

export interface ChatBridgeMethods {
  sendPrompt: (text: string) => void;
  sendAction: (action: { type: string; payload?: Record<string, unknown> }) => void;
}

export const ChatBridgeContext = createContext<MutableRefObject<ChatBridgeMethods | null>>({
  current: null,
} as MutableRefObject<ChatBridgeMethods | null>);

export function useChatBridgeRegister(): (methods: ChatBridgeMethods) => void {
  const ref = useContext(ChatBridgeContext);
  return useCallback(
    (methods: ChatBridgeMethods) => {
      ref.current = methods;
    },
    [ref],
  );
}

export interface UseChatBridgeReturn {
  sendPrompt: (text: string) => void;
  sendAction: (action: { type: string; payload?: Record<string, unknown> }) => void;
}

export function useChatBridge(): UseChatBridgeReturn {
  const ref = useContext(ChatBridgeContext);
  const sendPrompt = useCallback(
    (text: string) => ref.current?.sendPrompt(text),
    [ref],
  );
  const sendAction = useCallback(
    (action: { type: string; payload?: Record<string, unknown> }) => ref.current?.sendAction(action),
    [ref],
  );
  return { sendPrompt, sendAction };
}
