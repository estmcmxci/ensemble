/**
 * ENS Contract Deployments
 *
 * Contract addresses for ENS on Ethereum Mainnet and Sepolia
 */

export type NetworkConfig = {
	chainId: number;
	parentDomain: string;
	registry: `0x${string}`;
	resolver: `0x${string}`;
	registrarController: `0x${string}`;
	baseRegistrar: `0x${string}`;
	nameWrapper: `0x${string}`;
	reverseRegistrar: `0x${string}`;
	universalResolver: `0x${string}`;
	ensNodeSubgraph: string;
	rpcUrl: string;
	explorerUrl: string;
};

export const ENS_DEPLOYMENTS: Record<string, NetworkConfig> = {
	mainnet: {
		chainId: 1,
		parentDomain: "eth",
		registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
		resolver: "0xF29100983E058B709F3D539b0c765937B804AC15",
		registrarController: "0x253553366Da8546fC250F225fe3d25d0C782303b",
		baseRegistrar: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
		nameWrapper: "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401",
		reverseRegistrar: "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb",
		universalResolver: "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe",
		ensNodeSubgraph: "https://api.alpha.ensnode.io/subgraph",
		rpcUrl: "https://eth.drpc.org",
		explorerUrl: "https://etherscan.io",
	},
	sepolia: {
		chainId: 11155111,
		parentDomain: "eth",
		registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
		resolver: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
		registrarController: "0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968",
		baseRegistrar: "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
		nameWrapper: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
		reverseRegistrar: "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6",
		universalResolver: "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe",
		ensNodeSubgraph: "https://api.alpha-sepolia.ensnode.io/subgraph",
		rpcUrl: "https://sepolia.drpc.org",
		explorerUrl: "https://sepolia.etherscan.io",
	},
};

// Default to Sepolia
export const DEFAULT_NETWORK = "sepolia";

export function getNetworkConfig(network?: string): NetworkConfig {
	const net = network || process.env.ENS_NETWORK || DEFAULT_NETWORK;
	const config = ENS_DEPLOYMENTS[net];
	if (!config) {
		throw new Error(
			`Unknown network: ${net}. Available: ${Object.keys(ENS_DEPLOYMENTS).join(", ")}`,
		);
	}
	return config;
}

/**
 * Get the coin type for ENS (always standard ETH coin type 60)
 */
export function getCoinType(): bigint {
	return 60n;
}
