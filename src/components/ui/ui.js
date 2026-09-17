// INVENTA.AI — UI kit (src/components/ui.js)
// Helpers sin dependencias: DOM, toast, modales accesibles, defaults Chart.js.
// Usa el global `Chart` (vendor/chart.umd.min.js, cargado antes del bundle).

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const CH = {};

function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function toggleTheme() {
  const h = document.documentElement;
  h.dataset.theme = h.dataset.theme === "dark" ? "light" : "dark";
}

// Abre un modal con foco accesible (WCAG: role=dialog + foco inicial + cierre con Esc)
function openModal(id) {
  const m = $("#" + id);
  m.classList.add("open");
  const f = m.querySelector("input, select, textarea, button");
  if (f) setTimeout(() => f.focus(), 60);
}
function closeModal(id) { $("#" + id).classList.remove("open"); }
function initModalA11y() {
  $$(".modal-bg").forEach(m => {
    m.addEventListener("click", e => { if (e.target === m) m.classList.remove("open"); });
    const box = m.querySelector(".modal");
    if (box && !box.getAttribute("role")) { box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") $$(".modal-bg.open").forEach(m => m.classList.remove("open"));
  });
}

// Defaults Chart.js: el canvas vive en .chart-box con altura fija → sin aspect ratio,
// con padding para que ni el eje Y ni la leyenda se recorten.
function chartBase() {
  const dark = document.documentElement.dataset.theme === "dark";
  const tick = dark ? "#93A0BC" : "#5B6478";
  return {
    responsive: true, maintainAspectRatio: false,
    layout: { padding: { top: 10, right: 8 } },
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "top", align: "end", labels: { color: dark ? "#EDF1FF" : "#0B1023", usePointStyle: true, boxWidth: 6, boxHeight: 6, padding: 16, font: { size: 12 }, filter: (it) => it.text !== "p10" } },
      tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y}u` } } },
    scales: {
      x: { grid: { color: dark ? "rgba(255,255,255,.06)" : "rgba(11,16,35,.06)" }, ticks: { maxTicksLimit: 8, color: tick, font: { size: 11 }, maxRotation: 0 } },
      y: { grid: { color: dark ? "rgba(255,255,255,.06)" : "rgba(11,16,35,.06)" }, ticks: { color: tick, font: { size: 11 }, maxTicksLimit: 6 }, grace: "8%" } }
  };
}

function lineSets(hist, fc, band) {
  return [
    { label: "Histórico", data: [...hist, ...Array(fc.length).fill(null)], borderColor: "#93A0BC", borderDash: [5, 5], pointRadius: 0, pointStyle: "line", tension: .35 },
    ...(band ? [{ label: "p10", data: [...Array(hist.length - 1).fill(null), ...band.map(b => b.lo)], borderColor: "rgba(27,59,255,0)", pointRadius: 0, tension: .35 }, { label: "Banda p10–p90", data: [...Array(hist.length - 1).fill(null), ...band.map(b => b.hi)], borderColor: "rgba(27,59,255,0)", backgroundColor: "rgba(27,59,255,.16)", fill: "-1", pointRadius: 0, tension: .35 }] : []),
    { label: "Forecast IA", data: [...Array(hist.length - 1).fill(null), hist[hist.length - 1], ...fc], borderColor: "#1B3BFF", borderWidth: 2.5, pointRadius: 0, pointStyle: "line", tension: .35 },
  ];
}

function spark(id, data, color) {
  const el = document.getElementById(id); if (!el) return;
  if (CH[id]) CH[id].destroy();
  CH[id] = new Chart(el, { type: "line", data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: color + "22", fill: true, pointRadius: 0, tension: .45, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false } });
}

export { $, $$, CH, toast, toggleTheme, openModal, closeModal, initModalA11y, chartBase, lineSets, spark };
