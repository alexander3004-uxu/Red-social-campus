/**
 * server/controllers/profile.controller.js
 * Controlador de Perfil y Edición de Cuenta Universitaria:
 * - Consulta de perfil propio y público
 * - Actualización de datos personales y académicos
 * - Carga y procesamiento de foto de perfil con Multer
 * - Cambio seguro de contraseña con validación criptográfica
 */

import bcrypt from 'bcryptjs';
import { db } from '../db.js';

/**
 * 1. OBTENER PERFIL PROPIO (GET /api/users/profile)
 */
export async function getMyProfile(req, res) {
  try {
    if (req.user.isGuest) {
      return res.status(200).json({
        success: true,
        isGuest: true,
        profile: {
          username: 'invitado',
          full_name: 'Invitado del Campus',
          bio: 'Estás navegando en Modo Invitado.',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          university: 'Modo Invitado',
          faculty: 'Solo Lectura',
          career: 'Visitante',
          semester: 'Temporal',
          student_id: 'GUEST-001',
          reputation: 0,
        },
      });
    }

    const profile = await db.findProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        code: 'PROFILE_NOT_FOUND',
        message: 'No se encontró el perfil del usuario autenticado.',
      });
    }

    const user = await db.findUserById(req.user.id);

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        email: user?.email,
        is_verified: user?.is_verified,
        role: user?.role,
      },
    });
  } catch (error) {
    console.error('[Profile Controller] Error en getMyProfile:', error);
    return res.status(500).json({
      success: false,
      code: 'PROFILE_FETCH_ERROR',
      message: 'Fallo al obtener información del perfil.',
    });
  }
}

/**
 * 2. OBTENER PERFIL PÚBLICO POR @USERNAME (GET /api/users/:username)
 * Accesible tanto para estudiantes como para usuarios en modo invitado
 */
export async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;
    const profile = await db.findProfileByUsername(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: `No se encontró ningún estudiante con el nombre de usuario @${username}.`,
      });
    }

    // Datos públicos seguros (sin hash ni datos confidenciales)
    return res.status(200).json({
      success: true,
      profile: {
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        banner_url: profile.banner_url,
        university: profile.university,
        faculty: profile.faculty,
        career: profile.career,
        semester: profile.semester,
        student_id: profile.student_id,
        reputation: profile.reputation,
        social_links: profile.social_links,
      },
    });
  } catch (error) {
    console.error('[Profile Controller] Error en getPublicProfile:', error);
    return res.status(500).json({
      success: false,
      code: 'PUBLIC_PROFILE_ERROR',
      message: 'Error al consultar el perfil público.',
    });
  }
}

/**
 * 3. ACTUALIZAR PERFIL (PATCH /api/users/profile)
 * Protegido: Exclusivo para miembros registrados ('student', 'admin', 'professor')
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const patchData = req.body;

    // Si intenta cambiar el @username, validar que no esté tomado por otro usuario
    if (patchData.username) {
      const cleanUsername = patchData.username.replace(/^@/, '').toLowerCase().trim();
      const existing = await db.findProfileByUsername(cleanUsername);

      if (existing && existing.user_id !== userId) {
        return res.status(409).json({
          success: false,
          code: 'USERNAME_TAKEN',
          message: `El nombre de usuario @${cleanUsername} ya está en uso por otro estudiante.`,
        });
      }
      patchData.username = cleanUsername;
    }

    const updatedProfile = await db.updateProfile(userId, patchData);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        code: 'PROFILE_NOT_FOUND',
        message: 'No se encontró el perfil a actualizar.',
      });
    }

    return res.status(200).json({
      success: true,
      code: 'PROFILE_UPDATED',
      message: 'Perfil actualizado con éxito.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Profile Controller] Error en updateProfile:', error);
    return res.status(500).json({
      success: false,
      code: 'UPDATE_FAILED',
      message: 'Ocurrió un error al actualizar los datos del perfil.',
    });
  }
}

/**
 * 4. SUBIDA DE FOTO DE PERFIL / AVATAR (POST /api/users/avatar)
 * Procesado y validado mediante Multer
 */
export async function uploadAvatarImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'FILE_MISSING',
        message: 'No se ha adjuntado ningún archivo de imagen.',
      });
    }

    // Construcción de la URL pública del archivo
    const publicUrl = `/uploads/avatars/${req.file.filename}`;

    // Actualizar registro en base de datos
    const updatedProfile = await db.updateProfile(req.user.id, {
      avatar_url: publicUrl,
    });

    return res.status(200).json({
      success: true,
      code: 'AVATAR_UPLOADED',
      message: 'Foto de perfil actualizada exitosamente.',
      avatar_url: publicUrl,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Profile Controller] Error en uploadAvatarImage:', error);
    return res.status(500).json({
      success: false,
      code: 'AVATAR_UPLOAD_FAILED',
      message: 'Fallo al procesar la subida del avatar.',
    });
  }
}

/**
 * 5. CAMBIO SEGURO DE CONTRASEÑA (POST /api/users/change-password)
 * Requiere la contraseña anterior y aplica hashing con bcrypt (10 rounds)
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado.',
      });
    }

    // Verificar si el usuario tiene contraseña asignada (no es solo OAuth)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        code: 'NO_PASSWORD_SET',
        message: 'Tu cuenta está autenticada mediante Google OAuth y no requiere cambio de contraseña local.',
      });
    }

    // Verificar contraseña actual con bcrypt
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'La contraseña actual ingresada es incorrecta.',
      });
    }

    // Hashear nueva contraseña con bcrypt (10 salt rounds)
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await db.updateUserPassword(userId, newHash);

    // Opcional: revocar otras sesiones para forzar reautenticación en otros dispositivos
    await db.revokeAllUserSessions(userId);

    return res.status(200).json({
      success: true,
      code: 'PASSWORD_CHANGED',
      message: 'Contraseña actualizada de forma segura. Por favor, mantén tus credenciales a salvo.',
    });
  } catch (error) {
    console.error('[Profile Controller] Error en changePassword:', error);
    return res.status(500).json({
      success: false,
      code: 'PASSWORD_CHANGE_FAILED',
      message: 'Error al cambiar la contraseña.',
    });
  }
}
