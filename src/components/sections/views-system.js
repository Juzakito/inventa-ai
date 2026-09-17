// INVENTA.AI — Vistas de sistema (src/components/views-system.js)
// Landing widgets · Copiloto · Analytics · Integraciones · Ajustes.
import { PEN, SUPPLIERS, SKUS, historyFor, forecastFor, replenishment, supplierScore } from "../../lib/engine.js";
import { AUDIT, session } from "../../store/state.js";
import { $, $$, CH, toast, openModal, chartBase, spark } from "../ui/ui.js";
import { reps30 } from "./views-home.js";

/* Landing: calculadora ROI + demo */
function calcROI() {
  const v = +($("#roi-sales").value || 0), inv = +($("#roi-inv").value || 0);
  $("#roi-a").textContent = PEN(v * 0.12 * 0.7); $("#roi-b").textContent = PEN(inv * 0.20 * 0.6);
  const gain = v * 0.12 * 0.7 + inv * 0.20 * 0.6; $("#roi-c").textContent = (gain / 18000).toFixed(1) + "×";
}
function openDemo() { $("#demo-form").style.display = ""; $("#demo-ok").style.display = "none"; openModal("demo-modal"); }
function submitDemo() {
  const n = $("#dm-name").value.trim(), c = $("#dm-co").value.trim(), m = $("#dm-mail").value.trim();
  if (!n || !c || !/^\S+@\S+\.\S+$/.test(m)) { toast("⚠️ Completa nombre, empresa y un email válido"); return; }
  try { const l = JSON.parse(localStorage.getItem("inventa_leads") || "[]"); l.push({ n, c, m, b: $("#dm-biz").value, t: new Date().toISOString() }); localStorage.setItem("inventa_leads", JSON.stringify(l)); } catch (e) {}
  $("#demo-form").style.display = "none"; $("#demo-ok").style.display = "";
}
function initHeroBars() {
  const el = $("#hero-bars"); if (!el) return;
  const f = forecastFor(SKUS[0], 28); const mx = Math.max(...f.map(x => x.qty));
  el.innerHTML = f.map((d, i) => `<i style="height:${Math.round(d.qty / mx * 100)}%" class="${i > 22 ? "r" : i > 14 ? "o" : ""}" title="${d.date}: ${d.qty}u"></i>`).join("");
}

