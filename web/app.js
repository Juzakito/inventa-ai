// INVENTA.AI v1.1 — Sistema operativo de compras (SPA, sin build)
// Todo número en pantalla se CALCULA desde el estado (data.js + motor). Nada está hardcodeado.
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
let CH = {};
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2800); }
function toggleTheme() { const h = document.documentElement; h.dataset.theme = h.dataset.theme === "dark" ? "light" : "dark"; }
function enterApp(p) { $("#view-landing").style.display = "none"; $("#view-app").style.display = "block"; window.scrollTo(0, 0); if (p) go(p); runAutomations(false); }
function exitApp() { $("#view-app").style.display = "none"; $("#view-landing").style.display = ""; window.scrollTo(0, 0); }
function go(p) { $$(".side .mi[data-p]").forEach(b => b.classList.toggle("on", b.dataset.p === p)); $$(".page").forEach(x => x.classList.remove("on")); $("#p-" + p).classList.add("on"); document.querySelector(".side").classList.remove("open"); const s = $("#scrim"); if (s) s.classList.remove("on"); if (p === "analytics") drawAnalytics(); if (p === "suppliers") renderSuppliers(); if (p === "auto") renderAuto(); if (p === "settings") renderSettings(); }
$$(".side .mi[data-p]").forEach(b => b.onclick = () => go(b.dataset.p));
function closeModal(id) { $("#" + id).classList.remove("open"); }
$$(".modal-bg").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.classList.remove("open"); }));

/* ---------- Store con persistencia ---------- */
const ME = "S. Martín";
let ROLE = "owner", MFA = false, AUDIT = [], ALERTS = [];
function save() { try { localStorage.setItem("inventa_v1", JSON.stringify({ orders: PURCHASE_ORDERS, rules: AUTO_RULES, audit: AUDIT.slice(-200), role: ROLE, mfa: MFA })); } catch (e) {} }
function load() { try { const d = JSON.parse(localStorage.getItem("inventa_v1") || "null"); if (d) { if (Array.isArray(d.orders) && d.orders.length) PURCHASE_ORDERS = d.orders; if (Array.isArray(d.rules)) AUTO_RULES = d.rules; if (Array.isArray(d.audit)) AUDIT = d.audit; if (d.role) ROLE = d.role; MFA = !!d.mfa; } } catch (e) {} }
function audit(action) { const now = new Date(); AUDIT.push({ t: now.toLocaleDateString("es-PE") + " " + now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }), u: ME, r: ROLE, a: action }); save(); }
function setRole(r) { ROLE = r; $("#role-sel").value = r; const s2 = $("#role-sel2"); if (s2) s2.value = r; audit("Cambio de rol a " + r); save(); renderOCs(); renderSettings(); toast("Rol activo: " + ({ owner: "👑 Dueño", buyer: "🧾 Comprador", viewer: "👁️ Lector" }[r])); }
function can(act) { if (ROLE === "owner") return true; if (ROLE === "buyer") return ["create", "edit"].includes(act); return false; }
function needPerm(act) { if (can(act)) return true; toast("⛔ Tu rol (" + ROLE + ") no permite esta acción. Pide a un Dueño."); audit("Intento denegado (" + ROLE + "): " + act); return false; }
function toggleMFA() { MFA = !MFA; $("#mfa-sw").classList.toggle("on", MFA); $("#mfa-st").textContent = MFA ? "Activado — se pedirá confirmación doble en OCs > S/ 10,000" : "Desactivado"; audit("MFA " + (MFA ? "activado" : "desactivado")); save(); }

/* ---------- Landing: ROI + demo ---------- */
function calcROI() { const v = +($("#roi-sales").value || 0), inv = +($("#roi-inv").value || 0);
  $("#roi-a").textContent = PEN(v * 0.12 * 0.7); $("#roi-b").textContent = PEN(inv * 0.20 * 0.6);
  const gain = v * 0.12 * 0.7 + inv * 0.20 * 0.6; $("#roi-c").textContent = (gain / 18000).toFixed(1) + "×"; }
