import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend Landing Cars API',
      version: '1.0.0',
      description: 'API profesional para gestión de contactos de Landing Cars con sistema de autenticación y dashboard administrativo',
      contact: {
        name: 'Titan Motors',
        email: 'admin@titanmotors.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Contact: {
          type: 'object',
          required: ['fullName', 'email', 'phone', 'message'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del contacto'
            },
            fullName: {
              type: 'string',
              description: 'Nombre completo del contacto',
              minLength: 3
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del contacto'
            },
            phone: {
              type: 'string',
              pattern: '^\\d{10}$',
              description: 'Teléfono de 10 dígitos'
            },
            message: {
              type: 'string',
              description: 'Mensaje del contacto',
              minLength: 10
            },
            status: {
              type: 'string',
              enum: ['No Atendido', 'En Espera', 'Atendido', 'Enviado'],
              description: 'Estado de atención del contacto'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Prioridad del contacto'
            },
            notes: {
              type: 'string',
              description: 'Notas internas sobre el contacto'
            },
            assigned_to: {
              type: 'integer',
              description: 'ID del usuario asignado'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario único',
              minLength: 3
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'agent'],
              description: 'Rol del usuario'
            },
            is_active: {
              type: 'boolean',
              description: 'Estado activo del usuario'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        ContactMessage: {
          type: 'object',
          required: ['contact_id', 'message'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del mensaje'
            },
            contact_id: {
              type: 'integer',
              description: 'ID del contacto relacionado'
            },
            user_id: {
              type: 'integer',
              description: 'ID del usuario que envía el mensaje'
            },
            message: {
              type: 'string',
              description: 'Contenido del mensaje'
            },
            message_type: {
              type: 'string',
              enum: ['incoming', 'outgoing', 'note'],
              description: 'Tipo de mensaje'
            },
            is_read: {
              type: 'boolean',
              description: 'Si el mensaje ha sido leído'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nombre de usuario o email'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Si el login fue exitoso'
            },
            token: {
              type: 'string',
              description: 'JWT token para autenticación'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'object',
              description: 'Detalles adicionales del error'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Archivos que contienen anotaciones de swagger
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
