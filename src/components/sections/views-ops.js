// INVENTA.AI — Vistas de operación (src/components/views-ops.js)
// Reabastecimiento · OCs (lectura) · mesa de compras · financiamiento · proveedores · inventario.
// Las MUTACIONES viven en services/actions.js (este módulo solo renderiza).
import { PEN, SUPPLIERS, SKUS, FINANCING, KPIS, PURCHASE_ORDERS, replenishment, supplierScore } from "../../lib/engine.js";
import { $, $$ } from "../ui/ui.js";
import { reps30, pendingOCs } from "./views-home.js";

/* Reabastecimiento */
function renderRep() {
  const badge = { critical: '<span class="badge b-crit">● Crítico</span>', risk: '<span class="badge b-risk">● En riesgo</span>', excess: '<span class="badge b-ex">◆ Exceso</span>', ok: '<span class="badge b-ok">✓ Saludable</span>' };
  $("#rep-body").innerHTML = SKUS.map(s => { const r = replenishment(s, 30); return `<tr><td><b>${s.name}</b><br><span class="muted">${s.id} · ${SUPPLIERS[s.supplier].name}</span></td>
    <td class="mono">${s.stock}u</td><td class="mono">${r.rop}u</td><td class="mono">${r.safety}u</td><td class="mono">${r.daysCover.toFixed(1)}d</td>
    <td class="mono"><b>${r.suggested}u</b></td><td class="mono">${PEN(r.investment)}</td><td>${badge[r.status]}</td>
    <td><button class="btn btn-b btn-s" onclick="quickOC('${s.id}')">+ OC</button></td></tr>`; }).join("");
}

/* Órdenes de compra (render; el CRUD está en services/actions.js) */
let OCM_EDIT = null, armApprove = null;
function getOCM() { return { edit: OCM_EDIT, arm: armApprove }; }
function setOCM(patch) { if ("edit" in patch) OCM_EDIT = patch.edit; if ("arm" in patch) armApprove = patch.arm; }
function renderOCs() {
  const st = { pending: '<span class="badge b-risk">⏳ Pendiente</span>', approved: '<span class="badge b-info">✓ Aprobada</span>', received: '<span class="badge b-ok">📦 Recibida</span>', rejected: '<span class="badge b-crit">✕ Rechazada</span>' };
  $("#oc-list").innerHTML = PURCHASE_ORDERS.map((o, i) => `<div class="panel" style="margin-bottom:12px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <div><b class="mono">${o.id}</b> · <b>${o.supplier}</b> · entrega ${o.eta}<br><span class="muted" style="font-size:13px">${o.items}</span><br><span style="font-size:13px">✦ <i>${o.ai}</i></span></div>
    <div style="margin-left:auto;text-align:right"><b class="mono" style="font-size:19px">${PEN(o.total)}</b><br>${st[o.status]}<br><span class="muted" style="font-size:11.5px">${o.created || ""} · ${o.by || ""}</span></div></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
    ${o.status === "pending" ? `<button class="btn btn-b btn-s" onclick="ocApprove(${i},this)">${armApprove === o.id ? "⚠️ Clic de nuevo para confirmar" : "✓ Aprobar"}</button><button class="btn btn-g btn-s" onclick="openOCModal('${o.id}')">✏️ Editar</button><button class="btn btn-g btn-s" onclick="ocReject(${i})">✕ Rechazar</button>` : ""}
    ${o.status === "approved" ? `<button class="btn btn-g btn-s" onclick="ocReceive(${i})">📦 Marcar recibida</button>` : ""}
    <button class="btn btn-g btn-s" onclick="ocPDF(${i})">PDF</button><button class="btn btn-g btn-s" onclick="ocWA(${i})">WhatsApp</button><button class="btn btn-g btn-s" onclick="ocEmail(${i})">Email</button></div>
    <div class="hist">${(o.hist || []).map(h => `<div><b>${h.t}</b> — ${h.e}</div>`).join("")}</div></div>`).join("") || `<div class="panel">Sin órdenes. <button class="btn btn-b btn-s" onclick="openOCModal()">+ Nueva OC</button></div>`;
  const p = pendingOCs().length;
  $("#oc-badge").textContent = p; $("#oc-badge").style.display = p ? "" : "none";
}

