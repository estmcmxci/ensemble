import { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';
import { ENSembleClient } from './client/api';
import type { ENSembleConfig } from './types';

interface ENSembleContextValue {
  config: ENSembleConfig;
  client: ENSembleClient;
}

const ENSembleContext = createContext<ENSembleContextValue | null>(null);

export function useENSembleContext(): ENSembleContextValue {
  const ctx = useContext(ENSembleContext);
  if (!ctx) {
    throw new Error('useENSembleContext must be used within <ENSembleProvider>');
  }
  return ctx;
}

export interface ENSembleProviderProps extends ENSembleConfig {
  children: ReactNode;
}

export function ENSembleProvider({
  children,
  apiUrl,
  apiKey,
  features,
}: ENSembleProviderProps): JSX.Element {
  const value = useMemo<ENSembleContextValue>(
    () => ({
      config: { apiUrl, apiKey, features },
      client: new ENSembleClient(apiUrl, apiKey),
    }),
    [apiUrl, apiKey, features],
  );

  return (
    <ENSembleContext.Provider value={value}>
      {children}
    </ENSembleContext.Provider>
  );
}
