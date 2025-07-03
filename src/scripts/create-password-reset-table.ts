#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { config } from '../config/config.js';

const createPasswordResetTable = async () => {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    console.log(`📍 Host: ${config.DB_HOST}`);
    console.log(`📍 Database: ${config.DB_NAME}`);
    
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT
    });

    console.log('✅ Conectado a la base de datos');

    // Verificar si la tabla existe
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'password_reset_tokens'
    `, [config.DB_NAME]) as [any[], any];

    if (Array.isArray(tables) && tables.length > 0) {
      console.log('✅ La tabla password_reset_tokens ya existe');
      return;
    }

    console.log('📋 Creando tabla password_reset_tokens...');

    // Crear tabla de tokens de recuperación de contraseña
    const createTableQuery = `
      CREATE TABLE password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Tabla password_reset_tokens creada exitosamente');

    // Crear índices para optimización
    const indexes = [
      {
        query: 'CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)',
        name: 'idx_password_reset_tokens_token'
      },
      {
        query: 'CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
        name: 'idx_password_reset_tokens_user_id'
      },
      {
        query: 'CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)',
        name: 'idx_password_reset_tokens_expires_at'
      }
    ];

    console.log('📋 Creando índices...');
    
    for (const index of indexes) {
      try {
        await connection.execute(index.query);
        console.log(`✅ Índice ${index.name} creado`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️  Índice ${index.name} ya existe`);
        } else {
          console.warn(`⚠️  Error al crear índice ${index.name}:`, error.message);
        }
      }
    }

    console.log('🎉 Migración completada exitosamente');
    
    // Verificar la estructura de la tabla
    const [structure] = await connection.execute('DESCRIBE password_reset_tokens');
    console.log('📊 Estructura de la tabla:');
    console.table(structure);
    
  } catch (error: any) {
    console.error('❌ Error en la migración:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE' && error.message.includes('users')) {
      console.log('');
      console.log('💡 Parece que la tabla "users" no existe.');
      console.log('   Ejecuta primero: npm run setup-db');
      console.log('   O ejecuta el script completo de base de datos.');
    }
    
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
  createPasswordResetTable().catch(console.error);
}

export { createPasswordResetTable };