/* Copiloto (responde con datos calculados del motor) */
function bubble(who, html) {
  const box = $("#chat");
  const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html;
  box.appendChild(d); box.scrollTop = 1e6;
}
function initChat() {
  bubble("ai", "👋 Soy tu <b>Copilot de compras</b>. Analicé 14 SKUs y 180 días de ventas. Tienes <b>5 SKUs en riesgo</b> y <b>S/ 96,400 inmovilizados</b>. ¿Empezamos por lo urgente?");
}
function ask(q) {
  q = (q || "").trim(); if (!q) return; bubble("me", q); $("#chat-in").value = "";
  const t = q.toLowerCase();
  const reps = reps30();
  const crit = reps.filter(x => x.r.status === "critical"), risk = reps.filter(x => x.r.status === "risk"), exc = reps.filter(x => x.r.status === "excess");
  let a;
  if (t.includes("retraso") || t.includes("proveedor") || t.includes("cumplen") || t.includes("scorecard")) {
    const obs = Object.keys(SUPPLIERS).map(supplierScore).filter(x => x.risk !== "Saludable");
    a = obs.length ? `🏭 <b>Proveedores en observación (${obs.length}):</b><br>` + obs.map(x => `• <b>${x.sup.name}</b> — score ${x.score}/100 (${x.grade}) · ${x.crit} SKU(s) críticos · lead ${x.sup.leadTime}d · ${x.risk}`).join("<br>") + `<br><br>Detalle y contactos en <button class="chip" onclick="go('suppliers')">Proveedores →</button>`
      : `🏭 Todos tus proveedores están saludables (score ≥ 80). El lead time más alto es Kimberly-Clark (6d) pero sin SKUs críticos.`;
  } else if (t.includes("comprar") || t.includes("semana") || t.includes("orden") || t.includes("recomienda")) {
    const top = [...reps].sort((x, y) => y.r.lossRisk - x.r.lossRisk).slice(0, 3);
    a = `📋 <b>Compra esta semana (ordenado por pérdida evitada):</b><br>` + top.map((x, i) => `${i + 1}. <b>${x.s.name}</b> — ${x.r.suggested}u (${PEN(x.r.investment)}) · cobertura ${x.r.daysCover.toFixed(1)}d · evita pérdida de <b>${PEN(x.r.lossRisk)}</b>`).join("<br>") + `<br><br>Justificación: ROP = demanda×lead + safety(95%). <button class="chip" onclick="go('orders')">Ver OCs generadas →</button>`;
  } else if (t.includes("riesgo") || t.includes("quiebre") || t.includes("sku") || t.includes("critico") || t.includes("crítico")) {
    a = `🔴 <b>${crit.length + risk.length} SKUs en riesgo:</b><br>` + [...crit, ...risk].map(x => `• <b>${x.s.name}</b> — stock ${x.s.stock}u, ROP ${x.r.rop}u → quiebre en <b>${x.r.daysCover.toFixed(1)} días</b>`).join("<br>") + `<br><br>El más urgente: <b>${crit[0] ? crit[0].s.name : risk[0].s.name}</b>. Si no compras hoy pierdes <b>${PEN(Math.max(...reps.map(x => x.r.lossRisk)))}</b>/mes.`;
  } else if (t.includes("inmovilizado") || t.includes("muerto") || t.includes("exceso") || t.includes("dinero") || t.includes("capital")) {
    const deadVal = exc.reduce((s, x) => s + x.s.stock * x.s.cost, 0);
    a = `🟣 <b>Tienes ${PEN(deadVal)} inmovilizados</b> en:<br>` + exc.map(x => `• <b>${x.s.name}</b> — ${x.s.stock}u (${PEN(x.s.stock * x.s.cost)}) · rotación casi nula, ABC-${x.s.abc}/XYZ-${x.s.xyz}`).join("<br>") + `<br><br>Plan IA: congela recompra 60d + pack promo −15% + devuelve 800u a ${SUPPLIERS[SKUS[10].supplier].name}. Libera ~<b>S/ 38,000</b> de capital.`;
  } else if (t.includes("perder") || t.includes("pierdo") || t.includes("hoy") || t.includes("cuánto") || t.includes("cuanto")) {
    const tot = reps.reduce((s, x) => s + x.r.lossRisk, 0);
    a = `💸 <b>Si no compras hoy: ${PEN(tot)}/mes en ventas perdidas</b> + fill rate cae de 93.2% → 87%. El 72% viene de 3 SKUs clase A. <button class="chip" onclick="go('financing')">Financiar con 1 clic →</button>`;
  } else if (t.includes("financia") || t.includes("prestamo") || t.includes("préstamo") || t.includes("tasa") || t.includes("banco")) {
    a = `💳 <b>Mejor opción: Banco Pichincha</b> — S/ 120,000 al 1.45% × 90d (cuota S/ 41,200). Costo total S/ 3,600 vs S/ 6,200 de la fintech. Calza con tu ciclo de inventario de 34 días. <button class="chip" onclick="go('financing')">Ver marketplace →</button>`;
  } else {
    a = `✦ Analicé tu pregunta contra 14 SKUs y 180 días de historia. Puedo responder: <b>qué comprar, qué está en riesgo, dónde está tu capital inmovilizado, qué proveedores tienen retrasos, cuánto pierdes si no compras y qué financiamiento conviene</b> — todo con números. Prueba: “¿Qué proveedores tienen retrasos?”`;
  }
  setTimeout(() => bubble("ai", a), 350);
}

