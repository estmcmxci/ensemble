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

## Skills

Reusable workflow definitions in `skills/`. Each skill is a `SKILL.md` file that defines inputs, steps, verification, and edge cases — designed for both humans and AI agents.

```
skills/
├── ens-resolve/     Resolve ENS names, addresses, and text records
├── ens-register/    Register a new .eth name (commit-reveal)
├── ens-validate/    Validate text record keys (ENSIP-5) and avatar URIs (ENSIP-12)
├── build/           Compile the CLI to a production binary
├── dev/             Run the CLI from TypeScript source
├── lint-format/     Lint and auto-format with Biome
└── release-prep/    Prepare a versioned release with full verification
```

### ENS Operations

| Skill | Description | Make target |
|-------|-------------|-------------|
| **ens-resolve** | Name → address, address → name, text record queries | `make ens-resolve` |
| **ens-register** | Register a new `.eth` name on mainnet or sepolia | `make ens-register` |
| **ens-validate** | Validate ENSIP-5 keys and ENSIP-12 avatar URIs | `make ens-validate` |

### Development Workflow

| Skill | Description | Make target |
|-------|-------------|-------------|
| **dev** | Run the CLI directly from source (no compile step) | `make dev` |
| **build** | Fresh compile → `dist/index.js` with shebang | `make build` |
| **lint-format** | Biome lint + format with auto-fix | `make lint-format` |
| **release-prep** | Version bump, lint, build, smoke test, checklist | `make release-prep` |

Every skill has a corresponding `make` target. Run `make help` to list them all.

## Configuration

Copy `.env.example` to `.env` and fill in your values. See the example file for all options.
