# Skill: build

- **name:** build
- **version:** 0.1.0
- **description:**
  - **use when:** you need a fresh compiled binary, before releasing, or after changing source files.
  - **don't use when:** you just want to run the CLI in dev mode (use `dev` instead).
  - **outputs + success criteria:** `dist/index.js` exists, is executable (has shebang), and `node dist/index.js --help` exits 0.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| (none) | — | — | builds from `cli/index.ts` |

### Environment
- Node.js >= 18
- `node_modules/` installed (`npm install`)

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Compiled binary | `dist/index.js` | ESM bundle with shebang |
| Type declarations | `dist/index.d.ts` | TypeScript declarations |
| Build manifest | `artifacts/build/manifest.txt` | Paths + sizes of outputs |

## Steps

1. Install dependencies (if needed): `npm install`
2. Run build: `npx tsup cli/index.ts --format esm --dts --outDir dist`
3. Verify `dist/index.js` exists and has shebang line
4. Verify `node dist/index.js --help` exits 0
5. Write manifest to `artifacts/build/manifest.txt`

## Verification

```bash
test -f dist/index.js && head -1 dist/index.js | grep -q "#!/usr/bin/env" && echo "OK"
node dist/index.js --help > /dev/null 2>&1 && echo "Binary works"
```

## Edge Cases

- **node_modules missing:** step 1 handles this; fail fast if `npm install` errors.
- **tsup not found:** it's a devDependency — `npx` resolves it from node_modules.
- **Stale dist/:** always rebuilds from scratch (tsup overwrites).

## Security

- No network access required.
- No credentials needed.
- Build output is deterministic from source.
