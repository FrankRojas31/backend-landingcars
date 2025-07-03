# Backend Landing Cars - Sistema de Gestión de Contactos

![Titan Motors](https://img.shields.io/badge/Titan-Motors-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

Backend profesional para el sistema de gestión de contactos de Titan Motors con dashboard administrativo, autenticación, y sistema de mensajería integrado.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación

- Login con JWT
- Roles de usuario (Admin, Manager, Agent)
- Middleware de autorización
- Sesiones seguras

### 📊 Dashboard Administrativo

- Estadísticas en tiempo real
- Gestión completa de contactos
- Sistema de estados: `No Atendido`, `En Espera`, `Atendido`, `Enviado`
- Filtros avanzados y paginación
- Asignación de contactos a agentes

### 💬 Sistema de Mensajería

- Conversaciones por contacto
- Mensajes entrantes, salientes y notas internas
- Marcado de leídos/no leídos
- Historial completo de comunicación

### 📧 Notificaciones Automáticas

- **Slack**: Notificaciones instantáneas de nuevos contactos
- **Email**: Confirmaciones automáticas y seguimiento
- Templates HTML profesionales
- Notificaciones de cambios de estado

### 📖 Documentación API

- Swagger/OpenAPI 3.0 integrado
- Documentación interactiva completa
- Ejemplos de uso y schemas

### 🛡️ Seguridad

- Helmet.js para headers de seguridad
- Rate limiting configurable
- Validación exhaustiva con Joi
- CORS configurado
- Verificación reCAPTCHA

## 🏗️ Arquitectura del Proyecto

```
src/
├── config/          # Configuraciones (DB, Swagger, etc.)
├── controllers/     # Lógica de controladores
├── middleware/      # Middlewares personalizados
├── models/          # Modelos de datos (futuro)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades y helpers
└── index.ts         # Punto de entrada principal
```

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, TypeScript
- **Base de Datos**: MySQL con connection pooling
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Joi
- **Documentación**: Swagger/OpenAPI
- **Seguridad**: Helmet, Express Rate Limit
- **Notificaciones**: Slack API, Nodemailer
- **Testing**: Jest (configurado)

## 📋 Requisitos Previos

- Node.js 18+
- MySQL 8.0+
- npm o yarn
- Cuenta de Gmail (para emails)
- Slack workspace (opcional)
- reCAPTCHA keys (opcional)

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd Backend-LandingCars
npm install
```

### 2. Configurar base de datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de base de datos
source database.sql
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Variables importantes a configurar:**

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=landing_cars

# JWT Secret (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET=tu_jwt_secret_super_seguro

# reCAPTCHA (opcional pero recomendado)
RECAPTCHA_SECRET=tu_recaptcha_secret

# Email (para notificaciones)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Slack (opcional)
SLACK_BOT_TOKEN=xoxb-tu-token
```

### 4. Ejecutar el proyecto

```bash
# Desarrollo (con hot reload)
npm run dev

# Construcción para producción
npm run build
npm start
```

## 📚 Uso de la API

### 🔗 Endpoints Principales

#### Autenticación

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

#### Contactos (Público)

```http
POST /api/contact         # Crear contacto desde landing
```

#### Contactos (Protegido)

```http
GET    /api/contacts      # Listar contactos
GET    /api/contacts/:id  # Obtener contacto
PUT    /api/contacts/:id  # Actualizar contacto
DELETE /api/contacts/:id  # Eliminar contacto
POST   /api/contacts/:id/follow-up  # Enviar email de seguimiento
```

#### Dashboard

```http
GET /api/contacts/stats   # Estadísticas del dashboard
GET /api/contacts/my      # Mis contactos asignados
```

#### Mensajes

```http
GET  /api/messages/contact/:contactId  # Mensajes de un contacto
POST /api/messages/contact/:contactId  # Crear mensaje
PUT  /api/messages/:id                 # Actualizar mensaje
```

### 📖 Documentación Completa

Una vez que el servidor esté corriendo, visita:

**http://localhost:3000/api/docs**

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Construcción para producción
npm start        # Ejecutar versión de producción
npm run lint     # Linter de código
npm run format   # Formatear código con Prettier
npm test         # Ejecutar tests
```

## 🎯 Estados de Contactos

El sistema maneja 4 estados principales:

- **🔴 No Atendido**: Contacto recién creado
- **🟡 En Espera**: Contacto en proceso
- **🟢 Atendido**: Contacto procesado
- **🔵 Enviado**: Email de seguimiento enviado

## 👥 Roles de Usuario

- **Admin**: Acceso completo al sistema
- **Manager**: Gestión de contactos y usuarios
- **Agent**: Gestión de contactos asignados

## 🔐 Usuario por Defecto

```
Usuario: admin
Email: admin@titanmotors.com
Contraseña: (ver database.sql)
```

## 🌐 Integraciónes

### Slack

```env
SLACK_BOT_TOKEN=xoxb-tu-token
SLACK_CHANNEL=#general
```

### Email (Gmail)

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

### reCAPTCHA

```env
RECAPTCHA_SECRET=tu_secret_key
```

## 🛡️ Seguridad

- Headers de seguridad con Helmet
- Rate limiting (100 req/15min por defecto)
- Validación exhaustiva de entrada
- JWT con expiración configurable
- CORS restrictivo
- Hash de passwords con bcrypt

## 📊 Monitoreo

- Logs estructurados con timestamps
- Health check endpoint: `/health`
- Request logging con tiempo de respuesta
- Error handling centralizado

## 🚀 Despliegue

### Variables de Entorno Importantes para Producción

```env
NODE_ENV=production
JWT_SECRET=un_secret_realmente_seguro_de_32_caracteres_minimo
DB_PASSWORD=password_seguro_de_base_de_datos
```

### Recomendaciones

1. Usar HTTPS en producción
2. Configurar proxy reverso (nginx)
3. Implementar backup de base de datos
4. Monitorear logs y errores
5. Configurar variables de entorno seguras

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:

- Email: admin@titanmotors.com
- Documentación: http://localhost:3000/api/docs
- Issues: [GitHub Issues](tu-repo/issues)

---

**¡Desarrollado con ❤️ para Titan Motors!** 🚗
