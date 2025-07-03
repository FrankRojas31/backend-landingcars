# 🚨 Guía de Troubleshooting - Backend Landing Cars

## 🔍 Diagnóstico Rápido

### 1. Ejecutar diagnóstico completo

```bash
npm run diagnose
```

### 2. Verificar estado del servidor

```bash
npm run healthcheck
```

### 3. Verificar logs del servidor

```bash
# Si usas PM2
pm2 logs backend-landing-cars

# Si usas Docker
docker logs [container_id]

# Si usas Railway
railway logs
```

## 🐛 Problemas Comunes y Soluciones

### ❌ Error: "exports is not defined in ES module scope"

**Causa**: Incompatibilidad entre CommonJS y ES modules

**Solución**:

```bash
# Verificar tsconfig.json
# Debe tener "module": "ESNext" no "CommonJS"
npm run build
npm start
```

### ❌ Error: "Cannot connect to database"

**Causa**: Configuración incorrecta de base de datos

**Solución**:

1. Verificar variables de entorno:

```bash
echo $DB_HOST
echo $DB_PORT
echo $DB_USER
echo $DB_NAME
```

2. Probar conexión manual:

```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).then(() => console.log('✅ Conexión exitosa'))
.catch(err => console.log('❌ Error:', err.message));
"
```

### ❌ Error: "Port already in use"

**Causa**: Puerto ocupado por otro proceso

**Solución**:

```bash
# Encontrar proceso usando el puerto
lsof -i :3000
# o en Windows
netstat -ano | findstr :3000

# Cambiar puerto en .env
PORT=3001
```

### ❌ Error: "Module not found"

**Causa**: Dependencias no instaladas o rutas incorrectas

**Solución**:

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Recompilar
npm run build
```

### ❌ Error: "JWT secret not configured"

**Causa**: JWT_SECRET no configurado

**Solución**:

```bash
# Generar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Agregar al .env
JWT_SECRET=tu_secret_generado_aqui
```

## 🔧 Comandos de Mantenimiento

### Reiniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Actualizar dependencias

```bash
npm update
npm audit fix
```

### Verificar estado completo

```bash
npm run diagnose
npm run healthcheck
curl http://localhost:3000/health
```

### Backup de base de datos

```bash
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup.sql
```

## 📊 Monitoreo

### Endpoints de salud

- `GET /health` - Estado general del servidor
- `GET /api/docs` - Documentación Swagger
- `GET /api/auth/verify` - Verificar JWT (requiere token)

### Métricas importantes

- Tiempo de respuesta de base de datos
- Uso de memoria
- Número de conexiones activas
- Rate limiting

## 🚀 Despliegue

### Checklist pre-despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos accesible
- [ ] JWT_SECRET configurado
- [ ] CORS_ORIGIN configurado
- [ ] Dependencias instaladas
- [ ] Proyecto compilado
- [ ] Tests pasando

### Comandos de despliegue

```bash
# Preparar para producción
npm run build
npm run diagnose

# Iniciar en producción
npm start
```

## 🆘 Contacto de Emergencia

En caso de problemas críticos:

1. Revisar logs del servidor
2. Ejecutar diagnóstico completo
3. Verificar estado de la base de datos
4. Contactar al administrador del sistema

---

**Fecha de actualización**: $(date)
**Versión**: 1.0.0