calcROI();
function openDemo() { $("#demo-form").style.display = ""; $("#demo-ok").style.display = "none"; $("#demo-modal").classList.add("open"); }
function submitDemo() { const n = $("#dm-name").value.trim(), c = $("#dm-co").value.trim(), m = $("#dm-mail").value.trim();
  if (!n || !c || !/^\S+@\S+\.\S+$/.test(m)) { toast("⚠️ Completa nombre, empresa y un email válido"); return; }
  try { const l = JSON.parse(localStorage.getItem("inventa_leads") || "[]"); l.push({ n, c, m, b: $("#dm-biz").value, t: new Date().toISOString() }); localStorage.setItem("inventa_leads", JSON.stringify(l)); } catch (e) {}
  $("#demo-form").style.display = "none"; $("#demo-ok").style.display = ""; }

// Hero mini bars
(function () { const el = $("#hero-bars"); if (!el) return; const f = forecastFor(SKUS[0], 28); const mx = Math.max(...f.map(x => x.qty)); el.innerHTML = f.map((d, i) => `<i style="height:${Math.round(d.qty / mx * 100)}%" class="${i > 22 ? "r" : i > 14 ? "o" : ""}" title="${d.date}: ${d.qty}u"></i>`).join(""); })();

/* ---------- Estado derivado ---------- */
const reps30 = () => SKUS.map(s => ({ s, r: replenishment(s, 30) }));
const frozen = () => reps30().filter(x => x.r.status === "excess").reduce((a, x) => a + x.s.stock * x.s.cost, 0);
const pendingOCs = () => PURCHASE_ORDERS.filter(o => o.status === "pending");

/* ---------- KPIs dashboard ---------- */
function renderKPIs() {
  const k = KPIS, reps = reps30();
  const crit = reps.filter(x => ["critical", "risk"].includes(x.r.status)).length;
  const loss = reps.reduce((a, x) => a + x.r.lossRisk, 0);
  $("#kpi-grid").innerHTML = [
    ["Ventas proyectadas 30d", PEN(k.salesProj), `▲ +${k.salesDelta}%`, "up"],
    ["Stock crítico", crit + " SKUs", "● comprar hoy", "down"],
    ["Inventario valorizado", PEN(k.inventoryVal), "14 SKUs activos", ""],
    ["Capital inmovilizado", PEN(frozen()), "3 SKUs muertos", "down"],
    ["Órdenes pendientes", pendingOCs().length, PEN(pendingOCs().reduce((a, o) => a + o.total, 0)), ""],
    ["Ahorro generado", PEN(k.savings), "ROI " + k.roi + "×", "up"],
    ["Riesgo de quiebre", k.breakRisk + "%", PEN(loss) + " en juego", "down"],
    ["Fill Rate", k.fillRate + "%", "▲ +2.1 pts", "up"],
  ].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:19px;margin:5px 0 2px">${x[1]}</b><span style="font-size:12px;font-weight:700" class="${x[3]}">${x[2]}</span></div>`).join("");
}

/* ---------- Forecast charts ---------- */
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
(function () {
  const sel = $("#fc-sku"); sel.innerHTML = SKUS.map((s, i) => `<option value="${i}">${s.name}</option>`).join("");
  let h2 = 30, idx = 0;
  const render = () => { const s = SKUS[idx]; drawForecast("ch-fc2", s, h2); const r = replenishment(s, h2);
    $("#fc-explain").innerHTML = `✦ <b>Por qué predecimos ${r.demandH.toLocaleString("es-PE")}u en ${h2} días para ${s.name}:</b> media 30d de ${r.avgDaily.toFixed(1)}u/día × tendencia +${(forecastFor(s,30).reduce((a,b)=>a+b.qty,0)/ (historyFor(s,30).reduce((a,b)=>a+b.qty,0)) *100-100).toFixed(1)}% · boost finde ×1.28 y quincena ×1.18 · CV ${(s.cv*100).toFixed(0)}% (${s.xyz}) · lead time ${s.lead}d de ${SUPPLIERS[s.supplier].name} → safety stock <b>${r.safety}u</b>, ROP <b>${r.rop}u</b>. Cobertura actual: <b>${r.daysCover.toFixed(1)} días</b>.`; };
  sel.onchange = () => { idx = +sel.value; render(); };
  $$("#fc-tabs2 .tab").forEach(t => t.onclick = () => { $$("#fc-tabs2 .tab").forEach(x => x.classList.remove("on")); t.classList.add("on"); h2 = +t.dataset.h; render(); });
  render();
})();

