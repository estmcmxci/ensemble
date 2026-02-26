#!/usr/bin/env -S node --no-deprecation
import "dotenv/config";
/**
 * ENS CLI
 *
 * A CLI for managing ENS names on Ethereum Mainnet and Sepolia.
 * Based on the basenames-cli architecture with ENSNode integration.
 *
 * Usage:
 *   ens resolve <name|address>
 *   ens profile <name|address>
 *   ens available <name>
 *   ens register <name> --owner <address>
 *   ens list <address>
 *   ens verify <name>
 *   ens name <contract-address> <name>
 *   ens edit txt <name> <key> <value>
 *   ens edit address <name> <address>
 *   ens edit primary <name>
 *   ens namehash <name>
 *   ens labelhash <label>
 *   ens resolver <name>
 *   ens deployments
 */

import {
	binary,
	command,
	flag,
	option,
	optional,
	positional,
	run,
	string,
	subcommands,
	multioption,
	array,
} from "cmd-ts";
import {
	resolve as resolveCmd,
	profile as profileCmd,
	available as availableCmd,
	register as registerCmd,
	list as listCmd,
	verify as verifyCmd,
	setTxt as setTxtCmd,
	setAddress as setAddressCmd,
	setPrimary as setPrimaryCmd,
	getNamehash,
	getLabelHash,
	getResolverAddress,
	getDeployments,
	nameContract as nameContractCmd,
	renew as renewCmd,
	transfer as transferCmd,
} from "./commands";
import { stopSpinner } from "./utils/spinner";

// =============================================================================
// Read Commands
// =============================================================================

