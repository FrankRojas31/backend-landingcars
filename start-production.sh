#!/bin/bash

# Script de inicio para producción
# Asegura que el servidor esté corriendo y maneja errores

echo "🚀 Iniciando Backend Landing Cars..."

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar que dist existe
if [ ! -d "dist" ]; then
    echo "🔨 Compilando proyecto..."
    npm run build
fi

# Verificar que .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "📋 Copiando desde .env.example..."
    cp .env.example .env
    echo "❗ IMPORTANTE: Edita el archivo .env con tus configuraciones"
fi

# Verificar configuración de base de datos
echo "🔍 Verificando configuración..."
node diagnose.js

# Iniciar servidor
echo "🚀 Iniciando servidor..."
npm start
