console.log("🚀 Iniciando script de verificación de base de datos...");

// Cargar variables de entorno
require("dotenv").config();

console.log("✅ Variables de entorno cargadas");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

async function testConnection() {
  try {
    const mysql = require("mysql2/promise");

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "3306"),
    });

    console.log("✅ Conexión exitosa a MySQL");

    // Probar consulta básica
    const [result] = await connection.execute("SELECT 1 as test");
    console.log("✅ Consulta de prueba exitosa:", result);

    await connection.end();
    console.log("✅ Conexión cerrada");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
}

testConnection();
