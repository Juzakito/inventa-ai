// scripts/validate-build.js — valida el output de producción (public/).
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const pub = path.join(root, "public");
const files = [
  "index.html", "css/styles.css", "js/app.bundle.js", "js/app.bundle.js.map",
  "vendor/chart.umd.min.js", "robots.txt", "sitemap.xml", "manifest.json", "favicon.svg",
  "../vercel.json",
];
let bytes = 0, fail = false;
for (const f of files) {
  const q = path.join(pub, f);
  if (!fs.existsSync(q)) { console.error("FALTA: " + f); fail = true; continue; }
  const s = fs.statSync(q); bytes += s.size;
  console.log("OK  " + f + "  " + (s.size / 1024).toFixed(1) + " KB");
}
const html = fs.readFileSync(path.join(pub, "index.html"), "utf8");
for (const id of ["p-dashboard", "p-forecast", "p-replenishment", "p-orders", "p-financing", "p-inventory", "p-suppliers", "p-analytics", "p-integrations", "p-auto", "p-settings", "oc-modal", "demo-modal", "sku-modal", "ak-cap", "sp-cap", "ch-cat", "heat-table", "inv-cat", "inv-sup", "ana-period"]) {
  if (!html.includes(`id="${id}"`)) { console.error("FALTA id: " + id); fail = true; }
}
if (!html.includes("js/app.bundle.js")) { console.error("FALTA bundle ref"); fail = true; }
if (html.includes("app.js\"") || html.includes("data.js\"")) { console.error("Quedan refs al monolito"); fail = true; }
const js = fs.readdirSync(path.join(root, "src"));
console.log("Peso total public: " + (bytes / 1024).toFixed(1) + " KB");
if (fail) process.exit(1);
console.log("BUILD OK");
