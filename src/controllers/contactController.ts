import { Request, Response } from 'express';
import axios from 'axios';
import { ContactService } from '../services/contactService.js';
import { SlackService } from '../services/slackService.js';
import { EmailService } from '../services/emailService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { config } from '../config/config.js';
import { ContactData, Contact, ApiResponse, QueryParams, RecaptchaResponse } from '../types/index.js';

// Helper function para crear instancias de servicios
const getServices = () => ({
  contactService: new ContactService(),
  slackService: new SlackService(),
  emailService: new EmailService()
});

// Endpoint público para crear contactos desde la landing page
export const createContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { contactService, slackService, emailService } = getServices();
  const { fullName, email, phone, message, recaptcha }: ContactData = req.body;

  // Verificar reCAPTCHA
  try {
    const { data: recaptchaRes }: { data: RecaptchaResponse } = await axios.post(
      config.RECAPTCHA_URL,
      new URLSearchParams({
        secret: config.RECAPTCHA_SECRET,
        response: recaptcha
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!recaptchaRes.success) {
      res.status(400).json({
        success: false,
        error: 'Error de verificación reCAPTCHA',
        details: recaptchaRes['error-codes']
      } as ApiResponse);
      return;
    }
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar reCAPTCHA'
    } as ApiResponse);
    return;
  }

  // Crear el contacto
  const contact = await contactService.createContact({
    fullName,
    email,
    phone,
    message,
    status: 'No Atendido',
    priority: 'medium',
    source: 'landing_page'
  });

  // Enviar notificaciones en paralelo (sin esperar)
  Promise.all([
    slackService.sendContactNotification(contact),
    emailService.sendWelcomeEmail(contact),
    emailService.sendInternalNotification(contact)
  ]).catch(error => {
    console.error('Error en notificaciones:', error);
  });

  res.status(201).json({
    success: true,
    message: 'Contacto registrado exitosamente. Te contactaremos pronto.',
    data: { id: contact.id }
  } as ApiResponse);
});

// Endpoints protegidos para el dashboard
export const getAllContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { contactService } = getServices();
  const params: QueryParams = req.query as any;
  const result = await contactService.getAllContacts(params);
  
  res.status(200).json({
    success: true,
    data: result.contacts,
    pagination: {
      page: params.page || 1,
      limit: params.limit || config.DEFAULT_PAGE_SIZE,
      total: result.total,
      totalPages: result.totalPages
    }
  } as ApiResponse<Contact[]>);
});

export const getContactById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.id || '0');
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  const contact = await contactService.getContactById(contactId);
  
  res.status(200).json({
    success: true,
    data: contact
  } as ApiResponse<Contact>);
});

export const updateContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.id || '0');
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  // Obtener el contacto actual para comparar cambios
  const currentContact = await contactService.getContactById(contactId);
  const oldStatus = currentContact.status;
  
  const updatedContact = await contactService.updateContact(contactId, req.body);
  
  // Si cambió el estado, enviar notificación a Slack
  if (oldStatus !== updatedContact.status && req.user) {
    slackService.sendStatusUpdate(
      updatedContact, 
      oldStatus, 
      req.user.username
    ).catch(error => {
      console.error('Error enviando notificación de estado:', error);
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contacto actualizado exitosamente',
    data: updatedContact
  } as ApiResponse<Contact>);
});

export const deleteContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.id || '0');
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  const deleted = await contactService.deleteContact(contactId);
  
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'Contacto no encontrado'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Contacto eliminado exitosamente'
  } as ApiResponse);
});

export const assignContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.id || '0');
  const { assigned_to } = req.body;
  
  if (!contactId || !assigned_to) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto y usuario asignado son requeridos'
    } as ApiResponse);
    return;
  }

  const updatedContact = await contactService.assignContact(contactId, assigned_to);
  
  // Enviar notificación de asignación
  if (req.user) {
    slackService.sendAssignmentNotification(
      updatedContact,
      `Usuario ID: ${assigned_to}`, // En un caso real, obtendrías el nombre del usuario
      req.user.username
    ).catch(error => {
      console.error('Error enviando notificación de asignación:', error);
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contacto asignado exitosamente',
    data: updatedContact
  } as ApiResponse<Contact>);
});

export const getMyContacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    } as ApiResponse);
    return;
  }

  const params: QueryParams = req.query as any;
  const result = await contactService.getContactsByUser(req.user.id, params);
  
  res.status(200).json({
    success: true,
    data: result.contacts,
    pagination: {
      page: params.page || 1,
      limit: params.limit || config.DEFAULT_PAGE_SIZE,
      total: result.total,
      totalPages: Math.ceil(result.total / (params.limit || config.DEFAULT_PAGE_SIZE))
    }
  } as ApiResponse<Contact[]>);
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await contactService.getDashboardStats();
  
  res.status(200).json({
    success: true,
    data: stats
  } as ApiResponse);
});

export const sendFollowUpEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.id || '0');
  const { customMessage } = req.body;
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  const contact = await contactService.getContactById(contactId);
  await emailService.sendFollowUpEmail(contact, customMessage);

  // Actualizar estado del contacto a "Enviado"
  await contactService.updateContact(contactId, { status: 'Enviado' });

  res.status(200).json({
    success: true,
    message: 'Email de seguimiento enviado exitosamente'
  } as ApiResponse);
});
