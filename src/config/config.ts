import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Servidor
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Base de datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'landing_cars',
  DB_PORT: parseInt(process.env.DB_PORT || '3306'),
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_aqui',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // reCAPTCHA
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || '',
  RECAPTCHA_URL: process.env.RECAPTCHA_URL || 'https://www.google.com/recaptcha/api/siteverify',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001',
  
  // Slack
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  SLACK_CHANNEL: process.env.SLACK_CHANNEL || '#general',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests por ventana
  
  // Paginación
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '10'),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100')
};

export default config;
