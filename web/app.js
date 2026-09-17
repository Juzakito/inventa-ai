// INVENTA.AI — App logic (SPA, sin build)
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
let CH = {};
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2600); }
function toggleTheme() { const h = document.documentElement; h.dataset.theme = h.dataset.theme === "dark" ? "light" : "dark"; }
function enterApp(p) { $("#view-landing").style.display = "none"; $("#view-app").style.display = "block"; window.scrollTo(0, 0); if (p) go(p); }
function exitApp() { $("#view-app").style.display = "none"; $("#view-landing").style.display = ""; window.scrollTo(0, 0); }
function go(p) { $$(".side .mi[data-p]").forEach(b => b.classList.toggle("on", b.dataset.p === p)); $$(".page").forEach(x => x.classList.remove("on")); $("#p-" + p).classList.add("on"); if (p === "analytics") drawAnalytics(); }
$$(".side .mi[data-p]").forEach(b => b.onclick = () => go(b.dataset.p));

// Hero mini bars
(function () { const el = $("#hero-bars"); if (!el) return; const f = forecastFor(SKUS[0], 28); const mx = Math.max(...f.map(x => x.qty)); el.innerHTML = f.map((d, i) => `<i style="height:${Math.round(d.qty / mx * 100)}%" class="${i > 22 ? "r" : i > 14 ? "o" : ""}" title="${d.date}: ${d.qty}u"></i>`).join(""); })();

