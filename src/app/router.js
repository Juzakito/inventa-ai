// INVENTA.AI — Router SPA (src/app/router.js)
// Navegación + ciclo de vida de páginas. Las vistas se renderizan bajo demanda.
import { $$ } from "../components/ui/ui.js";
import { renderHome } from "../components/sections/views-home.js";
import { renderRep, renderOCs, renderBuyDesk, syncFinNeed, renderFin, renderFinSnap, renderSuppliers, renderInv } from "../components/sections/views-ops.js";
import { drawAnalytics, renderSettings } from "../components/sections/views-system.js";
import { renderAuto, runAutomations } from "../services/automation.js";

function go(p) {
  $$(".side .mi[data-p]").forEach(b => b.classList.toggle("on", b.dataset.p === p));
  $$(".page").forEach(x => x.classList.remove("on"));
  $("#p-" + p).classList.add("on");
  document.querySelector(".side").classList.remove("open");
  const s = $("#scrim"); if (s) s.classList.remove("on");
  if (p === "dashboard") renderHome();
  if (p === "analytics") drawAnalytics();
  if (p === "suppliers") renderSuppliers();
  if (p === "auto") renderAuto();
  if (p === "settings") renderSettings();
  if (p === "orders") renderBuyDesk();
  if (p === "financing") { syncFinNeed(); renderFin(); renderFinSnap(); }
  if (p === "inventory") renderInv();
  if (p === "replenishment") renderRep();
}

function enterApp(p) {
  $("#view-landing").style.display = "none";
  $("#view-app").style.display = "block";
  window.scrollTo(0, 0);
  if (p) go(p);
  runAutomations(false);
}

function exitApp() {
  $("#view-app").style.display = "none";
  $("#view-landing").style.display = "";
  window.scrollTo(0, 0);
}

function initNav() {
  $$(".side .mi[data-p]").forEach(b => b.onclick = () => go(b.dataset.p));
}

export { go, enterApp, exitApp, initNav };
