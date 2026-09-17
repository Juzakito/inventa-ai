# INVENTA.AI — Seguridad y cumplimiento

- **Auth**: OAuth 2.0 (Google/Microsoft) + passwordless por email; MFA TOTP obligatorio para aprobar OCs > S/ 10,000 y solicitar financiamiento.
- **Autorización**: RBAC `owner > buyer > viewer`; dueños aprueban, compradores proponen, viewers solo leen. RLS en Postgres por `app.company_id`.
- **Datos**: AES-256 en reposo (RDS/S3), TLS 1.3 en tránsito, secretos en AWS Secrets Manager, PII tokenizada para scoring crediticio.
- **Auditoría**: `audit_log` inmutable (quién aprobó qué OC, qué oferta aceptó, con qué forecast). Exportable a PDF para directorio/auditores.
- **Resiliencia**: backups PITR diarios, retención 30d, restore drill mensual; rate-limit por tenant; WAF + DDoS en edge.
- **Roadmap compliance**: SOC 2 Tipo I (Q2), Tipo II (Q4); Ley 29733 (Perú) + equivalentes MX/CO/CL; data residency por país.
