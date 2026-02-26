# @ens/cli

A CLI for managing ENS names on Ethereum — resolve, register, edit records, and more.

## Structure

```
src/          TypeScript source (commands, utils, config)
skills/       Reusable skill definitions (SKILL.md per workflow)
scripts/      Shell scripts invoked by skills
artifacts/    Skill outputs (gitignored — review then discard)
Makefile      Task runner — all skills have a make target
WORKFLOWS.md  Index of all skills with routing logic
STATE.md      Rolling summary of project state
```

## Quick Start

```bash
# First-time setup
make bootstrap

# Build the CLI binary
make build

# Resolve an ENS name
make ens-resolve NAME=vitalik.eth NETWORK=mainnet

# Run in dev mode
make dev ARGS="profile vitalik.eth --network mainnet"
```

All outputs land in `artifacts/<skill>/`. See [WORKFLOWS.md](WORKFLOWS.md) for the full list of available skills and when to use each one.

## ENS Commands

| Command | Description |
|---------|-------------|
| `resolve` | Name → address or address → name |
| `profile` | Full ENS profile with all records |
| `available` | Check if a name is available |
| `list` | List names owned by an address |
| `register` | Register a new name (commit-reveal) |
| `verify` | Verify records are set correctly |
| `edit` | Edit text, address, or primary records |
| `name` | Assign ENS name to a smart contract |

## Configuration

Copy `.env.example` to `.env` and fill in your values. See the example file for all options.

Read-only commands work without a private key. Write commands require `ENS_PRIVATE_KEY` or a Ledger device (`--ledger`).
