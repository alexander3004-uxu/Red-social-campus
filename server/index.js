/**
 * server/index.js
 * Punto de entrada principal del servidor local backend, API REST y WebSockets.
 */

import http from 'http';
import dotenv from 'dotenv';
import { app } from './app.js';
import { setupWebSocketServer } from './socket.js';
import { setIoInstance } from './services/notificationService.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
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
