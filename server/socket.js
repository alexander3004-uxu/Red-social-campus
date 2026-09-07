/**
 * server/socket.js
 * Módulo de Comunicación e Interacción en Tiempo Real para "Red Social Campus"
 * Arquitectura distribuida con Socket.io, Redis Adapter, Autenticación JWT y Presencia.
 */

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campus_super_secret_jwt_key_2026';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

/**
 * Inicializa y configura el servidor Socket.io con soporte para alta concurrencia
 * @param {import('http').Server} httpServer Servidor HTTP de Node/Express
 * @param {Object} dependencies Inyección opcional de DB/servicios
 */
export function setupWebSocketServer(httpServer, dependencies = {}) {
  // Clientes dedicados para Redis Adapter (Pub/Sub requiere clientes aislados)
  const pubClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  const subClient = pubClient.duplicate();

  // Cliente adicional para operaciones de caché de estado y presencia
  const redisClient = pubClient.duplicate();

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
    // Configuración de Heartbeat para detección rápida de desconexiones fantasma/abruptas
    pingInterval: 25000, // Enviar ping cada 25 segundos
    pingTimeout: 20000,  // Considerar desconectado si no responde pong en 20 segundos
    transports: ['websocket', 'polling'],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutos para reconexión con retención de buffer
      skipMiddlewares: false,
    },
  });

  // Guardar instancia de IO para acceso global en servicios
  if (dependencies.setIoInstance) {
    dependencies.setIoInstance(io);
  }

  // ============================================================================
  // 1. MIDDLEWARE DE AUTENTICACIÓN (HANDSHAKE JWT)
  // ============================================================================
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('AUTHENTICATION_ERROR: Token no proporcionado'));
      }

      // Validación criptográfica del JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      // Inyectar datos institucionales del usuario en el contexto del socket
      socket.user = {
        id: decoded.sub || decoded.userId || decoded.id,
        nombre: decoded.nombre || decoded.name || 'Estudiante',
        email: decoded.email,
        carrera: decoded.carrera, // Ej: 'Ingeniería en Sistemas'
        materiasInscritas: decoded.materias || [], // Ej: ['calc101', 'prog202']
        rol: decoded.rol || 'student', // 'student' | 'professor' | 'admin'
      };

      return next();
    } catch (err) {
      return next(new Error(`AUTHENTICATION_ERROR: Token inválido o expirado (${err.message})`));
    }
  });

  // ============================================================================
  // 2. CONTROLADOR DE CONEXIÓN Y EVENTOS
  // ============================================================================
  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    const socketId = socket.id;

    // A. Sala personal del usuario (permite enrutamiento 1-a-1 y notificaciones privadas)
    const userPersonalRoom = `user:${userId}`;
    socket.join(userPersonalRoom);

    // B. Manejo de Presencia con Redis (Múltiples Pestañas/Dispositivos)
    // Usamos un Redis SET con todos los socketIds activos del usuario
    const userPresenceKey = `presence:user:${userId}`;
    const socketUserKey = `presence:socket:${socketId}`;

    try {
      // 1. Mapear socketId -> userId (TTL 24h para autolimpieza de huérfanos)
      await redisClient.set(socketUserKey, userId, 'EX', 86400);

      // 2. Agregar socketId al SET del usuario
      const addedCount = await redisClient.sadd(userPresenceKey, socketId);
      const activeSocketsCount = await redisClient.scard(userPresenceKey);

      // Si antes no tenía sockets (addedCount === 1 && activeSocketsCount === 1), pasa a ONLINE
      if (activeSocketsCount === 1) {
        await redisClient.hset(`user:status:${userId}`, {
          online: 'true',
          lastSeen: new Date().toISOString(),
        });

        // Difundir estado Online a través del Redis Adapter a todos los clientes
        io.emit('presence:status_change', {
          userId,
          status: 'online',
          timestamp: Date.now(),
        });
      }
    } catch (presenceErr) {
      console.error(`[Presencia] Error al registrar conexión de ${userId}:`, presenceErr);
    }

    // ==========================================================================
    // 3. SUSCRIPCIÓN A SALAS DINÁMICAS (MATERIAS / CARRERAS)
    // ==========================================================================

    /**
     * Unirse a una sala de materia con validación académica
     * Ej: roomName = 'room:materia:calc101'
     */
    socket.on('room:join', async ({ roomName }, callback) => {
      try {
        if (!roomName || typeof roomName !== 'string') {
          return callback?.({ error: 'Nombre de sala inválido' });
        }

        // Validación de autorización académica
        if (roomName.startsWith('room:materia:')) {
          const materiaCode = roomName.replace('room:materia:', '');
          const isEnrolled = socket.user.materiasInscritas.includes(materiaCode) || socket.user.rol === 'admin';

          if (!isEnrolled) {
            return callback?.({
              error: `No estás inscrito en la asignatura '${materiaCode}'`,
              authorized: false,
            });
          }
        }

        await socket.join(roomName);

        // Notificar a la sala que un estudiante se unió
        socket.to(roomName).emit('room:user_joined', {
          userId,
          userName: socket.user.nombre,
          roomName,
          timestamp: Date.now(),
        });

        callback?.({ success: true, roomName });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    /**
     * Salir de una sala
     */
    socket.on('room:leave', ({ roomName }, callback) => {
      socket.leave(roomName);
      socket.to(roomName).emit('room:user_left', {
        userId,
        userName: socket.user.nombre,
        roomName,
        timestamp: Date.now(),
      });
      callback?.({ success: true, roomName });
    });

    // ==========================================================================
    // 4. CHAT DIRECTO Y GRUPAL (ENVÍO Y RECEPCIÓN DE MENSAJES)
    // ==========================================================================

    /**
     * Enviar mensaje con soporte de metadatos y ACK
     */
    socket.on('message:send', async (payload, ackCallback) => {
      try {
        const { conversationId, targetRoom, targetUserId, text, metadata = {}, type = 'text' } = payload;

        if (!text && (!metadata || !metadata.url)) {
          return ackCallback?.({ error: 'El mensaje no puede estar vacío' });
        }

        // Estructura del mensaje en memoria / persistencia
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const messageData = {
          id: messageId,
          conversationId,
          senderId: userId,
          senderName: socket.user.nombre,
          type, // 'text' | 'file' | 'image'
          content: text,
          metadata, // { fileName, fileSize, mimeType, url }
          status: 'sent',
          createdAt: new Date().toISOString(),
        };

        // TODO: En producción: Insertar en BD PostgreSQL mediante pool.query(INSERT...)
        // await db.messages.create(messageData);

        // Caso 1: Mensaje a Sala Grupal (Asignatura o Carrera)
        if (targetRoom) {
          // Emite a todos los sockets en la sala excepto al emisor
          socket.to(targetRoom).emit('message:received', messageData);
        }
        // Caso 2: Mensaje Directo (1 a 1)
        else if (targetUserId) {
          // Emite a la sala personal del destinatario (independiente de en qué réplica esté)
          io.to(`user:${targetUserId}`).emit('message:received', messageData);
        }

        // ACK al emisor confirmando persistencia exitosa
        ackCallback?.({
          status: 'sent',
          message: messageData,
        });
      } catch (err) {
        console.error('[Mensajería] Error al procesar mensaje:', err);
        ackCallback?.({ error: 'Fallo interno al enviar mensaje' });
      }
    });

    /**
     * Confirmación de Entrega (Delivery Receipt)
     * Emitido por el cliente receptor cuando el socket recibe el mensaje
     */
    socket.on('message:ack_delivery', ({ messageId, conversationId, senderId }) => {
      // Notificar al emisor que su mensaje fue entregado físicamente al dispositivo
      io.to(`user:${senderId}`).emit('message:status_update', {
        messageId,
        conversationId,
        status: 'delivered',
        deliveredTo: userId,
        timestamp: Date.now(),
      });
    });

    /**
     * Confirmación de Lectura ("Visto" / Read Receipt)
     * Emitido cuando el usuario abre la conversación o la ventana pasa a focus
     */
    socket.on('message:mark_read', async ({ conversationId, lastMessageId, targetRoom, peerUserId }) => {
      // TODO: Actualizar `last_read_message_id` en `conversation_participants` en BD

      const payload = {
        conversationId,
        lastMessageId,
        readBy: userId,
        readAt: new Date().toISOString(),
        status: 'read',
      };

      if (targetRoom) {
        socket.to(targetRoom).emit('message:read_receipt', payload);
      } else if (peerUserId) {
        io.to(`user:${peerUserId}`).emit('message:read_receipt', payload);
      }
    });

    // ==========================================================================
    // 5. INDICADOR DE "ESCRIBIENDO..." (TYPING INDICATOR)
    // ==========================================================================
    socket.on('typing:start', ({ targetRoom, targetUserId, conversationId }) => {
      const typingPayload = {
        userId,
        userName: socket.user.nombre,
        conversationId,
        isTyping: true,
      };

      if (targetRoom) {
        socket.to(targetRoom).emit('typing:status', typingPayload);
      } else if (targetUserId) {
        socket.to(`user:${targetUserId}`).emit('typing:status', typingPayload);
      }
    });

    socket.on('typing:stop', ({ targetRoom, targetUserId, conversationId }) => {
      const typingPayload = {
        userId,
        userName: socket.user.nombre,
        conversationId,
        isTyping: false,
      };

      if (targetRoom) {
        socket.to(targetRoom).emit('typing:status', typingPayload);
      } else if (targetUserId) {
        socket.to(`user:${targetUserId}`).emit('typing:status', typingPayload);
      }
    });

    // ==========================================================================
    // 6. HEARTBEAT Y MANEJO DE DESCONEXIONES ABRUPTAS
    // ==========================================================================
    socket.on('disconnect', async (reason) => {
      try {
        // Remover este socket específico del set de conexiones del usuario
        await redisClient.srem(userPresenceKey, socketId);
        await redisClient.del(socketUserKey);

        const remainingSockets = await redisClient.scard(userPresenceKey);

        // Si ya no quedan conexiones activas en ningún dispositivo o pestaña
        if (remainingSockets === 0) {
          const nowIso = new Date().toISOString();
          await redisClient.hset(`user:status:${userId}`, {
            online: 'false',
            lastSeen: nowIso,
          });

          // Notificar desconexión a toda la red o a sus contactos
          io.emit('presence:status_change', {
            userId,
            status: 'offline',
            lastSeen: nowIso,
            reason,
          });
        }
      } catch (err) {
        console.error(`[Desconexión] Error limpiando presencia para ${userId}:`, err);
      }
    });
  });

  return io;
}