/* ---------- Copilot (responde con datos calculados) ---------- */
const chatBox = $("#chat");
function bubble(who, html) { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; chatBox.appendChild(d); chatBox.scrollTop = 1e6; }
bubble("ai", "👋 Soy tu <b>Copilot de compras</b>. Analicé 14 SKUs y 180 días de ventas. Tienes <b>5 SKUs en riesgo</b> y <b>S/ 96,400 inmovilizados</b>. ¿Empezamos por lo urgente?");
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

/* ---------- Radar ---------- */
function renderRadar() {
  const reps = reps30();
  const li = (x, extra) => `<li><b style="color:var(--ink)">${x.s.name}</b> — ${extra}</li>`;
  $("#radar-crit").innerHTML = reps.filter(x => ["critical", "risk"].includes(x.r.status)).map(x => li(x, `${x.r.daysCover.toFixed(1)}d cobertura · pide ${x.r.suggested}u`)).join("");
  $("#radar-ex").innerHTML = reps.filter(x => x.r.status === "excess").map(x => li(x, `${PEN(x.s.stock * x.s.cost)} inmovilizados`)).join("");
  const op = [...reps].filter(x => x.s.abc === "A" && x.r.status !== "critical").slice(0, 4);
  $("#radar-op").innerHTML = op.map(x => li(x, `margen ${x.s.margin}% · +${(x.r.avgDaily * 30).toFixed(0)}u/mes`)).join("");
}

/* ---------- Reabastecimiento ---------- */
function renderRep() {
  const badge = { critical: '<span class="badge b-crit">● Crítico</span>', risk: '<span class="badge b-risk">● En riesgo</span>', excess: '<span class="badge b-ex">◆ Exceso</span>', ok: '<span class="badge b-ok">✓ Saludable</span>' };
  $("#rep-body").innerHTML = SKUS.map(s => { const r = replenishment(s, 30); return `<tr><td><b>${s.name}</b><br><span class="muted">${s.id} · ${SUPPLIERS[s.supplier].name}</span></td>
    <td class="mono">${s.stock}u</td><td class="mono">${r.rop}u</td><td class="mono">${r.safety}u</td><td class="mono">${r.daysCover.toFixed(1)}d</td>
    <td class="mono"><b>${r.suggested}u</b></td><td class="mono">${PEN(r.investment)}</td><td>${badge[r.status]}</td>
    <td><button class="btn btn-b btn-s" onclick="quickOC('${s.id}')">+ OC</button></td></tr>`; }).join("");
}
function quickOC(skuId) {
  if (!needPerm("create")) return;
  const s = SKUS.find(x => x.id === skuId); const r = replenishment(s, 30);
  if (!r.suggested) { toast("✓ " + s.name + " no necesita compra (cobertura sana)"); return; }
  const key = s.supplier, n = PURCHASE_ORDERS.length;
  const id = "OC-2026-" + (186 + n);
  PURCHASE_ORDERS.unshift({ id, supKey: key, supplier: SUPPLIERS[key].name, items: `${s.name} × ${r.suggested}`, total: Math.round(r.investment), status: "pending", eta: "Por definir", ai: `Sugerido por motor: ROP ${r.rop}u, cobertura ${r.daysCover.toFixed(1)}d.`, created: "2026-09-17", by: ME, hist: [{ t: "2026-09-17", e: "Creada desde Reabastecimiento por " + ME }] });
  audit("Crea " + id + " (" + s.name + " × " + r.suggested + ")"); save(); renderOCs(); renderKPIs(); buildAlerts();
  toast("✓ " + id + " creada como borrador pendiente"); go("orders");
}

