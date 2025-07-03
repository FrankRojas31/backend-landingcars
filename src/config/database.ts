import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'landing_cars',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let pool: mysql.Pool | null = null;

export const connectDB = async (): Promise<mysql.Pool> => {
  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      console.log('✅ Pool de conexiones MySQL creado');
      
      // Verificar conexión
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Conexión a la base de datos verificada');
    }
    
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    throw error; // No salir del proceso, solo lanzar el error
  }
};

export const getDB = (): mysql.Pool => {
  if (!pool) {
    // Si no hay pool, intentar crear uno sincrónicamente devolviendo null
    console.warn('⚠️  Base de datos no inicializada. Creando pool...');
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

export default { connectDB, getDB };
