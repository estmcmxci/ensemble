# ensemble

ENS name management suite — a CLI, an agent API, and a chat frontend.

**Live at [chat-ens.vercel.app](https://chat-ens.vercel.app)**

## Architecture

```
ensemble/
├── cli/                 ENS CLI — resolve, register, transfer, edit records
├── ens-agent-api/       Cloudflare Worker — on-chain ENS reads & writes
├── ens-agent/
│   ├── backend/         Python agent — OpenAI-powered chat + ENS tools
│   └── frontend/        React + ChatKit UI (Vercel deployment)
├── skills/              Reusable skill definitions (SKILL.md per workflow)
├── scripts/             Shell scripts invoked by skills
├── context/             ENS reference documentation
├── Makefile             Task runner — all skills have a make target
└── WORKFLOWS.md         Index of all skills with routing logic
```

## Quick Start

```bash
# First-time setup
make bootstrap

# Build the CLI
make build

# Resolve an ENS name
make ens-resolve NAME=vitalik.eth NETWORK=mainnet

# Run CLI in dev mode
make dev ARGS="profile vitalik.eth --network mainnet"
```

## Services

### CLI (`cli/`)

TypeScript CLI for direct ENS operations. Read-only commands work without a key; writes require `ENS_PRIVATE_KEY` or a Ledger (`--ledger`).

| Command     | Description                          |
|-------------|--------------------------------------|
| `resolve`   | Name → address or address → name     |
| `profile`   | Full ENS profile with all records    |
| `available` | Check if a name is available         |
| `list`      | List names owned by an address       |
| `register`  | Register a new name (commit-reveal)  |
| `verify`    | Verify records are set correctly     |
| `edit`      | Edit text, address, or primary records |
| `name`      | Assign ENS name to a smart contract  |

### Agent API (`ens-agent-api/`)

Cloudflare Worker that handles on-chain ENS reads and writes — registration, transfers, record updates, subname creation.

### Chat Agent (`ens-agent/`)

- **Backend** — Python agent with OpenAI tool-calling and ENS operation tools
- **Frontend** — React app with ChatKit integration, wallet connection, and signing overlays

## Configuration

Copy `.env.example` to `.env` and fill in your values. See the example file for all options.
