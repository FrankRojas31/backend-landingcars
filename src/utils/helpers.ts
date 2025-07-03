import axios from 'axios';
import { config } from '../config/config.js';
import { RecaptchaResponse } from '../types/index.js';

export const verifyRecaptcha = async (recaptchaToken: string): Promise<boolean> => {
  try {
    if (!config.RECAPTCHA_SECRET) {
      console.warn('⚠️ reCAPTCHA secret no configurado, saltando verificación');
      return true; // En desarrollo, permitir sin verificación
    }

    const response = await axios.post<RecaptchaResponse>(
      config.RECAPTCHA_URL,
      new URLSearchParams({
        secret: config.RECAPTCHA_SECRET,
        response: recaptchaToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000 // 5 segundos de timeout
      }
    );

    return response.data.success;
  } catch (error) {
    console.error('❌ Error al verificar reCAPTCHA:', error);
    return false;
  }
};

export const sanitizePhoneNumber = (phone: string): string => {
  // Remover todos los caracteres que no sean dígitos
  return phone.replace(/\D/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  const sanitized = sanitizePhoneNumber(phone);
  
  // Formato para números mexicanos de 10 dígitos
  if (sanitized.length === 10) {
    return `(${sanitized.slice(0, 3)}) ${sanitized.slice(3, 6)}-${sanitized.slice(6)}`;
  }
  
  return sanitized;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>, 
  retries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Reintentando en ${delay}ms... (${retries} intentos restantes)`);
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2); // Backoff exponencial
    }
    throw error;
  }
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatCurrency = (amount: number, currency: string = 'MXN'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
};

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};