// ---- KPIs dashboard ----
(function () {
  const k = KPIS;
  $("#kpi-grid").innerHTML = [
    ["Ventas proyectadas 30d", PEN(k.salesProj), `▲ +${k.salesDelta}%`, "up"],
    ["Stock crítico", k.critical + " SKUs", "● comprar hoy", "down"],
    ["Inventario valorizado", PEN(k.inventoryVal), "14 SKUs activos", ""],
    ["Ahorro generado", PEN(k.savings), "ROI " + k.roi + "×", "up"],
    ["Riesgo de quiebre", k.breakRisk + "%", "● 5 SKUs", "down"],
    ["Fill Rate", k.fillRate + "%", "▲ +2.1 pts", "up"],
  ].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span style="font-size:12.5px;font-weight:700" class="${x[3]}">${x[2]}</span></div>`).join("");
})();

// ---- Forecast chart (dashboard + predictiva) ----
let H = 30;
function drawForecast(canvas, sku, h) {
  const hist = historyFor(sku, 60).slice(-30);
  const fc = forecastFor(sku, h);
  const labels = [...hist.map(x => x.date.slice(5)), ...fc.map(x => x.date.slice(5))];
  if (CH[canvas]) CH[canvas].destroy();
  const dark = document.documentElement.dataset.theme === "dark";
  CH[canvas] = new Chart(document.getElementById(canvas), { type: "line",
    data: { labels, datasets: [
      { label: "Histórico", data: [...hist.map(x => x.qty), ...Array(fc.length).fill(null)], borderColor: "#93A0BC", borderDash: [5, 5], pointRadius: 0, tension: .35 },
      { label: "Forecast IA", data: [...Array(hist.length - 1).fill(null), hist[hist.length - 1].qty, ...fc.map(x => x.qty)], borderColor: "#1B3BFF", backgroundColor: "rgba(27,59,255,.12)", fill: true, pointRadius: 0, tension: .35, borderWidth: 2.5 }] },
    options: { plugins: { legend: { labels: { color: dark ? "#EDF1FF" : "#0B1023", boxWidth: 12 } } }, scales: { x: { ticks: { maxTicksLimit: 8, color: dark ? "#93A0BC" : "#5B6478" } }, y: { ticks: { color: dark ? "#93A0BC" : "#5B6478" } } } } });
}
drawForecast("ch-forecast", SKUS[0], 30);
$$("#fc-tabs .tab").forEach(t => t.onclick = () => { $$("#fc-tabs .tab").forEach(x => x.classList.remove("on")); t.classList.add("on"); H = +t.dataset.h; drawForecast("ch-forecast", SKUS[0], H); });

// Forecast page: selector + explicación
(function () {
  const sel = $("#fc-sku"); sel.innerHTML = SKUS.map((s, i) => `<option value="${i}">${s.name}</option>`).join("");
  let h2 = 30, idx = 0;
  const render = () => { const s = SKUS[idx]; drawForecast("ch-fc2", s, h2); const r = replenishment(s, h2);
    $("#fc-explain").innerHTML = `✦ <b>Por qué predecimos ${r.demandH.toLocaleString("es-PE")}u en ${h2} días para ${s.name}:</b> media 30d de ${r.avgDaily.toFixed(1)}u/día × tendencia +${(forecastFor(s,30).reduce((a,b)=>a+b.qty,0)/ (historyFor(s,30).reduce((a,b)=>a+b.qty,0)) *100-100).toFixed(1)}% · boost finde ×1.28 y quincena ×1.18 · CV ${(s.cv*100).toFixed(0)}% (${s.xyz}) · lead time ${s.lead}d de ${SUPPLIERS[s.supplier].name} → safety stock <b>${r.safety}u</b>, ROP <b>${r.rop}u</b>. Cobertura actual: <b>${r.daysCover.toFixed(1)} días</b>.`; };
  sel.onchange = () => { idx = +sel.value; render(); };
  $$("#fc-tabs2 .tab").forEach(t => t.onclick = () => { $$("#fc-tabs2 .tab").forEach(x => x.classList.remove("on")); t.classList.add("on"); h2 = +t.dataset.h; render(); });
  render();
})();

// ---- Copilot ----
const chatBox = $("#chat");
function bubble(who, html) { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; chatBox.appendChild(d); chatBox.scrollTop = 1e6; }
bubble("ai", "👋 Soy tu <b>Copilot de compras</b>. Analicé 14 SKUs y 180 días de ventas. Tienes <b>5 SKUs en riesgo</b> y <b>S/ 96,400 inmovilizados</b>. ¿Empezamos por lo urgente?");
function ask(q) {
  q = (q || "").trim(); if (!q) return; bubble("me", q); $("#chat-in").value = "";
  const t = q.toLowerCase();
  const reps = SKUS.map(s => ({ s, r: replenishment(s, 30) }));
  const crit = reps.filter(x => x.r.status === "critical"), risk = reps.filter(x => x.r.status === "risk"), exc = reps.filter(x => x.r.status === "excess");
  let a;
  if (t.includes("comprar") || t.includes("semana") || t.includes("orden") || t.includes("recomienda")) {
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
    a = `✦ Analicé tu pregunta contra 14 SKUs y 180 días de historia. Puedo responder: <b>qué comprar, qué está en riesgo, dónde está tu dinero inmovilizado, cuánto pierdes si no compras y qué financiamiento conviene</b> — todo con números. Prueba: “¿Qué debo comprar esta semana?”`;
  }
  setTimeout(() => bubble("ai", a), 350);
}

// ---- Radar ----
(function () {
  const reps = SKUS.map(s => ({ s, r: replenishment(s, 30) }));
  const li = (x, extra) => `<li><b style="color:var(--ink)">${x.s.name}</b> — ${extra}</li>`;
  $("#radar-crit").innerHTML = reps.filter(x => ["critical", "risk"].includes(x.r.status)).map(x => li(x, `${x.r.daysCover.toFixed(1)}d cobertura · pide ${x.r.suggested}u`)).join("");
  $("#radar-ex").innerHTML = reps.filter(x => x.r.status === "excess").map(x => li(x, `${PEN(x.s.stock * x.s.cost)} inmovilizados`)).join("");
  const op = [...reps].filter(x => x.s.abc === "A" && x.r.status !== "critical").slice(0, 4);
  $("#radar-op").innerHTML = op.map(x => li(x, `margen ${x.s.margin}% · +${(x.r.avgDaily * 30).toFixed(0)}u/mes`)).join("");
})();

// ---- Replenishment table ----
(function () {
  const badge = { critical: '<span class="badge b-crit">● Crítico</span>', risk: '<span class="badge b-risk">● En riesgo</span>', excess: '<span class="badge b-ex">◆ Exceso</span>', ok: '<span class="badge b-ok">✓ Saludable</span>' };
  $("#rep-body").innerHTML = SKUS.map(s => { const r = replenishment(s, 30); return `<tr><td><b>${s.name}</b><br><span class="muted">${s.id} · ${SUPPLIERS[s.supplier].name}</span></td>
    <td class="mono">${s.stock}u</td><td class="mono">${r.rop}u</td><td class="mono">${r.safety}u</td><td class="mono">${r.daysCover.toFixed(1)}d</td>
    <td class="mono"><b>${r.suggested}u</b></td><td class="mono">${PEN(r.investment)}</td><td>${badge[r.status]}</td>
    <td><button class="btn btn-b btn-s" onclick="toast('✓ ${r.suggested}u de ${s.name} agregados a OC-2026-186')">+ OC</button></td></tr>`; }).join("");
})();

// ---- Orders ----
function renderOCs() {
  const st = { pending: '<span class="badge b-risk">⏳ Pendiente</span>', approved: '<span class="badge b-info">✓ Aprobada</span>', received: '<span class="badge b-ok">📦 Recibida</span>', rejected: '<span class="badge b-crit">✕ Rechazada</span>' };
  $("#oc-list").innerHTML = PURCHASE_ORDERS.map((o, i) => `<div class="panel" style="margin-bottom:12px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <div><b class="mono">${o.id}</b> · <b>${o.supplier}</b> · entrega ${o.eta}<br><span class="muted" style="font-size:13px">${o.items}</span><br><span style="font-size:13px">✦ <i>${o.ai}</i></span></div>
    <div style="margin-left:auto;text-align:right"><b class="mono" style="font-size:19px">${PEN(o.total)}</b><br>${st[o.status]}</div></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${o.status === "pending" ? `<button class="btn btn-b btn-s" onclick="ocAct(${i},'approved')">✓ Aprobar</button><button class="btn btn-g btn-s" onclick="toast('✏️ Editor de OC ${o.id}: cantidades y precios ajustables')">✏️ Editar</button><button class="btn btn-g btn-s" onclick="ocAct(${i},'rejected')">✕ Rechazar</button><button class="btn btn-g btn-s" onclick="toast('📅 ${o.id} programada para el lunes 8:00am')">📅 Programar</button>` : ""}
    <button class="btn btn-g btn-s" onclick="toast('📄 ${o.id}.pdf generado')">PDF</button><button class="btn btn-g btn-s" onclick="toast('💬 ${o.id} enviada por WhatsApp a ${o.supplier}')">WhatsApp</button><button class="btn btn-g btn-s" onclick="toast('✉️ ${o.id} enviada por email')">Email</button></div></div>`).join("");
  const p = PURCHASE_ORDERS.filter(o => o.status === "pending").length;
  $("#oc-badge").textContent = p; $("#oc-badge").style.display = p ? "" : "none";
}
function ocAct(i, s) { PURCHASE_ORDERS[i].status = s; renderOCs(); toast(s === "approved" ? `✓ ${PURCHASE_ORDERS[i].id} aprobada y enviada al proveedor` : `✕ ${PURCHASE_ORDERS[i].id} rechazada`); }
renderOCs();

// ---- Financing ----
function renderFin() {
  const need = +$("#fin-range").value;
  $("#fin-need").textContent = PEN(need);
  $("#fin-list").innerHTML = FINANCING.map(f => { const cover = Math.min(100, Math.round(f.amount / need * 100));
    return `<div class="fin ${f.id === "F1" ? "rec" : ""}">${f.tag ? `<span class="tag">${f.tag}</span>` : ""}<div style="display:flex;gap:10px;align-items:center"><b style="font-size:16px">${f.entity}</b><span class="badge b-info">${f.type}</span><span class="muted" style="font-size:12.5px;margin-left:auto">Score IA ${f.score}/100 · aprueba en ${f.approval}</span></div>
    <div class="fin-grid"><div><small>Monto</small><b class="mono">${PEN(f.amount)}</b></div><div><small>Tasa mensual</small><b class="mono">${f.rate}%</b></div><div><small>Plazo</small><b class="mono">${f.term}d</b></div><div><small>Cuota</small><b class="mono">${PEN(f.quota)}</b></div></div>
    <p style="font-size:13.5px;margin:0 0 12px">✦ <i>${f.why}</i> · Cubre el ${cover}% de tu necesidad.</p>
    <button class="btn ${f.id === "F1" ? "btn-b" : "btn-g"} btn-s" onclick="toast('✓ Solicitud a ${f.entity} pre-aprobada con tu historial de ventas')">Solicitar ${PEN(Math.min(f.amount, need))} →</button></div>`; }).join("");
}
renderFin();

// ---- Inventory ----
(function () {
  const reps = SKUS.map(s => ({ s, r: replenishment(s, 30) }));
  const deadVal = reps.filter(x => x.r.status === "excess").reduce((a, x) => a + x.s.stock * x.s.cost, 0);
  const aVal = SKUS.filter(s => s.abc === "A").reduce((a, s) => a + s.stock * s.cost, 0);
  $("#inv-kpis").innerHTML = [["Inventario valorizado", PEN(KPIS.inventoryVal), "14 SKUs"], ["Dinero inmovilizado", PEN(deadVal), "3 SKUs muertos"], ["Clase A (% valor)", Math.round(aVal / KPIS.inventoryVal * 100) + "%", "enfoque IA"]].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span class="muted" style="font-size:12.5px">${x[2]}</span></div>`).join("");
  const dg = (s, r) => r.status === "excess" ? '<span class="badge b-ex">◆ Muerto / exceso</span>' : r.status === "critical" ? '<span class="badge b-crit">● Reponer ya</span>' : r.status === "risk" ? '<span class="badge b-risk">● Vigilar</span>' : '<span class="badge b-ok">✓ Sano</span>';
  $("#inv-body").innerHTML = SKUS.map(s => { const r = replenishment(s, 30); return `<tr><td><b>${s.name}</b><br><span class="muted">${s.id}</span></td><td>${s.cat}</td><td class="mono">${s.stock}u</td><td class="mono">${PEN(s.stock * s.cost)}</td><td><b>${s.abc}</b></td><td><b>${s.xyz}</b></td><td class="mono">${s.margin}%</td><td>${dg(s, r)}</td></tr>`; }).join("");
})();

