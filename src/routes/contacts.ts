import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  assignContact,
  getMyContacts,
  getDashboardStats,
  sendFollowUpEmail
} from '../controllers/contactController.js';
import { authenticateToken, requireManagerOrAdmin, requireAnyRole } from '../middleware/auth.js';
import { validateContact, validateContactUpdate, validateQueryParams } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phone
 *         - message
 *         - recaptcha
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           pattern: '^\\d{10}$'
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *         recaptcha:
 *           type: string
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Crear nuevo contacto desde landing page (público)
 *     tags: [Public]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Datos inválidos o error de reCAPTCHA
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateContact, createContact);

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Obtener todos los contactos (protegido)
 *     tags: [Contacts]
 *     parameters:
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
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre, email, teléfono o mensaje
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [No Atendido, En Espera, Atendido, Enviado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario asignado
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, fullName, email, created_at, updated_at, status, priority]
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de contactos
 */
router.get('/', authenticateToken, requireAnyRole, validateQueryParams, getAllContacts);

/**
 * @swagger
 * /api/contacts/my:
 *   get:
 *     summary: Obtener contactos asignados al usuario actual
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [No Atendido, En Espera, Atendido, Enviado]
 *     responses:
 *       200:
 *         description: Lista de contactos asignados
 */
router.get('/my', authenticateToken, requireAnyRole, validateQueryParams, getMyContacts);

/**
 * @swagger
 * /api/contacts/stats:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 */
router.get('/stats', authenticateToken, requireAnyRole, getDashboardStats);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Obtener contacto por ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Información del contacto
 *       404:
 *         description: Contacto no encontrado
 */
router.get('/:id', authenticateToken, requireAnyRole, getContactById);

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Actualizar contacto
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [No Atendido, En Espera, Atendido, Enviado]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               assigned_to:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 */
router.put('/:id', authenticateToken, requireAnyRole, validateContactUpdate, updateContact);

/**
 * @swagger
 * /api/contacts/{id}/assign:
 *   put:
 *     summary: Asignar contacto a un usuario
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - assigned_to
 *             properties:
 *               assigned_to:
 *                 type: integer
 *                 description: ID del usuario al que se asigna
 *     responses:
 *       200:
 *         description: Contacto asignado exitosamente
 */
router.put('/:id/assign', authenticateToken, requireManagerOrAdmin, assignContact);

/**
 * @swagger
 * /api/contacts/{id}/follow-up:
 *   post:
 *     summary: Enviar email de seguimiento al contacto
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customMessage:
 *                 type: string
 *                 description: Mensaje personalizado opcional
 *     responses:
 *       200:
 *         description: Email enviado exitosamente
 */
router.post('/:id/follow-up', authenticateToken, requireAnyRole, sendFollowUpEmail);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Eliminar contacto (solo managers y admins)
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contacto
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 *       404:
 *         description: Contacto no encontrado
 */
router.delete('/:id', authenticateToken, requireManagerOrAdmin, deleteContact);

export default router;
