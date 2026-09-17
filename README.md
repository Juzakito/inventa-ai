# INVENTA.AI 🧠 — El Cerebro de Compras para tu Empresa

[![CI + Deploy Gate](https://github.com/inventa-ai/inventa-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/inventa-ai/inventa-ai/actions)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://inventa.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Predice demanda · evita quiebres · automatiza OCs · financia inventario.
> Garantía: **S/ 5,000 de ahorro en 30 días o no pagas.**

**Producción:** https://inventa.ai · **Demo 60s:** landing → "Ver Simulación en vivo" → dashboard + Copilot + 6 módulos.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/inventa-ai/inventa-ai&root-directory=web)

## Estructura

```
inventa-ai/
├── web/                 ← frontend prod (estático, cero deps runtime) → https://inventa.ai
│   ├── index.html       ← landing + SPA (8 vistas)
│   ├── styles.css       ← design system (light/dark, glass)
│   ├── app.js / data.js ← lógica + kernel predictivo (mirror de ai-engine)
│   ├── vendor/          ← Chart.js 4.4.1 vendored (sin CDN en runtime)
│   ├── robots.txt / sitemap.xml / manifest.json / favicon.svg
│   └── package.json     ← lint + test + build (solo devDeps)
├── api/                 ← FastAPI (forecast, reposición, OCs, financiamiento, copilot)
├── ai-engine/           ← motor IA + smoke tests
├── db/                  ← Postgres multi-tenant (RLS + particionado) + seed
├── mobile/              ← spec Expo iOS/Android
├── docs/                ← arquitectura, API, seguridad, roadmap, DEPLOY
├── vercel.json          ← headers OWASP (CSP/HSTS), caché, clean URLs
└── .github/workflows/   ← CI: lint → tests → build → secret scan (gate del deploy)
```

## Desarrollo local

```bash
# Web (sin instalación)
python -m http.server 5173 --directory web   # → http://localhost:5173

# Frontend checks (requiere node 20+)
cd web && npm ci && npm run lint && npm test && npm run build

# Motor IA (solo stdlib) + API
python ai-engine/test_smoke.py
pip install fastapi uvicorn pydantic && uvicorn main:app --reload --port 8000  # desde api/
```

## Deploy

Ver **`docs/DEPLOY.md`** (comandos git exactos, Vercel, DNS, env vars, checklist).
Cada push a `main` → CI en verde → Vercel despliega a producción automáticamente.

## Documentación

| Doc | Contenido |
|---|---|
| `docs/DEPLOY.md` | Guía de lanzamiento: GitHub, Vercel, dominio, DNS, rollback |
| `docs/ARCHITECTURE.md` | Arquitectura y ruta a 500k empresas |
| `docs/API.md` | Spec de la API v1 |
| `docs/SECURITY.md` | Controles técnicos |
| `docs/ROADMAP-GTM.md` | Roadmap + GTM LATAM + pitch VC |

Licencia MIT — ver `LICENSE`. Cómo contribuir: `CONTRIBUTING.md`.
