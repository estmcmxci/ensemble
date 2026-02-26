.PHONY: bootstrap build dev lint-format lint-check release-prep ens-resolve ens-register help

# Defaults
ARGS       ?= --help
NAME       ?=
NETWORK    ?= sepolia
VERSION    ?=
DURATION   ?= 1y
TXT        ?=
SKIP_SMOKE ?=

help: ## Show available targets
	@echo "ens-cli — available make targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "See WORKFLOWS.md for full documentation."

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

bootstrap: ## First-time setup (install deps, check env)
	@bash scripts/bootstrap.sh

node_modules: package.json
	npm install
	@touch node_modules

# ──────────────────────────────────────────────
# Build
# ──────────────────────────────────────────────

build: node_modules ## Compile TypeScript to dist/
	@echo "=== build ==="
	npx tsup src/index.ts --format esm --dts --outDir dist
	@mkdir -p artifacts/build
	@echo "--- Build Manifest ---" > artifacts/build/manifest.txt
	@ls -lh dist/index.js dist/index.d.ts >> artifacts/build/manifest.txt 2>/dev/null || true
	@echo "" >> artifacts/build/manifest.txt
	@echo "Shebang: $$(head -1 dist/index.js)" >> artifacts/build/manifest.txt
	@# Verify
	@test -f dist/index.js || (echo "FAIL: dist/index.js not found" && exit 1)
	@head -1 dist/index.js | grep -q "#!/usr/bin/env" || (echo "FAIL: missing shebang" && exit 1)
	@node dist/index.js --help 2>&1 | grep -q "ENS" || (echo "FAIL: binary --help produced no output" && exit 1)
	@echo ""
	@echo "Artifacts:"
	@cat artifacts/build/manifest.txt
	@echo ""
	@echo "=== build OK ==="

# ──────────────────────────────────────────────
# Dev
# ──────────────────────────────────────────────

dev: node_modules ## Run CLI from source (ARGS="resolve vitalik.eth")
	npx tsx src/index.ts $(ARGS)

# ──────────────────────────────────────────────
# Lint & Format
# ──────────────────────────────────────────────

lint-format: node_modules ## Lint + format source (auto-fix)
	@echo "=== lint-format ==="
	@mkdir -p artifacts/lint-format
	npx @biomejs/biome lint --write src 2>&1 | tee artifacts/lint-format/lint-report.txt
	npx @biomejs/biome format --write src 2>&1 | tee artifacts/lint-format/format-report.txt
	@echo ""
	@echo "Artifacts:"
	@echo "  artifacts/lint-format/lint-report.txt"
	@echo "  artifacts/lint-format/format-report.txt"
	@echo "=== lint-format OK ==="

lint-check: node_modules ## Lint + format check only (no writes)
	npx @biomejs/biome lint src
	npx @biomejs/biome format src

# ──────────────────────────────────────────────
# Release
# ──────────────────────────────────────────────

release-prep: node_modules ## Prepare release (VERSION=x.y.z)
	@echo "=== release-prep ==="
	@test -n "$(VERSION)" || (echo "ERROR: VERSION required (e.g., make release-prep VERSION=0.2.0)" && exit 1)
	@mkdir -p artifacts/release-prep
	@echo "# Release Checklist — v$(VERSION)" > artifacts/release-prep/checklist.md
	@echo "" >> artifacts/release-prep/checklist.md
	@# Version bump
	@node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.version='$(VERSION)';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
	@echo "- [x] Version in package.json: $(VERSION)" >> artifacts/release-prep/checklist.md
	@# Lint
	npx @biomejs/biome lint src && echo "- [x] Lint: clean" >> artifacts/release-prep/checklist.md || echo "- [ ] Lint: FAILED" >> artifacts/release-prep/checklist.md
	@# Format
	npx @biomejs/biome format src && echo "- [x] Format: clean" >> artifacts/release-prep/checklist.md || echo "- [ ] Format: FAILED" >> artifacts/release-prep/checklist.md
	@# Build
	npx tsup src/index.ts --format esm --dts --outDir dist
	@test -f dist/index.js && echo "- [x] Build: success" >> artifacts/release-prep/checklist.md || echo "- [ ] Build: FAILED" >> artifacts/release-prep/checklist.md
	@# Help check
	@node dist/index.js --help 2>&1 | grep -q "ENS" && echo "- [x] Binary --help: works" >> artifacts/release-prep/checklist.md || echo "- [ ] Binary --help: FAILED" >> artifacts/release-prep/checklist.md
	@# Build manifest
	@ls -lh dist/index.js dist/index.d.ts > artifacts/release-prep/build-manifest.txt 2>/dev/null || true
	@echo "" >> artifacts/release-prep/checklist.md
	@echo "- [ ] Git tag: v$(VERSION) (manual)" >> artifacts/release-prep/checklist.md
	@echo "- [ ] npm publish (manual)" >> artifacts/release-prep/checklist.md
	@echo ""
	@echo "Artifacts:"
	@cat artifacts/release-prep/checklist.md
	@echo ""
	@echo "=== release-prep OK ==="

# ──────────────────────────────────────────────
# ENS Operations
# ──────────────────────────────────────────────

ens-resolve: node_modules ## Resolve ENS name (NAME=vitalik.eth NETWORK=mainnet)
	@echo "=== ens-resolve ==="
	@test -n "$(NAME)" || (echo "ERROR: NAME required (e.g., make ens-resolve NAME=vitalik.eth)" && exit 1)
	@mkdir -p artifacts/ens-resolve
	npx tsx src/index.ts resolve $(NAME) --network $(NETWORK) 2>&1 | tee artifacts/ens-resolve/resolve-log.txt
	@echo ""
	@echo "Artifact: artifacts/ens-resolve/resolve-log.txt"
	@echo "=== ens-resolve OK ==="

ens-register: node_modules ## Register ENS name (NAME=myname NETWORK=sepolia)
	@echo "=== ens-register ==="
	@test -n "$(NAME)" || (echo "ERROR: NAME required (e.g., make ens-register NAME=myname)" && exit 1)
	@mkdir -p artifacts/ens-register
	npx tsx src/index.ts register $(NAME) --duration $(DURATION) --network $(NETWORK) 2>&1 | tee artifacts/ens-register/register-log.txt
	@echo ""
	@echo "Artifact: artifacts/ens-register/register-log.txt"
	@echo "=== ens-register OK ==="
