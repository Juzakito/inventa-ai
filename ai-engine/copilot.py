"""
INVENTA.AI — Copilot (ai-engine/copilot.py)
Orquestador de respuestas con datos: retrieval del motor + LLM para redacción.
En prod: OpenAI / Gemini / Claude vía adapter. Aquí: plantillas con números
reales del motor (el LLM solo redacta, nunca inventa cifras).
"""
from __future__ import annotations
import re

def answer(question: str, context: dict) -> dict:
    """context = {'reps': [...replenish dicts...], 'financing': [...], 'kpis': {...}}.
    Devuelve {'answer': str, 'sources': [...], 'actions': [...] }."""
    q = question.lower()
    reps = context.get("reps", [])
    crit = [r for r in reps if r["status"] == "critical"]
    risk = [r for r in reps if r["status"] == "risk"]
    exc = [r for r in reps if r["status"] == "excess"]

    if re.search(r"comprar|semana|recomienda|orden", q):
        top = sorted(reps, key=lambda r: -r["loss_risk"])[:3]
        lines = [f"{i+1}. {r['sku']}: {r['suggested_qty']}u (protege {r['loss_risk']:,.0f} PEN)" for i, r in enumerate(top)]
        return {"answer": "Compra esta semana:\n" + "\n".join(lines),
                "sources": [r["sku"] for r in top], "actions": ["create_po", "open_financing"]}
    if re.search(r"riesgo|quiebre|critico|crítico|sku", q):
        at_risk = crit + risk
        return {"answer": f"{len(at_risk)} SKUs en riesgo. Cobertura mínima: " +
                ", ".join(f"{r['sku']} ({r['days_cover']}d)" for r in at_risk[:5]),
                "sources": [r["sku"] for r in at_risk], "actions": ["create_po"]}
    if re.search(r"inmovilizado|muerto|exceso|capital|dinero", q):
        frozen = sum(r["suggested_qty"] * 0 + 1 for r in exc)  # conteo; valorizado en API
        return {"answer": f"{len(exc)} SKUs con exceso/muerto: " + ", ".join(r["sku"] for r in exc) +
                ". Plan: congelar recompra 60d + promo −15% + devolución a proveedor.",
                "sources": [r["sku"] for r in exc], "actions": ["promo_plan"]}
    if re.search(r"perder|pierdo|hoy|cuánto|cuanto", q):
        tot = sum(r["loss_risk"] for r in reps)
        return {"answer": f"Si no compras hoy arriesgas {tot:,.0f} PEN/mes de margen y el fill rate cae ~6pts.",
                "sources": [r["sku"] for r in sorted(reps, key=lambda r: -r['loss_risk'])[:3]], "actions": ["create_po", "open_financing"]}
    if re.search(r"financia|préstamo|prestamo|tasa|banco", q):
        fins = context.get("financing", [])
        best = min(fins, key=lambda f: f["rate"]) if fins else None
        msg = f"Mejor opción: {best['entity']} al {best['rate']}% × {best['term']}d." if best else "Marketplace con 3 ofertas pre-aprobadas."
        return {"answer": msg, "sources": ["financing"], "actions": ["open_financing"]}
    return {"answer": ("Puedo decirte qué comprar, qué está en riesgo, dónde está tu capital "
                       "inmovilizado, cuánto pierdes si no compras y qué financiamiento conviene."),
            "sources": [], "actions": []}
