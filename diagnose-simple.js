#!/usr/bin/env node

/**
 * Script de diagnóstico simple para el Backend Landing Cars
 */

import dotenv from "dotenv";
import fs from "fs";

// Cargar variables de entorno
dotenv.config();

console.log("🔍 DIAGNÓSTICO BACKEND LANDING CARS\n");

// Verificar variables de entorno
console.log("📋 CONFIGURACIÓN:");
console.log("- Puerto:", process.env.PORT || "3000");
console.log("- Entorno:", process.env.NODE_ENV || "development");
console.log(
  "- Base de datos:",
  process.env.DB_HOST + ":" + process.env.DB_PORT
);
console.log("- Usuario DB:", process.env.DB_USER);
console.log("- Nombre DB:", process.env.DB_NAME);
console.log("- CORS Origin:", process.env.CORS_ORIGIN);
console.log(
  "- JWT Secret:",
  process.env.JWT_SECRET ? "✅ Configurado" : "❌ No configurado"
);
console.log(
  "- reCAPTCHA:",
  process.env.RECAPTCHA_SECRET ? "✅ Configurado" : "❌ No configurado"
);
console.log("");

// Verificar archivos
console.log("📁 ARCHIVOS:");
const files = [
  { name: "package.json", path: "package.json" },
  { name: ".env", path: ".env" },
  { name: "dist/index.js", path: "dist/index.js" },
  { name: "tsconfig.json", path: "tsconfig.json" },
];

files.forEach((file) => {
  const exists = fs.existsSync(file.path);
  console.log(`- ${file.name}: ${exists ? "✅ Existe" : "❌ No existe"}`);
});

console.log("\n🎯 DIAGNÓSTICO COMPLETADO");
console.log("📝 Para más detalles, consulta TROUBLESHOOTING.md");
