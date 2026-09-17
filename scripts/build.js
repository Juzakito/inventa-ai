// INVENTA.AI — Build de producción (scripts/build.js)
// 1) esbuild: src/app/main.js → public/js/app.bundle.js (IIFE, minificado, sourcemap)
// 2) Copia assets fuente (css, favicon) a public/
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pub = path.join(root, "public");

esbuild.buildSync({
  entryPoints: [path.join(root, "src/app/main.js")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["chrome90", "safari14", "firefox90"],
  sourcemap: true,
  outfile: path.join(pub, "js/app.bundle.js"),
  logLevel: "info",
});

fs.mkdirSync(path.join(pub, "css"), { recursive: true });
fs.copyFileSync(path.join(root, "src/styles/styles.css"), path.join(pub, "css/styles.css"));
fs.copyFileSync(path.join(root, "src/assets/icons/favicon.svg"), path.join(pub, "favicon.svg"));
console.log("BUILD OK → public/ listo para desplegar");
