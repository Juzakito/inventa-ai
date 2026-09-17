// INVENTA.AI — Demo Data Engine (LATAM, PEN)
// Datos deterministas para demo VC. Sin dependencias.

const PEN = (n) => "S/ " + Number(n).toLocaleString("es-PE", { maximumFractionDigits: 0 });

const SUPPLIERS = {
  ALICORP: { name: "Alicorp", leadTime: 4, rating: 4.8, discount: "2% x pronto pago" },
  GLORIA: { name: "Gloria", leadTime: 3, rating: 4.7, discount: "3% vol > 500u" },
  BACKUS: { name: "Backus AB InBev", leadTime: 2, rating: 4.9, discount: "Flete gratis" },
  MOLITALIA: { name: "Molitalia", leadTime: 5, rating: 4.5, discount: "5% campaña" },
  KIMBERLY: { name: "Kimberly-Clark", leadTime: 6, rating: 4.6, discount: "—" },
  UNACEM: { name: "UNACEM (Cemento Sol)", leadTime: 3, rating: 4.8, discount: "2.5% vol" },
  COCA: { name: "Coca-Cola", leadTime: 2, rating: 4.9, discount: "Rebate 1.5%" },
  NESTLE: { name: "Nestlé Perú", leadTime: 5, rating: 4.7, discount: "—" },
};

const SKUS = [
  { id: "SKU-001", name: "Aceite Primor Premium 1L", cat: "Consumo masivo", supplier: "ALICORP", price: 11.9, cost: 9.4, stock: 180, min: 400, max: 1400, lead: 4, daily: 62, cv: 0.18, margin: 21, abc: "A", xyz: "X", dead: false },
  { id: "SKU-002", name: "Arroz Costeño Extra 5kg", cat: "Consumo masivo", supplier: "ALICORP", price: 24.5, cost: 19.1, stock: 420, min: 350, max: 1200, lead: 4, daily: 41, cv: 0.22, margin: 22, abc: "A", xyz: "X", dead: false },
  { id: "SKU-003", name: "Leche Gloria Evaporada 400g x24", cat: "Lácteos", supplier: "GLORIA", price: 96.0, cost: 78.5, stock: 96, min: 200, max: 700, lead: 3, daily: 38, cv: 0.15, margin: 18, abc: "A", xyz: "X", dead: false },
  { id: "SKU-004", name: "Fideos Don Vittorio Spaghetti 500g", cat: "Consumo masivo", supplier: "MOLITALIA", price: 4.2, cost: 2.9, stock: 2100, min: 800, max: 2600, lead: 5, daily: 210, cv: 0.28, margin: 31, abc: "A", xyz: "Y", dead: false },
  { id: "SKU-005", name: "Coca-Cola 2L PET x8", cat: "Bebidas", supplier: "COCA", price: 72.0, cost: 58.0, stock: 64, min: 150, max: 600, lead: 2, daily: 44, cv: 0.35, margin: 19, abc: "A", xyz: "Y", dead: false },
  { id: "SKU-006", name: "Cerveza Cristal 650ml x12", cat: "Bebidas", supplier: "BACKUS", price: 58.0, cost: 44.2, stock: 310, min: 180, max: 800, lead: 2, daily: 52, cv: 0.42, margin: 24, abc: "B", xyz: "Y", dead: false },
  { id: "SKU-007", name: "Papel Higiénico Suave 40 rollos", cat: "Cuidado hogar", supplier: "KIMBERLY", price: 42.9, cost: 31.5, stock: 890, min: 250, max: 900, lead: 6, daily: 33, cv: 0.2, margin: 27, abc: "B", xyz: "X", dead: false },
  { id: "SKU-008", name: "Cemento Sol Tipo I 42.5kg", cat: "Ferretería", supplier: "UNACEM", price: 32.5, cost: 27.8, stock: 1200, min: 500, max: 2000, lead: 3, daily: 120, cv: 0.31, margin: 14, abc: "A", xyz: "Y", dead: false },
  { id: "SKU-009", name: "Café Nescafé Tradición 200g", cat: "Consumo masivo", supplier: "NESTLE", price: 21.9, cost: 15.8, stock: 45, min: 120, max: 500, lead: 5, daily: 18, cv: 0.25, margin: 28, abc: "B", xyz: "Y", dead: false },
  { id: "SKU-010", name: "Detergente Marsella 2.5kg", cat: "Cuidado hogar", supplier: "ALICORP", price: 28.9, cost: 21.3, stock: 1450, min: 300, max: 1000, lead: 4, daily: 26, cv: 0.55, margin: 26, abc: "C", xyz: "Z", dead: true },
  { id: "SKU-011", name: "Galletas Casino Menta x6 (descont.)", cat: "Confitería", supplier: "MOLITALIA", price: 6.5, cost: 5.9, stock: 3200, min: 200, max: 800, lead: 5, daily: 9, cv: 0.8, margin: 9, abc: "C", xyz: "Z", dead: true },
  { id: "SKU-012", name: "Pilsen Callao 650ml x12", cat: "Bebidas", supplier: "BACKUS", price: 60.0, cost: 45.9, stock: 240, min: 150, max: 700, lead: 2, daily: 47, cv: 0.38, margin: 23, abc: "B", xyz: "Y", dead: false },
  { id: "SKU-013", name: "Atún Florida Filete 170g x48", cat: "Conservas", supplier: "ALICORP", price: 245.0, cost: 198.0, stock: 52, min: 60, max: 240, lead: 4, daily: 7, cv: 0.33, margin: 19, abc: "B", xyz: "Z", dead: false },
  { id: "SKU-014", name: "Shampoo Head & Shoulders 700ml", cat: "Cuidado personal", supplier: "ALICORP", price: 38.9, cost: 27.2, stock: 680, min: 150, max: 600, lead: 4, daily: 14, cv: 0.6, margin: 30, abc: "C", xyz: "Z", dead: true },
];

