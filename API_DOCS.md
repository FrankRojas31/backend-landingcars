# API Documentation - Backend Landing Cars

## 🚀 Introducción

Esta es la documentación completa de la API para el Backend Landing Cars, un sistema profesional de gestión de contactos con autenticación, dashboard administrativo y notificaciones por email y Slack.

## 📋 Características Principales

- ✅ **Sistema de Autenticación JWT** completo
- ✅ **Dashboard Administrativo** con estadísticas en tiempo real
- ✅ **Gestión de Contactos** con estados y prioridades
- ✅ **Sistema de Mensajería** entre usuarios y contactos
- ✅ **Notificaciones por Email** automáticas
- ✅ **Integración con Slack** para notificaciones
- ✅ **Documentación Swagger** interactiva
- ✅ **Validación de datos** robusta
- ✅ **Rate Limiting** y seguridad
- ✅ **Base de datos MySQL** optimizada

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + TypeScript + Express
- **Base de Datos**: MySQL 8.0+
- **Autenticación**: JWT + bcrypt
- **Documentación**: Swagger/OpenAPI 3.0
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Notificaciones**: Nodemailer + Slack API
- **Validación**: Joi

## 📁 Estructura del Proyecto

```
Backend-LandingCars/
├── src/
│   ├── config/           # Configuraciones
│   │   ├── database.ts   # Configuración MySQL
│   │   ├── config.ts     # Variables de entorno
│   │   └── swagger.ts    # Configuración Swagger
│   ├── controllers/      # Controladores de rutas
│   │   ├── authController.ts
│   │   ├── contactController.ts
│   │   └── messageController.ts
│   ├── middleware/       # Middlewares
│   │   ├── auth.ts       # Autenticación JWT
│   │   ├── validation.ts # Validación de datos
│   │   └── errorHandler.ts
│   ├── models/           # Modelos de datos
│   ├── routes/           # Definición de rutas
│   │   ├── auth.ts
│   │   ├── contacts.ts
│   │   └── messages.ts
│   ├── services/         # Lógica de negocio
│   │   ├── authService.ts
│   │   ├── contactService.ts
│   │   ├── messageService.ts
│   │   ├── emailService.ts
│   │   └── slackService.ts
│   ├── types/            # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilidades
│   │   ├── helpers.ts
│   │   └── logger.ts
│   └── index.ts          # Punto de entrada
├── database.sql          # Script de base de datos
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Configuración e Instalación

### 1. Clonar el repositorio

```bash
git clone [tu-repositorio]
cd Backend-LandingCars
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar base de datos

```bash
# Crear base de datos MySQL y ejecutar el script
mysql -u root -p < database.sql
```

### 5. Iniciar el servidor

```bash
npm run dev
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Después del login exitoso, incluye el token en el header Authorization:

```
Authorization: Bearer your-jwt-token-here
```

### Roles de Usuario

- **admin**: Acceso completo al sistema
- **manager**: Gestión de contactos y usuarios
- **agent**: Gestión básica de contactos asignados

## 📊 Endpoints Principales

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil actual
- `POST /api/auth/logout` - Cerrar sesión

### Gestión de Usuarios (Admin)

- `GET /api/auth/users` - Listar usuarios
- `POST /api/auth/users` - Crear usuario
- `PUT /api/auth/users/:id` - Actualizar usuario
- `DELETE /api/auth/users/:id` - Eliminar usuario

### Contactos

- `GET /api/contacts` - Listar contactos (con filtros)
- `POST /api/contacts` - Crear contacto (público)
- `GET /api/contacts/:id` - Obtener contacto específico
- `PUT /api/contacts/:id` - Actualizar contacto
- `DELETE /api/contacts/:id` - Eliminar contacto
- `GET /api/contacts/dashboard/stats` - Estadísticas del dashboard

### Mensajes

- `GET /api/messages/contact/:id` - Mensajes de un contacto
- `POST /api/messages/contact/:id` - Enviar mensaje a contacto
- `PUT /api/messages/:id` - Actualizar mensaje
- `DELETE /api/messages/:id` - Eliminar mensaje

## 📈 Estados de Contactos

Los contactos pueden tener los siguientes estados:

1. **No Atendido** - Contacto recién creado
2. **En Espera** - Contacto en proceso de atención
3. **Atendido** - Contacto completamente atendido
4. **Enviado** - Información enviada al contacto

## 🎯 Prioridades de Contactos

- **low** - Prioridad baja
- **medium** - Prioridad media (por defecto)
- **high** - Prioridad alta

## 📧 Notificaciones

### Email Automático

Cuando se crea un contacto, se envía automáticamente un email de bienvenida al cliente.

### Slack

Las notificaciones importantes se envían al canal de Slack configurado.

## 🔍 Documentación Swagger

Accede a la documentación interactiva en:

```
http://localhost:3000/api-docs
```

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Control de acceso cross-origin
- **Rate Limiting**: Limitación de peticiones por IP
- **JWT**: Tokens seguros con expiración
- **bcrypt**: Hash seguro de contraseñas
- **Validación**: Validación robusta con Joi

## 📱 Uso del Dashboard

El dashboard proporciona:

- 📊 Estadísticas en tiempo real
- 📋 Lista de contactos con filtros avanzados
- 👥 Gestión de usuarios (admin)
- 💬 Sistema de mensajería
- 📈 Gráficos de tendencias
- ⚡ Acciones rápidas

## 🔧 Configuraciones Importantes

### Variables de Entorno Clave

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=landing_cars

# JWT
JWT_SECRET=tu_secret_super_seguro

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Slack (opcional)
SLACK_BOT_TOKEN=xoxb-tu-token
SLACK_CHANNEL=#general
```

## 🚀 Producción

Para desplegar en producción:

1. Configurar variables de entorno seguras
2. Usar HTTPS
3. Configurar proxy reverso (nginx)
4. Monitoreo y logs
5. Backups de base de datos

## 🐛 Debugging

- Los logs se muestran en consola durante desarrollo
- Usar `npm run dev` para hot-reload
- Swagger UI para testing de endpoints
- MySQL Workbench para debugging de BD

## 📞 Soporte

Para soporte técnico o consultas:

- Email: admin@titanmotors.com
- Slack: Canal #support

---

**Desarrollado con ❤️ para Titan Motors**
