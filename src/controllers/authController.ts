import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
  LoginRequest, 
  ApiResponse, 
  User, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../types/index.js';

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const credentials: LoginRequest = req.body;
  
  const result = await authService.login(credentials);
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token: result.token,
        user: result.user
      }
    } as ApiResponse);
  } else {
    res.status(401).json({
      success: false,
      error: result.message || 'Credenciales inválidas'
    } as ApiResponse);
  }
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    } as ApiResponse);
    return;
  }

  const authService = new AuthService();
  const user = await authService.getUserById(req.user.id!);
  
  if (!user) {
    res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    data: user
  } as ApiResponse<User>);
});

export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
    ...req.body,
    password_hash: req.body.password // Se hasheará en el servicio
  };

  const newUser = await authService.createUser(userData);
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: newUser
  } as ApiResponse<User>);
});

export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const userId = parseInt(req.params.id);
  const updates = req.body;

  // Si se está actualizando la contraseña, cambiar el nombre del campo
  if (updates.password) {
    updates.password_hash = updates.password;
    delete updates.password;
  }

  const updatedUser = await authService.updateUser(userId, updates);
  
  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: updatedUser
  } as ApiResponse<User>);
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await authService.getAllUsers(page, limit);
  const totalPages = Math.ceil(result.total / limit);
  
  res.status(200).json({
    success: true,
    data: result.users,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages
    }
  } as ApiResponse<User[]>);
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const userId = parseInt(req.params.id);
  const user = await authService.getUserById(userId);
  
  if (!user) {
    res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    data: user
  } as ApiResponse<User>);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const userId = parseInt(req.params.id);
  
  // Verificar que no se esté eliminando a sí mismo
  if (req.user?.id === userId) {
    res.status(400).json({
      success: false,
      error: 'No puedes eliminar tu propio usuario'
    } as ApiResponse);
    return;
  }

  const deleted = await authService.deleteUser(userId);
  
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  } as ApiResponse);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // En una implementación real, aquí podrías invalidar el token en una blacklist
  // Por ahora, solo respondemos exitosamente
  res.status(200).json({
    success: true,
    message: 'Logout exitoso'
  } as ApiResponse);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const { identifier }: ForgotPasswordRequest = req.body;
  
  if (!identifier) {
    res.status(400).json({
      success: false,
      error: 'Se requiere un nombre de usuario o email'
    } as ApiResponse);
    return;
  }

  const result = await authService.forgotPassword({ identifier });
  
  // Siempre devolvemos 200 por seguridad (no revelar si el usuario existe)
  res.status(200).json({
    success: result.success,
    message: result.message
  } as ApiResponse);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const { token, newPassword }: ResetPasswordRequest = req.body;
  
  if (!token || !newPassword) {
    res.status(400).json({
      success: false,
      error: 'Se requiere token y nueva contraseña'
    } as ApiResponse);
    return;
  }

  const result = await authService.resetPassword({ token, newPassword });
  
  if (result.success) {
    res.status(200).json({
      success: true,
      message: result.message
    } as ApiResponse);
  } else {
    res.status(400).json({
      success: false,
      error: result.message
    } as ApiResponse);
  }
});

export const validateResetToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authService = new AuthService();
  const { token } = req.params;
  
  if (!token) {
    res.status(400).json({
      success: false,
      error: 'Se requiere token'
    } as ApiResponse);
    return;
  }

  const result = await authService.validateResetToken(token);
  
  if (result.valid) {
    res.status(200).json({
      success: true,
      message: 'Token válido'
    } as ApiResponse);
  } else {
    res.status(400).json({
      success: false,
      error: result.message
    } as ApiResponse);
  }
});
