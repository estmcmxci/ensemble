# ENSNode

ENSNode is a modern multichain indexer for the Ethereum Name Service (ENS), designed to provide enhanced indexing capabilities beyond the legacy ENS Subgraph. Built on [Ponder](https://ponder.sh), it offers 10x faster indexing, supports multichain ENS namespaces (including Basenames, Lineanames, 3DNS), and provides a unified GraphQL API compatible with the ENS Subgraph. ENSNode enables queries that are impossible on-chain, such as listing all domains owned by an address, while preparing for ENSv2 and Namechain.

The ENSNode suite consists of several interconnected services: **ENSIndexer** (Ponder-powered blockchain indexer), **ENSApi** (horizontally scalable API server), **ENSRainbow** (label healing service that recovers ENS labels from labelhashes), and **ENSAdmin** (dashboard for monitoring). These components work together to provide a complete ENS indexing solution that can be self-hosted via Docker or deployed to cloud platforms like Render.

## ENSNode SDK - Client Initialization

The ENSNode SDK provides a TypeScript client for interacting with ENSNode services, supporting resolution APIs, indexing status, and configuration endpoints.

```typescript
import { ENSNodeClient, evmChainIdToCoinType } from "@ensnode/ensnode-sdk";
import { mainnet, base } from "viem/chains";

// Default client (uses hosted mainnet instance)
const client = new ENSNodeClient();

// Custom instance
const customClient = new ENSNodeClient({
  url: new URL("https://api.alpha.ensnode.io"),
});
```

## ENSNode SDK - Records Resolution (Forward Resolution)

Resolves ENS name records including addresses and text records. Supports Protocol Acceleration for indexed names, returning normalized names guaranteed to meet ENS standards.

```typescript
import { ENSNodeClient, evmChainIdToCoinType } from "@ensnode/ensnode-sdk";
import { mainnet, base } from "viem/chains";

const client = new ENSNodeClient();

// Resolve multiple record types for an ENS name
const { records } = await client.resolveRecords("greg.base.eth", {
  addresses: [evmChainIdToCoinType(mainnet.id), evmChainIdToCoinType(base.id)],
  texts: ["avatar", "com.twitter", "description"],
});

console.log(records);
// {
//   "addresses": {
//     "60": "0x179A862703a4adfb29896552DF9e307980D19285",
//     "2147492101": "0x179A862703a4adfb29896552DF9e307980D19285"
//   },
//   "texts": {
//     "avatar": "https://example.com/avatar.png",
//     "com.twitter": "gregskril",
//     "description": "Building on ENS"
//   }
// }

// With Protocol Acceleration and tracing
const result = await client.resolveRecords("vitalik.eth", {
  addresses: [60],
  texts: ["avatar"]
}, { accelerate: true, trace: true });
```

## ENSNode SDK - Primary Name Resolution (Reverse Resolution)

Resolves the primary ENS name for an Ethereum address on a specific chain, implementing ENSIP-19 Multichain Primary Names.

```typescript
import { ENSNodeClient, DEFAULT_EVM_CHAIN_ID } from "@ensnode/ensnode-sdk";
import { mainnet, base } from "viem/chains";

const client = new ENSNodeClient();

// Resolve primary name on Ethereum Mainnet
const { name } = await client.resolvePrimaryName(
  "0x179A862703a4adfb29896552DF9e307980D19285",
  mainnet.id
);
console.log(name); // "gregskril.eth"

// Resolve primary name on Base
const baseResult = await client.resolvePrimaryName(
  "0x179A862703a4adfb29896552DF9e307980D19285",
  base.id
);
console.log(baseResult.name); // "greg.base.eth"

// Resolve default primary name across all chains
const defaultResult = await client.resolvePrimaryName(
  "0x179A862703a4adfb29896552DF9e307980D19285",
  DEFAULT_EVM_CHAIN_ID
);
console.log(defaultResult.name); // "gregskril.eth"
```

## ENSNode SDK - Multichain Primary Names Resolution

Resolves primary names for an address across multiple ENSIP-19 supported chains in a single request.

```typescript
import { ENSNodeClient } from "@ensnode/ensnode-sdk";
import { mainnet, base } from "viem/chains";

const client = new ENSNodeClient();

// Resolve primary names across all supported chains
const { names } = await client.resolvePrimaryNames(
  "0x179A862703a4adfb29896552DF9e307980D19285"
);

console.log(names);
// {
//   "1": "gregskril.eth",      // Mainnet (default)
//   "10": "gregskril.eth",     // Optimism (default fallback)
//   "8453": "greg.base.eth",   // Base (chain-specific)
//   "42161": "gregskril.eth",  // Arbitrum (default fallback)
//   "59144": "gregskril.eth",  // Linea (default fallback)
//   "534352": "gregskril.eth"  // Scroll (default fallback)
// }

// Resolve for specific chains only
const { names: specificNames } = await client.resolvePrimaryNames(
  "0x179A862703a4adfb29896552DF9e307980D19285",
  { chainIds: [mainnet.id, base.id], accelerate: true }
);
```

## ENSNode SDK - Configuration and Indexing Status APIs

Fetch ENSNode instance configuration and monitor multichain indexing progress for building dashboards and health checks.

```typescript
import { ENSNodeClient } from "@ensnode/ensnode-sdk";

const client = new ENSNodeClient();

// Fetch ENSNode configuration
const config = await client.config();
console.log(config);
// {
//   "indexedChainIds": [1, 8453, 59144, 10, 42161, 534352],
//   "namespace": "mainnet",
//   "plugins": ["subgraph", "basenames", "lineanames", "threedns"],
//   "versionInfo": { "nodejs": "22.18.0", "ponder": "0.11.43", ... }
// }

// Fetch indexing status across all chains
const status = await client.indexingStatus();
console.log(status.realtimeProjection.worstCaseDistance); // seconds behind realtime
console.log(status.realtimeProjection.snapshot.omnichainSnapshot.omnichainStatus);
// "omnichain-following" or "omnichain-backfill"
```

## Subgraph GraphQL API

ENSNode exposes a subgraph-compatible GraphQL endpoint at `/subgraph` for querying domains, registrations, resolvers, and more.

```bash
# Query recently created domains
curl -X POST https://api.alpha.ensnode.io/subgraph \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ domains(orderBy: createdAt, orderDirection: desc, first: 5) { name expiryDate owner { id } } }"
  }'

# Response:
# {
#   "data": {
#     "domains": [
#       { "name": "newname.eth", "expiryDate": "1758170255", "owner": { "id": "0x..." } },
#       ...
#     ]
#   }
# }

# Query domains owned by an address
curl -X POST https://api.alpha.ensnode.io/subgraph \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetDomains($owner: String!) { domains(where: { owner: $owner }) { name createdAt expiryDate } }",
    "variables": { "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }
  }'
```

## REST API Endpoints

ENSNode provides REST APIs for resolution, configuration, indexing status, and realtime monitoring.

```bash
# Forward Resolution - Get records for an ENS name
curl "https://api.alpha.ensnode.io/api/resolve/records/vitalik.eth?addresses=60&texts=avatar,com.twitter"

# Reverse Resolution - Get primary name for an address on a specific chain
curl "https://api.alpha.ensnode.io/api/resolve/primary-name/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/1"

# Multichain Primary Names - Get primary names across all chains
curl "https://api.alpha.ensnode.io/api/resolve/primary-names/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

# Configuration endpoint
curl "https://api.alpha.ensnode.io/api/config"

# Indexing status endpoint
curl "https://api.alpha.ensnode.io/api/indexing-status"

# Realtime monitoring (returns 200 if within distance, 503 otherwise)
curl "https://api.alpha.ensnode.io/amirealtime?maxWorstCaseDistance=60"

# Registrar actions (registration/renewal history)
curl "https://api.alpha.ensnode.io/api/registrar-actions?limit=10"

# Health check
curl "https://api.alpha.ensnode.io/health"
```

## ENSRainbow SDK - Label Healing

ENSRainbow heals unknown ENS labels by recovering the original label from its labelhash. Essential for displaying human-readable names from on-chain data.

```typescript
import { EnsRainbowApiClient } from "@ensnode/ensrainbow-sdk";

// Default client (uses hosted instance)
const client = new EnsRainbowApiClient();

// Custom instance
const customClient = new EnsRainbowApiClient({
  endpointUrl: new URL("https://api.ensrainbow.io"),
  cacheCapacity: 1000,
});

// Heal a labelhash to its original label
const response = await client.heal(
  "0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc"
);
console.log(response);
// { status: "success", label: "vitalik" }

// Handle not found case
const notFound = await client.heal(
  "0xf64dc17ae2e2b9b16dbcb8cb05f35a2e6080a5ff1dc53ac0bc48f0e79111f264"
);
console.log(notFound);
// { status: "error", error: "Label not found", errorCode: 404 }

// Get count of healable labels
const count = await client.count();
console.log(count);
// { status: "success", count: 133856894, timestamp: "2024-01-30T11:18:56Z" }

// Health check
const health = await client.health();
// { status: "ok" }

// Get version info
const version = await client.version();
// { status: "success", versionInfo: { version: "1.5.1", dbSchemaVersion: 3, labelSet: {...} } }
```

## ENSNode React Hooks

React hooks for ENSNode with automatic caching, loading states, and error handling via TanStack Query integration.

```tsx
import { ENSNodeProvider, createConfig, useRecords, usePrimaryName, usePrimaryNames } from "@ensnode/ensnode-react";
import { mainnet } from "viem/chains";

// Setup provider (TanStack Query handled automatically)
const config = createConfig({ url: "https://api.alpha.ensnode.io" });

function App() {
  return (
    <ENSNodeProvider config={config}>
      <ENSProfile />
    </ENSNodeProvider>
  );
}

// Records resolution hook
function ENSRecords() {
  const { data, isLoading, error } = useRecords({
    name: "vitalik.eth",
    selection: {
      addresses: [60],
      texts: ["avatar", "com.twitter"],
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>ETH Address: {data?.records.addresses?.["60"]}</p>
      <p>Avatar: {data?.records.texts?.avatar}</p>
    </div>
  );
}

// Primary name resolution hook
function PrimaryName({ address }: { address: string }) {
  const { data, isLoading } = usePrimaryName({
    address,
    chainId: mainnet.id,
    accelerate: true,
  });

  return <span>{isLoading ? "Loading..." : data?.name ?? "No name"}</span>;
}

// Multichain primary names hook
function MultichainNames({ address }: { address: string }) {
  const { data } = usePrimaryNames({ address });

  return (
    <ul>
      {Object.entries(data?.names ?? {}).map(([chainId, name]) => (
        <li key={chainId}>Chain {chainId}: {name}</li>
      ))}
    </ul>
  );
}
```

## Integration with ENSjs

Configure ENSjs to use ENSNode instead of the default ENS Subgraph for enhanced multichain support.

```typescript
import { http, createClient } from "viem";
import { mainnet } from "viem/chains";
import { addEnsContracts } from "@ensdomains/ensjs";
import { getNamesForAddress, getSubgraphRecords } from "@ensdomains/ensjs/subgraph";

// Configure mainnet with ENSNode subgraph endpoint
const mainnetWithEns = addEnsContracts(mainnet);
const chain = {
  ...mainnetWithEns,
  subgraphs: {
    ens: {
      // Use ENSNode alpha instance (mainnet, Base, Linea names)
      url: "https://api.alpha.ensnode.io/subgraph",
      // Or use local instance
      // url: "http://localhost:4334/subgraph",
    },
  },
};

const client = createClient({
  chain,
  transport: http(),
});

// Now all ENSjs subgraph queries use ENSNode
const names = await getNamesForAddress(client, {
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
});
```

## Docker Deployment

Deploy the complete ENSNode suite using Docker Compose with ENSIndexer, ENSApi, ENSRainbow, ENSAdmin, and PostgreSQL.

```yaml
# docker-compose.yml
services:
  ensindexer:
    image: ghcr.io/namehash/ensnode/ensindexer:latest
    ports:
      - "42069:42069"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/postgres
      ENSRAINBOW_URL: http://ensrainbow:3223
      ENSINDEXER_URL: http://ensindexer:42069
    env_file:
      - ./apps/ensindexer/.env.local
    depends_on:
      - ensrainbow
      - postgres

  ensapi:
    image: ghcr.io/namehash/ensnode/ensapi:latest
    ports:
      - "4334:4334"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/postgres
      ENSINDEXER_URL: http://ensindexer:42069
    env_file:
      - ./apps/ensapi/.env.local
    depends_on:
      - ensindexer

  ensrainbow:
    image: ghcr.io/namehash/ensnode/ensrainbow:latest
    ports:
      - "3223:3223"
    volumes:
      - ensrainbow_data:/app/apps/ensrainbow/data

  ensadmin:
    image: ghcr.io/namehash/ensnode/ensadmin:latest
    ports:
      - "4173:4173"
    environment:
      NEXT_PUBLIC_SERVER_CONNECTION_LIBRARY: http://localhost:4334
    depends_on:
      - ensapi

  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
  ensrainbow_data:
```

```bash
# Start all services
docker compose up -d

# Check service health
curl http://localhost:4334/health
curl http://localhost:3223/health

# Access ENSAdmin dashboard
open http://localhost:4173
```

## Summary

ENSNode serves as the foundation for modern ENS integrations, enabling applications to query ENS data across multiple chains through a unified API. The primary use cases include building ENS-enabled applications with multichain support, implementing address-to-name resolution for wallets and dApps, creating analytics dashboards for ENS registrations and renewals, and self-hosting ENS infrastructure for custom queries and guaranteed uptime. The SDK and React hooks provide seamless integration paths for both server-side and client-side applications.

For production deployments, teams can choose between using NameHash's hosted instances (api.alpha.ensnode.io) for quick integration or deploying their own ENSNode infrastructure via Docker or Terraform for complete control over indexing behavior and data. The modular architecture allows enabling specific plugins (subgraph, basenames, lineanames, threedns, protocol-acceleration) based on indexing requirements, while the PostgreSQL backend enables custom SQL queries and joins for advanced analytics beyond the GraphQL API.

