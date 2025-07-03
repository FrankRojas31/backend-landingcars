import { Router } from 'express';
import {
  login,
  getCurrentUser,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  logout,
  forgotPassword,
  resetPassword,
  validateResetToken
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateLogin, validateUser } from '../middleware/validation.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario o email
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @swagger
 * /api/auth/users:
 *   post:
 *     summary: Crear nuevo usuario (solo administradores)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [admin, manager, agent]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post('/users', authenticateToken, requireAdmin, validateUser, createUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', authenticateToken, requireManagerOrAdmin, getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Información del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/users/:id', authenticateToken, requireManagerOrAdmin, getUserById);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, agent]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 */
router.put('/users/:id', authenticateToken, requireManagerOrAdmin, updateUser);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo administradores)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Nombre de usuario o email
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado (si el usuario existe)
 *       400:
 *         description: Datos inválidos
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o datos incorrectos
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/validate-reset-token/{token}:
 *   get:
 *     summary: Validar token de recuperación
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/validate-reset-token/:token', validateResetToken);

export default router;
