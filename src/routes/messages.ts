import { Router } from 'express';
import {
  createMessage,
  getMessagesByContact,
  updateMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount
} from '../controllers/messageController.js';
import { authenticateToken, requireAnyRole } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Obtener cantidad de mensajes no leídos
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Cantidad de mensajes no leídos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 */
router.get('/unread-count', authenticateToken, requireAnyRole, getUnreadCount);

/**
 * @swagger
 * /api/messages/contact/{contactId}:
 *   get:
 *     summary: Obtener mensajes de un contacto específico
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de mensajes por página
 *     responses:
 *       200:
 *         description: Lista de mensajes del contacto
 */
router.get('/contact/:contactId', authenticateToken, requireAnyRole, getMessagesByContact);

/**
 * @swagger
 * /api/messages/contact/{contactId}:
 *   post:
 *     summary: Crear nuevo mensaje para un contacto
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Contenido del mensaje
 *               message_type:
 *                 type: string
 *                 enum: [incoming, outgoing, note]
 *                 default: note
 *                 description: Tipo de mensaje
 *     responses:
 *       201:
 *         description: Mensaje creado exitosamente
 */
router.post('/contact/:contactId', authenticateToken, requireAnyRole, validateMessage, createMessage);

/**
 * @swagger
 * /api/messages/contact/{contactId}/mark-read:
 *   post:
 *     summary: Marcar todos los mensajes de un contacto como leídos
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 */
router.post('/contact/:contactId/mark-read', authenticateToken, requireAnyRole, markAsRead);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: Actualizar un mensaje específico
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               is_read:
 *                 type: boolean
 *               message_type:
 *                 type: string
 *                 enum: [incoming, outgoing, note]
 *     responses:
 *       200:
 *         description: Mensaje actualizado exitosamente
 *       404:
 *         description: Mensaje no encontrado
 */
router.put('/:id', authenticateToken, requireAnyRole, validateMessage, updateMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Eliminar un mensaje específico
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mensaje
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete('/:id', authenticateToken, requireAnyRole, deleteMessage);

export default router;
