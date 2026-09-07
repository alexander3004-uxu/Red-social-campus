/**
 * server/middlewares/uploadMiddleware.js
 * Middleware de subida y validación estricta de imágenes con Multer.
 * Valida límites de tamaño (5MB) y tipos MIME (JPEG, PNG, WebP) para prevenir ataques de carga de archivos.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Directorio destino para avatares
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'avatars');

// Asegurar existencia de la carpeta de uploads
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// Filtro estricto de tipos MIME permitidos
const fileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('FORMATO_NO_PERMITIDO');
    error.code = 'INVALID_MIME_TYPE';
    cb(error, false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes máximo
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware para capturar y formatear errores de Multer en respuestas HTTP estándar
 */
export function handleUploadErrors(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message: 'El archivo excede el tamaño máximo permitido de 5 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: `Error al procesar el archivo: ${err.message}`,
    });
  } else if (err && err.message === 'FORMATO_NO_PERMITIDO') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Tipo de archivo no permitido. Solo se aceptan imágenes en formato JPEG, PNG o WebP.',
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      code: 'STORAGE_ERROR',
      message: 'Error interno en el servidor de almacenamiento.',
    });
  }
  next();
}
