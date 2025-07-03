import { Request, Response } from 'express';
import { MessageService } from '../services/messageService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ContactMessage, ApiResponse } from '../types/index.js';
import { config } from '../config/config.js';

const messageService = new MessageService();

export const createMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.contactId || '0');
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  const messageData = {
    contact_id: contactId,
    user_id: req.user?.id,
    message: req.body.message,
    message_type: req.body.message_type || 'note',
    is_read: false
  };

  const newMessage = await messageService.createMessage(messageData);
  
  res.status(201).json({
    success: true,
    message: 'Mensaje creado exitosamente',
    data: newMessage
  } as ApiResponse<ContactMessage>);
});

export const getMessagesByContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.contactId || '0');
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  const result = await messageService.getMessagesByContact(contactId, page, limit);
  
  res.status(200).json({
    success: true,
    data: result.messages,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  } as ApiResponse<ContactMessage[]>);
});

export const updateMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const messageId = parseInt(req.params.id || '0');
  
  if (!messageId) {
    res.status(400).json({
      success: false,
      error: 'ID de mensaje inválido'
    } as ApiResponse);
    return;
  }

  const updatedMessage = await messageService.updateMessage(messageId, req.body);
  
  res.status(200).json({
    success: true,
    message: 'Mensaje actualizado exitosamente',
    data: updatedMessage
  } as ApiResponse<ContactMessage>);
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const messageId = parseInt(req.params.id || '0');
  
  if (!messageId) {
    res.status(400).json({
      success: false,
      error: 'ID de mensaje inválido'
    } as ApiResponse);
    return;
  }

  const deleted = await messageService.deleteMessage(messageId);
  
  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'Mensaje no encontrado'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Mensaje eliminado exitosamente'
  } as ApiResponse);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const contactId = parseInt(req.params.contactId || '0');
  
  if (!contactId) {
    res.status(400).json({
      success: false,
      error: 'ID de contacto inválido'
    } as ApiResponse);
    return;
  }

  await messageService.markAsRead(contactId, req.user?.id);
  
  res.status(200).json({
    success: true,
    message: 'Mensajes marcados como leídos'
  } as ApiResponse);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const count = await messageService.getUnreadCount(req.user?.id);
  
  res.status(200).json({
    success: true,
    data: { unreadCount: count }
  } as ApiResponse);
});
