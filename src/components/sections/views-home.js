// INVENTA.AI — Vistas del home operacional (src/components/views-home.js)
// Bloques: resumen ejecutivo · decisiones · mapa · predicciones. Solo lectura + navegación.
import { PEN, SUPPLIERS, SKUS, KPIS, NETWORK, PURCHASE_ORDERS, historyFor, forecastFor, forecastBands, replenishment, supplierScore } from "../../lib/engine.js";
import { session, audit } from "../../store/state.js";
import { $, $$, CH, chartBase, lineSets } from "../ui/ui.js";

const reps30 = () => SKUS.map(s => ({ s, r: replenishment(s, 30) }));
const pendingOCs = () => PURCHASE_ORDERS.filter(o => o.status === "pending");

/* Modos Ejecutivo / Operaciones */
let MODE = "ops";
function setMode(m) {
  MODE = m;
  const v = $("#view-app");
  v.classList.remove("mode-exec", "mode-ops");
  v.classList.add("mode-" + m);
  $("#seg-exec").classList.toggle("on", m === "exec");
  $("#seg-ops").classList.toggle("on", m === "ops");
  audit("Vista " + (m === "exec" ? "Ejecutiva" : "Operaciones"));
}

/* Bloque 1: resumen ejecutivo + Bloque 2: centro de decisiones */
function renderHome() {
  const reps = reps30();
  const byLoss = [...reps].sort((x, y) => y.r.lossRisk - x.r.lossRisk);
  const crit = reps.filter(x => ["critical", "risk"].includes(x.r.status));
  const exc = reps.filter(x => x.r.status === "excess");
  const plan = reps.reduce((a, x) => a + x.r.investment, 0);
  const frozenVal = exc.reduce((a, x) => a + x.s.stock * x.s.cost, 0);
  $("#exec-buy").innerHTML = byLoss.slice(0, 2).map(x => `<div><span>• <b>${x.s.name}</b> <span class="muted">· ${SUPPLIERS[x.s.supplier].name}</span></span><b class="mono">${x.r.suggested}u</b></div>`).join("");
  const minDays = crit.length ? Math.min(...crit.map(x => x.r.daysCover)) : 99;
  $("#exec-risk-n").textContent = crit.length + " SKUs";
  $("#exec-risk-t").textContent = crit.length ? `Agotarán stock en ~${minDays.toFixed(0)} días si no compras hoy.` : "Sin quiebres proyectados a 30 días.";
  const saving = Math.round(plan * 0.02 + frozenVal * 0.15);
  $("#exec-opp-n").textContent = PEN(saving);
  $("#exec-opp-t").textContent = `2% pronto pago sobre plan de ${PEN(plan)} + 15% recuperable de muertos.`;
  $("#exec-snap").innerHTML = [["Capital inmovilizado", PEN(frozenVal)], ["Ahorro generado 30d", PEN(KPIS.savings)], ["Riesgo de quiebre", KPIS.breakRisk + "%"], ["Ventas pronosticadas", PEN(KPIS.salesProj)], ["ROI estimado", KPIS.roi + "×"]].map(x => `<span><span class="muted">${x[0]}:</span> <b class="mono">${x[1]}</b></span>`).join("");
  $("#dec-red-n").textContent = crit.length;
  $("#dec-red-l").innerHTML = crit.slice(0, 3).map(x => `<li>${x.s.name} — ${x.r.daysCover.toFixed(1)}d</li>`).join("") || "<li>Sin riesgos</li>";
  const atten = reps.filter(x => x.r.status === "risk").length + pendingOCs().length;
  $("#dec-yel-n").textContent = atten;
  $("#dec-yel-l").innerHTML = `<li>${pendingOCs().length} OCs pendientes de aprobación</li>` + reps.filter(x => x.r.status === "risk").slice(0, 2).map(x => `<li>${x.s.name} bajo ROP</li>`).join("");
  $("#dec-grn-n").textContent = PEN(frozenVal + KPIS.savings);
  $("#dec-grn-l").innerHTML = `<li>${PEN(frozenVal)} inmovilizados recuperables</li><li>Financiamiento 1.45% pre-aprobado</li>`;
  $("#opsbuy-body").innerHTML = byLoss.filter(x => x.r.suggested > 0).slice(0, 5).map(x => `<tr><td><b>${x.s.name}</b></td><td class="mono"><b>${x.r.suggested}u</b></td><td>${SUPPLIERS[x.s.supplier].name}</td><td class="mono">≤ ${x.s.lead}d</td><td><button class="btn btn-b btn-s" onclick="quickOC('${x.s.id}')">Comprar</button></td></tr>`).join("");
  $("#pred-vars").innerHTML = [
    ["📈 Tendencia", "Demanda +3–5% mensual en clase A (media móvil 30d)"],
    ["📅 Estacionalidad", "Finde ×1.28 · quincena ×1.18 (patrón LATAM verificado)"],
    ["🎲 Volatilidad", `CV promedio ${(reps.reduce((a, x) => a + x.s.cv, 0) / reps.length * 100).toFixed(0)}% → banda p10–p90`],
    ["⚠️ Factores de riesgo", `${crit.length} SKUs bajo ROP · lead máximo ${Math.max(...SKUS.map(s => s.lead))}d (Kimberly-Clark)`],
  ].map(x => `<div><b>${x[0]}</b><br><span class="muted">${x[1]}</span></div>`).join("");
  renderSupMap();
}

