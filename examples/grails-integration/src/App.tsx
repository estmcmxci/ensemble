import '@rainbow-me/rainbowkit/styles.css';
import '@ensemble-ens/react/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, ConnectButton, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { ENSemble } from '@ensemble-ens/react';
import { mainnet, sepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'ENSemble Example',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia, mainnet],
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div style={{ maxWidth: 460, margin: '40px auto', padding: '0 16px' }}>
            <h1 style={{ fontSize: 20, marginBottom: 16 }}>ENSemble Example</h1>
            <div style={{
              borderRadius: 18,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 700,
            }}>
              <ENSemble
                apiUrl="https://your-ens-api.workers.dev"
                connectButton={<ConnectButton />}
                chatApiUrl="/chatkit"
                chatDomainKey="domain_pk_69a088ac5ae88194b0dfe37e51828c3a0d073e803fd9ebfa"
              />
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
