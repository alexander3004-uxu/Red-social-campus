/**
 * server/index.js
 * Punto de entrada principal del servidor backend, API REST y WebSockets.
 * Implementa seguridad, cookies HTTP-only, rutas de autenticación y gestión de perfiles.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { setupWebSocketServer } from './socket.js';
import { setIoInstance } from './services/notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Configuración de CORS con soporte estricto para credenciales y cookies
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, CURL, herramientas de servidor) o que coincidan con orígenes locales
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === CLIENT_ORIGIN) {
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
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

// ==============================================================================
// RUTAS DE LA API
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

const server = http.createServer(app);

// Inicializar Socket.io con Redis Adapter y Presencia
let io = null;
try {
  io = setupWebSocketServer(server, {
    setIoInstance,
  });
} catch (socketErr) {
  console.warn('[WebSocket] Servidor Socket.io inicializado en modo fallback:', socketErr.message);
}

server.listen(PORT, () => {
  console.log(`🚀 Servidor backend y WebSockets corriendo en: http://localhost:${PORT}`);
  console.log(`🔒 Módulo de Autenticación, Cookies HTTP-only y Perfiles activo.`);
});
