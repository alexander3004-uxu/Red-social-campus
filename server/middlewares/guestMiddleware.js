/**
 * server/middlewares/guestMiddleware.js
 * Control de Acceso Basado en Roles (RBAC) y Bloqueo de Acciones de Invitado.
 * Asegura que los usuarios en modo invitado tengan acceso estricto de solo lectura.
 */

/**
 * Middleware para requerir roles específicos (ej. 'student', 'admin', 'professor')
 * Si un invitado intenta acceder a una ruta que requiere 'student', retorna 403 con código GUEST_RESTRICTED.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Debes iniciar sesión para realizar esta acción.',
      });
    }

    const { role, isGuest } = req.user;

    // Si es un invitado intentando una acción de usuario registrado
    if (isGuest || role === 'guest') {
      if (!allowedRoles.includes('guest')) {
        return res.status(403).json({
          success: false,
          code: 'GUEST_RESTRICTED',
          message: 'Esta funcionalidad es exclusiva para miembros registrados de la comunidad universitaria.',
          prompt_upgrade: true,
          upgrade_info: {
            title: 'Desbloquea todas las funciones del Campus',
            benefits: [
              'Publicar apuntes, dudas y encuestas en el feed',
              'Comentar y votar en publicaciones de compañeros',
              'Enviar mensajes directos y participar en salas de estudio',
              'Publicar artículos en el Campus Market',
              'Obtener tu Carnet Digital QR y credencial NFC',
            ],
          },
        });
      }
    }

    // Comprobación de roles estándar
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `No tienes los privilegios necesarios (${role}). Se requiere uno de: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Middleware para bloquear cualquier mutación de datos por parte de invitados
 * (Publicaciones, Comentarios, Mensajes, Likes, Edición de Perfil)
 */
export function blockGuestMutation(req, res, next) {
  if (req.user && (req.user.isGuest || req.user.role === 'guest')) {
    return res.status(403).json({
      success: false,
      code: 'GUEST_RESTRICTED',
      message: 'Los usuarios en modo invitado tienen permisos de solo lectura.',
      prompt_upgrade: true,
    });
  }
  next();
}
