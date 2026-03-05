import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'wagmi',
    'wagmi/actions',
    'viem',
    '@tanstack/react-query',
    '@rainbow-me/rainbowkit',
    '@openai/chatkit-react',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