/* Bloque 4: mapa de abastecimiento */
function edgeStatus(a) {
  if (a === "CD") return "ok";
  const skus = SKUS.filter(s => s.supplier === a);
  const bad = skus.some(s => ["critical", "risk"].includes(replenishment(s, 30).status));
  if (bad) return "warn";
  const transit = PURCHASE_ORDERS.some(o => o.supKey === a && o.status === "approved");
  return transit ? "ok" : "";
}
function renderSupMap() {
  const el = $("#supmap"); if (!el) return;
  const riskSup = new Set(SKUS.filter(s => ["critical", "risk"].includes(replenishment(s, 30).status)).map(s => s.supplier));
  let svg = "";
  NETWORK.edges.forEach(e => { const a = NETWORK.nodes.find(n => n.id === e.from), b = NETWORK.nodes.find(n => n.id === e.to);
    svg += `<line class="edge ${edgeStatus(e.from)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`; });
  NETWORK.nodes.forEach(n => { const cls = n.type === "plant" ? "n-plant" : n.type === "dc" ? "n-dc" : "n-branch";
    const risk = riskSup.has(n.id) ? " n-risk" : "";
    svg += `<g class="node ${cls}${risk}" onclick="mapDetail('${n.id}')"><circle cx="${n.x}" cy="${n.y}" r="${n.type === "dc" ? 20 : 13}" fill="${n.type === "dc" ? "var(--primary)" : "var(--card)"}"/><text x="${n.x}" y="${n.y + (n.type === "dc" ? 34 : 28)}" text-anchor="middle">${n.label}</text>${riskSup.has(n.id) ? `<text x="${n.x}" y="${n.y - 20}" text-anchor="middle" style="fill:var(--bad)">● riesgo</text>` : ""}</g>`; });
  el.innerHTML = svg;
  mapDetail("CD");
}
function mapDetail(id) {
  const n = NETWORK.nodes.find(x => x.id === id); const el = $("#map-detail");
  if (id === "CD") { const reps = reps30(); const crit = reps.filter(x => ["critical", "risk"].includes(x.r.status)).length;
    const transit = PURCHASE_ORDERS.filter(o => o.status === "approved").length;
    el.innerHTML = `<b>${n.label}</b><div>📦 Valorizado: <b class="mono">${PEN(KPIS.inventoryVal)}</b></div><div>🚚 En tránsito: <b>${transit} OCs</b> aprobadas</div><div>🔴 SKUs en riesgo: <b>${crit}</b></div><div>✅ Fill rate: <b>93.2%</b> (meta 98%)</div>`; return; }
  if (n.type === "branch") { el.innerHTML = `<b>${n.label}</b><div>📦 Cobertura: <b>18–24 días</b> (reposición semanal desde CD)</div><div>🚚 Próximo despacho: <b>mañana 06:00</b></div><div>✅ Sin quiebres activos</div>`; return; }
  const x = supplierScore(id);
  el.innerHTML = `<b>${x.sup.name}</b><div>Score IA: <b class="mono">${x.score}/100 (${x.grade})</b> · ${x.risk}</div><div>Lead time: <b>${x.sup.leadTime}d</b> · ★ ${x.sup.rating}</div><div>En OCs: <b class="mono">${PEN(x.spendOC)}</b> · plan 30d <b class="mono">${PEN(x.spendPlan)}</b></div><div>✉️ ${x.sup.email}</div><div><button class="btn btn-g btn-s" onclick="go('suppliers')">Abrir ficha →</button></div>`;
}

