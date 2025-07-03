#!/bin/bash

# Script para corregir las instancias de servicios en los controladores

echo "🔧 Corrigiendo instancias de servicios en controladores..."

# Crear backup de los controladores originales
cp src/controllers/contactController.ts src/controllers/contactController.ts.bak
cp src/controllers/messageController.ts src/controllers/messageController.ts.bak

echo "✅ Backups creados"
echo "⚠️  Los archivos necesitan corrección manual para agregar las instancias de servicios en cada función"
echo "   Por favor, agrega 'const serviceName = new ServiceName();' al inicio de cada función exportada"

echo "📝 Ejemplo de patrón a seguir:"
echo "   export const functionName = asyncHandler(async (req: Request, res: Response): Promise<void> => {"
echo "     const serviceInstance = new ServiceClass();"
echo "     // resto del código..."
echo "   });"
