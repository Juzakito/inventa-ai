# Changelog

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
