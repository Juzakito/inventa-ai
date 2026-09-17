# AUDIT — Auditoría técnica v1.4.0 (2026-09-17)

Metodología: inventario de archivos (40 trackeados) + grep de TODOs/secretos +
métricas (app.js 558 líneas) + revisión de pipeline (CI + Vercel).

## Hallazgos y resolución

| # | Hallazgo | Sev. | Resolución |
|---|---|---|---|
| 1 | Monolito `web/app.js` (558 líneas: router+estado+11 vistas+acciones) | Alta | `src/`: `lib/engine` · `store/state` · `components/{ui,sections}` · `services/{actions,automation}` · `api/client` · `app/{router,main}` |
| 2 | Deploy sin build (fuente sin minificar, doble parseo) | Media | esbuild → `public/js/app.bundle.js` (IIFE+minify+sourcemap) |
| 3 | `outputDirectory=web/` + upload de `api/`, `ai-engine/`, `tests/` | Media | Output único `public/`; `.vercelignore` excluye tests |
| 4 | Kernel predictivo duplicado JS/Python | Baja | Paridad intencional (misma spec, tests en ambos: `tests/engine-check.js` + `ai-engine/test_smoke.py`) |
| 5 | Restos: `__pycache__/`, `.env.local` en disco | Baja | Eliminados; `.gitignore` los cubre |
| 6 | A11y: modales sin rol/foco, toolbar sin labels | Media | `role=dialog`, foco inicial, Esc, `aria-label`s |
| 7 | Persistencia `localStorage` (demo, un dispositivo) | Media | Aceptado v1.x; ruta Supabase (`db/schema.sql` listo) |
| 8 | Sin TypeScript | Baja | Decisión: JSDoc (`src/types/models.js`) + CI; `tsc` estricto en v2.0 |
| 9 | `console.log` solo en scripts dev; sin secretos en git | OK | Secret-scan en CI |
| 10 | Handlers inline dependen de globales | Media | Superficie explícita y mínima en `src/app/main.js` (`Object.assign(window, …)`) |

## Deuda aceptada (consciente)
- `localStorage` como backend en v1.x. - Inglés/español mixto en UI (es-PE primero).
- Sin tests E2E (Playwright en roadmap v1.5).
