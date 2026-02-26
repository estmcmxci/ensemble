# Skill: dev

- **name:** dev
- **version:** 0.1.0
- **description:**
  - **use when:** you want to run the CLI directly from TypeScript source without compiling, for development or quick testing.
  - **don't use when:** you need a production binary (use `build`), or you're preparing a release (use `release-prep`).
  - **outputs + success criteria:** CLI runs, shows banner, and responds to `--help`. No artifacts produced (interactive use).

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `ARGS` | no | `--help` | CLI arguments to pass through |

### Environment
- Node.js >= 18
- `node_modules/` installed
- `.env` file with at least `ETH_RPC_URL_SEPOLIA` for network commands

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| (none) | — | Interactive; output goes to stdout |

## Steps

1. Ensure dependencies installed: `npm install`
2. Run: `npx tsx cli/index.ts $(ARGS)`
3. Observe output — no artifact collection (dev is interactive)

## Verification

```bash
npx tsx cli/index.ts --help 2>&1 | grep -q "ENS" && echo "OK"
```

## Edge Cases

- **Missing .env:** read-only commands (resolve, profile, available) work without private key. Write commands will fail with a clear error.
- **Network errors:** commands that hit RPC will fail if URL is unreachable — check `.env` values.

## Security

- May access Ethereum RPC endpoints (see `.env.example` for allowlisted domains).
- Private key loaded from `.env` — never paste into commands directly.
- Assume RPC responses are untrusted; viem validates them.
