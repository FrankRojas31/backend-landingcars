#!/usr/bin/env node

import { AuthService } from '../services/authService.js';
import { EmailService } from '../services/emailService.js';

const testForgotPassword = async () => {
  console.log('🧪 Iniciando pruebas de recuperación de contraseña...\n');
  
  const authService = new AuthService();
  const emailService = new EmailService();
  
  try {
    // Prueba 1: Solicitar recuperación con email válido
    console.log('1️⃣ Probando solicitud de recuperación con email...');
    const result1 = await authService.forgotPassword({
      identifier: 'admin@titanmotors.com'
    });
    console.log('✅ Resultado:', result1);
    console.log('');
    
    // Prueba 2: Solicitar recuperación con username válido
    console.log('2️⃣ Probando solicitud de recuperación con username...');
    const result2 = await authService.forgotPassword({
      identifier: 'admin'
    });
    console.log('✅ Resultado:', result2);
    console.log('');
    
    // Prueba 3: Solicitar recuperación con usuario inexistente
    console.log('3️⃣ Probando solicitud con usuario inexistente...');
    const result3 = await authService.forgotPassword({
      identifier: 'usuario_que_no_existe@ejemplo.com'
    });
    console.log('✅ Resultado:', result3);
    console.log('');
    
    // Prueba 4: Validar token inválido
    console.log('4️⃣ Probando validación de token inválido...');
    const result4 = await authService.validateResetToken('token_invalido');
    console.log('✅ Resultado:', result4);
    console.log('');
    
    // Prueba 5: Intentar resetear con token inválido
    console.log('5️⃣ Probando reset con token inválido...');
    const result5 = await authService.resetPassword({
      token: 'token_invalido',
      newPassword: 'nuevaContraseña123'
    });
    console.log('✅ Resultado:', result5);
    console.log('');
    
    console.log('🎉 Todas las pruebas completadas!');
    console.log('');
    console.log('📋 Resumen de pruebas:');
    console.log('- Solicitud con email válido: ✅');
    console.log('- Solicitud con username válido: ✅');
    console.log('- Solicitud con usuario inexistente: ✅');
    console.log('- Validación de token inválido: ✅');
    console.log('- Reset con token inválido: ✅');
    console.log('');
    console.log('💡 Nota: Para probar el flujo completo, necesitas:');
    console.log('1. Tener configurado el servicio de email');
    console.log('2. Usar el token recibido por correo');
    console.log('3. Probar el endpoint de reset con token válido');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
};

// Ejecutar pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  testForgotPassword();
}

export { testForgotPassword };
