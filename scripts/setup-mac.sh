#!/usr/bin/env bash
# setup-mac.sh — Prepara el workspace InventaAI en macOS (idempotente).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== InventaAI setup (macOS) =="
command -v brew >/dev/null || { echo "Instala Homebrew primero: https://brew.sh"; exit 1; }
command -v node >/dev/null || brew install node@20
bash scripts/setup.sh
