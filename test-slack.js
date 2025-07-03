#!/usr/bin/env node

/**
 * Script para probar la configuración de Slack
 */

import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#general';

console.log('🧪 Probando configuración de Slack...\n');

if (!SLACK_BOT_TOKEN) {
    console.log('❌ SLACK_BOT_TOKEN no configurado');
    console.log('📋 Configura tu token en el archivo .env');
    process.exit(1);
}

console.log('✅ Token configurado');
console.log('📋 Canal:', SLACK_CHANNEL);
console.log('🔑 Token:', SLACK_BOT_TOKEN.substring(0, 20) + '...');

const slack = new WebClient(SLACK_BOT_TOKEN);

try {
    // Probar conexión
    const authTest = await slack.auth.test();
    console.log('✅ Conexión exitosa a Slack');
    console.log('👤 Bot:', authTest.user);
    console.log('🏢 Workspace:', authTest.team);
    
    // Enviar mensaje de prueba
    const message = {
        channel: SLACK_CHANNEL,
        text: `🧪 *PRUEBA DE CONFIGURACIÓN*\n\n✅ Bot de Titan Motors CRM funcionando correctamente\n📅 ${new Date().toLocaleString()}\n\n🎯 Sistema listo para recibir notificaciones de contactos`
    };
    
    const result = await slack.chat.postMessage(message);
    
    if (result.ok) {
        console.log('✅ Mensaje de prueba enviado exitosamente');
        console.log('🎉 ¡Configuración de Slack completada!');
    } else {
        console.log('❌ Error al enviar mensaje:', result.error);
    }
    
} catch (error) {
    console.log('❌ Error al conectar con Slack:');
    console.log('   Error:', error.message);
    
    if (error.message.includes('invalid_auth')) {
        console.log('💡 El token parece ser inválido. Verifica que sea correcto.');
    } else if (error.message.includes('channel_not_found')) {
        console.log('💡 El canal no existe o el bot no tiene acceso.');
        console.log('   Invita el bot al canal:', `/invite @tu-bot`);
    }
}

console.log('\n📋 Configuración completa en: SLACK_EMAIL_CONFIG.md');
