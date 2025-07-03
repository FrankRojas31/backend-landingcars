# 📧 Configuración de Emails via Slack - Backend Landing Cars

## 🔧 Cómo Funciona

El sistema ahora está configurado para que **Slack maneje el envío de emails** en lugar del servicio de email tradicional. Esto te permite:

1. **Recibir notificaciones en Slack** cuando llega un nuevo contacto
2. **Obtener templates de email listos** para copiar y enviar
3. **Gestionar el envío de emails** directamente desde Slack
4. **Hacer seguimiento** de contactos pendientes

## 🚀 Configuración Requerida

### 1. Variables de Entorno

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-tu-token-aqui
SLACK_CHANNEL=#general
```

### 2. Configurar Slack Bot

1. Ir a https://api.slack.com/apps
2. Crear una nueva app o usar existente
3. Ir a "OAuth & Permissions"
4. Agregar estos scopes:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
   - `users:read`

### 3. Instalar Bot en Workspace

1. Ir a "Install App"
2. Copiar el "Bot User OAuth Token"
3. Invitar el bot al canal: `/invite @tu-bot`

## 📋 Flujo de Trabajo

### Cuando llega un nuevo contacto:

1. ✅ **Notificación principal** con info del contacto
2. ✅ **Template de email de bienvenida** listo para copiar
3. ✅ **Solicitud específica** para enviar email

### Mensajes que recibirás en Slack:

#### 1. Notificación de Nuevo Contacto

```
🚗 Nuevo contacto en Landing Cars
👤 Nombre: Juan Pérez
📧 Email: juan@email.com
📱 Teléfono: 1234567890
📝 Mensaje: Estoy interesado en un auto...
```

#### 2. Template de Email de Bienvenida

```
📧 TEMPLATE DE EMAIL - BIENVENIDA

📧 Para: Juan Pérez <juan@email.com>
📝 Asunto: ¡Gracias por contactarnos! - Titan Motors

📄 Cuerpo del Email:
```

Estimado/a Juan Pérez,

¡Gracias por contactarnos! Hemos recibido tu mensaje...

```

🎯 Acción: Copiar y enviar este email al cliente
```

#### 3. Solicitud de Email

```
📧 SOLICITUD DE EMAIL DE BIENVENIDA

👤 Cliente: Juan Pérez
📧 Email: juan@email.com
📱 Teléfono: 1234567890
📝 Mensaje: Estoy interesado en un auto...

🎯 Acción requerida: Enviar email de bienvenida al cliente
```

## 🎯 Endpoints Disponibles

### Para usar desde el dashboard:

#### 1. Enviar Template de Email

```
POST /api/contacts/{id}/email-template
Body: {
  "emailType": "welcome" // o "followup" o "quote"
}
```

#### 2. Enviar Recordatorio de Seguimiento

```
POST /api/contacts/{id}/follow-up-reminder
Body: {
  "daysSinceContact": 5 // opcional
}
```

#### 3. Solicitar Email de Bienvenida

```
POST /api/contacts/{id}/request-welcome-email
```

## 📧 Tipos de Email Disponibles

### 1. Welcome (Bienvenida)

- **Uso**: Para nuevos contactos
- **Contenido**: Confirmación de recepción, tiempo de respuesta

### 2. Follow-up (Seguimiento)

- **Uso**: Para contactos sin respuesta
- **Contenido**: Recordatorio gentil, ofrecimiento de ayuda

### 3. Quote (Cotización)

- **Uso**: Para enviar precios o propuestas
- **Contenido**: Información personalizada, próximos pasos

## 🔄 Automatización Recomendada

### Opción 1: Manual (Actual)

- Recibes notificaciones en Slack
- Copias el template
- Envías email manualmente

### Opción 2: Semi-automática (Recomendada)

1. Configurar Slack Workflows
2. Conectar con tu servicio de email (Gmail, Outlook)
3. Automatizar envío con un clic

### Opción 3: Totalmente Automática

1. Usar Zapier o similar
2. Conectar Slack → Email Service
3. Envío automático basado en mensajes de Slack

## 📊 Ventajas del Sistema

### ✅ Beneficios:

- **Centralización**: Todo en Slack
- **Flexibilidad**: Puedes personalizar antes de enviar
- **Seguimiento**: Registro claro de todas las comunicaciones
- **Colaboración**: Todo el equipo puede ver y colaborar
- **Control**: Aprobación manual antes del envío

### ⚠️ Consideraciones:

- **Proceso manual**: Requiere acción humana
- **Dependencia de Slack**: Necesitas tener Slack abierto
- **Formato**: Templates predefinidos (pero personalizables)

## 🚀 Próximos Pasos

1. **Configurar Slack Bot** con los tokens
2. **Probar el sistema** con un contacto de prueba
3. **Entrenar al equipo** en el nuevo flujo
4. **Considerar automatización** según necesidades

## 📞 Comandos Útiles

```bash
# Probar notificación
curl -X POST http://localhost:3000/api/contacts/{id}/email-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"emailType": "welcome"}'

# Enviar recordatorio
curl -X POST http://localhost:3000/api/contacts/{id}/follow-up-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}"
```

---

**Fecha**: 3 de julio de 2025
**Sistema**: Emails via Slack configurado ✅
