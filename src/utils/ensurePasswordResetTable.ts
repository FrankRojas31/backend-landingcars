import mysql from 'mysql2/promise';
import { config } from '../config/config.js';

export const ensurePasswordResetTable = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT
    });

    // Verificar si la tabla existe
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'password_reset_tokens'
    `, [config.DB_NAME]) as [any[], any];

    if (Array.isArray(tables) && tables.length > 0) {
      console.log('✅ Tabla password_reset_tokens verificada');
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
    console.log('✅ Tabla password_reset_tokens creada');

    // Crear índices
    const indexes = [
      'CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)',
      'CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
      'CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)'
    ];

    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery);
      } catch (error: any) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          console.warn('⚠️  Error al crear índice:', error.message);
        }
      }
    }

    console.log('✅ Índices creados para password_reset_tokens');
    
  } catch (error: any) {
    console.error('❌ Error al verificar/crear tabla password_reset_tokens:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE' && error.message.includes('users')) {
      console.log('💡 La tabla "users" no existe. Ejecuta: npm run setup-db');
    }
    
    // No lanzar error para que la aplicación pueda seguir funcionando
    console.log('⚠️  La funcionalidad de recuperación de contraseña no estará disponible');
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
