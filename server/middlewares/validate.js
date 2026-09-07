/**
 * server/middlewares/validate.js
 * Sanitización y validación estricta de entradas HTTP para prevención de inyecciones y datos maliciosos.
 */

// Regex para correo estándar y dominios institucionales (.edu, .ac, etc.)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex para @username universitario: 3 a 30 caracteres alfanuméricos, guiones y puntos
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

/**
 * Sanitiza cadenas de texto eliminando etiquetas HTML y caracteres de control
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Remover tags HTML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remover caracteres de control
    .trim();
}

/**
 * Validador de fortaleza de contraseña:
 * - Mínimo 8 caracteres
 * - Al menos una letra
 * - Al menos un número o símbolo especial
 */
export function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  return hasLetter && hasNumberOrSymbol;
}

/**
 * Middleware para validación de registro tradicional
 */
export function validateRegister(req, res, next) {
  const { email, password, full_name, username } = req.body;
  const errors = [];

  // Sanitizar
  if (email) req.body.email = sanitizeString(email).toLowerCase();
  if (full_name) req.body.full_name = sanitizeString(full_name);
  if (username) req.body.username = sanitizeString(username).replace(/^@/, '').toLowerCase();

  // Validar Email
  if (!req.body.email || !EMAIL_REGEX.test(req.body.email)) {
    errors.push('El formato del correo electrónico institucional o personal es inválido.');
  }

  // Validar Contraseña
  if (!password || !isStrongPassword(password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres y contener una combinación de letras y números.');
  }

  // Validar Nombre Completo
  if (!req.body.full_name || req.body.full_name.length < 2 || req.body.full_name.length > 100) {
    errors.push('El nombre completo debe tener entre 2 y 100 caracteres.');
  }

  // Validar Username
  if (!req.body.username || !USERNAME_REGEX.test(req.body.username)) {
    errors.push('El nombre de usuario solo puede contener letras, números, puntos y guiones bajos (3-30 caracteres).');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Errores de validación en la solicitud.',
      errors,
    });
  }

  next();
}

/**
 * Middleware para validación de inicio de sesión
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (email) req.body.email = sanitizeString(email).toLowerCase();

  if (!req.body.email || !EMAIL_REGEX.test(req.body.email)) {
    errors.push('Se requiere un correo electrónico válido.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Se requiere la contraseña de acceso.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Datos de acceso incompletos o incorrectos.',
      errors,
    });
  }

  next();
}

/**
 * Middleware para validación de actualización de perfil
 */
export function validateProfileUpdate(req, res, next) {
  const { full_name, username, bio, university, faculty, career, semester, social_links } = req.body;
  const errors = [];

  if (full_name !== undefined) {
    req.body.full_name = sanitizeString(full_name);
    if (req.body.full_name.length < 2 || req.body.full_name.length > 100) {
      errors.push('El nombre completo debe tener entre 2 y 100 caracteres.');
    }
  }

  if (username !== undefined) {
    const cleanUsername = sanitizeString(username).replace(/^@/, '').toLowerCase();
    req.body.username = cleanUsername;
    if (!USERNAME_REGEX.test(cleanUsername)) {
      errors.push('El nombre de usuario solo puede contener letras, números, puntos y guiones bajos (3-30 caracteres).');
    }
  }

  if (bio !== undefined) {
    req.body.bio = sanitizeString(bio);
    if (req.body.bio.length > 500) {
      errors.push('La biografía no puede exceder los 500 caracteres.');
    }
  }

  if (university !== undefined) req.body.university = sanitizeString(university);
  if (faculty !== undefined) req.body.faculty = sanitizeString(faculty);
  if (career !== undefined) req.body.career = sanitizeString(career);
  if (semester !== undefined) req.body.semester = sanitizeString(semester);

  if (social_links !== undefined && !Array.isArray(social_links)) {
    errors.push('El campo social_links debe ser una lista estructurada.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Errores en los datos del perfil.',
      errors,
    });
  }

  next();
}

/**
 * Middleware para validación de cambio de contraseña
 */
export function validatePasswordChange(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Debes ingresar tu contraseña actual.');
  }

  if (!newPassword || !isStrongPassword(newPassword)) {
    errors.push('La nueva contraseña debe tener al menos 8 caracteres y contener una combinación de letras y números.');
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('La nueva contraseña debe ser diferente a la actual.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Datos de contraseña inválidos.',
      errors,
    });
  }

  next();
}
