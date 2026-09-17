# Changelog

## [1.4.0] — 2026-09-17 — Reestructuración empresarial + workspace
- Repo movido a `Desktop/InventaAI` (historial git intacto) + acceso directo "InventaAI - Workspace".
- Arquitectura `src/` + `public/`: `lib/engine` · `store/state` · `components/{ui,sections}` · `services/{actions,automation}` · `api/client` · `app/{router,main}` · `config` · `types` (JSDoc).
- Bundle esbuild (IIFE+minify+sourcemap) → `public/` es el único output; `vercel.json` con build.
- `src/api/client.js` con prueba de conexión real desde Ajustes → Backend.
- A11y: modales `role=dialog`, foco inicial, cierre con Esc, `aria-label`s.
- `docs/AUDIT.md` (10 hallazgos), `deployment/` (vercel/dns/rollback), setup `ps1/bat/sh/mac.sh`.
- CI actualizado a raíz (sin working-directory); build valida 21 IDs + ausencia de legacy.

## [1.3.0] — 2026-09-17 — Lenguaje visual de los mockups
- Sidebar navy permanente + fondo claro premium; pills de estado Óptimo/Bajo/Crítico.
- Analytics estilo mockup 3: 3 KPI cards con sparklines (trailing reconstruido día a día desde el historial: stock(d) = stock + vendido), forecast-vs-real mensual 12M (6 reales + 6 IA), barras por categoría, donut por categoría, heatmap de cobertura SKU×categoría, filtro de período funcional (30/90/180).
- Inventario estilo mockup 2: columnas SKU/producto/categoría/stock/mínimo/estado/proveedor/último reabastecimiento (derivado de OCs reales) + filtros categoría/estado/proveedor + **Nuevo Producto** (entra al maestro, al forecast y persiste).
- CI: build valida los 21 IDs críticos.

## [1.2.0] — 2026-09-17 — Plataforma de inteligencia operacional
- Home destruido y reconstruido: Resumen ejecutivo (qué comprar/riesgo/oportunidad calculados), Centro de decisiones (3 tarjetas → workflows), Copiloto, Mapa de abastecimiento SVG interactivo (plantas→CD→sucursales, clic por nodo), Predicciones con bandas p10–p90 + variables explicativas.
- Forecast agregado top-3 + intervalos de confianza (forecastBands: σ√t).
- Inventario como centro de inteligencia: actual/ideal/días/riesgo/impacto/prioridad P0-P2 + búsqueda, filtros ABC/riesgo y exportación CSV real.
- Compras como mesa de control: recomendaciones IA, comparador de proveedores, simulador financiero (cobertura→inversión/margen/costo/neto).
- Financiamiento con snapshot (capital disponible, crédito sugerido, costo, retorno) y slider sincronizado al plan calculado.
- Modos Ejecutivo / Operaciones. Tablas enterprise (sticky header, hover, densas). Sombras planas, tipografía refinada.
- CI reforzado: engine-check (runtime Node del motor) + audit-ids (81/81 IDs resuelven, cero código muerto del home viejo).

## [1.1.0] — 2026-09-17 — Edición empresarial
- Rebrand: cero referencias a Amazon. "El Cerebro de Compras para tu Empresa".
- OCs reales: crear/editar/aprobar (2 pasos con MFA)/rechazar/recibir + PDF imprimible + mailto + WhatsApp share + historial por OC + persistencia local.
- Nuevo módulo Proveedores: scorecards calculados (fórmula visible), contactos editables.
- Nuevo Automatización: 4 reglas ejecutables (R1 genera borradores de verdad) + centro de alertas con campana.
- Nueva página Ajustes: roles RBAC que restringen acciones, MFA, auditoría visible.
- Landing empresarial: casos por rubro, calculadora ROI funcional, testimonios piloto, FAQ, formulario demo con validación.
- Móvil: drawer de navegación + tablas con scroll horizontal.
- DB: sucursales, stock por sede, reglas, alertas, contactos de proveedor. API: POST /orders, reject, /suppliers, /alerts, /audit.

## [1.0.0] — 2026-09-17
- Lanzamiento producción: landing + dashboard + 6 módulos (web estática, cero deps runtime).
- API FastAPI v1.0.0 (forecast, reposición, OCs, financiamiento, copilot).
- Motor IA con explicación auditable; schema Postgres multi-tenant + seed.
- Hardening prod: CSP/HSTS, SEO (sitemap, robots, OG, JSON-LD), vendor local de Chart.js.
- CI/CD: GitHub Actions + deploy automático en Vercel.
