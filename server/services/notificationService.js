/**
 * server/services/notificationService.js
 * Servicio centralizado y desacoplado para despacho de notificaciones en tiempo real
 * con persistencia y estrategia híbrida (WebSocket + Base de Datos + Badge Counter).
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

// Variable para almacenar la referencia al servidor Socket.io inyectada durante bootstrap
let globalIo = null;

export const setIoInstance = (ioInstance) => {
  globalIo = ioInstance;
};

/**
 * Tipos de eventos prioritarios del ecosistema Red Social Campus
 */
export const NotificationType = {
  POST_COMMENT: 'POST_COMMENT',
  USER_MENTION: 'USER_MENTION',
  COURSE_ANNOUNCEMENT: 'COURSE_ANNOUNCEMENT',
  COURSE_MATERIAL: 'COURSE_MATERIAL',
  DIRECT_MESSAGE: 'DIRECT_MESSAGE',
};

class NotificationService {
  /**
   * Extrae menciones de tipo @usuario o @matricula de un bloque de texto
   * @param {string} text Contenido del post o comentario
   * @returns {string[]} Lista de nombres de usuario únicos sin el símbolo @
   */
  static extractMentions(text) {
    if (!text || typeof text !== 'string') return [];
    const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
    const matches = text.match(mentionRegex);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.substring(1))));
  }

  /**
   * Emisión híbrida: guarda en persistencia, incrementa badge count y emite vía WebSocket
   * @param {Object} params
   * @param {string} params.userId Destinatario
   * @param {string} params.actorId Usuario que originó la acción
   * @param {string} params.type Tipo de notificación (NotificationType)
   * @param {string} params.title Título de la notificación
   * @param {string} params.body Contenido legible
   * @param {Object} params.data Metadatos adicionales (URL, postId, etc.)
   */
  static async sendNotification({ userId, actorId, type, title, body, data = {} }) {
    try {
      // 1. Persistencia simulada en Base de Datos (en prod: INSERT INTO notifications ...)
      const notificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        actorId,
        type,
        title,
        body,
        data,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // 2. Incrementar atómicamente el contador de notificaciones no leídas (Badge Count) en Redis
      const badgeKey = `badge:user:${userId}`;
      const unreadBadgeCount = await redis.incr(badgeKey);

      // 3. Evaluar presencia en Redis para métricas o canal push alternativo
      const presenceKey = `presence:user:${userId}`;
      const activeSockets = await redis.scard(presenceKey);
      const isOnline = activeSockets > 0;

      // 4. Emisión por WebSocket (a través del Redis Adapter de Socket.io)
      // Aunque el usuario esté en otra réplica, io.to(`user:${userId}`) lo alcanzará
      if (globalIo) {
        globalIo.to(`user:${userId}`).emit('notification:new', {
          notification: notificationRecord,
          badgeCount: unreadBadgeCount,
          isRealtime: true,
        });
      }

      return {
        success: true,
        deliveredViaSocket: isOnline,
        unreadBadgeCount,
        notification: notificationRecord,
      };
    } catch (error) {
      console.error(`[NotificationService] Error enviando notificación a ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Caso 1: Notificar al autor de un post cuando recibe un nuevo comentario
   */
  static async notifyPostComment({ postAuthorId, commentAuthor, postId, postExcerpt, commentExcerpt }) {
    // Evitar auto-notificarse si el autor comenta su propio post
    if (postAuthorId === commentAuthor.id) return null;

    return this.sendNotification({
      userId: postAuthorId,
      actorId: commentAuthor.id,
      type: NotificationType.POST_COMMENT,
      title: 'Nuevo comentario en tu publicación',
      body: `${commentAuthor.name} comentó: "${commentExcerpt.substring(0, 70)}..."`,
      data: {
        postId,
        authorAvatar: commentAuthor.avatar,
        link: `/feed?postId=${postId}`,
      },
    });
  }

  /**
   * Caso 2: Notificar menciones directas (@usuario) detectadas en posts o comentarios
   */
  static async notifyMentions({ text, actor, contextType, contextId, userResolver }) {
    const mentionedUsernames = this.extractMentions(text);
    if (mentionedUsernames.length === 0) return [];

    // Resolver identificadores o usernames a IDs de usuario en base de datos
    const targetUsers = await userResolver(mentionedUsernames);

    const dispatchPromises = targetUsers
      .filter((target) => target.id !== actor.id) // No auto-mencionarse
      .map((target) =>
        this.sendNotification({
          userId: target.id,
          actorId: actor.id,
          type: NotificationType.USER_MENTION,
          title: 'Te mencionaron en el campus',
          body: `${actor.name} te mencionó en un ${contextType}: "${text.substring(0, 80)}..."`,
          data: {
            contextType,
            contextId,
            link: `/${contextType}/${contextId}`,
          },
        })
      );

    return Promise.all(dispatchPromises);
  }

  /**
   * Caso 3: Notificar nuevo material de estudio o anuncio subido a una materia
   * Puede emitirse directamente al room de la materia Y/O persistir en el buzón de cada estudiante
   */
  static async notifyCourseAnnouncement({ courseCode, courseName, professor, announcementTitle, materialType = 'anuncio' }) {
    const roomName = `room:materia:${courseCode}`;

    const notificationPayload = {
      type: NotificationType.COURSE_ANNOUNCEMENT,
      courseCode,
      courseName,
      title: `[${courseCode.toUpperCase()}] Nuevo ${materialType}: ${announcementTitle}`,
      body: `El profesor ${professor.name} ha publicado nuevo contenido en ${courseName}.`,
      publishedAt: new Date().toISOString(),
      metadata: {
        professorId: professor.id,
        courseCode,
      },
    };

    // 1. Difusión instantánea a todos los estudiantes que tengan abierto el canal de la materia
    if (globalIo) {
      globalIo.to(roomName).emit('course:broadcast', notificationPayload);
    }

    // 2. Registro y actualización de badge para los alumnos inscritos (procesado típicamente en background job/worker)
    return {
      broadcastedToRoom: roomName,
      payload: notificationPayload,
    };
  }

  /**
   * Reiniciar o decrementar el contador de badges del usuario
   */
  static async clearBadgeCount(userId) {
    const badgeKey = `badge:user:${userId}`;
    await redis.set(badgeKey, 0);
    return 0;
  }
}

export default NotificationService;
