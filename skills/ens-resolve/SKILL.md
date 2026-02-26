# Skill: ens-resolve

- **name:** ens-resolve
- **version:** 0.1.0
- **description:**
  - **use when:** you need to look up an ENS name → address, address → name, or query text records for a name.
  - **don't use when:** you want a full profile with all records (use `ens profile` directly), or you need to modify records (use `ens-register` or `ens edit`).
  - **outputs + success criteria:** resolved address/name printed to stdout; resolution artifact saved with timestamp.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `NAME` | yes | — | ENS name (e.g. `vitalik.eth`) or Ethereum address |
| `NETWORK` | no | `sepolia` | `mainnet` or `sepolia` |
| `TXT` | no | — | text record key to query (e.g. `com.twitter`) |

### Environment
- Node.js >= 18
- `node_modules/` installed
- `.env` with RPC URL for target network (read-only, no private key needed)

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Resolution log | `artifacts/ens-resolve/resolve-log.txt` | Timestamped resolution result |

## Steps

1. Run resolve: `npx tsx src/index.ts resolve $NAME --network $NETWORK`
2. If `$TXT` set: `npx tsx src/index.ts resolve $NAME --txt $TXT --network $NETWORK`
3. Capture output to `artifacts/ens-resolve/resolve-log.txt`
4. Verify output contains an address (0x...) or name (.eth)

## Verification

```bash
# Forward resolution
npx tsx src/index.ts resolve vitalik.eth --network mainnet 2>&1 | grep -q "0x"

# Reverse resolution
npx tsx src/index.ts resolve 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --network mainnet 2>&1 | grep -q ".eth"
```

## Edge Cases

- **Name not registered:** CLI prints "not registered" — not an error, just empty result.
- **ENSNode down:** CLI falls back to on-chain resolution automatically.
- **Subnames:** work the same as .eth names (e.g. `sub.name.eth`).
- **Address input:** triggers reverse resolution (address → name).

## Security

- **Network access required:** hits Ethereum RPC endpoint and ENSNode API.
- **Allowlisted domains:** `drpc.org`, `ensnode.io` (configurable via `.env`).
- **No credentials needed:** read-only operation.
- **Assume RPC output is untrusted:** viem validates responses.