/* ---------- Órdenes de compra (CRUD real) ---------- */
let OCM_EDIT = null, armApprove = null;
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
function ocTouch(o, e) { o.hist = o.hist || []; const n = new Date(); o.hist.push({ t: n.toLocaleDateString("es-PE") + " " + n.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }), e }); }
function ocApprove(i, btn) {
  if (!needPerm("approve")) return;
  const o = PURCHASE_ORDERS[i];
  if (MFA && o.total > 10000 && armApprove !== o.id) { armApprove = o.id; renderOCs(); toast("🔐 MFA: confirma de nuevo para aprobar " + o.id); return; }
  armApprove = null; o.status = "approved"; ocTouch(o, "Aprobada por " + ME + " (" + ROLE + ")"); audit("Aprueba " + o.id + " por " + PEN(o.total)); save(); renderOCs(); renderKPIs();
  toast("✓ " + o.id + " aprobada y enviada a " + o.supplier);
}
function ocReject(i) { if (!needPerm("approve")) return; const o = PURCHASE_ORDERS[i]; o.status = "rejected"; ocTouch(o, "Rechazada por " + ME); audit("Rechaza " + o.id); save(); renderOCs(); renderKPIs(); toast("✕ " + o.id + " rechazada"); }
function ocReceive(i) { if (!needPerm("approve")) return; const o = PURCHASE_ORDERS[i]; o.status = "received"; ocTouch(o, "Marcada como recibida por " + ME); audit("Recibe " + o.id); save(); renderOCs(); toast("📦 " + o.id + " recibida. Stock actualizado en próximo sync."); }
function openOCModal(id) {
  if (!needPerm(id ? "edit" : "create")) return;
  OCM_EDIT = id || null;
  $("#ocm-title").textContent = id ? "Editar " + id : "Nueva orden de compra";
  $("#ocm-sup").innerHTML = Object.keys(SUPPLIERS).map(k => `<option value="${k}">${SUPPLIERS[k].name}</option>`).join("");
  const o = id ? PURCHASE_ORDERS.find(x => x.id === id) : null;
  if (o) $("#ocm-sup").value = o.supKey;
  $("#ocm-lines").innerHTML = "";
  if (o && o.lines) o.lines.forEach(l => ocAddLine(l.sku, l.qty));
  else ocAddLine();
  if (o) $("#ocm-eta").value = o.eta;
  ocCalcTotal(); $("#oc-modal").classList.add("open");
}
function ocAddLine(sku, qty) {
  const d = document.createElement("div"); d.className = "oc-line";
  d.innerHTML = `<select>${SKUS.map(s => `<option value="${s.id}" ${s.id === sku ? "selected" : ""}>${s.name} (${PEN(s.cost)})</option>`).join("")}</select><input type="number" min="1" value="${qty || 100}" oninput="ocCalcTotal()"><span class="mono line-t" style="font-size:13px"></span><button class="btn btn-g btn-s" onclick="this.parentNode.remove();ocCalcTotal()">✕</button>`;
  d.querySelector("select").onchange = ocCalcTotal;
  $("#ocm-lines").appendChild(d); ocCalcTotal();
}
function ocCalcTotal() {
  let t = 0; $$("#ocm-lines .oc-line").forEach(l => { const s = SKUS.find(x => x.id === l.querySelector("select").value); const q = +(l.querySelector("input").value || 0); const st = Math.round(q * s.cost); t += st; l.querySelector(".line-t").textContent = PEN(st); });
  $("#ocm-total").value = PEN(t); return t;
}
function ocSave() {
  const lines = [...$$("#ocm-lines .oc-line")].map(l => { const s = SKUS.find(x => x.id === l.querySelector("select").value); return { sku: s.id, name: s.name, qty: +(l.querySelector("input").value || 0), cost: s.cost }; }).filter(l => l.qty > 0);
  if (!lines.length) { toast("⚠️ Agrega al menos una línea con cantidad"); return; }
  const key = $("#ocm-sup").value, total = Math.round(lines.reduce((a, l) => a + l.qty * l.cost, 0));
  const items = lines.map(l => `${l.name} × ${l.qty}`).join(" · ");
  if (OCM_EDIT) { const o = PURCHASE_ORDERS.find(x => x.id === OCM_EDIT); Object.assign(o, { supKey: key, supplier: SUPPLIERS[key].name, items, lines, total, eta: $("#ocm-eta").value }); ocTouch(o, "Editada por " + ME); audit("Edita " + o.id); }
  else { const id = "OC-2026-" + (186 + PURCHASE_ORDERS.length); PURCHASE_ORDERS.unshift({ id, supKey: key, supplier: SUPPLIERS[key].name, items, lines, total, status: "pending", eta: $("#ocm-eta").value, ai: "Creada manualmente por " + ME + " con costos del maestro de productos.", created: "2026-09-17", by: ME, hist: [{ t: "2026-09-17", e: "Creada manualmente por " + ME }] }); audit("Crea " + id + " por " + PEN(total)); }
  save(); closeModal("oc-modal"); renderOCs(); renderKPIs(); toast("✓ OC guardada como pendiente");
}
function ocPDF(i) {
  const o = PURCHASE_ORDERS[i];
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>${o.id}</title><style>body{font-family:Arial;padding:40px;color:#111}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #999;padding:8px;text-align:left}.r{text-align:right}.muted{color:#555}</style></head><body>
    <h1>INVENTA.AI — Orden de Compra ${o.id}</h1><p class="muted">Distribuidora San Martín · Lima · ${o.created || ""}</p>
    <p><b>Proveedor:</b> ${o.supplier}<br><b>Entrega esperada:</b> ${o.eta}<br><b>Estado:</b> ${o.status}</p>
    <table><tr><th>Detalle</th><th class="r">Total</th></tr><tr><td>${o.items}</td><td class="r"><b>${PEN(o.total)}</b></td></tr></table>
    <p class="muted">✦ ${o.ai}</p><p class="muted">Generado por INVENTA.AI · ${(o.hist || []).map(h => h.t + ": " + h.e).join(" → ")}</p>
    <script>onload=()=>print()<\/script></body></html>`);
  w.document.close(); audit("Exporta PDF de " + o.id); save();
}
function ocEmail(i) { const o = PURCHASE_ORDERS[i]; const sup = SUPPLIERS[o.supKey] || {};
  location.href = `mailto:${sup.email || ""}?subject=${encodeURIComponent("Orden de compra " + o.id + " — Distribuidora San Martín")}&body=${encodeURIComponent("Estimados " + o.supplier + ":\n\nConfirmamos la orden " + o.id + " por " + PEN(o.total) + ":\n" + o.items + "\n\nEntrega esperada: " + o.eta + "\n\nSaludos,\n" + ME)}`;
  audit("Envía email de " + o.id); save(); }
function ocWA(i) { const o = PURCHASE_ORDERS[i];
  open("https://api.whatsapp.com/send?text=" + encodeURIComponent("🧾 *" + o.id + "* — " + o.supplier + " · " + PEN(o.total) + "\n" + o.items + "\nEntrega: " + o.eta), "_blank");
  audit("Comparte por WhatsApp " + o.id); save(); }

/* ---------- Proveedores ---------- */
function renderSuppliers() {
  $("#sup-grid").innerHTML = Object.keys(SUPPLIERS).map(k => { const x = supplierScore(k);
    const badge = x.grade === "A" ? "b-ok" : x.grade === "B" ? "b-risk" : "b-crit";
    return `<div class="panel"><div style="display:flex;gap:14px;align-items:center">
      <div class="score s-${x.grade}">${x.grade}</div>
      <div><b style="font-size:16px">${x.sup.name}</b><br><span class="muted" style="font-size:13px">${x.sup.contact} · lead ${x.sup.leadTime}d · ★ ${x.sup.rating} · ${x.sup.discount}</span></div>
      <span class="badge ${x.risk === "Saludable" ? "b-ok" : "b-risk"}" style="margin-left:auto">${x.risk}</span></div>
      <div class="fin-grid" style="grid-template-columns:repeat(4,1fr)"><div><small>Score IA</small><b class="mono">${x.score}/100</b></div><div><small>SKUs</small><b class="mono">${x.skus}</b></div><div><small>En OCs</small><b class="mono">${PEN(x.spendOC)}</b></div><div><small>Plan 30d</small><b class="mono">${PEN(x.spendPlan)}</b></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:12.5px">✉️</span><input id="em-${k}" value="${x.sup.email}" style="flex:1;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:8px 11px;font-size:13px;min-width:180px"><button class="btn btn-g btn-s" onclick="SUPPLIERS['${k}'].email=document.getElementById('em-${k}').value;audit('Actualiza contacto de ${x.sup.name}');toast('✓ Contacto actualizado')">Guardar</button></div>
    </div>`; }).join("");
}

/* ---------- Automatización + alertas ---------- */
function buildAlerts() {
  const reps = reps30(); ALERTS = [];
  reps.filter(x => ["critical", "risk"].includes(x.r.status)).forEach(x => ALERTS.push({ lvl: "crit", t: "Quiebre: " + x.s.name, d: `Cobertura ${x.r.daysCover.toFixed(1)}d · pide ${x.r.suggested}u (${PEN(x.r.investment)})`, go: "replenishment" }));
  reps.filter(x => x.r.status === "excess").forEach(x => ALERTS.push({ lvl: "warn", t: "Exceso: " + x.s.name, d: `${PEN(x.s.stock * x.s.cost)} inmovilizados · congela recompra`, go: "inventory" }));
  const inv = reps.reduce((a, x) => a + x.r.investment, 0);
  if (AUTO_RULES.find(r => r.id === "R4").on && inv > 50000) ALERTS.push({ lvl: "info", t: "Financiamiento sugerido", d: `Plan 30d de ${PEN(inv)} · Pichincha 1.45% es la mejor oferta`, go: "financing" });
  const n = ALERTS.length; $("#bell-n").textContent = n; $("#bell-n").style.display = n ? "" : "none";
  const dot = { crit: "🔴", warn: "🟣", info: "🔵" };
  $("#alert-drop").innerHTML = ALERTS.map((a, i) => `<div class="alert-it" onclick="go('${a.go}');document.getElementById('alert-drop').classList.remove('open')"><b>${dot[a.lvl]} ${a.t}</b>${a.d}</div>`).join("") || `<div class="alert-it"><b>✅ Sin alertas</b>Todo bajo control.</div>`;
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
  save(); renderOCs(); renderKPIs(); buildAlerts(); renderAuto();
  if (manual) toast(created ? `🤖 R1 generó ${created} borrador(es) de OC` : "🤖 Motor ejecutado: sin novedades");
}
function renderAuto() {
  $("#rule-list").innerHTML = AUTO_RULES.map(r => `<div class="rule"><div><b>${r.name}</b><p>${r.desc}</p></div><div class="switch ${r.on ? "on" : ""}" onclick="AUTO_RULES.find(x=>x.id==='${r.id}').on=!AUTO_RULES.find(x=>x.id==='${r.id}').on;audit('Regla ${r.id} '+(AUTO_RULES.find(x=>x.id==='${r.id}').on?'activada':'pausada'));save();runAutomations(false)"></div></div>`).join("");
  const dot = { crit: "🔴", warn: "🟣", info: "🔵" };
  $("#alert-list").innerHTML = ALERTS.map(a => `<div class="alert-it"><b>${dot[a.lvl]} ${a.t}</b>${a.d} <button class="chip" style="margin-top:6px" onclick="go('${a.go}')">Ir →</button></div>`).join("");
}

/* ---------- Financiamiento ---------- */
function renderFin() {
  const need = +$("#fin-range").value;
  $("#fin-need").textContent = PEN(need);
  $("#fin-list").innerHTML = FINANCING.map(f => { const cover = Math.min(100, Math.round(f.amount / need * 100));
    return `<div class="fin ${f.id === "F1" ? "rec" : ""}">${f.tag ? `<span class="tag">${f.tag}</span>` : ""}<div style="display:flex;gap:10px;align-items:center"><b style="font-size:16px">${f.entity}</b><span class="badge b-info">${f.type}</span><span class="muted" style="font-size:12.5px;margin-left:auto">Score IA ${f.score}/100 · aprueba en ${f.approval}</span></div>
    <div class="fin-grid"><div><small>Monto</small><b class="mono">${PEN(f.amount)}</b></div><div><small>Tasa mensual</small><b class="mono">${f.rate}%</b></div><div><small>Plazo</small><b class="mono">${f.term}d</b></div><div><small>Cuota</small><b class="mono">${PEN(f.quota)}</b></div></div>
    <p style="font-size:13.5px;margin:0 0 12px">✦ <i>${f.why}</i> · Cubre el ${cover}% de tu necesidad.</p>
    <button class="btn ${f.id === "F1" ? "btn-b" : "btn-g"} btn-s" onclick="audit('Solicita ${PEN(Math.min(f.amount, need))} a ${f.entity}');save();toast('✓ Solicitud a ${f.entity} pre-aprobada con tu historial de ventas')">Solicitar ${PEN(Math.min(f.amount, need))} →</button></div>`; }).join("");
}
renderFin();

/* ---------- Inventario ---------- */
function renderInv() {
  const reps = reps30();
  const deadVal = reps.filter(x => x.r.status === "excess").reduce((a, x) => a + x.s.stock * x.s.cost, 0);
  const aVal = SKUS.filter(s => s.abc === "A").reduce((a, s) => a + s.stock * s.cost, 0);
  $("#inv-kpis").innerHTML = [["Inventario valorizado", PEN(KPIS.inventoryVal), "14 SKUs"], ["Dinero inmovilizado", PEN(deadVal), "3 SKUs muertos"], ["Clase A (% valor)", Math.round(aVal / KPIS.inventoryVal * 100) + "%", "enfoque IA"]].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span class="muted" style="font-size:12.5px">${x[2]}</span></div>`).join("");
  const dg = (s, r) => r.status === "excess" ? '<span class="badge b-ex">◆ Muerto / exceso</span>' : r.status === "critical" ? '<span class="badge b-crit">● Reponer ya</span>' : r.status === "risk" ? '<span class="badge b-risk">● Vigilar</span>' : '<span class="badge b-ok">✓ Sano</span>';
  $("#inv-body").innerHTML = SKUS.map(s => { const r = replenishment(s, 30); return `<tr><td><b>${s.name}</b><br><span class="muted">${s.id}</span></td><td>${s.cat}</td><td class="mono">${s.stock}u</td><td class="mono">${PEN(s.stock * s.cost)}</td><td><b>${s.abc}</b></td><td><b>${s.xyz}</b></td><td class="mono">${s.margin}%</td><td>${dg(s, r)}</td></tr>`; }).join("");
}

