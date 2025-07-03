import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config.js';
import { User } from '../types/index.js';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash'>;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Token de acceso requerido' 
    });
    return;
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ 
        success: false, 
        error: 'Token inválido o expirado' 
      });
      return;
    }

    req.user = decoded as Omit<User, 'password_hash'>;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Permisos insuficientes para esta acción' 
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireManagerOrAdmin = requireRole(['admin', 'manager']);
export const requireAnyRole = requireRole(['admin', 'manager', 'agent']);
