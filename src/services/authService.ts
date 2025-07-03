import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDB } from '../config/database.js';
import { config } from '../config/config.js';
import { User, LoginRequest, LoginResponse } from '../types/index.js';

export class AuthService {
  private db: Pool;

  constructor() {
    this.db = getDB();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;

      // Buscar usuario por username o email
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = true',
        [username, username]
      );

      console.log('Rows found:', rows.length);

      if (rows.length === 0) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      const user = rows[0] as User;

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash!);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Generar JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
      );

      // Excluir password_hash del usuario retornado
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Error interno en el servicio de autenticación');
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password_hash!, saltRounds);

      const [result] = await this.db.execute<ResultSetHeader>(
        'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [userData.username, userData.email, hashedPassword, userData.role, userData.is_active]
      );

      // Obtener el usuario creado
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [result.insertId]
      );

      return rows[0] as User;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El nombre de usuario o email ya existe');
      }
      console.error('Error al crear usuario:', error);
      throw new Error('Error al crear el usuario');
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.username) {
        updateFields.push('username = ?');
        updateValues.push(updates.username);
      }
      if (updates.email) {
        updateFields.push('email = ?');
        updateValues.push(updates.email);
      }
      if (updates.password_hash) {
        const hashedPassword = await bcrypt.hash(updates.password_hash, 10);
        updateFields.push('password_hash = ?');
        updateValues.push(hashedPassword);
      }
      if (updates.role) {
        updateFields.push('role = ?');
        updateValues.push(updates.role);
      }
      if (typeof updates.is_active === 'boolean') {
        updateFields.push('is_active = ?');
        updateValues.push(updates.is_active);
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      updateValues.push(id);

      await this.db.execute(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      // Obtener el usuario actualizado
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      return rows[0] as User;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new Error('Error al obtener el usuario');
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    try {
      const offset = (page - 1) * limit;

      // Obtener total de usuarios
      const [countRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users'
      );
      const total = countRows[0].total;

      // Obtener usuarios paginados
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      return {
        users: rows as User[],
        total
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error al obtener la lista de usuarios');
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error('Error al eliminar el usuario');
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      return await this.getUserById(decoded.id);
    } catch (error) {
      return null;
    }
  }
}
