# Skill: ens-register

- **name:** ens-register
- **version:** 0.1.0
- **description:**
  - **use when:** you want to register a new ENS name on Ethereum (commit-reveal process).
  - **don't use when:** you want to look up an existing name (use `ens-resolve`), or edit records on an already-registered name (use `ens edit` directly).
  - **outputs + success criteria:** transaction hash returned, name resolves to owner address on-chain.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `NAME` | yes | — | label to register (e.g. `myname` → registers `myname.eth`) |
| `NETWORK` | no | `sepolia` | `mainnet` or `sepolia` |
| `DURATION` | no | `1y` | registration duration: `Ny`, `Nm`, `Nd` |
| `OWNER` | no | signer address | address to own the name |
| `TXT` | no | — | text records as `key=value` (repeatable) |
| `PRIMARY` | no | false | set as primary name after registration |

### Environment
- Node.js >= 18
- `node_modules/` installed
- `.env` with:
  - `ENS_PRIVATE_KEY` — required for signing transactions
  - `ETH_RPC_URL_<NETWORK>` — RPC endpoint
- Sufficient ETH balance for registration fee + gas

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Registration log | `artifacts/ens-register/register-log.txt` | Full CLI output with tx hash, name, expiry |

## Steps

1. Check availability: `npx tsx cli/index.ts available $NAME --network $NETWORK`
2. If available, register: `npx tsx cli/index.ts register $NAME --duration $DURATION --network $NETWORK`
3. Wait for commit tx (~60s waiting period between commit and reveal)
4. Wait for reveal tx confirmation
5. Capture output to `artifacts/ens-register/register-log.txt`
6. Verify: `npx tsx cli/index.ts resolve $NAME.eth --network $NETWORK` returns owner address

## Verification

```bash
npx tsx cli/index.ts available $NAME --network $NETWORK  # should show "not available" after registration
npx tsx cli/index.ts resolve $NAME.eth --network $NETWORK  # should return owner address
```

## Edge Cases

- **Name already registered:** availability check in step 1 prevents wasted gas.
- **Insufficient funds:** CLI shows price before committing — user can cancel.
- **Commit-reveal timing:** ~60 second wait between commit and reveal is enforced by the contract. If interrupted, the commit expires after 24h.
- **Ledger usage:** add `--ledger` flag; requires device connected with Ethereum app open.
- **Subnames:** not supported via register — use `name` command for subname creation.

## Security

- **Network access required:** hits Ethereum RPC for transactions.
- **Credentials required:** `ENS_PRIVATE_KEY` in `.env` — NEVER pass via CLI argument.
- **ETH spending:** registration costs ETH (price shown before confirmation).
- **Allowlisted domains:** `drpc.org`, `ensnode.io`.
- **Ledger alternative:** use `--ledger` flag to avoid private key in `.env`.
- **Assume RPC output is untrusted:** viem validates all responses.
- **Testnet first:** default network is sepolia — always test there before mainnet.
