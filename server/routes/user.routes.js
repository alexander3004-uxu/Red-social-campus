/**
 * server/routes/user.routes.js
 * Enrutador para Gestión de Perfiles, Carga de Archivos Multimedia y Cambio de Credenciales.
 */

import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticateToken, optionalAuthenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/guestMiddleware.js';
import { validateProfileUpdate, validatePasswordChange } from '../middlewares/validate.js';
import { uploadAvatar, handleUploadErrors } from '../middlewares/uploadMiddleware.js';

const router = Router();

// 1. Obtener perfil propio (accesible para estudiantes e invitados)
router.get('/profile', authenticateToken, profileController.getMyProfile);

// 2. Actualizar datos personales y académicos (exclusivo estudiantes/profesores/admins)
router.patch(
  '/profile',
  authenticateToken,
  requireRole('student', 'professor', 'admin'),
  validateProfileUpdate,
  profileController.updateProfile
);

// 3. Subir y actualizar foto de perfil / avatar con Multer
router.post(
  '/avatar',
  authenticateToken,
  requireRole('student', 'professor', 'admin'),
  uploadAvatar.single('avatar'),
  handleUploadErrors,
  profileController.uploadAvatarImage
);

// 4. Cambio seguro de contraseña
router.post(
  '/change-password',
  authenticateToken,
  requireRole('student', 'professor', 'admin'),
  validatePasswordChange,
  profileController.changePassword
);

// 5. Consultar perfil público por @username (accesible para invitados y estudiantes)
router.get('/:username', optionalAuthenticate, profileController.getPublicProfile);

export default router;
