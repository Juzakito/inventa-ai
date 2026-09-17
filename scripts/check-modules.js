// scripts/check-modules.js — valida sintaxis + grafo de imports ESM (sin emitir).
const esbuild = require("esbuild");
const path = require("path");
esbuild.buildSync({
  entryPoints: [path.join(__dirname, "..", "src/app/main.js")],
  bundle: true,
  write: false,
  format: "iife",
  logLevel: "silent",
});
console.log("MODULES OK · grafo src/ resuelve");
