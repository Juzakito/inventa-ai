// INVENTA.AI — Constantes de configuración (src/config/constants.js)
// Los secretos reales viven en variables de entorno (Vercel / .env), nunca aquí.

const APP = {
  name: "INVENTA.AI",
  tagline: "Transformamos datos en decisiones de abastecimiento.",
  version: "1.4.0",
  horizons: [30, 60, 90, 180],
  serviceLevelZ: 1.65, // 95%
  weekendBoost: 1.28,
  paydayBoost: 1.18,
};

const LINKS = {
  production: "https://inventa.ai",
  repo: "https://github.com/Juzakito/inventa-ai",
  docs: "https://github.com/Juzakito/inventa-ai/tree/main/docs",
};

export { APP, LINKS };