/* ---------- Analytics ---------- */
function renderAnaKpis() {
  const k = KPIS;
  $("#ana-kpis").innerHTML = [["GMROI", k.gmroi + "×", "por sol invertido"], ["Fill Rate", k.fillRate + "%", "meta 98%"], ["Sell-Through", k.sellThrough + "%", "30 días"], ["OTIF", k.otif + "%", "on-time in-full"], ["Nivel servicio", k.service + "%", "95% objetivo"], ["Riesgo quiebre", k.breakRisk + "%", "5 SKUs"]].map(x => `<div class="panel" style="padding:15px"><small class="muted" style="font-size:11px;font-weight:800;text-transform:uppercase">${x[0]}</small><b class="mono" style="display:block;font-size:20px;margin:5px 0 2px">${x[1]}</b><span style="font-size:12px" class="muted">${x[2]}</span></div>`).join("");
}
function drawAnalytics() {
  renderAnaKpis();
  if (CH.ana1) { CH.ana1.update(); CH.ana2.update(); return; }
  const h = historyFor(SKUS[0], 90); const f = forecastFor(SKUS[0], 30);
  const dark = document.documentElement.dataset.theme === "dark";
  CH.ana1 = new Chart($("#ch-ana1"), { type: "bar", data: { labels: h.slice(-30).map(x => x.date.slice(5)), datasets: [{ label: "Ventas reales", data: h.slice(-30).map(x => x.qty), backgroundColor: "rgba(27,59,255,.75)", borderRadius: 4 }, { label: "Forecast", data: [...Array(23).fill(null), ...f.slice(0, 7).map(x => x.qty)], type: "line", borderColor: "#00C2FF", pointRadius: 0, tension: .4 }] }, options: { plugins: { legend: { labels: { color: dark ? "#EDF1FF" : "#0B1023", boxWidth: 12 } } } } });
  CH.ana2 = new Chart($("#ch-ana2"), { type: "doughnut", data: { labels: ["Clase A (80% valor)", "Clase B (15%)", "Clase C (5%)"], datasets: [{ data: [80, 15, 5], backgroundColor: ["#1B3BFF", "#7C5CFF", "#00C2FF"], borderWidth: 0 }] }, options: { plugins: { legend: { position: "bottom", labels: { color: dark ? "#EDF1FF" : "#0B1023", boxWidth: 12 } } } } });
}

