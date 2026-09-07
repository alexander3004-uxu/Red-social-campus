/**
 * server/index.js
 * Punto de entrada principal del servidor backend y WebSockets
 */

import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { setupWebSocketServer } from './socket.js';
import { setIoInstance } from './services/notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Endpoint de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Red Social Campus - Realtime & API',
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);

// Inicializar Socket.io con Redis Adapter y Presencia
const io = setupWebSocketServer(server, {
  setIoInstance,
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor backend y WebSockets corriendo en: http://localhost:${PORT}`);
});
