# WORKFLOWS.md — Routing Map

> Index of available skills. Use this to find the right procedure for a task.

## Skills

| Skill | Use When | Don't Use When | Command |
|-------|----------|----------------|---------|
| `build` | Need a fresh compiled binary in `dist/` | Just running dev mode | `make build` |
| `dev` | Running CLI from source for development/testing | Need production binary | `make dev ARGS="resolve vitalik.eth"` |
| `lint-format` | Lint and auto-format source before committing | Want check-only (no fixes) | `make lint-format` |
| `release-prep` | Preparing a new version for publish | Just building locally | `make release-prep VERSION=0.2.0` |
| `ens-resolve` | Looking up an ENS name or address | Need full profile or want to edit | `make ens-resolve NAME=vitalik.eth` |
| `ens-register` | Registering a new ENS name | Name already exists; just editing records | `make ens-register NAME=myname` |
| `ens-validate` | Validating text record keys (ENSIP-5) or avatar URIs (ENSIP-12) | Just reading/writing without validation | Integrated into `edit`, `profile`, `resolve` |

## Artifact Outputs

All skill outputs land in `artifacts/<skill_name>/`. See each `skills/<name>/SKILL.md` for exact paths and descriptions.

| Skill | Artifacts |
|-------|-----------|
| `build` | `artifacts/build/manifest.txt` |
| `lint-format` | `artifacts/lint-format/lint-report.txt`, `format-report.txt` |
| `release-prep` | `artifacts/release-prep/checklist.md`, `build-manifest.txt` |
| `ens-resolve` | `artifacts/ens-resolve/resolve-log.txt` |
| `ens-register` | `artifacts/ens-register/register-log.txt` |
| `ens-validate` | (integrated into edit/profile/resolve — no separate artifacts) |

## Quick Start

```bash
# First-time setup
make bootstrap

# Build the CLI
make build

# Resolve an ENS name (mainnet)
make ens-resolve NAME=vitalik.eth NETWORK=mainnet

# Register a name on sepolia testnet
make ens-register NAME=myname NETWORK=sepolia

# Lint + format source
make lint-format

# Prepare a release
make release-prep VERSION=0.2.0
```
