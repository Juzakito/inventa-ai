# INVENTA.AI — Arquitectura (nivel Serie A)

## Visión
Un solo cerebro de compras: ingesta → forecast → reposición → OC → financiamiento → medición.
Todo auditable: la IA siempre cita SKU, números y modelo (`ma30-seas-v1` hoy; Prophet/LightGBM/LLM mañana).

## Diagrama

```
Fuentes (Shopify, ML, Woo, Falabella, Amazon, POS, Excel, Sheets)
  │ webhooks + ETL nocturno + sync 5min (BullMQ)
  ▼
Postgres (particionado mensual, RLS por tenant) + Redis (caché forecast) + S3 (raw)
  │ feature store: MA30, tendencia, estacionalidad, CV, lead time real
  ▼
ai-engine/  forecast.py → replenishment.py → copilot.py → LLM adapter (OpenAI/Gemini/Claude: solo redacta)
  ▼
api/ (FastAPI)  /forecast /replenishment /orders /financing /copilot/chat   →  web/ + mobile/ + WhatsApp bot
  ▲
Financiamiento: scoring con ventas verificadas (útil para bancos/fintechs)
```

## Decisiones clave
- **Monolito modular primero** (api/ + ai-engine/): velocidad Serie A; se parte a microservicios al pasar 10k tenants.
- **Mismo kernel en 3 lados**: `ai-engine/*.py` = `api/` = `web/data.js`. Cero divergencia demo/prod.
- **LLM como redactor, no calculador**: los números siempre vienen del motor determinista; el LLM explica y propone. Evita alucinaciones financieras.
- **RLS por `company_id`** + particiones mensuales: soporta 500k empresas / 5M SKUs / miles de M de filas sin re-arquitectura.
- **Colas**: forecast masivo nocturno (por tenant/SKU), alertas en tiempo real por Redis Streams.

## Escalabilidad (ruta a 500k empresas)
1. Postgres con particionado + réplicas de lectura; Redis para forecast 30/60/90/180 precomputado.
2. Workers horizontales (K8s HPA) para ETL y forecast; CDN para web/.
3. Multi-región AWS (Lima → São Paulo → CDMX) cuando la latencia p95 > 400ms.

## Seguridad
OAuth 2.0 + MFA (TOTP), RBAC (owner/buyer/viewer/admin), JWT corto + refresh rotativo,
cifrado AES-256 en reposo / TLS 1.3 en tránsito, `audit_log` de cada aprobación y desembolso,
backups PITR diarios. Detalle en `docs/SECURITY.md`.
