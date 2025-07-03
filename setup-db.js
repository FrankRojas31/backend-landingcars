// Cargar variables de entorno primero
import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

// Mostrar configuración para debug
console.log("🔧 Configuración de conexión:");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Database:", process.env.DB_NAME);
console.log("Port:", process.env.DB_PORT);

const config = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "landing_cars",
  DB_PORT: parseInt(process.env.DB_PORT || "3306"),
};

const checkAndCreateTables = async () => {
  let connection;

  try {
    console.log("🚀 Iniciando verificación de base de datos...");

    // Crear conexión a MySQL sin especificar base de datos
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
    });

    console.log("✅ Conectado a MySQL");

    // Crear base de datos si no existe
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Base de datos '${config.DB_NAME}' verificada/creada`);

    // Cerrar conexión inicial y reconectar con la base de datos específica
    await connection.end();

    // Crear nueva conexión con la base de datos específica
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      database: config.DB_NAME,
    });

    console.log(`✅ Conectado a la base de datos '${config.DB_NAME}'`);

    // Verificar tablas existentes
    const [tables] = await connection.execute("SHOW TABLES");
    const existingTables = tables.map((row) => Object.values(row)[0]);

    console.log("📋 Tablas existentes:", existingTables);

    // Definir todas las tablas que deberían existir
    const requiredTables = [
      "users",
      "contacts",
      "contact_messages",
      "user_sessions",
    ];
    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length === 0) {
      console.log("✅ Todas las tablas necesarias ya existen");
      return;
    }

    console.log("🔧 Tablas faltantes:", missingTables);

    // Crear tabla users si no existe
    if (missingTables.includes("users")) {
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Tabla users creada");
    }

    // Crear tabla contacts si no existe
    if (missingTables.includes("contacts")) {
      await connection.execute(`
        CREATE TABLE contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('No Atendido', 'En Espera', 'Atendido', 'Enviado') DEFAULT 'No Atendido',
          assigned_to INT NULL,
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          notes TEXT NULL,
          source VARCHAR(100) DEFAULT 'landing_page',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log("✅ Tabla contacts creada");
    }

    // Crear tabla contact_messages si no existe
    if (missingTables.includes("contact_messages")) {
      await connection.execute(`
        CREATE TABLE contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          contact_id INT NOT NULL,
          user_id INT NULL,
          message TEXT NOT NULL,
          message_type ENUM('incoming', 'outgoing', 'note') DEFAULT 'note',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log("✅ Tabla contact_messages creada");
    }

    // Crear tabla user_sessions si no existe
    if (missingTables.includes("user_sessions")) {
      await connection.execute(`
        CREATE TABLE user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("✅ Tabla user_sessions creada");
    }

    // Crear índices para optimización
    console.log("🔧 Creando índices...");

    const indexes = [
      { table: "contacts", index: "idx_contacts_email", column: "email" },
      { table: "contacts", index: "idx_contacts_status", column: "status" },
      {
        table: "contacts",
        index: "idx_contacts_created_at",
        column: "created_at",
      },
      {
        table: "contacts",
        index: "idx_contacts_assigned_to",
        column: "assigned_to",
      },
      {
        table: "contact_messages",
        index: "idx_contact_messages_contact_id",
        column: "contact_id",
      },
      {
        table: "contact_messages",
        index: "idx_contact_messages_created_at",
        column: "created_at",
      },
      { table: "users", index: "idx_users_email", column: "email" },
      { table: "users", index: "idx_users_username", column: "username" },
    ];

    for (const { table, index, column } of indexes) {
      try {
        await connection.execute(
          `CREATE INDEX ${index} ON ${table}(${column})`
        );
        console.log(`✅ Índice ${index} creado`);
      } catch (error) {
        if (error.code === "ER_DUP_KEYNAME") {
          console.log(`⚠️  Índice ${index} ya existe`);
        } else {
          console.error(`❌ Error creando índice ${index}:`, error.message);
        }
      }
    }

    // Insertar usuario administrador por defecto si no existe
    try {
      const [existingAdmin] = await connection.execute(
        "SELECT id FROM users WHERE username = ?",
        ["admin"]
      );

      if (existingAdmin.length === 0) {
        // Password hash para "admin123" - En producción usar una contraseña segura
        const defaultPasswordHash =
          "$2b$10$rKvK1YjUQVZhF8q8T9.9I.8J5XZBfGk5H5.8J5XZBfGk5H5.8J5XZB";

        await connection.execute(
          `
          INSERT INTO users (username, email, password_hash, role) 
          VALUES (?, ?, ?, ?)
        `,
          ["admin", "admin@titanmotors.com", defaultPasswordHash, "admin"]
        );

        console.log("✅ Usuario administrador por defecto creado");
        console.log("📧 Email: admin@titanmotors.com");
        console.log("🔐 Password: admin123 (¡Cambia esto en producción!)");
      } else {
        console.log("⚠️  Usuario administrador ya existe");
      }
    } catch (error) {
      console.error("❌ Error creando usuario administrador:", error.message);
    }

    // Insertar datos de ejemplo si no existen
    try {
      const [existingContacts] = await connection.execute(
        "SELECT COUNT(*) as count FROM contacts"
      );
      const contactCount = existingContacts[0].count;

      if (contactCount === 0) {
        console.log("🔧 Insertando datos de ejemplo...");

        const sampleContacts = [
          [
            "Carlos Rodríguez",
            "carlos@example.com",
            "5551234567",
            "Interesado en Camioneta Mediana Pro",
            "Atendido",
          ],
          [
            "María González",
            "maria@example.com",
            "5552345678",
            "Quiero información sobre Camioneta Compacta Urban",
            "En Espera",
          ],
          [
            "Javier Martínez",
            "javier@example.com",
            "5553456789",
            "Necesito cotización para Camioneta Grande Heavy",
            "Atendido",
          ],
          [
            "Ana Fernández",
            "ana@example.com",
            "5554567890",
            "Consulta sobre financiamiento Camioneta Mediana Flex",
            "No Atendido",
          ],
        ];

        for (const [
          fullName,
          email,
          phone,
          message,
          status,
        ] of sampleContacts) {
          await connection.execute(
            `
            INSERT INTO contacts (fullName, email, phone, message, status) 
            VALUES (?, ?, ?, ?, ?)
          `,
            [fullName, email, phone, message, status]
          );
        }

        console.log("✅ Datos de ejemplo insertados");
      } else {
        console.log("⚠️  Ya existen contactos en la base de datos");
      }
    } catch (error) {
      console.error("❌ Error insertando datos de ejemplo:", error.message);
    }

    console.log(
      "\n🎉 Verificación y creación de tablas completada exitosamente!"
    );
  } catch (error) {
    console.error("❌ Error durante el setup de la base de datos:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("✅ Conexión a MySQL cerrada");
    }
  }
};

// Ejecutar el script
checkAndCreateTables().catch(console.error);
