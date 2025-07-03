#!/bin/bash

# Script para configurar la base de datos MySQL
echo "🚀 Configurando base de datos Landing Cars..."

# Verificar si MySQL está corriendo
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL no está instalado o no está en el PATH"
    echo "   Por favor instala MySQL y asegúrate de que esté en tu PATH"
    exit 1
fi

# Variables (puedes cambiarlas según tu configuración)
DB_USER="root"
DB_NAME="landing_cars"
SQL_FILE="database.sql"

echo "📊 Ejecutando script de base de datos..."

# Ejecutar el script SQL
mysql -u $DB_USER -p < $SQL_FILE

if [ $? -eq 0 ]; then
    echo "✅ Base de datos configurada exitosamente!"
    echo "   - Base de datos: $DB_NAME"
    echo "   - Tablas creadas: users, contacts, contact_messages, user_sessions"
    echo "   - Usuario admin creado con credenciales por defecto"
    echo ""
    echo "⚠️  IMPORTANTE: Cambia la contraseña del usuario admin antes de ir a producción"
    echo ""
    echo "🔄 Puedes iniciar el servidor con: npm run dev"
else
    echo "❌ Error al configurar la base de datos"
    echo "   Verifica tus credenciales de MySQL y que el servicio esté corriendo"
    exit 1
fi
