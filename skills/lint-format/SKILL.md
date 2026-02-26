# Skill: lint-format

- **name:** lint-format
- **version:** 0.1.0
- **description:**
  - **use when:** you want to lint and auto-format source code, before committing, or in CI.
  - **don't use when:** you only want to check for issues without fixing (use `make lint-check` instead).
  - **outputs + success criteria:** Biome exits 0 for both lint and format. Report written to artifacts.

## Inputs

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| (none) | — | — | operates on `cli/` directory |

### Environment
- Node.js >= 18
- `node_modules/` installed (Biome is a devDependency via npx)

## Outputs

| Artifact | Path | Description |
|----------|------|-------------|
| Lint report | `artifacts/lint-format/lint-report.txt` | Biome lint output |
| Format report | `artifacts/lint-format/format-report.txt` | Biome format output |

## Steps

1. Run lint with auto-fix: `npx @biomejs/biome lint --write src 2>&1 | tee artifacts/lint-format/lint-report.txt`
2. Run format with auto-fix: `npx @biomejs/biome format --write src 2>&1 | tee artifacts/lint-format/format-report.txt`
3. Verify both exit 0
4. Check if any files were modified: `git diff --stat cli/`

## Verification

```bash
npx @biomejs/biome lint src && npx @biomejs/biome format src && echo "Clean"
```

## Edge Cases

- **New files outside src/:** Biome only scans `cli/` — scripts in `scripts/` are not covered.
- **Conflicting edits:** `--write` modifies files in place. If run during active editing, changes may conflict.
- **biome.json missing:** will use Biome defaults (less strict).

## Security

- No network access required.
- No credentials needed.
- Operates only on local source files.
