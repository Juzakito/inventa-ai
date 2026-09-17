# Deployment — InventaAI

Pipeline: `git push main` → GitHub Actions (lint → test → build → secret scan)
→ Vercel build (`npm run build`, output `public/`) → producción.

## Vercel (dashboard)
- Framework: Other · Build: `npm run build` · Output: `public/` · Install: `npm ci`
- Root Directory: `./` (raíz del repo) · Production branch: `main`
- Env vars frontend: ninguna requerida. Opcionales: `GA_MEASUREMENT_ID`, `CLARITY_PROJECT_ID`.

## DNS (ver dns-records.md) y rollback (ver rollback.md)
