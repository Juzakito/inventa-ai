// INVENTA.AI — Motor de automatización (src/services/automation.js)
// Reglas R1–R4: se ejecutan de verdad y dejan rastro en auditoría.
import { PEN, SUPPLIERS, AUTO_RULES, PURCHASE_ORDERS } from "../lib/engine.js";
import { audit, save, ALERTS } from "../store/state.js";
import { $, toast } from "../components/ui/ui.js";
import { renderHome, reps30 } from "../components/sections/views-home.js";
import { renderOCs } from "../components/sections/views-ops.js";

function buildAlerts() {
  const reps = reps30(); ALERTS.length = 0;
  reps.filter(x => ["critical", "risk"].includes(x.r.status)).forEach(x => ALERTS.push({ lvl: "crit", t: "Quiebre: " + x.s.name, d: `Cobertura ${x.r.daysCover.toFixed(1)}d · pide ${x.r.suggested}u (${PEN(x.r.investment)})`, go: "replenishment" }));
  reps.filter(x => x.r.status === "excess").forEach(x => ALERTS.push({ lvl: "warn", t: "Exceso: " + x.s.name, d: `${PEN(x.s.stock * x.s.cost)} inmovilizados · congela recompra`, go: "inventory" }));
  const inv = reps.reduce((a, x) => a + x.r.investment, 0);
  if (AUTO_RULES.find(r => r.id === "R4").on && inv > 50000) ALERTS.push({ lvl: "info", t: "Financiamiento sugerido", d: `Plan 30d de ${PEN(inv)} · Pichincha 1.45% es la mejor oferta`, go: "financing" });
  const n = ALERTS.length; $("#bell-n").textContent = n; $("#bell-n").style.display = n ? "" : "none";
  const dot = { crit: "🔴", warn: "🟣", info: "🔵" };
  $("#alert-drop").innerHTML = ALERTS.map(a => `<div class="alert-it" onclick="go('${a.go}');document.getElementById('alert-drop').classList.remove('open')"><b>${dot[a.lvl]} ${a.t}</b>${a.d}</div>`).join("") || `<div class="alert-it"><b>✅ Sin alertas</b>Todo bajo control.</div>`;
}

function runAutomations(manual) {
  const R = id => AUTO_RULES.find(r => r.id === id);
  let created = 0;
  if (R("R1").on) reps30().filter(x => x.r.status === "critical" && x.r.suggested > 0).forEach(x => {
    if (PURCHASE_ORDERS.some(o => o.status === "pending" && o.items.includes(x.s.name))) return;
    const id = "OC-2026-" + (186 + PURCHASE_ORDERS.length + created);
    PURCHASE_ORDERS.unshift({ id, supKey: x.s.supplier, supplier: SUPPLIERS[x.s.supplier].name, items: `${x.s.name} × ${x.r.suggested}`, total: Math.round(x.r.investment), status: "pending", eta: "Auto · " + x.s.lead + "d lead", ai: "Regla R1: stock bajo 60% del ROP. Revisa y aprueba.", created: "2026-09-17", by: "Regla R1", hist: [{ t: "2026-09-17", e: "Borrador creado por regla R1" }] });
    audit("R1 crea borrador " + id); created++;
  });
  if (R("R3").on) audit("R3 congela recompra de " + reps30().filter(x => x.r.status === "excess").length + " SKUs por 60 días");
  const n = new Date(); $("#auto-last").textContent = n.toLocaleDateString("es-PE") + " " + n.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) + (created ? ` · ${created} borrador(es) creado(s)` : " · sin novedades");
  save(); renderOCs(); renderHome(); buildAlerts(); renderAuto();
  if (manual) toast(created ? `🤖 R1 generó ${created} borrador(es) de OC` : "🤖 Motor ejecutado: sin novedades");
}

function renderAuto() {
  $("#rule-list").innerHTML = AUTO_RULES.map(r => `<div class="rule"><div><b>${r.name}</b><p>${r.desc}</p></div><div class="switch ${r.on ? "on" : ""}" onclick="toggleRule('${r.id}')"></div></div>`).join("");
  const dot = { crit: "🔴", warn: "🟣", info: "🔵" };
  $("#alert-list").innerHTML = ALERTS.map(a => `<div class="alert-it"><b>${dot[a.lvl]} ${a.t}</b>${a.d} <button class="chip" style="margin-top:6px" onclick="go('${a.go}')">Ir →</button></div>`).join("");
}

function toggleRule(id) {
  const r = AUTO_RULES.find(x => x.id === id);
  r.on = !r.on;
  audit("Regla " + id + " " + (r.on ? "activada" : "pausada"));
  save(); runAutomations(false);
}

export { buildAlerts, runAutomations, renderAuto, toggleRule };
