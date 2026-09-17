// INVENTA.AI — Estado de sesión (src/store/state.js)
// Sesión + persistencia local. Sin DOM salvo a través de ui (toast).
// En producción multi-dispositivo este store se respalda en Supabase (ver db/schema.sql).
import { PURCHASE_ORDERS, AUTO_RULES, SKUS } from "../lib/engine.js";

const ME = "S. Martín";
const session = { role: "owner", mfa: false };
const AUDIT = [];
const ALERTS = [];
const LS_KEY = "inventa_v1";
const LS_SKUS = "inventa_skus";

function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      orders: PURCHASE_ORDERS, rules: AUTO_RULES,
      audit: AUDIT.slice(-200), role: session.role, mfa: session.mfa,
    }));
  } catch (e) { /* almacenamiento no disponible: la app sigue funcionando en memoria */ }
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (!d) return;
    // Restaura CONTENIDO (nunca la referencia: los bindings ESM son de solo lectura)
    if (Array.isArray(d.orders) && d.orders.length) { PURCHASE_ORDERS.length = 0; PURCHASE_ORDERS.push(...d.orders); }
    if (Array.isArray(d.rules)) { AUTO_RULES.length = 0; AUTO_RULES.push(...d.rules); }
    if (Array.isArray(d.audit)) AUDIT.push(...d.audit);
    if (d.role) session.role = d.role;
    session.mfa = !!d.mfa;
  } catch (e) { /* estado corrupto: se arranca con valores semilla */ }
}

function audit(action) {
  const now = new Date();
  AUDIT.push({
    t: now.toLocaleDateString("es-PE") + " " + now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    u: ME, r: session.role, a: action,
  });
  save();
}

function loadCustomSkus() {
  try {
    (JSON.parse(localStorage.getItem(LS_SKUS) || "[]")).forEach(s => {
      if (!SKUS.some(x => x.id === s.id)) SKUS.push(s);
    });
  } catch (e) { /* sin customs previos */ }
}

function persistCustomSku(sku) {
  try {
    const c = JSON.parse(localStorage.getItem(LS_SKUS) || "[]");
    c.push(sku);
    localStorage.setItem(LS_SKUS, JSON.stringify(c));
  } catch (e) { /* sigue en memoria */ }
}

export { ME, session, AUDIT, ALERTS, save, load, audit, loadCustomSkus, persistCustomSku };
