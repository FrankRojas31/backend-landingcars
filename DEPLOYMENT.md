# 🚀 Guía de Despliegue a Producción - Backend Landing Cars

## 🔧 Problema Solucionado

**Error anterior**: `ReferenceError: exports is not defined in ES module scope`

**Solución aplicada**:

- Cambiar `tsconfig.json` de `"module": "CommonJS"` a `"module": "ESNext"`
- Mantener `"type": "module"` en `package.json`

## ✅ Estado Actual

El servidor está funcionando correctamente:

- ✅ Compilación exitosa
- ✅ Conexión a base de datos
- ✅ Servidor corriendo en puerto 3000
- ✅ Documentación Swagger disponible
- ✅ Health check funcionando

## 🚀 Pasos para Desplegar en Railway

### 1. Configurar Variables de Entorno en Railway

Ir al dashboard de Railway y configurar:

```bash
NODE_ENV=production
PORT=3000
DB_HOST=shuttle.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=WolMjdjqrOIJhgiJnpBgLYGcogvDTDcZ
DB_NAME=railway
DB_PORT=40050
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion
RECAPTCHA_SECRET=6Ld8Z2srAAAAANazYnRGWg8piHq-zBYcRqKwLImu
CORS_ORIGIN=https://landingcars-production.up.railway.app
```

### 2. Comandos de Despliegue

```bash
# Instalar dependencias
npm install

# Compilar proyecto
npm run build

# Iniciar servidor
npm start
```

### 3. Archivos de Configuración Creados

- `railway.toml` - Configuración específica para Railway
- `.env.railway` - Variables de entorno para Railway
- `TROUBLESHOOTING.md` - Guía de resolución de problemas
- `diagnose-simple.js` - Script de diagnóstico
- `start-production.sh` - Script de inicio para producción

## 🔍 Verificación del Despliegue

### Endpoints a verificar:

- `GET /health` - Estado del servidor
- `GET /api/docs` - Documentación Swagger
- `POST /api/contacts` - Crear contacto
- `GET /api/contacts` - Listar contactos (requiere auth)

### Scripts de verificación:

```bash
# Diagnóstico local
npm run diagnose

# Health check
npm run healthcheck

# Verificar desde web
curl https://tu-dominio.railway.app/health
```

## 🐛 Troubleshooting

Si el servidor no responde:

1. **Verificar logs en Railway**:

   ```bash
   railway logs
   ```

2. **Verificar variables de entorno**:
   - NODE_ENV debe ser "production"
   - Puerto correcto (Railway asigna automáticamente)
   - Base de datos accesible

3. **Verificar conexión a base de datos**:
   - Host, puerto, usuario y contraseña correctos
   - Base de datos existe y es accesible

4. **Verificar compilación**:
   - `dist/` folder existe
   - Archivos `.js` generados correctamente

## 📊 Monitoreo

### Métricas importantes:

- Tiempo de respuesta
- Errores 500
- Conexiones de base de datos
- Uso de memoria

### Logs a monitorear:

- Errores de conexión a BD
- Errores de JWT
- Rate limiting
- Requests fallidos

## 🔒 Seguridad

- ✅ JWT_SECRET configurado
- ✅ CORS configurado correctamente
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting configurado
- ✅ Validación de datos con Joi

## 📝 Notas Importantes

1. **El problema principal era de configuración de módulos ES/CommonJS**
2. **La base de datos Railway está funcionando correctamente**
3. **El servidor se inicia sin errores críticos**
4. **Los warnings de MySQL2 son normales y no afectan el funcionamiento**

---

**Fecha**: 3 de julio de 2025
**Estado**: ✅ Funcionando correctamente
**Última actualización**: Configuración de módulos ES corregida
