# Changelog

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
