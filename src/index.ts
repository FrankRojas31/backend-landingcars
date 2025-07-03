import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database.js';
import { config } from './config/config.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { Logger } from './utils/logger.js';
import { checkAndCreateTables } from './scripts/checkAndCreateTables.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import messageRoutes from './routes/messages.js';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      Logger.success('Base de datos inicializada correctamente');
      
      // Verificar y crear tablas si no existen
      await checkAndCreateTables();
      Logger.success('Esquema de base de datos verificado');
    } catch (error) {
      Logger.error('Error al inicializar la base de datos:', error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Helmet para seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX,
      message: {
        success: false,
        error: 'Demasiadas solicitudes, intenta nuevamente más tarde'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // CORS más restrictivo
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          config.CORS_ORIGIN,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173' // Vite dev server
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          Logger.warn(`CORS bloqueó origen: ${origin}`);
          callback(new Error('No permitido por política CORS'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
      ],
      credentials: true,
      optionsSuccessStatus: 200
    };

    this.app.use(cors(corsOptions));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use((req: Request, res: Response, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        Logger.request(req.method, req.originalUrl, res.statusCode, duration);
      });
      
      next();
    });
  }

  private initializeRoutes(): void {
    // Ruta de health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.NODE_ENV
      });
    });

    // Ruta de prueba CORS
    this.app.get('/api/test-cors', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'CORS funcionando correctamente',
        origin: req.headers.origin || 'No origin',
        timestamp: new Date().toISOString()
      });
    });

    // Rutas de la API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/contacts', contactRoutes);
    this.app.use('/api/messages', messageRoutes);

    // Ruta para servir archivos estáticos (si es necesario)
    this.app.use('/public', express.static('public'));
  }

  private initializeSwagger(): void {
    // Configuración de Swagger UI
    const swaggerOptions = {
      explorer: true,
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
      customSiteTitle: 'API Landing Cars - Documentación',
      customfavIcon: '/public/favicon.ico'
    };

    this.app.use('/api/docs', swaggerUi.serve);
    this.app.get('/api/docs', swaggerUi.setup(swaggerSpec, swaggerOptions));

    // Ruta para obtener el spec en JSON
    this.app.get('/api/docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    Logger.info(`📚 Documentación Swagger disponible en: http://localhost:${config.PORT}/api/docs`);
  }

  private initializeErrorHandling(): void {
    // Manejar rutas no encontradas (usar un patrón válido)
    this.app.use((req: Request, res: Response, next) => {
      notFound(req, res);
    });

    // Manejador global de errores
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.PORT, () => {
      Logger.success(`🚀 Servidor corriendo en puerto ${config.PORT}`);
      Logger.info(`🌍 Entorno: ${config.NODE_ENV}`);
      Logger.info(`📖 API Docs: http://localhost:${config.PORT}/api/docs`);
      Logger.info(`🔍 Health Check: http://localhost:${config.PORT}/health`);
      
      if (config.NODE_ENV === 'development') {
        Logger.debug('🛠️ Modo de desarrollo activado');
        Logger.debug(`🔗 CORS Origin: ${config.CORS_ORIGIN}`);
      }
    });

    // Manejar cierre graceful
    process.on('SIGTERM', this.gracefulShutdown);
    process.on('SIGINT', this.gracefulShutdown);
  }

  private gracefulShutdown = (signal: string): void => {
    Logger.info(`📤 Recibida señal ${signal}. Cerrando servidor...`);
    
    process.exit(0);
  };
}

// Inicializar y arrancar la aplicación
const app = new App();
app.listen();
