# Backend Landing Cars

Backend API para el landing de autos con formulario de contacto y validación reCAPTCHA.

## Características

- API REST para formulario de contacto
- Validación con Joi
- Protección reCAPTCHA
- Base de datos MySQL
- CORS configurado

## Requisitos

- Node.js 18+
- MySQL 8.0+
- Bun runtime

## Instalación

1. Instalar dependencias:

```bash
bun install
```

2. Configurar base de datos MySQL:

   - Crear una base de datos llamada `landing_cars`
   - Configurar las credenciales en el archivo `.env`

3. Configurar variables de entorno:

   - Copiar `.env.example` a `.env`
   - Completar las variables de MySQL y reCAPTCHA

4. Ejecutar el servidor:

```bash
bun run dev
```

## Variables de entorno

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=landing_cars
DB_PORT=3306
CORS_ORIGIN=http://localhost:5173
RECAPTCHA_SECRET=tu_secret_key
```

## API Endpoints

### POST /api/contact

Envía información de contacto.

**Body:**

```json
{
  "fullName": "Nombre Completo",
  "email": "email@ejemplo.com",
  "phone": "1234567890",
  "message": "Mensaje de contacto",
  "recaptcha": "token_recaptcha"
}
```

**Respuesta exitosa:**

```json
{
  "message": "Datos guardados correctamente",
  "id": 1
}
```

This project was created using `bun init` in bun v1.2.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