/* Compras · mesa de control */
function renderBuyDesk() {
  const reps = [...reps30()].sort((a, b) => b.r.lossRisk - a.r.lossRisk);
  $("#buy-recs").innerHTML = reps.filter(x => x.r.suggested > 0).slice(0, 5).map((x, i) => `<div class="rule"><div><b>#${i + 1} · ${x.s.name} × ${x.r.suggested}u</b><p>${SUPPLIERS[x.s.supplier].name} · cobertura ${x.r.daysCover.toFixed(1)}d · protege ${PEN(x.r.lossRisk)} · inversión ${PEN(x.r.investment)}</p></div><button class="btn btn-b btn-s" style="margin-left:auto" onclick="quickOC('${x.s.id}')">Aprobar compra</button></div>`).join("");
  const bySup = {};
  reps.forEach(x => { bySup[x.s.supplier] = bySup[x.s.supplier] || { inv: 0, crit: 0 }; bySup[x.s.supplier].inv += x.r.investment; if (["critical", "risk"].includes(x.r.status)) bySup[x.s.supplier].crit++; });
  const top = Object.entries(bySup).sort((a, b) => b[1].inv - a[1].inv).slice(0, 3);
  $("#sup-compare").innerHTML = `<div class="tscroll"><table><thead><tr><th>Proveedor</th><th>Plan 30d</th><th>Lead</th><th>Score</th><th>Críticos</th></tr></thead><tbody>` +
    top.map(([k, v]) => { const s = supplierScore(k); return `<tr><td><b>${s.sup.name}</b></td><td class="mono">${PEN(v.inv)}</td><td class="mono">${s.sup.leadTime}d</td><td><b class="mono">${s.score}</b> (${s.grade})</td><td>${v.crit ? `<span class="badge b-risk">${v.crit}</span>` : `<span class="badge b-ok">0</span>`}</td></tr>`; }).join("") + `</tbody></table></div>
    <p class="muted" style="font-size:12.5px;margin:10px 0 0">✦ Negociación: ${SUPPLIERS[top[0][0]].discount} con ${SUPPLIERS[top[0][0]].name} por volumen de ${PEN(top[0][1].inv)}. Usa este número en tu próxima llamada.</p>`;
  renderSim();
}
function renderSim() {
  const d = +($("#sim-d").value || 30); $("#sim-d-lab").textContent = d + " días";
  let inv = 0, mar = 0;
  SKUS.forEach(s => { const r = replenishment(s, d); inv += r.investment; mar += Math.max(0, r.demandH - s.stock) * (s.price - s.cost); });
  const cost = inv * 0.0145 * (d / 30);
  $("#sim-inv").textContent = PEN(inv); $("#sim-mar").textContent = PEN(mar);
  $("#sim-cost").textContent = PEN(cost); $("#sim-net").textContent = PEN(mar - cost);
  $("#sim-net").style.color = mar - cost >= 0 ? "var(--ok)" : "var(--bad)";
}

/* Financiamiento */
function planInvestment() { return reps30().reduce((a, x) => a + x.r.investment, 0); }
function syncFinNeed() { const r = $("#fin-range"); const plan = Math.round(planInvestment()); r.max = Math.max(200000, plan); r.value = Math.min(plan, +r.max); }
function renderFin() {
  const need = +$("#fin-range").value;
  $("#fin-need").textContent = PEN(need);
  $("#fin-list").innerHTML = FINANCING.map(f => { const cover = Math.min(100, Math.round(f.amount / need * 100));
    return `<div class="fin ${f.id === "F1" ? "rec" : ""}">${f.tag ? `<span class="tag">${f.tag}</span>` : ""}<div style="display:flex;gap:10px;align-items:center"><b style="font-size:16px">${f.entity}</b><span class="badge b-info">${f.type}</span><span class="muted" style="font-size:12.5px;margin-left:auto">Score IA ${f.score}/100 · aprueba en ${f.approval}</span></div>
    <div class="fin-grid"><div><small>Monto</small><b class="mono">${PEN(f.amount)}</b></div><div><small>Tasa mensual</small><b class="mono">${f.rate}%</b></div><div><small>Plazo</small><b class="mono">${f.term}d</b></div><div><small>Cuota</small><b class="mono">${PEN(f.quota)}</b></div></div>
    <p style="font-size:13.5px;margin:0 0 12px">✦ <i>${f.why}</i> · Cubre el ${cover}% de tu necesidad.</p>
    <button class="btn ${f.id === "F1" ? "btn-b" : "btn-g"} btn-s" onclick="finRequest('${f.id}',${need})">Solicitar ${PEN(Math.min(f.amount, need))} →</button></div>`; }).join("");
}
function renderFinSnap() {
  const reps = reps30();
  const plan = reps.reduce((a, x) => a + x.r.investment, 0);
  const prot = reps.reduce((a, x) => a + x.r.lossRisk, 0);
  const frozenVal = reps.filter(x => x.r.status === "excess").reduce((a, x) => a + x.s.stock * x.s.cost, 0);
  $("#fin-snap").innerHTML = [["Capital disponible (caja + muertos)", PEN(KPIS.savings + frozenVal * 0.15)], ["Crédito sugerido por IA", PEN(plan)], ["Costo financiero (1.45%×90d)", PEN(plan * 0.0435)], ["Retorno esperado", PEN(prot + KPIS.savings - plan * 0.0435)]].map(x => `<span><span class="muted">${x[0]}:</span> <b class="mono">${x[1]}</b></span>`).join("");
}

