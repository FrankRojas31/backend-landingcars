# Setup de Base de Datos - Landing Cars Backend

## Configuración Automática de Tablas

Este proyecto incluye un sistema automático para verificar y crear las tablas necesarias en la base de datos MySQL.

## Métodos de Configuración

### 1. Automático (Recomendado)

Las tablas se crean automáticamente cuando arranca el servidor:

```bash
npm run dev
```

### 2. Manual

Ejecutar el script específico para crear tablas:

```bash
npm run setup-db
```

### 3. SQL Directo

Ejecutar el archivo SQL manualmente:

```bash
mysql -u root -p < database.sql
```

## Estructura de la Base de Datos

### Tablas Principales

1. **`users`** - Usuarios del sistema
   - `id` (INT, PRIMARY KEY)
   - `username` (VARCHAR(100), UNIQUE)
   - `email` (VARCHAR(255), UNIQUE)
   - `password_hash` (VARCHAR(255))
   - `role` (ENUM: 'admin', 'manager', 'agent')
   - `is_active` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`contacts`** - Contactos de clientes
   - `id` (INT, PRIMARY KEY)
   - `fullName` (VARCHAR(255))
   - `email` (VARCHAR(255))
   - `phone` (VARCHAR(20))
   - `message` (TEXT)
   - `status` (ENUM: 'No Atendido', 'En Espera', 'Atendido', 'Enviado')
   - `assigned_to` (INT, FK a users)
   - `priority` (ENUM: 'low', 'medium', 'high')
   - `notes` (TEXT)
   - `source` (VARCHAR(100))
   - `created_at`, `updated_at` (TIMESTAMP)

3. **`contact_messages`** - Mensajes/conversaciones
   - `id` (INT, PRIMARY KEY)
   - `contact_id` (INT, FK a contacts)
   - `user_id` (INT, FK a users)
   - `message` (TEXT)
   - `message_type` (ENUM: 'incoming', 'outgoing', 'note')
   - `is_read` (BOOLEAN)
   - `created_at` (TIMESTAMP)

4. **`user_sessions`** - Sesiones de usuario
   - `id` (INT, PRIMARY KEY)
   - `user_id` (INT, FK a users)
   - `token_hash` (VARCHAR(255))
   - `expires_at` (TIMESTAMP)
   - `created_at` (TIMESTAMP)

## Configuración Requerida

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=landing_cars
DB_PORT=3306
```

### Prerrequisitos

- MySQL 5.7+ o MariaDB 10.3+
- Node.js 18+
- npm o yarn

## Usuario Administrador Por Defecto

El script crea automáticamente un usuario administrador:

- **Email:** admin@titanmotors.com
- **Password:** admin123
- **Rol:** admin

⚠️ **IMPORTANTE:** Cambiar esta contraseña en producción.

## Índices Optimizados

El sistema crea automáticamente índices para mejorar el rendimiento:

- Índices en `contacts`: email, status, created_at, assigned_to
- Índices en `contact_messages`: contact_id, created_at
- Índices en `users`: email, username

## Troubleshooting

### Error de Conexión

```
Error: connect ECONNREFUSED
```

**Solución:** Verificar que MySQL esté ejecutándose y las credenciales sean correctas.

### Error de Permisos

```
Error: Access denied for user
```

**Solución:** Verificar usuario y contraseña en `.env`.

### Error de Base de Datos Inexistente

```
Error: Unknown database
```

**Solución:** El script crea la base de datos automáticamente, pero verificar permisos de creación.

## Comandos Útiles

```bash
# Verificar tablas existentes
npm run setup-db

# Reiniciar servidor con verificación de DB
npm run dev

# Ejecutar solo verificación de tablas
tsx src/scripts/checkAndCreateTables.ts

# Ver logs de la base de datos
# (incluidos en la salida del servidor)
```

## Datos de Ejemplo

El script incluye datos de ejemplo para testing:

- 4 contactos de prueba
- 1 usuario administrador

Estos datos se insertan solo si no existen previamente.