// ---- Analytics ----
function drawAnalytics() {
  if (CH.ana1) return;
  const h = historyFor(SKUS[0], 90); const f = forecastFor(SKUS[0], 30);
  const dark = document.documentElement.dataset.theme === "dark";
  CH.ana1 = new Chart($("#ch-ana1"), { type: "bar", data: { labels: h.slice(-30).map(x => x.date.slice(5)), datasets: [{ label: "Ventas reales", data: h.slice(-30).map(x => x.qty), backgroundColor: "rgba(27,59,255,.75)", borderRadius: 4 }, { label: "Forecast", data: [...Array(23).fill(null), ...f.slice(0, 7).map(x => x.qty)], type: "line", borderColor: "#00C2FF", pointRadius: 0, tension: .4 }] }, options: { plugins: { legend: { labels: { color: dark ? "#EDF1FF" : "#0B1023", boxWidth: 12 } } } } });
  CH.ana2 = new Chart($("#ch-ana2"), { type: "doughnut", data: { labels: ["Clase A (80% valor)", "Clase B (15%)", "Clase C (5%)"], datasets: [{ data: [80, 15, 5], backgroundColor: ["#1B3BFF", "#7C5CFF", "#00C2FF"], borderWidth: 0 }] }, options: { plugins: { legend: { position: "bottom", labels: { color: dark ? "#EDF1FF" : "#0B1023", boxWidth: 12 } } } } });
}
(function () {
  const k = KPIS;
  $("#ana-kpis").innerHTML = [["GMROI", k.gmroi + "×", "up", "por sol invertido"], ["Fill Rate", k.fillRate + "%", "up", "meta 98%"], ["Sell-Through", k.sellThrough + "%", "", "30 días"], ["OTIF", k.otif + "%", "up", "on-time in-full"], ["Nivel servicio", k.service + "%", "up", "95% objetivo"], ["Riesgo quiebre", k.breakRisk + "%", "down", "5 SKUs"]].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span style="font-size:12px" class="muted">${x[3]}</span></div>`).join("");
})();

// ---- Integrations ----
(function () {
  const ints = [["🛍️", "Shopify", "Pedidos + stock · sync 5min", 1], ["🟡", "Mercado Libre", "Ventas + reputación p/ crédito", 1], ["🟣", "WooCommerce", "Catálogo + órdenes", 1], ["🔴", "Falabella", "Seller center · stock", 0], ["📦", "Amazon FBA", "Buy Box + inbound", 0], ["🧾", "POS / Alegra", "Ticket + cierre diario", 1], ["📊", "Excel / Sheets", "Carga masiva en 1 clic", 1], ["🔌", "API + Webhooks", "ERP custom · SAP · Odoo", 1], ["💬", "WhatsApp Business", "Alertas + aprobación OC", 1]];
  $("#int-grid").innerHTML = ints.map(x => `<div class="int"><div class="ic">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div>${x[3] ? '<span class="dotok"></span>' : '<span class="badge b-info" style="margin-left:auto">Pronto</span>'}</div>`).join("");
})();