// Serie histórica 180 días generada de forma determinista (seeded) — tendencia + estacionalidad semanal + ruido
function seededRand(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function historyFor(sku, days = 180) {
  const rnd = seededRand(sku.daily * 97 + sku.id.length * 13);
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const weekendBoost = (dow === 0 || dow === 6) ? 1.28 : 1.0;      // fin de semana LATAM
    const paydayBoost = (d.getDate() >= 28 || d.getDate() <= 3) ? 1.18 : 1.0; // quincena/fin de mes
    const trend = 1 + (days - i) * 0.0011;                             // crecimiento ~20% semestral
    const noise = 0.82 + rnd() * 0.36;
    out.push({ date: d.toISOString().slice(0, 10), qty: Math.max(0, Math.round(sku.daily * weekendBoost * paydayBoost * trend * noise)) });
  }
  return out;
}

// Forecast 180 días: media móvil + estacionalidad + tendencia (mismo kernel que el backend Python)
function forecastFor(sku, horizon = 90) {
  const hist = historyFor(sku, 180);
  const last30 = hist.slice(-30).reduce((a, b) => a + b.qty, 0) / 30;
  const prev30 = hist.slice(-60, -30).reduce((a, b) => a + b.qty, 0) / 30;
  const trend = prev30 > 0 ? Math.min(1.35, Math.max(0.8, last30 / prev30)) : 1.0;
  const out = []; const today = new Date();
  const rnd = seededRand(sku.daily * 31 + 7);
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const w = (dow === 0 || dow === 6) ? 1.28 : 1.0;
    const payday = (d.getDate() >= 28 || d.getDate() <= 3) ? 1.18 : 1.0;
    const base = last30 * Math.pow(trend, i / 30) * w * payday * (0.93 + rnd() * 0.14);
    out.push({ date: d.toISOString().slice(0, 10), qty: Math.round(base) });
  }
  return out;
}

// Motor de reposición: ROP, safety stock, EOQ simplificado
function replenishment(sku, horizon = 30) {
  const fc = forecastFor(sku, horizon);
  const demandH = fc.reduce((a, b) => a + b.qty, 0);
  const avgDaily = demandH / horizon;
  const z = 1.65; // nivel servicio 95%
  const sigma = avgDaily * sku.cv;
  const safety = Math.ceil(z * sigma * Math.sqrt(sku.lead));
  const rop = Math.ceil(avgDaily * sku.lead + safety);
  const daysCover = avgDaily > 0 ? sku.stock / avgDaily : 99;
  const suggested = Math.max(0, Math.ceil(demandH + safety - sku.stock));
  const status = sku.stock <= rop * 0.6 ? "critical" : sku.stock <= rop ? "risk" : (sku.stock > sku.max * 1.15 || sku.dead) ? "excess" : "ok";
  const lossRisk = Math.max(0, Math.round((demandH - sku.stock) * (sku.price - sku.cost)));
  return { demandH, avgDaily, safety, rop, daysCover, suggested, status, lossRisk, investment: suggested * sku.cost };
}

const FINANCING = [
  { id: "F1", entity: "Banco Pichincha", type: "Banco", amount: 120000, rate: 1.45, term: 90, quota: 41200, approval: "24h", score: 96, tag: "Recomendada por IA", why: "Menor costo total (S/ 3,600) y calza con ciclo de 90 días de tu inventario. TCEA más baja del marketplace." },
  { id: "F2", entity: "Prestamype", type: "Fintech", amount: 80000, rate: 2.10, term: 60, quota: 41333, approval: "4h", score: 88, tag: "Desembolso hoy", why: "Aprobación en 4h contra historial de ventas de Mercado Libre. Ideal si la OC de Backus vence el viernes." },
  { id: "F3", entity: "Kubo Financiero", type: "Fondo", amount: 200000, rate: 1.80, term: 120, quota: 52600, approval: "48h", score: 84, tag: "Mayor monto", why: "Cubre el 100% del plan de compras 90 días. Cuota 22% menor, libera flujo para campaña navideña." },
];

let PURCHASE_ORDERS = [
  { id: "OC-2026-184", supplier: "Alicorp", items: "Aceite Primor 1L × 750 · Arroz Costeño × 300", total: 12830, status: "pending", eta: "Viernes", ai: "Evita quiebre en 2.9 días. Margen protegido S/ 2,140." },
  { id: "OC-2026-185", supplier: "Backus AB InBev", items: "Coca-Cola 2L × 220 · Cristal × 180", total: 22440, status: "pending", eta: "Mañana", ai: "Fin de semana + Fiestas Patrias: demanda +38%. Financia con Prestamype 4h." },
  { id: "OC-2026-183", supplier: "Gloria", items: "Leche evaporada × 400", total: 31400, status: "approved", eta: "En tránsito", ai: "Cobertura 10.5 días → 34 días. Fill rate vuelve a 98%." },
  { id: "OC-2026-182", supplier: "Molitalia", items: "Don Vittorio × 1,200", total: 3480, status: "received", eta: "Recibida", ai: "Lead time real 5.2d vs 5d pactado. OTIF 96%." },
];

const KPIS = { salesProj: 482600, salesDelta: 18.4, critical: 5, inventoryVal: 1240000, savings: 48600, breakRisk: 12.4, roi: 4.8, fillRate: 93.2, gmroi: 3.1, sellThrough: 71, otif: 94.6, service: 95.8 };
