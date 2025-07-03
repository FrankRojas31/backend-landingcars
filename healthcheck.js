#!/usr/bin/env node

/**
 * Script de health check para verificar el estado del servidor
 */

import fetch from "node-fetch";
import { config } from "./dist/config/config.js";

const PORT = config.PORT || 3000;
const HOST = process.env.HOST || "localhost";

console.log("🏥 Health Check del Backend Landing Cars...\n");

async function checkHealth() {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/health`, {
      timeout: 5000,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Servidor respondiendo correctamente");
      console.log("📊 Estado:", JSON.stringify(data, null, 2));
      process.exit(0);
    } else {
      console.log("❌ Servidor responde con error:", response.status);
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Error al conectar con el servidor:");
    console.log("   Error:", error.message);
    console.log("   Código:", error.code);
    process.exit(1);
  }
}

checkHealth();
