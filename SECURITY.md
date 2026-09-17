# Política de seguridad — INVENTA.AI

- **Reportes**: security@inventa.ai (respuesta < 48h, fix crítico < 7 días). No publicar exploits antes del fix.
- **Alcance**: `web/`, `api/`, `ai-engine/`, pipeline Vercel/GitHub.
- **Controles**: OAuth + MFA, RBAC + RLS por tenant, AES-256/TLS 1.3, CSP + HSTS en producción, secretos solo en Vercel Env Vars (nunca en git).
- Detalle técnico: `docs/SECURITY.md`.
