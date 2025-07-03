import { WebClient } from '@slack/web-api';
import { config } from '../config/config.js';
import { Contact } from '../types/index.js';

export class SlackService {
  private slack: WebClient;

  constructor() {
    this.slack = new WebClient(config.SLACK_BOT_TOKEN);
  }

  async sendContactNotification(contact: Contact): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando notificación');
        return;
      }

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `🚗 Nuevo contacto en Landing Cars`,
        attachments: [
          {
            color: this.getPriorityColor(contact.priority),
            fields: [
              {
                title: 'Nombre',
                value: contact.fullName,
                short: true
              },
              {
                title: 'Email',
                value: contact.email,
                short: true
              },
              {
                title: 'Teléfono',
                value: contact.phone,
                short: true
              },
              {
                title: 'Estado',
                value: contact.status,
                short: true
              },
              {
                title: 'Prioridad',
                value: this.formatPriority(contact.priority),
                short: true
              },
              {
                title: 'Mensaje',
                value: contact.message.length > 100 ? 
                  contact.message.substring(0, 100) + '...' : 
                  contact.message,
                short: false
              }
            ],
            footer: 'Titan Motors CRM',
            ts: Math.floor(new Date().getTime() / 1000).toString()
          }
        ]
      };

      await this.slack.chat.postMessage(message);
      console.log('✅ Notificación enviada a Slack');
    } catch (error) {
      console.error('❌ Error al enviar notificación a Slack:', error);
      // No lanzar error para no afectar el flujo principal
    }
  }

  async sendStatusUpdate(contact: Contact, oldStatus: string, updatedBy: string): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando notificación');
        return;
      }

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `📋 Actualización de estado - ${contact.fullName}`,
        attachments: [
          {
            color: this.getStatusColor(contact.status),
            fields: [
              {
                title: 'Contacto',
                value: `${contact.fullName} (${contact.email})`,
                short: true
              },
              {
                title: 'Estado anterior',
                value: oldStatus,
                short: true
              },
              {
                title: 'Nuevo estado',
                value: contact.status,
                short: true
              },
              {
                title: 'Actualizado por',
                value: updatedBy,
                short: true
              }
            ],
            footer: 'Titan Motors CRM',
            ts: Math.floor(new Date().getTime() / 1000).toString()
          }
        ]
      };

      await this.slack.chat.postMessage(message);
      console.log('✅ Actualización de estado enviada a Slack');
    } catch (error) {
      console.error('❌ Error al enviar actualización a Slack:', error);
    }
  }

  async sendAssignmentNotification(contact: Contact, assignedToUser: string, assignedBy: string): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando notificación');
        return;
      }

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `👤 Contacto asignado - ${contact.fullName}`,
        attachments: [
          {
            color: '#36a64f',
            fields: [
              {
                title: 'Contacto',
                value: `${contact.fullName} (${contact.email})`,
                short: true
              },
              {
                title: 'Asignado a',
                value: assignedToUser,
                short: true
              },
              {
                title: 'Asignado por',
                value: assignedBy,
                short: true
              },
              {
                title: 'Prioridad',
                value: this.formatPriority(contact.priority),
                short: true
              }
            ],
            footer: 'Titan Motors CRM',
            ts: Math.floor(new Date().getTime() / 1000).toString()
          }
        ]
      };

      await this.slack.chat.postMessage(message);
      console.log('✅ Notificación de asignación enviada a Slack');
    } catch (error) {
      console.error('❌ Error al enviar notificación de asignación a Slack:', error);
    }
  }

  /**
   * Envía un mensaje a Slack solicitando el envío de un correo de bienvenida
   */
  async requestWelcomeEmail(contact: Contact): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando solicitud de email');
        return;
      }

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `📧 *SOLICITUD DE EMAIL DE BIENVENIDA*\n\n👤 **Cliente:** ${contact.fullName}\n📧 **Email:** ${contact.email}\n📱 **Teléfono:** ${contact.phone}\n\n📝 **Mensaje:**\n${contact.message}\n\n🎯 **Acción requerida:** Enviar email de bienvenida al cliente\n📋 **ID Contacto:** ${contact.id}`
      };

      await this.slack.chat.postMessage(message);
      console.log('✅ Solicitud de email de bienvenida enviada a Slack');
    } catch (error) {
      console.error('❌ Error al enviar solicitud de email a Slack:', error);
    }
  }

  /**
   * Envía un mensaje a Slack con template completo de email
   */
  async sendEmailTemplate(contact: Contact, emailType: 'welcome' | 'followup' | 'quote' = 'welcome'): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando template de email');
        return;
      }

      const templates = {
        welcome: {
          subject: '¡Gracias por contactarnos! - Titan Motors',
          body: `Estimado/a ${contact.fullName},\n\n¡Gracias por contactarnos! Hemos recibido tu mensaje y nos comunicaremos contigo en las próximas 24 horas.\n\nTu consulta: "${contact.message}"\n\nNos pondremos en contacto contigo al teléfono ${contact.phone} o por este mismo email.\n\n¡Gracias por confiar en Titan Motors!\n\nSaludos,\nEquipo Titan Motors`
        },
        followup: {
          subject: 'Seguimiento de tu consulta - Titan Motors',
          body: `Estimado/a ${contact.fullName},\n\nEsperamos que te encuentres bien. Nos gustaría hacer un seguimiento de tu consulta sobre vehículos.\n\n¿Hay algo más en lo que podamos ayudarte?\n\nNo dudes en contactarnos al teléfono ${contact.phone} o responder este email.\n\nSaludos cordiales,\nEquipo Titan Motors`
        },
        quote: {
          subject: 'Cotización personalizada - Titan Motors',
          body: `Estimado/a ${contact.fullName},\n\nTe enviamos una cotización personalizada basada en tu consulta.\n\nPor favor revisa los detalles y no dudes en contactarnos si tienes alguna pregunta.\n\nTeléfono: ${contact.phone}\n\nGracias por tu interés en Titan Motors.\n\nSaludos,\nEquipo de Ventas`
        }
      };

      const template = templates[emailType];
      const emailTypeLabel = emailType === 'welcome' ? 'BIENVENIDA' : 
                            emailType === 'followup' ? 'SEGUIMIENTO' : 'COTIZACIÓN';

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `📧 *TEMPLATE DE EMAIL - ${emailTypeLabel}*\n\n` +
              `📧 **Para:** ${contact.fullName} <${contact.email}>\n` +
              `📝 **Asunto:** ${template.subject}\n\n` +
              `📄 **Cuerpo del Email:**\n\`\`\`\n${template.body}\n\`\`\`\n\n` +
              `📋 **Info del Contacto:**\n` +
              `• ID: ${contact.id}\n` +
              `• Teléfono: ${contact.phone}\n` +
              `• Estado: ${contact.status}\n\n` +
              `🎯 **Acción:** Copiar y enviar este email al cliente`
      };

      await this.slack.chat.postMessage(message);
      console.log(`✅ Template de email ${emailType} enviado a Slack`);
    } catch (error) {
      console.error('❌ Error al enviar template de email a Slack:', error);
    }
  }

  /**
   * Envía recordatorio de seguimiento
   */
  async sendFollowUpReminder(contact: Contact, daysSinceContact: number): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando recordatorio');
        return;
      }

      const message = {
        channel: config.SLACK_CHANNEL,
        text: `⏰ *RECORDATORIO DE SEGUIMIENTO*\n\n` +
              `👤 **Cliente:** ${contact.fullName} (${contact.email})\n` +
              `📅 **Días sin contacto:** ${daysSinceContact} días\n` +
              `📱 **Teléfono:** ${contact.phone}\n` +
              `📊 **Estado actual:** ${contact.status}\n\n` +
              `📝 **Mensaje original:**\n${contact.message}\n\n` +
              `🎯 **Acción requerida:** Enviar email de seguimiento o llamar al cliente`
      };

      await this.slack.chat.postMessage(message);
      console.log('✅ Recordatorio de seguimiento enviado a Slack');
    } catch (error) {
      console.error('❌ Error al enviar recordatorio a Slack:', error);
    }
  }

  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return '#ff0000';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#36a64f';
      default:
        return '#808080';
    }
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'No Atendido':
        return '#ff0000';
      case 'En Espera':
        return '#ffaa00';
      case 'Atendido':
        return '#36a64f';
      case 'Enviado':
        return '#0066cc';
      default:
        return '#808080';
    }
  }

  private formatPriority(priority: string): string {
    switch (priority) {
      case 'high':
        return '🔴 Alta';
      case 'medium':
        return '🟡 Media';
      case 'low':
        return '🟢 Baja';
      default:
        return '⚪ Sin definir';
    }
  }
}
