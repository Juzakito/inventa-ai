"""
INVENTA.AI — API (api/main.py)
FastAPI · Corre con:  uvicorn main:app --reload --port 8000  (desde api/)
Docs interactivas:    http://localhost:8000/docs
"""
from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-engine"))
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from forecast import SKU, forecast, history
from replenishment import replenish
from copilot import answer

app = FastAPI(title="INVENTA.AI API", version="1.0.0",
              description="Cerebro de compras: forecast, reposición, OCs, financiamiento y copilot.")

# ---- Catálogo demo (en prod: Postgres + RLS por tenant) ----
CATALOG: dict[str, SKU] = {
    "SKU-001": SKU("SKU-001", "Aceite Primor Premium 1L", 62, 0.18, 4, 180, 400, 1400, 9.4, 11.9),
    "SKU-002": SKU("SKU-002", "Arroz Costeño Extra 5kg", 41, 0.22, 4, 420, 350, 1200, 19.1, 24.5),
    "SKU-003": SKU("SKU-003", "Leche Gloria Evaporada x24", 38, 0.15, 3, 96, 200, 700, 78.5, 96.0),
    "SKU-004": SKU("SKU-004", "Fideos Don Vittorio 500g", 210, 0.28, 5, 2100, 800, 2600, 2.9, 4.2),
    "SKU-005": SKU("SKU-005", "Coca-Cola 2L x8", 44, 0.35, 2, 64, 150, 600, 58.0, 72.0),
    "SKU-006": SKU("SKU-006", "Cerveza Cristal x12", 52, 0.42, 2, 310, 180, 800, 44.2, 58.0),
    "SKU-008": SKU("SKU-008", "Cemento Sol 42.5kg", 120, 0.31, 3, 1200, 500, 2000, 27.8, 32.5),
    "SKU-011": SKU("SKU-011", "Galletas Casino (descont.)", 9, 0.80, 5, 3200, 200, 800, 5.9, 6.5),
}
FINANCING = [
    {"id": "F1", "entity": "Banco Pichincha", "type": "Banco", "amount": 120000, "rate": 1.45, "term": 90, "quota": 41200},
    {"id": "F2", "entity": "Prestamype", "type": "Fintech", "amount": 80000, "rate": 2.10, "term": 60, "quota": 41333},
    {"id": "F3", "entity": "Kubo Financiero", "type": "Fondo", "amount": 200000, "rate": 1.80, "term": 120, "quota": 52600},
]
OCS: list[dict] = [
    {"id": "OC-2026-184", "supKey": "ALICORP", "supplier": "Alicorp", "total": 12830, "status": "pending"},
    {"id": "OC-2026-185", "supKey": "BACKUS", "supplier": "Backus AB InBev", "total": 22440, "status": "pending"},
]
SUPPLIERS = {
    "ALICORP": {"name": "Alicorp", "lead": 4, "rating": 4.8, "email": "atencion.clientes@alicorp.com.pe"},
    "GLORIA": {"name": "Gloria", "lead": 3, "rating": 4.7, "email": "ventas@gloria.com.pe"},
    "BACKUS": {"name": "Backus AB InBev", "lead": 2, "rating": 4.9, "email": "distribuidores@backus.com.pe"},
    "MOLITALIA": {"name": "Molitalia", "lead": 5, "rating": 4.5, "email": "mayoristas@molitalia.com.pe"},
}
AUDIT: list[dict] = []

