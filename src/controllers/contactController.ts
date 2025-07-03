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

  // Enviar notificaciones a Slack (reemplazando el envío de emails)
  Promise.all([
    slackService.sendContactNotification(contact),
    slackService.sendEmailTemplate(contact, 'welcome'), // Template de email para que Slack lo envíe
    slackService.requestWelcomeEmail(contact) // Solicitud específica de envío de email
  ]).catch(error => {
    console.error('Error en notificaciones Slack:', error);
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
  const { contactService } = getServices();
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
  const { contactService, slackService } = getServices();
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
    ).catch((error: Error) => {
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
  const { contactService } = getServices();
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
  const { contactService, slackService } = getServices();
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
    ).catch((error: Error) => {
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
  const { contactService } = getServices();
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
  const { contactService } = getServices();
  const stats = await contactService.getDashboardStats();
  
  res.status(200).json({
    success: true,
    data: stats
  } as ApiResponse);
});

export const sendFollowUpEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { contactService, emailService } = getServices();
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

// Endpoint para enviar template de email específico a Slack
export const sendEmailTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slackService, contactService } = getServices();
  const { id } = req.params;
  const { emailType } = req.body;

  const contact = await contactService.getContactById(parseInt(id));
  
  if (!contact) {
    res.status(404).json({
      success: false,
      error: 'Contacto no encontrado'
    } as ApiResponse);
    return;
  }

  const validEmailTypes = ['welcome', 'followup', 'quote'];
  if (!validEmailTypes.includes(emailType)) {
    res.status(400).json({
      success: false,
      error: 'Tipo de email inválido. Debe ser: welcome, followup, o quote'
    } as ApiResponse);
    return;
  }

  await slackService.sendEmailTemplate(contact, emailType);

  res.status(200).json({
    success: true,
    message: `Template de email ${emailType} enviado a Slack para el contacto ${contact.fullName}`
  } as ApiResponse);
});

// Endpoint para enviar recordatorio de seguimiento
export const sendFollowUpReminder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slackService, contactService } = getServices();
  const { id } = req.params;
  const { daysSinceContact } = req.body;

  const contact = await contactService.getContactById(parseInt(id));
  
  if (!contact) {
    res.status(404).json({
      success: false,
      error: 'Contacto no encontrado'
    } as ApiResponse);
    return;
  }

  const days = daysSinceContact || Math.floor((Date.now() - new Date(contact.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24));

  await slackService.sendFollowUpReminder(contact, days);

  res.status(200).json({
    success: true,
    message: `Recordatorio de seguimiento enviado a Slack para ${contact.fullName}`
  } as ApiResponse);
});

// Endpoint para solicitar email de bienvenida específico
export const requestWelcomeEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slackService, contactService } = getServices();
  const { id } = req.params;

  const contact = await contactService.getContactById(parseInt(id));
  
  if (!contact) {
    res.status(404).json({
      success: false,
      error: 'Contacto no encontrado'
    } as ApiResponse);
    return;
  }

  await slackService.requestWelcomeEmail(contact);

  res.status(200).json({
    success: true,
    message: `Solicitud de email de bienvenida enviada a Slack para ${contact.fullName}`
  } as ApiResponse);
});