/* Bloque 5 + página predictiva: charts con bandas */
let H = 30;
function drawForecast(canvas, sku, h) {
  const hist = historyFor(sku, 60).slice(-30).map(x => x.qty);
  const b = forecastBands(sku, h);
  const labels = [...historyFor(sku, 60).slice(-30).map(x => x.date.slice(5)), ...b.map(x => x.date.slice(5))];
  if (CH[canvas]) CH[canvas].destroy();
  CH[canvas] = new Chart(document.getElementById(canvas), { type: "line", data: { labels, datasets: lineSets(hist, b.map(x => x.qty), b) }, options: chartBase() });
}
function drawAggregate(canvas, h) {
  const top = [...SKUS].sort((a, b) => b.daily - a.daily).slice(0, 3);
  const hist = historyFor(top[0], 60).slice(-30);
  const labels = [...hist.map(x => x.date.slice(5))];
  const sumH = hist.map((_, i) => top.reduce((a, s) => a + historyFor(s, 60).slice(-30)[i].qty, 0));
  const bands = top.map(s => forecastBands(s, h));
  const sumF = bands[0].map((_, i) => bands.reduce((a, b) => a + b[i].qty, 0));
  const sumLo = bands[0].map((_, i) => bands.reduce((a, b) => a + b[i].lo, 0));
  const sumHi = bands[0].map((_, i) => bands.reduce((a, b) => a + b[i].hi, 0));
  bands[0].forEach((p) => labels.push(p.date.slice(5)));
  if (CH[canvas]) CH[canvas].destroy();
  CH[canvas] = new Chart(document.getElementById(canvas), { type: "line", data: { labels, datasets: lineSets(sumH, sumF, sumHi.map((hi, i) => ({ hi, lo: sumLo[i] }))) }, options: chartBase() });
  return { total: sumF.reduce((a, b) => a + b, 0), lo: sumLo.reduce((a, b) => a + b, 0), hi: sumHi.reduce((a, b) => a + b, 0) };
}
function initHomeCharts() {
  drawAggregate("ch-forecast", 30);
  $$("#fc-tabs .tab").forEach(t => t.onclick = () => { $$("#fc-tabs .tab").forEach(x => x.classList.remove("on")); t.classList.add("on"); H = +t.dataset.h; drawAggregate("ch-forecast", H); });
}
function initForecastPage() {
  const sel = $("#fc-sku");
  sel.innerHTML = SKUS.map((s, i) => `<option value="${i}">${s.name}</option>`).join("");
  let h2 = 30, idx = 0;
  const render = () => { const s = SKUS[idx]; drawForecast("ch-fc2", s, h2); const r = replenishment(s, h2);
    $("#fc-explain").innerHTML = `✦ <b>Por qué predecimos ${r.demandH.toLocaleString("es-PE")}u en ${h2} días para ${s.name}:</b> media 30d de ${r.avgDaily.toFixed(1)}u/día × tendencia +${(forecastFor(s, 30).reduce((a, b) => a + b.qty, 0) / (historyFor(s, 30).reduce((a, b) => a + b.qty, 0)) * 100 - 100).toFixed(1)}% · boost finde ×1.28 y quincena ×1.18 · CV ${(s.cv * 100).toFixed(0)}% (${s.xyz}) · lead time ${s.lead}d de ${SUPPLIERS[s.supplier].name} → safety stock <b>${r.safety}u</b>, ROP <b>${r.rop}u</b>. Cobertura actual: <b>${r.daysCover.toFixed(1)} días</b>.`; };
  sel.onchange = () => { idx = +sel.value; render(); };
  $$("#fc-tabs2 .tab").forEach(t => t.onclick = () => { $$("#fc-tabs2 .tab").forEach(x => x.classList.remove("on")); t.classList.add("on"); h2 = +t.dataset.h; render(); });
  render();
}

export { MODE, setMode, renderHome, renderSupMap, mapDetail, edgeStatus, drawForecast, drawAggregate, initHomeCharts, initForecastPage, reps30, pendingOCs };
