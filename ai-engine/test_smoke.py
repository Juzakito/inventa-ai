"""Smoke tests del motor IA — corre con `python test_smoke.py` (sin dependencias)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from forecast import SKU, forecast
from replenishment import replenish
from copilot import answer

ACEITE = SKU("SKU-001", "Aceite Primor 1L", 62, 0.18, 4, 180, 400, 1400, 9.4, 11.9)

def test_forecast_horizons():
    for h in (30, 60, 90, 180):
        f = forecast(ACEITE, horizon=h)
        assert f["demand"] > 0 and len(f["points"]) == h
        assert 0.80 <= f["confidence"] <= 1.0
        assert "Media 30d" in f["explain"]

def test_replenishment_critical():
    r = replenish(ACEITE, 30)
    assert r["status"] == "critical"          # stock 180 << ROP
    assert r["suggested_qty"] > 0 and r["safety_stock"] > 0
    assert r["days_cover"] < ACEITE.lead      # quiebre antes del lead time
    assert "Compra YA" in r["recommendation"]

def test_replenishment_excess():
    muerto = SKU("SKU-011", "Galletas", 9, 0.80, 5, 3200, 200, 800, 5.9, 6.5)
    r = replenish(muerto, 30)
    assert r["status"] == "excess" and r["suggested_qty"] == 0

def test_copilot_intents():
    reps = [replenish(ACEITE, 30)]
    assert "Compra esta semana" in answer("¿Qué debo comprar esta semana?", {"reps": reps})["answer"]
    assert "riesgo" in answer("¿Qué SKU corre riesgo?", {"reps": reps})["answer"]
    assert "S/ 5,000" not in answer("hola", {"reps": reps})["answer"]  # fallback genérico, sin cifras inventadas

if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t(); print(f"PASS {t.__name__}")
    print(f"{len(tests)} tests OK")