/* Proveedores */
function renderSuppliers() {
  $("#sup-grid").innerHTML = Object.keys(SUPPLIERS).map(k => { const x = supplierScore(k);
    return `<div class="panel"><div style="display:flex;gap:14px;align-items:center">
      <div class="score s-${x.grade}">${x.grade}</div>
      <div><b style="font-size:16px">${x.sup.name}</b><br><span class="muted" style="font-size:13px">${x.sup.contact} · lead ${x.sup.leadTime}d · ★ ${x.sup.rating} · ${x.sup.discount}</span></div>
      <span class="badge ${x.risk === "Saludable" ? "b-ok" : "b-risk"}" style="margin-left:auto">${x.risk}</span></div>
      <div class="fin-grid" style="grid-template-columns:repeat(4,1fr)"><div><small>Score IA</small><b class="mono">${x.score}/100</b></div><div><small>SKUs</small><b class="mono">${x.skus}</b></div><div><small>En OCs</small><b class="mono">${PEN(x.spendOC)}</b></div><div><small>Plan 30d</small><b class="mono">${PEN(x.spendPlan)}</b></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:12.5px">✉️</span><input id="em-${k}" value="${x.sup.email}" aria-label="Email de ${x.sup.name}" style="flex:1;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:8px 11px;font-size:13px;min-width:180px"><button class="btn btn-g btn-s" onclick="supSaveEmail('${k}')">Guardar</button></div>
    </div>`; }).join("");
}

/* Inventario */
function lastRestock(s) {
  const hit = PURCHASE_ORDERS.find(o => o.items.toLowerCase().includes(s.name.slice(0, 14).toLowerCase()));
  return hit ? hit.created || "—" : "—";
}
function invStatePill(st) {
  return st === "ok" ? '<span class="state-pill st-ok">Óptimo</span>' : st === "risk" ? '<span class="state-pill st-low">Bajo</span>' : st === "critical" ? '<span class="state-pill st-crit">Crítico</span>' : '<span class="state-pill st-low">Sobrestock</span>';
}
function invRows() {
  const q = ($("#inv-q").value || "").toLowerCase(), cat = $("#inv-cat").value, rk = $("#inv-risk").value, sup = $("#inv-sup").value;
  return reps30()
    .map(x => ({ ...x }))
    .filter(x => (!q || x.s.name.toLowerCase().includes(q) || x.s.id.toLowerCase().includes(q) || SUPPLIERS[x.s.supplier].name.toLowerCase().includes(q)) && (!cat || x.s.cat === cat) && (!rk || x.r.status === rk) && (!sup || x.s.supplier === sup))
    .sort((a, b) => a.r.daysCover - b.r.daysCover);
}
function fillInvFilters() {
  const cats = [...new Set(SKUS.map(s => s.cat))];
  $("#inv-cat").innerHTML = `<option value="">Categoría: todas</option>` + cats.map(c => `<option>${c}</option>`).join("");
  $("#inv-sup").innerHTML = `<option value="">Proveedor: todos</option>` + Object.keys(SUPPLIERS).map(k => `<option value="${k}">${SUPPLIERS[k].name}</option>`).join("");
}
function renderInv() {
  if (!$("#inv-cat").options.length || $("#inv-cat").options.length <= 1) fillInvFilters();
  const reps = reps30();
  const deadVal = reps.filter(x => x.r.status === "excess").reduce((a, x) => a + x.s.stock * x.s.cost, 0);
  const aVal = SKUS.filter(s => s.abc === "A").reduce((a, s) => a + s.stock * s.cost, 0);
  $("#inv-kpis").innerHTML = [["Inventario valorizado", PEN(KPIS.inventoryVal), SKUS.length + " SKUs"], ["Dinero inmovilizado", PEN(deadVal), "recuperable con promo"], ["Clase A (% valor)", Math.round(aVal / KPIS.inventoryVal * 100) + "%", "enfoque IA"]].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span class="muted" style="font-size:12.5px">${x[2]}</span></div>`).join("");
  $("#inv-body").innerHTML = invRows().map(x => `<tr><td class="mono">${x.s.id}</td><td><b>${x.s.name}</b></td><td>${x.s.cat}</td>
    <td class="mono">${x.s.stock}</td><td class="mono">${x.s.min}</td><td>${invStatePill(x.r.status)}</td>
    <td>${SUPPLIERS[x.s.supplier].name}</td><td class="mono" style="font-size:12.5px">${lastRestock(x.s)}</td>
    <td>${x.r.suggested ? `<button class="btn btn-b btn-s" onclick="quickOC('${x.s.id}')">Comprar</button>` : `<span class="muted" style="font-size:12px">—</span>`}</td></tr>`).join("") || `<tr><td colspan="9" class="muted">Sin resultados para este filtro.</td></tr>`;
}

export { renderRep, renderOCs, getOCM, setOCM, renderBuyDesk, renderSim, planInvestment, syncFinNeed, renderFin, renderFinSnap, renderSuppliers, invRows, fillInvFilters, renderInv, lastRestock };
