const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const ids = [...js.matchAll(/\$\(['"]#([a-z0-9-]+)['"]\)/g)].map(m => m[1]);
const missing = [...new Set(ids)].filter(id => !html.includes('id="' + id + '"'));
console.log('IDs en JS:', new Set(ids).size, '| faltantes:', missing.length ? missing.join(',') : 'ninguno');
for (const c of ['exec', 'dec-card', 'map-svg', 'chart-box', 'toolbar', 'seg', 'prio', 'sim-grid', 'vars', 'band-legend']) {
  if (!css.includes(c)) throw new Error('falta CSS ' + c);
}
console.log('CSS v2 OK');
for (const r of ['id="kpi-grid"', 'id="radar-crit"', 'renderRadar', 'renderKPIs']) {
  if (js.includes(r) || html.includes(r)) throw new Error('resto del home viejo: ' + r);
}
console.log('Home viejo eliminado OK');
