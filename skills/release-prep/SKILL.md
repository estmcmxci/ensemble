# Skill: release-prep

- **name:** release-prep
- **version:** 0.1.0
- **description:**
  - **use when:** you're preparing a new version of the CLI for publish or distribution.
  - **don't use when:** you just want to build locally (use `build`), or you're developing (use `dev`).
  - **outputs + success criteria:** clean lint, fresh build, binary passes smoke test, version in package.json matches, release checklist artifact written.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `VERSION` | yes | — | semver string, e.g. `0.2.0` |

### Environment
- Node.js >= 18
- `node_modules/` installed
- Clean git working tree (no uncommitted changes)

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Release checklist | `artifacts/release-prep/checklist.md` | Pre-publish verification results |
| Build manifest | `artifacts/release-prep/build-manifest.txt` | Binary paths + sizes |

## Steps

1. Verify git working tree is clean: `git diff --quiet && git diff --cached --quiet`
2. Update version in `package.json` to `$VERSION`
3. Run lint-format skill (must pass)
4. Run build skill (must produce working binary)
5. Smoke test: `node dist/index.js --help` exits 0
6. Smoke test: `node dist/index.js resolve vitalik.eth --network mainnet` returns an address
7. Write checklist to `artifacts/release-prep/checklist.md`:
   - [ ] Version matches: $VERSION
   - [ ] Lint clean
   - [ ] Build succeeds
   - [ ] Binary --help works
   - [ ] Resolve smoke test passes
   - [ ] Git tag created: v$VERSION
8. Print checklist for human review

## Verification

```bash
node -e "const p=require('./package.json');process.exit(p.version==='$VERSION'?0:1)"
node dist/index.js --help > /dev/null 2>&1 && echo "Binary OK"
```

## Edge Cases

- **Dirty git tree:** step 1 fails — commit or stash changes first.
- **Network required for smoke test:** step 6 hits mainnet RPC. Skip with `SKIP_SMOKE=1` if offline.
- **npm publish not included:** this skill prepares the release; actual `npm publish` is a separate manual step.

## Security

- Step 6 accesses Ethereum RPC (drpc.org by default). No credentials needed for read-only resolve.
- Never include `.env` or private keys in the release.
- Verify `files` field in `package.json` only includes `dist/`.

## Template: checklist.md

```markdown
# Release Checklist — v{{VERSION}}

- [ ] Version in package.json: {{VERSION}}
- [ ] Lint: {{LINT_STATUS}}
- [ ] Format: {{FORMAT_STATUS}}
- [ ] Build: {{BUILD_STATUS}}
- [ ] Binary --help: {{HELP_STATUS}}
- [ ] Resolve smoke test: {{SMOKE_STATUS}}
- [ ] Git tag: v{{VERSION}}
- [ ] npm publish (manual)
```
