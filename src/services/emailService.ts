import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import { Contact, EmailConfig } from '../types/index.js';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(contact: Contact): Promise<void> {
    try {
      if (!config.EMAIL_USER || !config.EMAIL_PASS) {
        console.warn('Configuración de email no disponible, saltando envío');
        return;
      }

      const emailConfig: EmailConfig = {
        to: contact.email,
        subject: '¡Gracias por contactarnos! - Titan Motors',
        html: this.generateWelcomeEmailHTML(contact)
      };

      await this.sendEmail(emailConfig);
      console.log(`✅ Email de bienvenida enviado a ${contact.email}`);
    } catch (error) {
      console.error('❌ Error al enviar email de bienvenida:', error);
      throw new Error('Error al enviar email de confirmación');
    }
  }

  async sendFollowUpEmail(contact: Contact, customMessage?: string): Promise<void> {
    try {
      if (!config.EMAIL_USER || !config.EMAIL_PASS) {
        console.warn('Configuración de email no disponible, saltando envío');
        return;
      }

      const emailConfig: EmailConfig = {
        to: contact.email,
        subject: 'Seguimiento de su consulta - Titan Motors',
        html: this.generateFollowUpEmailHTML(contact, customMessage)
      };

      await this.sendEmail(emailConfig);
      console.log(`✅ Email de seguimiento enviado a ${contact.email}`);
    } catch (error) {
      console.error('❌ Error al enviar email de seguimiento:', error);
      throw new Error('Error al enviar email de seguimiento');
    }
  }

  async sendInternalNotification(contact: Contact, assignedUser?: string): Promise<void> {
    try {
      if (!config.EMAIL_USER || !config.EMAIL_PASS) {
        console.warn('Configuración de email no disponible, saltando notificación');
        return;
      }

      const emailConfig: EmailConfig = {
        to: config.EMAIL_USER, // Email interno del equipo
        subject: `Nuevo contacto: ${contact.fullName} - Titan Motors CRM`,
        html: this.generateInternalNotificationHTML(contact, assignedUser)
      };

      await this.sendEmail(emailConfig);
      console.log('✅ Notificación interna enviada');
    } catch (error) {
      console.error('❌ Error al enviar notificación interna:', error);
      // No lanzar error para no afectar el flujo principal
    }
  }

  private async sendEmail(emailConfig: EmailConfig): Promise<void> {
    const mailOptions = {
      from: `"Titan Motors" <${config.EMAIL_FROM}>`,
      to: emailConfig.to,
      subject: emailConfig.subject,
      text: emailConfig.text,
      html: emailConfig.html
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generateWelcomeEmailHTML(contact: Contact): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Titan Motors</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 TITAN MOTORS</h1>
                <p>Gracias por contactarnos</p>
            </div>
            <div class="content">
                <h2>¡Hola ${contact.fullName}!</h2>
                <p>Hemos recibido tu consulta y nuestro equipo se pondrá en contacto contigo pronto.</p>
                
                <div class="highlight">
                    <h3>📋 Resumen de tu consulta:</h3>
                    <p><strong>Mensaje:</strong> ${contact.message}</p>
                    <p><strong>Teléfono:</strong> ${contact.phone}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                </div>

                <p>Mientras tanto, puedes:</p>
                <ul>
                    <li>Visitar nuestro catálogo completo en nuestro sitio web</li>
                    <li>Seguirnos en redes sociales para las últimas novedades</li>
                    <li>Llamarnos directamente al <strong>(+52) 55 1234 5678</strong></li>
                </ul>

                <p>¡Gracias por elegir Titan Motors!</p>
                
                <div class="footer">
                    <p>Este email fue enviado automáticamente. Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>© 2025 Titan Motors. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateFollowUpEmailHTML(contact: Contact, customMessage?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seguimiento - Titan Motors</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 TITAN MOTORS</h1>
                <p>Seguimiento de tu consulta</p>
            </div>
            <div class="content">
                <h2>¡Hola ${contact.fullName}!</h2>
                <p>Queremos darte seguimiento a tu consulta realizada recientemente.</p>
                
                ${customMessage ? `
                <div class="highlight">
                    <h3>💬 Mensaje de nuestro equipo:</h3>
                    <p>${customMessage}</p>
                </div>
                ` : ''}

                <p>Nuestro equipo está trabajando en brindarte la mejor atención y información sobre nuestros vehículos.</p>
                
                <p>Si tienes alguna pregunta adicional o necesitas información inmediata, no dudes en contactarnos:</p>
                <ul>
                    <li><strong>Teléfono:</strong> (+52) 55 1234 5678</li>
                    <li><strong>Email:</strong> info@titanmotors.com</li>
                    <li><strong>WhatsApp:</strong> (+52) 55 9876 5432</li>
                </ul>

                <p>¡Gracias por tu interés en Titan Motors!</p>
                
                <div class="footer">
                    <p>© 2025 Titan Motors. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateInternalNotificationHTML(contact: Contact, assignedUser?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Nuevo Contacto - CRM Titan Motors</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b35; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #ff6b35; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; }
            .status.no-atendido { background: #f44336; }
            .status.en-espera { background: #ff9800; }
            .status.atendido { background: #4caf50; }
            .status.enviado { background: #2196f3; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 NUEVO CONTACTO - CRM</h1>
                <p>Se ha registrado un nuevo contacto en el sistema</p>
            </div>
            <div class="content">
                <div class="info-box">
                    <h3>📋 Información del Contacto</h3>
                    <p><strong>Nombre:</strong> ${contact.fullName}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                    <p><strong>Teléfono:</strong> ${contact.phone}</p>
                    <p><strong>Estado:</strong> <span class="status ${contact.status.toLowerCase().replace(' ', '-')}">${contact.status}</span></p>
                    <p><strong>Prioridad:</strong> ${contact.priority}</p>
                    ${assignedUser ? `<p><strong>Asignado a:</strong> ${assignedUser}</p>` : ''}
                </div>

                <div class="info-box">
                    <h3>💬 Mensaje</h3>
                    <p>${contact.message}</p>
                </div>

                <div class="info-box">
                    <h3>🕒 Información Adicional</h3>
                    <p><strong>Fecha de contacto:</strong> ${new Date().toLocaleString('es-MX')}</p>
                    <p><strong>Fuente:</strong> ${contact.source || 'Landing Page'}</p>
                </div>

                <p><em>Accede al CRM para gestionar este contacto y darle seguimiento.</em></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
