/**
 * server/routes/auth.routes.js
 * Enrutador de Autenticación, Registro, Google OAuth, Modo Invitado y Sesiones.
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middlewares/validate.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Registro tradicional (Email + Password + Perfil Inicial)
router.post('/register', validateRegister, authController.register);

// 2. Inicio de sesión tradicional (Email + Password)
router.post('/login', validateLogin, authController.login);

// 3. Autenticación con Google Identity Services (Google OAuth 2.0)
router.post('/google', authController.googleAuth);

// 4. Acceso temporal en Modo Invitado (Solo Lectura)
router.post('/guest', authController.guestLogin);

// 5. Conversión / Upgrade de Invitado a cuenta registrada
router.post('/upgrade-guest', authController.upgradeGuest);

// 6. Consultar estado y datos de la sesión activa
router.get('/me', authenticateToken, authController.getSessionUser);

// 7. Cierre de sesión y revocación de cookies/tokens
router.post('/logout', authController.logout);

export default router;
