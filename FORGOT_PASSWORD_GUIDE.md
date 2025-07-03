# Funcionalidad de Recuperación de Contraseña

## Descripción General

Se ha implementado una funcionalidad completa de "Olvidé mi contraseña" que permite a los usuarios recuperar el acceso a sus cuentas mediante correo electrónico.

## Características Implementadas

### 1. Solicitud de Recuperación

- **Endpoint**: `POST /api/auth/forgot-password`
- **Descripción**: Permite solicitar un token de recuperación
- **Entrada**: Email o nombre de usuario
- **Salida**: Confirmación de envío (sin revelar si el usuario existe)

### 2. Validación de Token

- **Endpoint**: `GET /api/auth/validate-reset-token/:token`
- **Descripción**: Valida si un token de recuperación es válido
- **Entrada**: Token en la URL
- **Salida**: Estado de validez del token

### 3. Restablecimiento de Contraseña

- **Endpoint**: `POST /api/auth/reset-password`
- **Descripción**: Permite cambiar la contraseña con un token válido
- **Entrada**: Token y nueva contraseña
- **Salida**: Confirmación de cambio exitoso

## Flujo de Trabajo

### Paso 1: Solicitar Recuperación

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "usuario@ejemplo.com"
  }'
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Si el usuario existe, se ha enviado un correo con las instrucciones para restablecer la contraseña."
}
```

### Paso 2: Validar Token (Opcional)

```bash
curl -X GET http://localhost:3000/api/auth/validate-reset-token/abc123token
```

**Respuesta válida:**

```json
{
  "success": true,
  "message": "Token válido"
}
```

### Paso 3: Restablecer Contraseña

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123token",
    "newPassword": "nuevaContraseña123"
  }'
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
}
```

## Configuración Requerida

### Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```env
# URL del frontend para el enlace de recuperación
FRONTEND_URL=http://localhost:3001

# Configuración de email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicación
EMAIL_FROM=noreply@titanmotors.com
```

### Base de Datos

La funcionalidad requiere la tabla `password_reset_tokens`. Para crearla:

1. **Opción 1**: Ejecutar el script de migración

```bash
npm run migrate:password-reset
```

2. **Opción 2**: Ejecutar manualmente el SQL

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Características de Seguridad

### 1. Tokens Seguros

- **Generación**: Utilizando `crypto.randomBytes(32)` para máxima aleatoriedad
- **Expiración**: Los tokens expiran en 1 hora
- **Uso único**: Cada token solo puede usarse una vez

### 2. Protección contra Enumeración

- **Respuesta uniforme**: Siempre se devuelve el mismo mensaje, independientemente de si el usuario existe
- **No revelación**: No se expone información sobre usuarios existentes

### 3. Validación de Contraseñas

- **Longitud mínima**: 8 caracteres
- **Hasheado**: Usando bcrypt con salt rounds 10

### 4. Limpieza Automática

- **Invalidación**: Los tokens anteriores se invalidan al generar uno nuevo
- **Expiración**: Los tokens expirados no pueden ser utilizados

## Correos Electrónicos

### Diseño del Correo

El correo incluye:

- **Enlace directo**: Para restablecer la contraseña
- **Código de respaldo**: Token copiable manualmente
- **Información de seguridad**: Advertencias sobre expiración y uso único
- **Diseño responsive**: Compatible con todos los clientes de correo

### Ejemplo de Correo

```
🔒 Recuperación de Contraseña
Titan Motors CRM

Hola [usuario],

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

[Botón: Restablecer Contraseña]

⚠️ Importante:
- Este enlace expira en 1 hora
- Solo puede ser usado una vez
- Si no solicitaste este cambio, ignora este correo
```

## Casos de Error

### 1. Token Inválido/Expirado

```json
{
  "success": false,
  "error": "Token de recuperación inválido o expirado."
}
```

### 2. Contraseña Muy Corta

```json
{
  "success": false,
  "error": "La contraseña debe tener al menos 8 caracteres."
}
```

### 3. Usuario Inactivo

```json
{
  "success": false,
  "error": "Usuario no encontrado o inactivo."
}
```

## Integración con Frontend

### Formulario de Solicitud

```html
<form id="forgotPasswordForm">
  <input
    type="text"
    name="identifier"
    placeholder="Email o nombre de usuario"
    required
  />
  <button type="submit">Enviar correo de recuperación</button>
</form>
```

### Página de Restablecimiento

```html
<form id="resetPasswordForm">
  <input type="hidden" name="token" value="[token_from_url]" />
  <input
    type="password"
    name="newPassword"
    placeholder="Nueva contraseña"
    required
  />
  <button type="submit">Restablecer contraseña</button>
</form>
```

## Monitoreo y Logs

### Logs de Seguridad

- Solicitudes de recuperación
- Intentos de uso de tokens inválidos
- Cambios de contraseña exitosos

### Métricas Recomendadas

- Número de solicitudes de recuperación por día
- Tasa de éxito de restablecimiento
- Tokens expirados sin usar

## Mantenimiento

### Limpieza de Tokens

Se recomienda crear una tarea programada para limpiar tokens expirados:

```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() OR used = true;
```

### Monitoreo de Correos

Verificar regularmente:

- Tasa de entrega de correos
- Correos rebotados
- Configuración SMTP

## Próximas Mejoras

1. **Límite de intentos**: Implementar rate limiting para solicitudes
2. **Notificaciones**: Alertar sobre cambios de contraseña
3. **Autenticación 2FA**: Integrar con autenticación de dos factores
4. **Historial**: Mantener log de cambios de contraseña
5. **Plantillas**: Personalizar correos por empresa/marca
