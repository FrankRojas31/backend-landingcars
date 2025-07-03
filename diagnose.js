#!/usr/bin/env node

/**
 * Script de diagnóstico para el Backend Landing Cars
 * Verifica conexión a base de datos, configuración y estado del servidor
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar configuración
import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT || "3000"),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "landing_cars",
  DB_PORT: parseInt(process.env.DB_PORT || "3306"),
  JWT_SECRET: process.env.JWT_SECRET || "",
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3001",
};

console.log("🔍 Iniciando diagnóstico del Backend Landing Cars...\n");

// Verificar variables de entorno
console.log("📋 CONFIGURACIÓN:");
console.log("- Puerto:", config.PORT);
console.log("- Entorno:", config.NODE_ENV);
console.log("- Base de datos:", config.DB_HOST + ":" + config.DB_PORT);
console.log("- Usuario DB:", config.DB_USER);
console.log("- Nombre DB:", config.DB_NAME);
console.log("- CORS Origin:", config.CORS_ORIGIN);
console.log("- JWT Secret configurado:", config.JWT_SECRET ? "✅ Sí" : "❌ No");
console.log(
  "- reCAPTCHA configurado:",
  config.RECAPTCHA_SECRET ? "✅ Sí" : "❌ No"
);
console.log("- Email configurado:", config.EMAIL_USER ? "✅ Sí" : "❌ No");
console.log("- Slack configurado:", config.SLACK_BOT_TOKEN ? "✅ Sí" : "❌ No");
console.log("");

// Verificar archivos necesarios
console.log("📁 ARCHIVOS:");
const requiredFiles = ["dist/index.js", "package.json", ".env"];

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`- ${file}: ${exists ? "✅ Existe" : "❌ No existe"}`);
});
console.log("");

// Verificar conexión a base de datos
console.log("🗄️ CONEXIÓN A BASE DE DATOS:");
try {
  const mysql = await import("mysql2/promise");
  const connection = await mysql.default.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    connectTimeout: 10000,
  });

  console.log("✅ Conexión exitosa a la base de datos");

  // Verificar tablas
  const [tables] = await connection.execute("SHOW TABLES");
  console.log(`✅ Tablas encontradas: ${tables.length}`);

  tables.forEach((table) => {
    const tableName = Object.values(table)[0];
    console.log(`   - ${tableName}`);
  });

  await connection.end();
  console.log("");
} catch (error) {
  console.log("❌ Error de conexión a base de datos:");
  console.log("   Error:", error.message);
  console.log("   Código:", error.code);
  console.log("");
}

// Verificar puerto disponible
console.log("🌐 PUERTO:");
import { createServer } from "http";

const server = createServer();
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`❌ Puerto ${config.PORT} ya está en uso`);
  } else {
    console.log(`❌ Error con puerto ${config.PORT}:`, err.message);
  }
  console.log("\n🎯 DIAGNÓSTICO COMPLETADO\n");
});

server.on("listening", () => {
  console.log(`✅ Puerto ${config.PORT} disponible`);
  server.close();
  console.log("\n🎯 DIAGNÓSTICO COMPLETADO\n");
});

server.listen(config.PORT);