const resolve = command({
	name: "resolve",
	description: "Resolve an ENS name to an address or vice versa",
	args: {
		input: positional({
			type: string,
			description: "ENS name or address to resolve",
		}),
		txt: option({
			type: optional(string),
			description: "Query a specific text record",
			long: "txt",
			short: "t",
		}),
		contenthash: flag({
			long: "contenthash",
			short: "c",
			description: "Fetch the content hash",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description: "Specify a custom resolver address",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.input) {
			console.log("Usage: ens resolve <name|address>");
			return;
		}
		await resolveCmd(args);
	},
});

const profile = command({
	name: "profile",
	description: "Display a complete profile for an ENS name",
	args: {
		input: positional({
			type: string,
			description: "ENS name or address to query",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description: "Specify a custom resolver address",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.input) {
			console.log("Usage: ens profile <name|address>");
			return;
		}
		await profileCmd(args);
	},
});

const available = command({
	name: "available",
	description: "Check if an ENS name is available for registration",
	args: {
		name: positional({
			type: string,
			description: "ENS name to check",
		}),
		noPrice: flag({
			long: "no-price",
			description: "Skip showing registration price",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens available <name>");
			return;
		}
		await availableCmd({
			name: args.name,
			showPrice: !args.noPrice,
			network: args.network,
		});
	},
});

const list = command({
	name: "list",
	description: "List all ENS names owned by an address",
	args: {
		address: positional({
			type: string,
			description: "Address to query",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.address) {
			console.log("Usage: ens list <address>");
			return;
		}
		await listCmd(args);
	},
});

// =============================================================================
// Write Commands
// =============================================================================

const register = command({
	name: "register",
	description:
		"Register a new ENS name (commit-reveal process)",
	args: {
		name: positional({
			type: string,
			description: "ENS name to register (without .eth)",
		}),
		owner: option({
			type: optional(string),
			long: "owner",
			short: "o",
			description:
				"Owner address for the name (defaults to signer from ENS_PRIVATE_KEY)",
		}),
		address: option({
			type: optional(string),
			long: "address",
			short: "a",
			description: "Address record to set (defaults to owner)",
		}),
		duration: option({
			type: optional(string),
			long: "duration",
			short: "d",
			description:
				"Registration duration (e.g., 1y, 6m, 30d). Default: 1y",
		}),
		txt: multioption({
			type: array(string),
			long: "txt",
			short: "t",
			description:
				"Text record to set (format: key=value). Can be used multiple times.",
		}),
		primary: flag({
			long: "primary",
			short: "p",
			description: "Set as primary name for owner",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log(
				"Usage: ens register <name> [--owner <address>] [options]",
			);
			console.log("\nOptions:");
			console.log(
				"  --owner, -o       Owner address (defaults to signer from ENS_PRIVATE_KEY)",
			);
			console.log("  --address, -a     Address record to set");
			console.log("  --duration, -d    Duration (1y, 6m, 30d)");
			console.log("  --txt, -t         Text record (key=value)");
			console.log("  --primary, -p     Set as primary name");
			console.log(
				"  --network, -n     Network (mainnet, sepolia)",
			);
			console.log(
				"  --ledger, -l      Use Ledger hardware wallet",
			);
			console.log(
				"  --account-index   Ledger account index (default: 0)",
			);
			return;
		}
		await registerCmd({
			...args,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const verify = command({
	name: "verify",
	description:
		"Verify that records are correctly set for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "ENS name to verify",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens verify <name>");
			return;
		}
		await verifyCmd({ name: args.name, network: args.network });
	},
});

const renewName = command({
	name: "renew",
	description: "Renew an existing ENS name registration",
	args: {
		name: positional({
			type: string,
			description: "ENS name to renew",
		}),
		duration: option({
			type: optional(string),
			long: "duration",
			short: "d",
			description:
				"Renewal duration (e.g., 1y, 6m, 30d). Default: 1y",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log(
				"Usage: ens renew <name> [--duration 1y] [options]",
			);
			return;
		}
		await renewCmd({
			...args,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const transferName = command({
	name: "transfer",
	description: "Transfer ownership of an ENS name",
	args: {
		name: positional({
			type: string,
			description: "ENS name to transfer",
		}),
		to: positional({
			type: string,
			description: "Recipient address",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.to) {
			console.log(
				"Usage: ens transfer <name> <to-address> [options]",
			);
			return;
		}
		await transferCmd({
			...args,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const name = command({
	name: "name",
	description: "Assign an ENS name to a smart contract",
	args: {
		contractAddress: positional({
			type: string,
			displayName: "contract-address",
			description: "Contract address to name",
		}),
		nameArg: positional({
			type: string,
			displayName: "name",
			description: "Name label (without parent domain)",
		}),
		parent: option({
			type: optional(string),
			long: "parent",
			short: "p",
			description:
				"Parent domain (defaults to eth)",
		}),
		noReverse: flag({
			long: "no-reverse",
			description: "Skip reverse resolution",
		}),
		checkCompatibility: flag({
			long: "check-compatibility",
			description:
				"Check if contract supports reverse resolution",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.contractAddress || !args.nameArg) {
			console.log(
				"Usage: ens name <contract-address> <name> [options]",
			);
			console.log("\nOptions:");
			console.log(
				"  --parent, -p            Parent domain (defaults to eth)",
			);
			console.log(
				"  --no-reverse            Skip reverse resolution",
			);
			console.log(
				"  --check-compatibility   Check contract compatibility",
			);
			console.log(
				"  --network, -n           Network (mainnet, sepolia)",
			);
			console.log(
				"  --ledger, -l            Use Ledger hardware wallet",
			);
			console.log(
				"  --account-index         Ledger account index (default: 0)",
			);
			return;
		}
		await nameContractCmd({
			contractAddress: args.contractAddress,
			name: args.nameArg,
			parent: args.parent,
			noReverse: args.noReverse,
			checkCompatibility: args.checkCompatibility,
			network: args.network,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

// =============================================================================
// Edit Subcommands
// =============================================================================

const editTxt = command({
	name: "txt",
	description:
		"Set or clear a text record (use 'null' to clear)",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		key: positional({
			type: string,
			description:
				"Text record key (e.g., com.github, description)",
		}),
		value: positional({
			type: string,
			description: "Value to set (use 'null' to clear)",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (auto-detected if not provided)",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.key || args.value === undefined) {
			console.log("Usage: ens edit txt <name> <key> <value>");
			return;
		}
		await setTxtCmd({
			name: args.name,
			key: args.key,
			value: args.value,
			resolverAddress: args.resolverAddress,
			network: args.network,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const editAddress = command({
	name: "address",
	description: "Set the address record for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		value: positional({
			type: string,
			description: "Address to set",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (auto-detected if not provided)",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.value) {
			console.log(
				"Usage: ens edit address <name> <address>",
			);
			return;
		}
		await setAddressCmd({
			name: args.name,
			value: args.value,
			resolverAddress: args.resolverAddress,
			network: args.network,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const editPrimary = command({
	name: "primary",
	description:
		"Set the primary name for your address (reverse record)",
	args: {
		name: positional({
			type: string,
			description: "ENS name to set as primary",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
		ledger: flag({
			long: "ledger",
			short: "l",
			description: "Use Ledger hardware wallet for signing",
		}),
		accountIndex: option({
			type: optional(string),
			long: "account-index",
			description: "Ledger account index (default: 0)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens edit primary <name>");
			return;
		}
		await setPrimaryCmd({
			name: args.name,
			network: args.network,
			useLedger: args.ledger,
			accountIndex: args.accountIndex
				? parseInt(args.accountIndex, 10)
				: 0,
		});
	},
});

const edit = subcommands({
	name: "edit",
	description: "Edit records for an ENS name",
	cmds: {
		txt: editTxt,
		address: editAddress,
		primary: editPrimary,
	},
});

// =============================================================================
// Utility Commands
// =============================================================================

const namehash = command({
	name: "namehash",
	description: "Get the namehash for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "Name to hash",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens namehash <name>");
			return;
		}
		await getNamehash({
			name: args.name,
			network: args.network,
		});
	},
});

const labelhash = command({
	name: "labelhash",
	description: "Get the labelhash for a single label",
	args: {
		name: positional({
			type: string,
			description: "Label to hash",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens labelhash <label>");
			return;
		}
		await getLabelHash(args);
	},
});

const resolver = command({
	name: "resolver",
	description: "Get the resolver address for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		network: option({
			type: optional(string),
			long: "network",
			short: "n",
			description: "Network to use (mainnet, sepolia)",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Usage: ens resolver <name>");
			return;
		}
		await getResolverAddress({
			name: args.name,
			network: args.network,
		});
	},
});

const deployments = command({
	name: "deployments",
	description: "Display ENS contract addresses",
	args: {},
	handler: () => {
		getDeployments();
	},
});

// =============================================================================
// Main CLI
// =============================================================================

const cli = subcommands({
	name: "ens",
	description: `
  _____ _   _ ____
 | ____| \\ | / ___|
 |  _| |  \\| \\___ \\
 | |___| |\\  |___) |
 |_____|_| \\_|____/

  CLI for managing ENS names on Ethereum

  Environment Variables:
    ENS_PRIVATE_KEY  - Private key for write operations
    ETH_RPC_URL      - Custom RPC URL (default: https://sepolia.drpc.org)
    ENS_NETWORK      - Network to use (mainnet, sepolia)

  Examples:
    ens available myname
    ens register myname --owner 0x1234...
    ens resolve vitalik.eth
    ens profile vitalik.eth
    ens edit txt myname description "My ENS name"
    ens edit primary myname
  `,
	version: "0.1.0",
	cmds: {
		// Read commands
		resolve,
		profile,
		available,
		list,
		// Write commands
		register,
		renew: renewName,
		transfer: transferName,
		verify,
		name,
		edit,
		// Utility commands
		namehash,
		labelhash,
		resolver,
		deployments,
	},
});

// =============================================================================
// Entry Point
// =============================================================================

async function main() {
	// Check if this is a help request
	const isHelpRequest =
		process.argv.includes("--help") ||
		process.argv.includes("-h") ||
		process.argv.length === 2; // Just "ens" with no subcommand

	// Cleanup function to ensure spinner is stopped before exit
	const cleanup = () => {
		try {
			stopSpinner();
		} catch {
			// Ignore errors during cleanup
		}
	};

	// Ensure cleanup on exit
	process.on("exit", cleanup);
	process.on("SIGINT", () => {
		cleanup();
		process.exit(0);
	});
	process.on("SIGTERM", () => {
		cleanup();
		process.exit(0);
	});

	try {
		await run(binary(cli), process.argv);
		// Explicitly exit with success code on successful completion
		cleanup();
		process.exit(0);
	} catch (error) {
		const e = error as Error;
		cleanup();
		// cmd-ts may throw when showing help - treat as success
		if (
			isHelpRequest ||
			e.message.includes("subcommand") ||
			e.message.includes("help")
		) {
			process.exit(0);
			return;
		}
		console.error("Error:", e.message);
		process.exit(1);
	}
}

main();
