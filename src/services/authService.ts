import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';
import { getDB } from '../config/database.js';
import { config } from '../config/config.js';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  ForgotPasswordRequest, 
  ForgotPasswordResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse,
  PasswordResetToken 
} from '../types/index.js';
import { EmailService } from './emailService.js';

export class AuthService {
  private db: Pool;
  private emailService: EmailService;

  constructor() {
    this.db = getDB();
    this.emailService = new EmailService();
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

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const { identifier } = request;

      // Buscar usuario por username o email
      const [rows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND is_active = true',
        [identifier, identifier]
      );

      if (rows.length === 0) {
        // Por seguridad, siempre devolvemos el mismo mensaje
        return {
          success: true,
          message: 'Si el usuario existe, se ha enviado un correo con las instrucciones para restablecer la contraseña.'
        };
      }

      const user = rows[0] as User;

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Invalidar tokens anteriores del usuario
      await this.db.execute(
        'UPDATE password_reset_tokens SET used = true WHERE user_id = ? AND used = false',
        [user.id]
      );

      // Crear nuevo token
      await this.db.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, false)',
        [user.id, resetToken, expiresAt]
      );

      // Enviar correo de recuperación
      await this.emailService.sendPasswordResetEmail(user.email, user.username, resetToken);

      return {
        success: true,
        message: 'Si el usuario existe, se ha enviado un correo con las instrucciones para restablecer la contraseña.'
      };
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, intente más tarde.'
      };
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const { token, newPassword } = request;

      // Validar longitud de contraseña
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres.'
        };
      }

      // Buscar token válido
      const [tokenRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT * FROM password_reset_tokens WHERE token = ? AND used = false AND expires_at > NOW()',
        [token]
      );

      if (tokenRows.length === 0) {
        return {
          success: false,
          message: 'Token de recuperación inválido o expirado.'
        };
      }

      const resetTokenData = tokenRows[0] as PasswordResetToken;

      // Verificar que el usuario existe
      const [userRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT id, username, email FROM users WHERE id = ? AND is_active = true',
        [resetTokenData.user_id]
      );

      if (userRows.length === 0) {
        return {
          success: false,
          message: 'Usuario no encontrado o inactivo.'
        };
      }

      const user = userRows[0] as User;

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await this.db.execute(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, user.id]
      );

      // Marcar token como usado
      await this.db.execute(
        'UPDATE password_reset_tokens SET used = true WHERE id = ?',
        [resetTokenData.id]
      );

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, intente más tarde.'
      };
    }
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const [tokenRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT * FROM password_reset_tokens WHERE token = ? AND used = false AND expires_at > NOW()',
        [token]
      );

      if (tokenRows.length === 0) {
        return {
          valid: false,
          message: 'Token de recuperación inválido o expirado.'
        };
      }

      return {
        valid: true
      };
    } catch (error) {
      console.error('Error en validateResetToken:', error);
      return {
        valid: false,
        message: 'Error interno del servidor.'
      };
    }
  }
}
