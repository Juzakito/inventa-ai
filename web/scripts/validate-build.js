// scripts/validate-build.js — "build" del frontend estático: valida assets y reporta peso.
const fs = require("fs"), path = require("path");
const web = path.join(__dirname, "..");          // inventa-ai/web
const repo = path.join(web, "..");               // inventa-ai
const files = [
  ["index.html", web], ["styles.css", web], ["app.js", web], ["data.js", web],
  ["vendor/chart.umd.min.js", web], ["robots.txt", web], ["sitemap.xml", web],
  ["manifest.json", web], ["favicon.svg", web], ["vercel.json", repo],
];
let bytes = 0, fail = false;
for (const [f, base] of files) {
  const q = path.join(base, f);
  if (!fs.existsSync(q)) { console.error("FALTA: " + f); fail = true; continue; }
  const s = fs.statSync(q); bytes += s.size;
  console.log("OK  " + f + "  " + (s.size / 1024).toFixed(1) + " KB");
}
const html = fs.readFileSync(path.join(web, "index.html"), "utf8");
for (const id of ["p-dashboard", "p-forecast", "p-replenishment", "p-orders", "p-financing", "p-inventory", "p-analytics", "p-integrations"]) {
  if (!html.includes(id)) { console.error("FALTA vista: " + id); fail = true; }
}
console.log("Peso total web: " + (bytes / 1024).toFixed(1) + " KB");
if (fail) process.exit(1);
console.log("BUILD OK");