/* Analytics */
function kpiTrail(n = 30) {
  const base = SKUS.map(s => ({ s, r: replenishment(s, 30), h: historyFor(s, 180) }));
  const risk = [], eff = [], cap = [];
  for (let d = n - 1; d >= 0; d--) {
    let crit = 0, ok = 0, frozen = 0;
    base.forEach(({ s, r, h }) => {
      const sold = d === 0 ? 0 : h.slice(-d).reduce((a, x) => a + x.qty, 0);
      const st = s.stock + sold;
      const isCrit = st <= r.rop * 0.6, isRisk = st <= r.rop, isExc = st > s.max * 1.15;
      if (isCrit || isRisk) crit++;
      if (!isCrit && !isRisk && !isExc) ok++;
      if (isExc) frozen += st * s.cost;
    });
    risk.push(crit); eff.push(Math.round(ok / SKUS.length * 100)); cap.push(Math.round(frozen));
  }
  return { risk, eff, cap };
}
function monthLabel(key) { const [y, m] = key.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("es-PE", { month: "short", year: "2-digit" }); }
function monthlyActual() {
  const top = [...SKUS].sort((a, b) => b.daily - a.daily).slice(0, 3);
  const buckets = {};
  top.forEach(s => historyFor(s, 180).forEach(p => { buckets[p.date.slice(0, 7)] = (buckets[p.date.slice(0, 7)] || 0) + p.qty; }));
  return Object.keys(buckets).sort().slice(-6).map(k => ({ k, v: buckets[k] }));
}
function monthlyForecast() {
  const top = [...SKUS].sort((a, b) => b.daily - a.daily).slice(0, 3);
  const per = {};
  top.forEach(s => forecastFor(s, 180).forEach(p => { per[p.date.slice(0, 7)] = (per[p.date.slice(0, 7)] || 0) + p.qty; }));
  return Object.keys(per).sort().slice(0, 6).map(k => ({ k, v: per[k] }));
}
function drawAnalytics() {
  const period = +($("#ana-period").value || 90);
  const trail = kpiTrail(Math.min(period, 90));
  $("#ak-cap").textContent = PEN(trail.cap[trail.cap.length - 1]);
  $("#ak-eff").textContent = trail.eff[trail.eff.length - 1] + "%";
  $("#ak-risk").textContent = trail.risk[trail.risk.length - 1];
  spark("sp-cap", trail.cap, "#1B3BFF"); spark("sp-eff", trail.eff, "#7C5CFF"); spark("sp-risk", trail.risk, "#E8930C");
  const A = monthlyActual(), F = monthlyForecast();
  const labels = [...A.map(x => monthLabel(x.k)), ...F.map(x => monthLabel(x.k))];
  const actual = [...A.map(x => x.v), ...Array(F.length).fill(null)];
  const fc = [...Array(A.length - 1).fill(null), A[A.length - 1].v, ...F.map(x => x.v)];
  ["ch-ana1", "ch-cat", "ch-ana2"].forEach(k => { if (CH[k]) { CH[k].destroy(); delete CH[k]; } });
  const o = chartBase(); o.scales.x.ticks.maxTicksLimit = 12;
  CH["ch-ana1"] = new Chart($("#ch-ana1"), { type: "line",
    data: { labels, datasets: [
      { label: "Demanda real", data: actual, borderColor: "#1B3BFF", backgroundColor: "rgba(27,59,255,.18)", fill: true, pointRadius: 0, tension: .4, borderWidth: 2.5 },
      { label: "Predicción IA", data: fc, borderColor: "#0B1023", borderDash: [5, 4], pointRadius: 0, tension: .4, borderWidth: 2 }] }, options: o });
  const cats = [...new Set(SKUS.map(s => s.cat))];
  const catVal = cats.map(c => SKUS.filter(s => s.cat === c).reduce((a, s) => a + s.stock * s.cost, 0));
  const oc = chartBase(); oc.plugins.legend.display = false;
  CH["ch-cat"] = new Chart($("#ch-cat"), { type: "bar",
    data: { labels: cats.map(c => c.split(" ")[0]), datasets: [{ data: catVal, backgroundColor: ["#1B3BFF", "#7C5CFF", "#4D6BFF", "#00C2FF", "#5B7CFF", "#9AA8FF"], borderRadius: 7 }] },
    options: { ...oc, plugins: { ...oc.plugins, tooltip: { callbacks: { label: c => " " + PEN(c.parsed.y) } } } } });
  const o2 = chartBase(); delete o2.scales; o2.plugins.legend.position = "bottom"; o2.plugins.legend.align = "center";
  CH["ch-ana2"] = new Chart($("#ch-ana2"), { type: "doughnut",
    data: { labels: cats, datasets: [{ data: catVal, backgroundColor: ["#1B3BFF", "#7C5CFF", "#00C2FF", "#4D6BFF", "#5B7CFF", "#9AA8FF"], borderWidth: 2 }] },
    options: { ...o2, plugins: { ...o2.plugins, tooltip: { callbacks: { label: c => " " + c.label + ": " + PEN(c.parsed) } } } } });
  const rows = [...reps30()].sort((a, b) => b.r.daysCover - a.r.daysCover).slice(0, 10);
  const cellCls = x => x.r.status === "critical" ? "h4" : x.r.status === "risk" ? "h3" : x.r.status === "excess" ? "h2" : (x.r.daysCover > 45 ? "h1" : "h0");
  $("#heat-table").innerHTML = `<tr><th>SKU</th>${cats.map(c => `<th>${c.split(" ")[0]}</th>`).join("")}</tr>` +
    rows.map(x => `<tr><td style="text-align:left;font-weight:700;color:var(--ink);background:none;min-width:90px">${x.s.id}</td>` +
      cats.map(c => c === x.s.cat ? `<td class="${cellCls(x)}">${x.r.daysCover.toFixed(0)}d</td>` : `<td class="h0" style="opacity:.35">—</td>`).join("") + `</tr>`).join("");
}

