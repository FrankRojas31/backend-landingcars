#!/bin/bash

# Script para crear la tabla password_reset_tokens
# Ejecutar con: ./fix-password-reset-table.sh

echo "🔧 Creando tabla password_reset_tokens..."

# Opción 1: Usar el script TypeScript
echo "Opción 1: Ejecutando script TypeScript..."
npm run create-password-table

echo ""
echo "🎉 ¡Listo! La tabla password_reset_tokens debería estar creada."
echo ""
echo "📋 Para verificar manualmente, puedes ejecutar este SQL:"
echo "   USE railway;"
echo "   DESCRIBE password_reset_tokens;"
echo ""
echo "🚀 Ahora puedes reiniciar tu servidor con: npm run dev"
