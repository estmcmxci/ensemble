/**
 * Viem Client Setup for ENS CLI
 *
 * Configures public and wallet clients for Ethereum Mainnet and Sepolia
 * with ENSNode subgraph integration for indexed queries.
 */

import {
	createPublicClient,
	createWalletClient,
	http,
	type PublicClient,
	type WalletClient,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { getNetworkConfig } from "../config/deployments";
import { getLedgerAccount, getLedgerAddress, closeLedger } from "./ledger";

/**
 * Create a public client for read operations
 * Configured with ENSNode subgraph for indexed queries
 */
export function createEnsPublicClient(network?: string): PublicClient {
	const config = getNetworkConfig(network);
	const chain = config.chainId === 1 ? mainnet : sepolia;

	// Support network-specific RPC URLs, fallback to generic ETH_RPC_URL, then default
	const net = network || process.env.ENS_NETWORK || "sepolia";
	const rpcUrl =
		(net === "mainnet" && process.env.ETH_RPC_URL_MAINNET) ||
		(net === "sepolia" && process.env.ETH_RPC_URL_SEPOLIA) ||
		process.env.ETH_RPC_URL ||
		config.rpcUrl;

	return createPublicClient({
		chain: {
			...chain,
			// Add ENSNode subgraph for indexed queries
			subgraphs: { ens: { url: config.ensNodeSubgraph } },
		} as any,
		transport: http(rpcUrl),
	}) as PublicClient;
}

/**
 * Create a wallet client for write operations
 * Supports both private key (env var) and Ledger hardware wallet
 */
export async function createEnsWalletClient(
	network?: string,
	useLedger = false,
	accountIndex = 0,
): Promise<WalletClient | null> {
	const config = getNetworkConfig(network);
	const chain = config.chainId === 1 ? mainnet : sepolia;

	// Support network-specific RPC URLs, fallback to generic ETH_RPC_URL, then default
	const net = network || process.env.ENS_NETWORK || "sepolia";
	const rpcUrl =
		(net === "mainnet" && process.env.ETH_RPC_URL_MAINNET) ||
		(net === "sepolia" && process.env.ETH_RPC_URL_SEPOLIA) ||
		process.env.ETH_RPC_URL ||
		config.rpcUrl;

	if (useLedger) {
		const account = await getLedgerAccount(accountIndex);
		return createWalletClient({
			account,
			chain,
			transport: http(rpcUrl),
		});
	}

	// Existing private key flow
	const privateKey = process.env.ENS_PRIVATE_KEY;
	if (!privateKey) {
		return null;
	}

	const account = privateKeyToAccount(privateKey as `0x${string}`);
	return createWalletClient({
		account,
		chain,
		transport: http(rpcUrl),
	});
}

/**
 * Get the signer address from the configured private key
 */
export function getSignerAddress(): `0x${string}` | null {
	const privateKey = process.env.ENS_PRIVATE_KEY;
	if (!privateKey) return null;

	const account = privateKeyToAccount(privateKey as `0x${string}`);
	return account.address;
}

// Cache clients per network to avoid recreating them
const _publicClients: Map<string, PublicClient> = new Map();
const _walletClients: Map<string, WalletClient> = new Map();

export function getPublicClient(network?: string): PublicClient {
	const net = network || process.env.ENS_NETWORK || "sepolia";

	if (!_publicClients.has(net)) {
		_publicClients.set(net, createEnsPublicClient(net));
	}
	return _publicClients.get(net)!;
}

export async function getWalletClient(
	network?: string,
	useLedger = false,
	accountIndex = 0,
): Promise<WalletClient | null> {
	const net = network || process.env.ENS_NETWORK || "sepolia";

	// For Ledger, always create fresh client (no caching)
	if (useLedger) {
		return await createEnsWalletClient(net, true, accountIndex);
	}

	// For private key, use cached client
	if (!_walletClients.has(net)) {
		const client = await createEnsWalletClient(net);
		if (client) {
			_walletClients.set(net, client);
		} else {
			return null;
		}
	}
	return _walletClients.get(net) || null;
}

/**
 * Get signer address (async version for Ledger support)
 */
export async function getSignerAddressAsync(
	useLedger = false,
	accountIndex = 0,
): Promise<`0x${string}` | null> {
	if (useLedger) {
		return await getLedgerAddress(accountIndex);
	}
	return getSignerAddress();
}

// Re-export closeLedger for cleanup
export { closeLedger };