def supplier_score(key: str) -> dict:
    sup = SUPPLIERS[key]
    # Mapeo realista por prefijo de catálogo demo:
    mapping = {"ALICORP": ["SKU-001", "SKU-002"], "GLORIA": ["SKU-003"], "BACKUS": ["SKU-005", "SKU-006"], "MOLITALIA": ["SKU-004"]}
    reps = [replenish(CATALOG[i], 30) for i in mapping.get(key, []) if i in CATALOG]
    crit = sum(1 for r in reps if r["status"] in ("critical", "risk"))
    spend = sum(o["total"] for o in OCS if o.get("supKey") == key and o["status"] != "rejected")
    score = round((0.4 * sup["rating"] / 5 + 0.3 * (1 - crit / max(len(reps), 1)) + 0.3 * (1 - min(sup["lead"], 7) / 7)) * 100)
    return {"key": key, **sup, "skus": len(reps), "critical": crit, "spend_oc": spend,
            "score": score, "grade": "A" if score >= 85 else "B" if score >= 70 else "C",
            "risk": "En observación" if crit else ("Lead time alto" if sup["lead"] >= 5 else "Saludable")}

class ChatIn(BaseModel):
    question: str

class CreateOC(BaseModel):
    supKey: str
    items: str
    total: float
    eta: str = "Por definir"

@app.get("/health")
def health(): return {"ok": True, "service": "inventa-ai", "version": "1.0.0"}

@app.get("/skus")
def skus(): return [{"id": s.id, "name": s.name, "stock": s.stock} for s in CATALOG.values()]

@app.get("/forecast/{sku_id}")
def get_forecast(sku_id: str, horizon: int = 90):
    s = CATALOG.get(sku_id)
    if not s: raise HTTPException(404, "SKU no encontrado")
    if horizon not in (30, 60, 90, 180): raise HTTPException(400, "horizon ∈ {30,60,90,180}")
    return forecast(s, horizon=horizon)

@app.get("/replenishment")
def all_replenishment(horizon: int = 30):
    return [replenish(s, horizon) for s in CATALOG.values()]

@app.get("/replenishment/{sku_id}")
def one_replenishment(sku_id: str, horizon: int = 30):
    s = CATALOG.get(sku_id)
    if not s: raise HTTPException(404, "SKU no encontrado")
    return replenish(s, horizon)

@app.get("/orders")
def orders(): return OCS

@app.post("/orders", status_code=201)
def create_order(body: CreateOC):
    if body.supKey not in SUPPLIERS: raise HTTPException(400, "Proveedor inválido")
    oc = {"id": f"OC-2026-{186 + len(OCS)}", "supKey": body.supKey,
          "supplier": SUPPLIERS[body.supKey]["name"], "items": body.items,
          "total": body.total, "eta": body.eta, "status": "pending"}
    OCS.insert(0, oc); AUDIT.append({"action": "create", "id": oc["id"]}); return oc

@app.post("/orders/{oc_id}/approve")
def approve(oc_id: str):
    for o in OCS:
        if o["id"] == oc_id: o["status"] = "approved"; AUDIT.append({"action": "approve", "id": oc_id}); return o
    raise HTTPException(404, "OC no encontrada")

@app.post("/orders/{oc_id}/reject")
def reject(oc_id: str):
    for o in OCS:
        if o["id"] == oc_id: o["status"] = "rejected"; AUDIT.append({"action": "reject", "id": oc_id}); return o
    raise HTTPException(404, "OC no encontrada")

@app.get("/suppliers")
def suppliers(): return [supplier_score(k) for k in SUPPLIERS]

@app.get("/alerts")
def alerts():
    out = []
    for s in CATALOG.values():
        r = replenish(s, 30)
        if r["status"] in ("critical", "risk"):
            out.append({"level": "crit", "title": f"Quiebre: {s.name}", "detail": f"Cobertura {r['days_cover']}d · pide {r['suggested_qty']}u"})
        elif r["status"] == "excess":
            out.append({"level": "warn", "title": f"Exceso: {s.name}", "detail": "Congela recompra"})
    return out

@app.get("/audit")
def get_audit(): return AUDIT[-50:]

@app.get("/financing")
def financing(need: float = 60000):
    ranked = sorted(FINANCING, key=lambda f: f["rate"])
    return {"need": need, "best": ranked[0]["id"], "options": ranked}

@app.post("/copilot/chat")
def chat(body: ChatIn):
    reps = [replenish(s) for s in CATALOG.values()]
    return answer(body.question, {"reps": reps, "financing": FINANCING})
