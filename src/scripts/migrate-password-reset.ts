#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { config } from '../config/config.js';

const createPasswordResetTable = async () => {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT
    });

    console.log('✅ Conectado a la base de datos');

    // Crear tabla de tokens de recuperación de contraseña
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Tabla password_reset_tokens creada/verificada');

    // Crear índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)'
    ];

    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery);
        console.log('✅ Índice creado/verificado');
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          console.warn('⚠️  Error al crear índice:', error.message);
        }
      }
    }

    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
};

// Ejecutar migración
if (import.meta.url === `file://${process.argv[1]}`) {
  createPasswordResetTable();
}

export { createPasswordResetTable };
