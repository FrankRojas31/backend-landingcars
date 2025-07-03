import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { config } from '../config/config.js';
import { Contact, QueryParams, DashboardStats } from '../types/index.js';

export class ContactService {
  private db: Pool;

  constructor() {
    this.db = getDB();
  }

  async createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        `INSERT INTO contacts (fullName, email, phone, message, status, priority, source) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          contactData.fullName,
          contactData.email,
          contactData.phone,
          contactData.message,
          contactData.status || 'No Atendido',
          contactData.priority || 'medium',
          contactData.source || 'landing_page'
        ]
      );

      return await this.getContactById(result.insertId);
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw new Error('Error al guardar el contacto');
    }
  }

  async getContactById(id: number): Promise<Contact> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT c.*, u.username as assigned_username 
         FROM contacts c 
         LEFT JOIN users u ON c.assigned_to = u.id 
         WHERE c.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        throw new Error('Contacto no encontrado');
      }

      return rows[0] as Contact;
    } catch (error) {
      console.error('Error al obtener contacto:', error);
      throw error;
    }
  }

  async getAllContacts(params: QueryParams): Promise<{ contacts: Contact[], total: number, totalPages: number }> {
    try {
      const {
        page = 1,
        limit = config.DEFAULT_PAGE_SIZE,
        search,
        status,
        assigned_to,
        priority,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = params;

      const offset = (page - 1) * limit;
      
      // Construir WHERE clause
      const whereConditions: string[] = [];
      const whereValues: any[] = [];

      if (search) {
        whereConditions.push('(c.fullName LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.message LIKE ?)');
        const searchPattern = `%${search}%`;
        whereValues.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (status) {
        whereConditions.push('c.status = ?');
        whereValues.push(status);
      }

      if (assigned_to) {
        whereConditions.push('c.assigned_to = ?');
        whereValues.push(assigned_to);
      }

      if (priority) {
        whereConditions.push('c.priority = ?');
        whereValues.push(priority);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Obtener total de contactos
      const [countRows] = await this.db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM contacts c ${whereClause}`,
        whereValues
      );
      const total = countRows[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Obtener contactos paginados
      const query = `
        SELECT c.*, u.username as assigned_username 
        FROM contacts c 
        LEFT JOIN users u ON c.assigned_to = u.id 
        ${whereClause}
        ORDER BY c.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [rows] = await this.db.execute<RowDataPacket[]>(
        query,
        [...whereValues, limit, offset]
      );

      return {
        contacts: rows as Contact[],
        total,
        totalPages
      };
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      throw new Error('Error al obtener la lista de contactos');
    }
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.status) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.priority) {
        updateFields.push('priority = ?');
        updateValues.push(updates.priority);
      }
      if (updates.notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(updates.notes);
      }
      if (updates.assigned_to !== undefined) {
        updateFields.push('assigned_to = ?');
        updateValues.push(updates.assigned_to);
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      updateValues.push(id);

      const [result] = await this.db.execute<ResultSetHeader>(
        `UPDATE contacts SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        throw new Error('Contacto no encontrado');
      }

      return await this.getContactById(id);
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      throw error;
    }
  }

  async deleteContact(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        'DELETE FROM contacts WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      throw new Error('Error al eliminar el contacto');
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Total de contactos
      const [totalRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM contacts'
      );
      const totalContacts = totalRows[0]?.total || 0;

      // Contactos por estado
      const [statusRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT status, COUNT(*) as count FROM contacts GROUP BY status'
      );
      const contactsByStatus = {
        'No Atendido': 0,
        'En Espera': 0,
        'Atendido': 0,
        'Enviado': 0
      };
      statusRows.forEach(row => {
        contactsByStatus[row.status as keyof typeof contactsByStatus] = row.count;
      });

      // Contactos por prioridad
      const [priorityRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT priority, COUNT(*) as count FROM contacts GROUP BY priority'
      );
      const contactsByPriority = {
        'low': 0,
        'medium': 0,
        'high': 0
      };
      priorityRows.forEach(row => {
        contactsByPriority[row.priority as keyof typeof contactsByPriority] = row.count;
      });

      // Contactos recientes (últimos 5)
      const [recentRows] = await this.db.execute<RowDataPacket[]>(
        `SELECT c.*, u.username as assigned_username 
         FROM contacts c 
         LEFT JOIN users u ON c.assigned_to = u.id 
         ORDER BY c.created_at DESC 
         LIMIT 5`
      );
      const recentContacts = recentRows as Contact[];

      // Estadísticas mensuales (últimos 6 meses)
      const [monthlyRows] = await this.db.execute<RowDataPacket[]>(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           COUNT(*) as count
         FROM contacts 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC`
      );
      const monthlyStats = monthlyRows.map(row => ({
        month: row.month,
        count: row.count
      }));

      return {
        totalContacts,
        contactsByStatus,
        contactsByPriority,
        recentContacts,
        monthlyStats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw new Error('Error al generar estadísticas del dashboard');
    }
  }

  async assignContact(contactId: number, userId: number): Promise<Contact> {
    try {
      return await this.updateContact(contactId, { assigned_to: userId });
    } catch (error) {
      console.error('Error al asignar contacto:', error);
      throw new Error('Error al asignar el contacto');
    }
  }

  async getContactsByUser(userId: number, params: QueryParams): Promise<{ contacts: Contact[], total: number }> {
    try {
      const {
        page = 1,
        limit = config.DEFAULT_PAGE_SIZE,
        status,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = params;

      const offset = (page - 1) * limit;
      
      // Construir WHERE clause
      const whereConditions = ['c.assigned_to = ?'];
      const whereValues = [userId];

      if (status) {
        whereConditions.push('c.status = ?');
        whereValues.push(status);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Obtener total
      const [countRows] = await this.db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM contacts c ${whereClause}`,
        whereValues
      );
      const total = countRows[0]?.total || 0;

      // Obtener contactos
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT c.*, u.username as assigned_username 
         FROM contacts c 
         LEFT JOIN users u ON c.assigned_to = u.id 
         ${whereClause}
         ORDER BY c.${sortBy} ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...whereValues, limit, offset]
      );

      return {
        contacts: rows as Contact[],
        total
      };
    } catch (error) {
      console.error('Error al obtener contactos del usuario:', error);
      throw new Error('Error al obtener contactos asignados');
    }
  }
}
