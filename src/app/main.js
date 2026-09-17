// INVENTA.AI — Entrada de la aplicación (src/app/main.js)
// Orden de arranque (idéntico al monolito original): estado → vistas → motor.
// Expone en `window` solo la API pública que usan los handlers inline del HTML.
import { load, loadCustomSkus, audit, session } from "../store/state.js";
import { toggleTheme, initModalA11y } from "../components/ui/ui.js";
import { go, enterApp, exitApp, initNav } from "./router.js";
import { setMode, renderHome, initHomeCharts, initForecastPage, mapDetail } from "../components/sections/views-home.js";
import { renderRep, renderOCs, renderInv, renderFin, renderSim } from "../components/sections/views-ops.js";
import { calcROI, openDemo, submitDemo, initHeroBars, initChat, ask, drawAnalytics, initIntegrations } from "../components/sections/views-system.js";
import { buildAlerts, runAutomations, toggleRule } from "../services/automation.js";
import { needPerm, setRole, toggleMFA, quickOC, ocApprove, ocReject, ocReceive, openOCModal, ocAddLine, ocCalcTotal, ocSave, ocPDF, ocEmail, ocWA, exportInvCSV, supSaveEmail, openSkuModal, skuSave, finRequest } from "../services/actions.js";
import { pingBackend } from "../api/client.js";

/* API pública para los onclick inline del HTML (documentada y mínima) */
Object.assign(window, {
  go, enterApp, exitApp, toggleTheme, setMode, setRole, toggleMFA,
  ask, calcROI, openDemo, submitDemo, mapDetail, drawAnalytics,
  quickOC, ocApprove, ocReject, ocReceive, openOCModal, ocAddLine, ocCalcTotal, ocSave,
  ocPDF, ocEmail, ocWA, exportInvCSV, supSaveEmail, openSkuModal, skuSave, finRequest,
  renderFin, renderSim, renderInv, toggleRule, runAutomations, pingBackend,
});

/* Arranque */
load();
loadCustomSkus();
document.getElementById("view-app").classList.add("mode-ops");
document.getElementById("role-sel").value = session.role;
initNav();
initModalA11y();
audit("Sesión iniciada (" + session.role + ")");
renderHome();
renderRep();
renderOCs();
renderInv();
renderFin();
buildAlerts();
initHomeCharts();
initForecastPage();
initChat();
initHeroBars();
calcROI();
initIntegrations();
document.addEventListener("click", e => {
  const d = document.getElementById("alert-drop");
  if (d && d.classList.contains("open") && !e.target.closest(".bell-wrap")) d.classList.remove("open");
});
