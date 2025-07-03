export const Logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  },
  
  success: (message: string, meta?: any) => {
    console.log(`[SUCCESS] ✅ ${new Date().toISOString()} - ${message}`, meta || '');
  },
  
  request: (method: string, url: string, statusCode?: number, responseTime?: number) => {
    const status = statusCode ? `${statusCode}` : '';
    const time = responseTime ? `${responseTime}ms` : '';
    console.log(`[REQUEST] ${method} ${url} ${status} ${time}`);
  }
};

export default Logger;
