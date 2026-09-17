// INVENTA.AI — Cliente del backend (src/api/client.js)
// Habla con api/main.py cuando está desplegada. Base configurable:
// window.__API_BASE__ (inyectado en staging/prod) o localhost en desarrollo.
const BASE = () => (typeof window !== "undefined" && window.__API_BASE__) || "http://localhost:8000";

async function get(path) {
  const r = await fetch(BASE() + path);
  if (!r.ok) throw new Error("API " + r.status + " en " + path);
  return r.json();
}

async function post(path, body) {
  const r = await fetch(BASE() + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  if (!r.ok) throw new Error("API " + r.status + " en " + path);
  return r.json();
}

const api = {
  health: () => get("/health"),
  forecast: (sku, h = 30) => get(`/forecast/${sku}?horizon=${h}`),
  replenishment: () => get("/replenishment"),
  suppliers: () => get("/suppliers"),
  alerts: () => get("/alerts"),
  orders: () => get("/orders"),
  createOrder: (o) => post("/orders", o),
  approveOrder: (id) => post(`/orders/${id}/approve`),
  rejectOrder: (id) => post(`/orders/${id}/reject`),
  chat: (q) => post("/copilot/chat", { question: q }),
};

// Prueba de conexión usada en Ajustes → Backend. Devuelve texto para la UI.
async function pingBackend() {
  const t0 = Date.now();
  const h = await api.health();
  return `✅ ${h.service} v${h.version} · ${Date.now() - t0}ms`;
}

export { api, pingBackend };
