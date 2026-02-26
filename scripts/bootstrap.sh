#!/usr/bin/env bash
set -euo pipefail

# bootstrap.sh — one-time environment setup for ens-cli

echo "=== ens-cli bootstrap ==="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Install Node.js >= 18."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js >= 18 required (found v$(node -v))"
  exit 1
fi
echo "Node.js $(node -v) — OK"

# Install dependencies
echo "Installing dependencies..."
npm install
echo "Dependencies — OK"

# Check .env
if [ ! -f .env ]; then
  echo ""
  echo "NOTE: No .env file found."
  echo "  Copy .env.example to .env and fill in your values:"
  echo "  cp .env.example .env"
  echo ""
else
  echo ".env — found"
fi

echo ""
echo "=== Bootstrap complete ==="
echo "Run 'make build' to compile, or 'make dev ARGS=\"--help\"' to start developing."
