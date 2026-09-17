# INVENTA.AI 🧠 — El Cerebro de Compras para tu Empresa

[![CI + Deploy Gate](https://github.com/Juzakito/inventa-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Juzakito/inventa-ai/actions)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://inventa.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Transformamos datos en decisiones de abastecimiento.
> Garantía: **S/ 5,000 de ahorro en 30 días o no pagas.**

**Producción:** https://inventa.ai · **Workspace local:** `Desktop/InventaAI`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Juzakito/inventa-ai)

## Arquitectura

```
InventaAI/
├── public/             ← único output a producción (bundle + assets)
│   ├── index.html      ← shell (landing + SPA)
│   ├── css/ js/ vendor/ ← generados/copiados por npm run build
│   └── robots.txt sitemap.xml manifest.json favicon.svg
├── src/
│   ├── app/            ← main.js (boot + API window) · router.js (SPA)
│   ├── components/
│   │   ├── ui/         ← toast, modales, Chart.js defaults, sparklines
│   │   ├── sections/   ← views-home · views-ops · views-system
│   │   ├── layout/ forms/ ← puntos de extensión (v2.0)
│   ├── pages/ hooks/   ← puntos de extensión (v2.0)
│   ├── lib/            ← engine.js (datos + forecast + reposición, sin DOM)
│   ├── services/       ← actions.js (mutaciones) · automation.js (R1–R4)
│   ├── api/            ← client.js (FastAPI; ping real desde Ajustes)
│   ├── store/          ← state.js (sesión + persistencia + auditoría)
│   ├── types/          ← models.js (contratos JSDoc)
│   ├── assets/         ← icons/ (favicon fuente) · images/ videos/
│   ├── styles/         ← styles.css (fuente; build lo copia a public/)
│   └── config/         ← constants.js
├── tests/              ← engine-check · audit-ids (frontend)
├── scripts/            ← build · validate · setup (ps1/bat/sh/mac)
├── deployment/         ← vercel/dns/rollback runbooks
├── api/ ai-engine/     ← backend FastAPI + motor Python (paridad con lib/)
├── db/                 ← Postgres multi-tenant + seed
├── docs/               ← AUDIT · arquitectura · API · seguridad · roadmap · deploy
└── mobile/             ← spec Expo iOS/Android
```

**Reglas:** las vistas solo leen; toda mutación pasa por `services/` (permiso → cambio → auditoría → re-render). `lib/` no toca el DOM. Superficie `window` mínima y documentada en `src/app/main.js`.

## Desarrollo

```bash
npm install      # dependencias (solo dev: esbuild + htmlhint)
npm run build    # bundle + validación → public/
npm test         # motor + IDs + smoke Python
npm run lint     # htmlhint + node --check
npm run serve    # http://localhost:5173 (sirve public/)
```

O automático: `scripts/setup.ps1` (Windows) · `setup.sh` (Linux) · `setup-mac.sh` (macOS).

## Deploy

`git push main` → CI en verde → Vercel publica `public/`. Detalle: `docs/DEPLOY.md`, `deployment/`.
