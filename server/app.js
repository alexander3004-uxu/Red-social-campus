/**
 * server/app.js
 * Instancia y configuración principal de Express para Red Social Campus.
 * Exportable tanto para el servidor local (server/index.js) como para
 * funciones serverless (api/index.js para Vercel).
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Configuración de CORS con soporte para credenciales, cookies y múltiples orígenes
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (apps móviles, curl, Postman) o cualquier origen en desarrollo/producción
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('vercel.app') || origin === CLIENT_ORIGIN) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Guest-Session-Id'],
  })
);

// Parsing de JSON, URL-Encoded y Cookies firmadas
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'campus_cookie_signer_secret_key_2026'));

// Servir archivos estáticos subidos (ej. avatares de usuario)
const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('[Uploads] Directorio estático:', e.message);
}
app.use('/uploads', express.static(uploadsDir));

// Endpoint de salud del servidor
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Red Social Campus - Core API & Auth',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Red Social Campus - Core API & Auth',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ==============================================================================
// RUTAS DE LA API (Montadas con y sin prefijo /api para compatibilidad con Vercel)
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

// Manejador global de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: `La ruta solicitada '${req.method} ${req.originalUrl}' no existe en el servidor.`,
  });
});

// Manejador global de excepciones no controladas
app.use((err, _req, res, _next) => {
  console.error('[Error Global Express]:', err);
  res.status(err.status || 500).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Ha ocurrido un error inesperado en el servidor.',
  });
});

export default app;
export { app };