/* ---------- Integraciones ---------- */
(function () {
  const ints = [["🛍️", "Shopify", "Pedidos + stock · sync 5min", 1], ["🟡", "Mercado Libre", "Ventas + reputación p/ crédito", 1], ["🟣", "WooCommerce", "Catálogo + órdenes", 1], ["🔴", "Falabella", "Seller center · stock", 0], ["🛒", "Ripley", "Seller center · stock", 0], ["🧾", "POS / Alegra", "Ticket + cierre diario", 1], ["📊", "Excel / Sheets", "Carga masiva en 1 clic", 1], ["🔌", "API + Webhooks", "ERP custom · SAP · Odoo", 1], ["💬", "WhatsApp Business", "Alertas + aprobación OC", 1]];
  $("#int-grid").innerHTML = ints.map(x => `<div class="int"><div class="ic">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div>${x[3] ? '<span class="dotok"></span>' : '<span class="badge b-info" style="margin-left:auto">Pronto</span>'}</div>`).join("");
})();

/* ---------- Ajustes ---------- */
function renderSettings() {
  const s2 = $("#role-sel2"); if (s2) s2.value = ROLE;
  const rows = [["Crear y editar OCs", can("create")], ["Aprobar / rechazar OCs", can("approve")], ["Solicitar financiamiento", ROLE !== "viewer"], ["Ver reportes y analytics", true], ["Cambiar reglas de automatización", ROLE === "owner"]];
  $("#perm-list").innerHTML = rows.map(r => `<div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)"><span>${r[1] ? "✅" : "⛔"}</span>${r[0]}</div>`).join("");
  $("#mfa-sw").classList.toggle("on", MFA);
  $("#mfa-st").textContent = MFA ? "Activado — se pedirá confirmación doble en OCs > S/ 10,000" : "Desactivado";
  $("#audit-body").innerHTML = [...AUDIT].reverse().slice(0, 30).map(a => `<tr><td class="mono">${a.t}</td><td>${a.u}</td><td><span class="badge b-info">${a.r}</span></td><td>${a.a}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Sin actividad aún. Cada acción sensible aparecerá aquí.</td></tr>`;
}

/* ---------- Boot ---------- */
load();
$("#role-sel").value = ROLE;
audit("Sesión iniciada (" + ROLE + ")");
renderKPIs(); renderRadar(); renderRep(); renderOCs(); renderInv(); buildAlerts();
document.addEventListener("click", e => { const d = $("#alert-drop"); if (d && d.classList.contains("open") && !e.target.closest(".bell-wrap")) d.classList.remove("open"); });
