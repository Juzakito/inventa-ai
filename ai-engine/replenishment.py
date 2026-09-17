"""
INVENTA.AI — Motor de reabastecimiento (ai-engine/replenishment.py)
ROP, safety stock (95%), EOQ-lite, cobertura, inversión y pérdida evitada.
Cada recomendación sale con justificación para el Copilot y la OC.
"""
from __future__ import annotations
from dataclasses import dataclass
from forecast import SKU, forecast

Z_95 = 1.65  # nivel de servicio 95%

def replenish(sku: SKU, horizon: int = 30) -> dict:
    f = forecast(sku, horizon=horizon)
    avg = f["avg_daily"]
    sigma = avg * sku.cv
    safety = max(0, round(Z_95 * sigma * (sku.lead ** 0.5)))
    rop = round(avg * sku.lead + safety)
    cover = round(sku.stock / avg, 1) if avg > 0 else 99.0
    suggested = max(0, round(f["demand"] + safety - sku.stock))
    investment = round(suggested * sku.cost, 2)
    margin_u = sku.price - sku.cost
    loss_risk = round(max(0, f["demand"] - sku.stock) * margin_u, 2)
    if sku.stock <= rop * 0.6: status = "critical"
    elif sku.stock <= rop: status = "risk"
    elif sku.stock > sku.max * 1.15: status = "excess"
    else: status = "ok"
    verb = {"critical": "Compra YA", "risk": "Programa compra", "excess": "Congela recompra", "ok": "Sin acción"}[status]
    return {
        "sku": sku.id, "status": status, "avg_daily": avg,
        "safety_stock": safety, "rop": rop, "days_cover": cover,
        "suggested_qty": suggested, "investment": investment,
        "loss_risk": loss_risk,
        "recommendation": (f"{verb}: {suggested}u de {sku.name} "
                           f"(ROP {rop}u, safety {safety}u, cobertura {cover}d). "
                           f"Inversión {investment:,.0f} PEN, protege {loss_risk:,.0f} PEN de margen."),
        "forecast_explain": f["explain"],
    }

if __name__ == "__main__":
    from forecast import SKU
    demo = [
        SKU("SKU-001", "Aceite Primor 1L", 62, 0.18, 4, 180, 400, 1400, 9.4, 11.9),
        SKU("SKU-005", "Coca-Cola 2L x8", 44, 0.35, 2, 64, 150, 600, 58.0, 72.0),
        SKU("SKU-011", "Galletas Casino (descont.)", 9, 0.80, 5, 3200, 200, 800, 5.9, 6.5),
    ]
    for s in demo:
        r = replenish(s)
        print(f"[{r['status']:^8}] {r['recommendation']}")
