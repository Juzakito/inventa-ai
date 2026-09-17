#!/usr/bin/env bash
# setup.sh — Prepara el workspace InventaAI en Linux (idempotente).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== InventaAI setup =="
for d in public/css public/js public/vendor src/app src/components/ui src/components/layout src/components/forms src/components/sections src/pages src/hooks src/lib src/services src/api src/store src/types src/assets/images src/assets/icons src/assets/videos src/styles src/config tests scripts deployment docs; do
  mkdir -p "$d"
done
echo "✔ Estructura verificada"
[ -f .env ] || { [ -f .env.example ] && cp .env.example .env && echo "✔ .env creado"; }
command -v node >/dev/null || { echo "Node.js 20+ no encontrado"; exit 1; }
npm install
echo "✔ Dependencias instaladas"
npm run build
[ -d .git ] || { git init -b main && echo "✔ Git inicializado"; }
command -v code >/dev/null && code "$ROOT" || echo "! Abre manual: $ROOT"
echo "== Listo: npm run serve → http://localhost:5173 =="
