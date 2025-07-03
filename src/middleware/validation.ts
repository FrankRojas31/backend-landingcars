import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateContact = (req: Request, res: Response, next: NextFunction): void => {
  const contactSchema = Joi.object({
    fullName: Joi.string().min(3).max(255).required()
      .messages({
        'string.min': 'El nombre completo debe tener al menos 3 caracteres',
        'string.max': 'El nombre completo no puede exceder 255 caracteres',
        'any.required': 'El nombre completo es requerido'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'any.required': 'El email es requerido'
      }),
    phone: Joi.string().pattern(/^\d{10}$/).required()
      .messages({
        'string.pattern.base': 'El teléfono debe tener exactamente 10 dígitos',
        'any.required': 'El teléfono es requerido'
      }),
    message: Joi.string().min(10).max(1000).required()
      .messages({
        'string.min': 'El mensaje debe tener al menos 10 caracteres',
        'string.max': 'El mensaje no puede exceder 1000 caracteres',
        'any.required': 'El mensaje es requerido'
      }),
    recaptcha: Joi.string().required()
      .messages({
        'any.required': 'La verificación reCAPTCHA es requerida'
      })
  });

  const { error } = contactSchema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Datos inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

export const validateContactUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const updateSchema = Joi.object({
    status: Joi.string().valid('No Atendido', 'En Espera', 'Atendido', 'Enviado'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    notes: Joi.string().max(1000),
    assigned_to: Joi.number().integer().min(1).allow(null)
  }).min(1);

  const { error } = updateSchema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Datos de actualización inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const loginSchema = Joi.object({
    username: Joi.string().required()
      .messages({
        'any.required': 'El nombre de usuario es requerido'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida'
      })
  });

  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Datos de login inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const userSchema = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'manager', 'agent').default('agent'),
    is_active: Joi.boolean().default(true)
  });

  const { error } = userSchema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Datos de usuario inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

export const validateMessage = (req: Request, res: Response, next: NextFunction): void => {
  const messageSchema = Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    message_type: Joi.string().valid('incoming', 'outgoing', 'note').default('note')
  });

  const { error } = messageSchema.validate(req.body);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Datos de mensaje inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

export const validateQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255),
    status: Joi.string().valid('No Atendido', 'En Espera', 'Atendido', 'Enviado'),
    assigned_to: Joi.number().integer().min(1),
    priority: Joi.string().valid('low', 'medium', 'high'),
    sortBy: Joi.string().valid('id', 'fullName', 'email', 'created_at', 'updated_at', 'status', 'priority').default('created_at'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  });

  const { error, value } = querySchema.validate(req.query);
  if (error) {
    res.status(400).json({ 
      success: false,
      error: 'Parámetros de consulta inválidos', 
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  // Sobrescribir query params con valores validados
  req.query = value;
  next();
};
