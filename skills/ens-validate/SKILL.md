# Skill: ens-validate

- **name:** ens-validate
- **version:** 0.1.0
- **description:**
  - **use when:** you need to validate ENS text record keys (ENSIP-5) or avatar URI formats (ENSIP-12), or resolve avatar URIs to image URLs.
  - **don't use when:** you just want to read/write records without validation (use `ens edit` or `ens-resolve`).
  - **outputs + success criteria:** validation warnings printed to stderr; avatar resolved URLs printed below raw values.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `NAME` | yes | — | ENS name to query (e.g. `nick.eth`) |
| `NETWORK` | no | `sepolia` | `mainnet` or `sepolia` |
| `KEY` | no | — | Text record key to validate (e.g. `foobar`, `com.myapp`) |
| `AVATAR_URI` | no | — | Avatar URI to validate (e.g. `eip155:1/erc721:0x.../123`) |

### Environment
- Node.js >= 18
- `node_modules/` installed
- `.env` with RPC URL for target network (avatar resolution needs mainnet RPC for NFT lookups)

## Outputs

Validation is integrated into existing commands — no separate artifacts.

| Integration Point | Behavior |
|-------------------|----------|
| `ens edit txt` | Warns on non-standard keys; validates avatar URI format on write |
| `ens profile` | Resolves avatar URI and shows image URL below raw value |
| `ens resolve --txt avatar` | Resolves avatar URI and shows image URL below raw value |

## Steps

1. **Key validation** (edit command): `validateTextRecordKey(key)` checks against ENSIP-5 standard keys and reverse-DNS format
2. **Avatar URI validation** (edit command): `validateAvatarUri(value)` checks ENSIP-12 format (HTTPS, IPFS, data, NFT)
3. **Avatar resolution** (profile/resolve): `resolveAvatarUri(rawUri)` fetches NFT metadata on-chain, converts IPFS to gateway URLs

## Verification

```bash
# Profile with avatar resolution (nick.eth has an NFT avatar)
make dev ARGS="profile nick.eth --network mainnet"
# Should show "Resolved: https://..." below the avatar value

# Resolve avatar text record
make dev ARGS="resolve nick.eth --txt avatar --network mainnet"
# Should show raw URI + "Resolved: https://..." below

# Key validation (non-standard key warning)
# Would need a testnet name you own to actually write:
# make dev ARGS="edit txt <name> foobar hello --network sepolia"
# Should warn: "foobar" is not a standard ENSIP-5 key
```

## Edge Cases

- **Non-standard key:** warns but does NOT block the transaction
- **Invalid avatar format:** warns but does NOT block the transaction
- **NFT metadata fetch fails:** raw URI is still shown; resolution error is silent
- **IPFS gateway unreachable:** gateway URL is still displayed (user can try manually)
- **ERC-1155 `{id}` template:** automatically substituted with hex token ID

## Security

- **Network access:** avatar resolution fetches NFT metadata from IPFS gateways and on-chain token URI
- **On-chain reads only:** no write operations during validation/resolution
- **No credentials needed:** read-only RPC calls
- **Graceful degradation:** all errors are caught; raw values always displayed
