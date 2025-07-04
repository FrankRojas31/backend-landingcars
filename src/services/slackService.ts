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

  async sendPasswordResetNotification(username: string, email: string, resetToken: string): Promise<void> {
    try {
      if (!config.SLACK_BOT_TOKEN) {
        console.warn('Slack token no configurado, saltando notificacion de recuperacion');
        return;
      }

      const resetUrl = config.FRONTEND_URL + '/reset-password?token=' + resetToken;
      
      const message = {
        channel: config.SLACK_CHANNEL,
        text: ':lock: Solicitud de Recuperacion de Contraseña',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🔐 Recuperacion de Contraseña - CRM Landing Cars*\n\n*Usuario:* ${username}\n*Email:* ${email}\n*Fecha:* ${new Date().toLocaleString('es-MX')}\n*Expira:* 1 hora`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Restablecer Contraseña'
                },
                url: resetUrl,
                style: 'primary' as const
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:warning: *Informacion de Seguridad*\n• Este enlace expira en 1 hora\n• Solo puede usarse una vez\n• Token: \`${resetToken}\``
            }
          }
        ]
      };

      const result = await this.slack.chat.postMessage(message);
      
      if (result.ok) {
        console.log('Notificacion de recuperacion enviada a Slack para ' + username);
      } else {
        console.error('Error al enviar notificacion a Slack:', result.error);
        throw new Error('Error de Slack: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error al enviar notificacion de recuperacion a Slack:', error);
      throw new Error('Error al enviar notificacion de recuperacion de contraseña');
    }
  }
}
