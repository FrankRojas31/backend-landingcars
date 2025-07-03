import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { ContactMessage } from '../types/index.js';

export class MessageService {
  private db: Pool;

  constructor() {
    this.db = getDB();
  }

  async createMessage(messageData: Omit<ContactMessage, 'id' | 'created_at'>): Promise<ContactMessage> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        `INSERT INTO contact_messages (contact_id, user_id, message, message_type, is_read) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          messageData.contact_id,
          messageData.user_id || null,
          messageData.message,
          messageData.message_type || 'note',
          messageData.is_read || false
        ]
      );

      return await this.getMessageById(result.insertId);
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      throw new Error('Error al guardar el mensaje');
    }
  }

  async getMessageById(id: number): Promise<ContactMessage> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT cm.*, u.username, c.fullName as contact_name
         FROM contact_messages cm
         LEFT JOIN users u ON cm.user_id = u.id
         LEFT JOIN contacts c ON cm.contact_id = c.id
         WHERE cm.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error('Mensaje no encontrado');
      }

      return rows[0] as ContactMessage;
    } catch (error) {
      console.error('Error al obtener mensaje:', error);
      throw error;
    }
  }

  async getMessagesByContact(
    contactId: number, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ messages: ContactMessage[], total: number }> {
    try {
      const offset = (page - 1) * limit;

      // Obtener total de mensajes
      const [countRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM contact_messages WHERE contact_id = ?',
        [contactId]
      );
      const total = countRows[0]?.total || 0;

      // Obtener mensajes paginados
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT cm.*, u.username, c.fullName as contact_name
         FROM contact_messages cm
         LEFT JOIN users u ON cm.user_id = u.id
         LEFT JOIN contacts c ON cm.contact_id = c.id
         WHERE cm.contact_id = ?
         ORDER BY cm.created_at ASC
         LIMIT ? OFFSET ?`,
        [contactId, limit, offset]
      );

      return {
        messages: rows as ContactMessage[],
        total
      };
    } catch (error) {
      console.error('Error al obtener mensajes del contacto:', error);
      throw new Error('Error al obtener mensajes');
    }
  }

  async updateMessage(id: number, updates: Partial<ContactMessage>): Promise<ContactMessage> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.message) {
        updateFields.push('message = ?');
        updateValues.push(updates.message);
      }
      if (typeof updates.is_read === 'boolean') {
        updateFields.push('is_read = ?');
        updateValues.push(updates.is_read);
      }
      if (updates.message_type) {
        updateFields.push('message_type = ?');
        updateValues.push(updates.message_type);
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      updateValues.push(id);

      const [result] = await this.db.execute<ResultSetHeader>(
        `UPDATE contact_messages SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        throw new Error('Mensaje no encontrado');
      }

      return await this.getMessageById(id);
    } catch (error) {
      console.error('Error al actualizar mensaje:', error);
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        'DELETE FROM contact_messages WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      throw new Error('Error al eliminar el mensaje');
    }
  }

  async markAsRead(contactId: number, userId?: number): Promise<void> {
    try {
      let query = 'UPDATE contact_messages SET is_read = true WHERE contact_id = ?';
      const params: any[] = [contactId];

      if (userId) {
        query += ' AND user_id != ?';
        params.push(userId);
      }

      await this.db.execute(query, params);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      throw new Error('Error al marcar mensajes como leídos');
    }
  }

  async getUnreadCount(userId?: number): Promise<number> {
    try {
      let query = 'SELECT COUNT(*) as total FROM contact_messages WHERE is_read = false';
      const params: any[] = [];

      if (userId) {
        query += ' AND user_id != ?';
        params.push(userId);
      }

      const [rows] = await this.db.execute<RowDataPacket[]>(query, params);
      return rows[0]?.total || 0;
    } catch (error) {
      console.error('Error al obtener mensajes no leídos:', error);
      return 0;
    }
  }
}