/* Integraciones */
function initIntegrations() {
  const ints = [["🛍️", "Shopify", "Pedidos + stock · sync 5min", 1], ["🟡", "Mercado Libre", "Ventas + reputación p/ crédito", 1], ["🟣", "WooCommerce", "Catálogo + órdenes", 1], ["🔴", "Falabella", "Seller center · stock", 0], ["🛒", "Ripley", "Seller center · stock", 0], ["🧾", "POS / Alegra", "Ticket + cierre diario", 1], ["📊", "Excel / Sheets", "Carga masiva en 1 clic", 1], ["🔌", "API + Webhooks", "ERP custom · SAP · Odoo", 1], ["💬", "WhatsApp Business", "Alertas + aprobación OC", 1]];
  $("#int-grid").innerHTML = ints.map(x => `<div class="int"><div class="ic">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div>${x[3] ? '<span class="dotok"></span>' : '<span class="badge b-info" style="margin-left:auto">Pronto</span>'}</div>`).join("");
}

/* Ajustes */
function can(act) {
  if (session.role === "owner") return true;
  if (session.role === "buyer") return ["create", "edit"].includes(act);
  return false;
}
function renderSettings() {
  const s2 = $("#role-sel2"); if (s2) s2.value = session.role;
  const rows = [["Crear y editar OCs", can("create")], ["Aprobar / rechazar OCs", can("approve")], ["Solicitar financiamiento", session.role !== "viewer"], ["Ver reportes y analytics", true], ["Cambiar reglas de automatización", session.role === "owner"]];
  $("#perm-list").innerHTML = rows.map(r => `<div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)"><span>${r[1] ? "✅" : "⛔"}</span>${r[0]}</div>`).join("");
  $("#mfa-sw").classList.toggle("on", session.mfa);
  $("#mfa-st").textContent = session.mfa ? "Activado — se pedirá confirmación doble en OCs > S/ 10,000" : "Desactivado";
  $("#audit-body").innerHTML = [...AUDIT].reverse().slice(0, 30).map(a => `<tr><td class="mono">${a.t}</td><td>${a.u}</td><td><span class="badge b-info">${a.r}</span></td><td>${a.a}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Sin actividad aún. Cada acción sensible aparecerá aquí.</td></tr>`;
}

export { calcROI, openDemo, submitDemo, initHeroBars, bubble, initChat, ask, kpiTrail, drawAnalytics, initIntegrations, can, renderSettings };
