import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
    return;
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expirado'
    });
    return;
  }

  // Error de validación de Joi
  if (err.isJoi) {
    res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: err.details
    });
    return;
  }

  // Error de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        res.status(409).json({
          success: false,
          error: 'El registro ya existe'
        });
        return;
      case 'ER_NO_REFERENCED_ROW_2':
        res.status(400).json({
          success: false,
          error: 'Referencia inválida en la base de datos'
        });
        return;
      case 'ECONNREFUSED':
        res.status(503).json({
          success: false,
          error: 'Error de conexión a la base de datos'
        });
        return;
    }
  }

  // Error por defecto
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.originalUrl}`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
