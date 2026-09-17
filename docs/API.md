# INVENTA.AI — API spec (v1)

Base: `https://api.inventa.ai` · Auth: `Authorization: Bearer <JWT>` · OpenAPI en `/docs`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/skus` | Catálogo del tenant |
| GET | `/forecast/{sku}?horizon=30\|60\|90\|180` | Forecast + explicación + confianza |
| GET | `/replenishment?horizon=30` | ROP, safety, cobertura, sugerido, inversión, pérdida |
| GET | `/replenishment/{sku}` | Ficha de reposición por SKU |
| GET | `/orders` | OCs con estado |
| POST | `/orders/{id}/approve` | Aprobar (audita usuario + timestamp) |
| GET | `/financing?need=60000` | Ofertas rankeadas por costo total |
| POST | `/copilot/chat` `{question}` | Respuesta con `answer/sources/actions` |

## Ejemplo

```bash
curl "http://localhost:8000/forecast/SKU-001?horizon=30"
curl -X POST localhost:8000/copilot/chat -H "Content-Type: application/json" \
  -d '{"question":"¿Qué debo comprar esta semana?"}'
```

## Contratos clave
- `forecast`: `{sku, horizon, demand, avg_daily, confidence, trend_pct, points[], explain}`.
- `replenishment`: `{sku, status, safety_stock, rop, days_cover, suggested_qty, investment, loss_risk, recommendation, forecast_explain}`.
- `copilot/chat`: `{answer, sources[], actions[]}` donde `actions ∈ {create_po, open_financing, promo_plan}`.
- Errores: `404 SKU/OC`, `400 horizon inválido`, `401 sin JWT`, todo JSON.
