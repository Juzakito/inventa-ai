// tests/engine-check.js — runtime del motor (lee src/lib/engine.js sin ESM).
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "src/lib/engine.js"), "utf8")
  .replace(/^export\s*\{[^}]*\};?/m, "");
const { SKUS, forecastBands, replenishment, NETWORK } =
  new Function(src + '; return { SKUS, forecastBands, replenishment, NETWORK };')();
const b = forecastBands(SKUS[0], 30);
if (b.length !== 30) throw new Error("bands len");
if (!b.every(p => p.lo <= p.qty && p.qty <= p.hi)) throw new Error("banda inválida");
console.log("BANDS OK · Aceite 30d: qty", b[0].qty, "p10", b[0].lo, "p90", b[0].hi);
const top = [...SKUS].sort((a, z) => z.daily - a.daily).slice(0, 3);
console.log("TOP3:", top.map(s => s.name).join(" | "));
if (NETWORK.nodes.length !== 7 || NETWORK.edges.length !== 6) throw new Error("network");
console.log("NETWORK OK · 7 nodos, 6 aristas");
const reps = SKUS.map(s => ({ s, r: replenishment(s, 30) }));
const crit = reps.filter(x => ["critical", "risk"].includes(x.r.status));
const plan = reps.reduce((a, x) => a + x.r.investment, 0);
console.log("HOME · críticos:", crit.length, "| plan 30d:", Math.round(plan));
console.log("ENGINE OK");
