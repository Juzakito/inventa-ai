// tests/audit-ids.js — cada id tocado por src/ debe existir en public/index.html.
// Además: cero restos del monolito (web/, data.js, app.js) y del home v1.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}
const ids = new Set();
for (const f of walk(path.join(root, "src"))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/\$\(['"]#([a-z0-9-]+)['"]\)/g)) ids.add(m[1]);
  for (const m of src.matchAll(/getElementById\(['"]([a-z0-9-]+)['"]\)/g)) ids.add(m[1]);
}
const missing = [...ids].filter(id => !html.includes(`id="${id}"`));
console.log("IDs en src/:", ids.size, "| faltantes:", missing.length ? missing.join(",") : "ninguno");
if (missing.length) process.exit(1);
for (const r of ['id="kpi-grid"', 'id="radar-crit"', "renderRadar", "renderKPIs", "src=\"app.js\"", "src=\"data.js\""]) {
  const hit = walk(path.join(root, "src")).some(f => fs.readFileSync(f, "utf8").includes(r)) || html.includes(r);
  if (hit) throw new Error("resto legacy: " + r);
}
if (fs.existsSync(path.join(root, "web"))) throw new Error("directorio web/ aún existe");
console.log("AUDIT IDS OK · sin legacy");
