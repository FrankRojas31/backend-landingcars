export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash?: string;
  role: 'admin' | 'manager' | 'agent';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contact {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: 'No Atendido' | 'En Espera' | 'Atendido' | 'Enviado';
  assigned_to?: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  source?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ContactMessage {
  id?: number;
  contact_id: number;
  user_id?: number;
  message: string;
  message_type: 'incoming' | 'outgoing' | 'note';
  is_read: boolean;
  created_at?: Date;
}

export interface ContactData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  recaptcha: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  message?: string;
}

export interface ForgotPasswordRequest {
  identifier: string; // username o email
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetToken {
  id?: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at?: Date;
}

export interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Contact['status'];
  assigned_to?: number;
  priority?: Contact['priority'];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DashboardStats {
  totalContacts: number;
  contactsByStatus: {
    [key in Contact['status']]: number;
  };
  contactsByPriority: {
    [key in Contact['priority']]: number;
  };
  recentContacts: Contact[];
  monthlyStats: {
    month: string;
    count: number;
  }[];
}

export interface EmailConfig {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  attachments?: any[];
}
