/**
 * src/services/socketClient.ts
 * Cliente WebSocket de referencia para "Red Social Campus"
 * Utiliza socket.io-client con manejo de reconexión, rooms de materias, typing debounce y notificaciones.
 */

import { io, Socket } from 'socket.io-client';

class CampusSocketClient {
  private socket: Socket | null = null;
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private isCurrentlyTyping: boolean = false;

  /**
   * Conectar e inicializar el socket con JWT en el handshake
   */
  public connect(serverUrl: string, jwtToken: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      auth: {
        token: jwtToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.registerLifecycleEvents();
    return this.socket;
  }

  /**
   * Ciclo de vida y reconexión
   */
  private registerLifecycleEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(`[Socket] Conectado exitosamente con ID: ${this.socket?.id}`);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[Socket] Error de conexión / handshake:', error.message);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Socket] Desconectado:', reason);
      if (reason === 'io server disconnect') {
        // Desconexión forzada por el servidor (ej. token revocado), reconectar manualmente si aplica
        this.socket?.connect();
      }
    });

    // Escucha global de cambios de presencia de compañeros
    this.socket.on('presence:status_change', (data: { userId: string; status: 'online' | 'offline'; timestamp: number }) => {
      console.log(`[Presencia] Usuario ${data.userId} ahora está: ${data.status}`);
    });
  }

  /**
   * Suscribirse a la sala de una asignatura (ej. 'calc101')
   */
  public joinCourseRoom(courseCode: string, onJoined?: (res: any) => void): void {
    if (!this.socket) throw new Error('Socket no inicializado');

    const roomName = `room:materia:${courseCode}`;
    this.socket.emit('room:join', { roomName }, (response: any) => {
      if (response?.error) {
        console.error(`[Salas] Error al unirse a ${roomName}:`, response.error);
      } else {
        console.log(`[Salas] Unido con éxito a la materia: ${courseCode}`);
      }
      onJoined?.(response);
    });
  }

  /**
   * Salir de la sala de una asignatura
   */
  public leaveCourseRoom(courseCode: string): void {
    if (!this.socket) return;
    const roomName = `room:materia:${courseCode}`;
    this.socket.emit('room:leave', { roomName });
  }

  /**
   * Enviar un mensaje (a sala grupal o directo) con soporte de ACK
   */
  public sendMessage(
    payload: {
      conversationId: string;
      text: string;
      targetRoom?: string;
      targetUserId?: string;
      metadata?: any;
    },
    onAck?: (response: any) => void
  ): void {
    if (!this.socket) throw new Error('Socket no conectado');

    this.socket.emit('message:send', payload, (ack: any) => {
      if (onAck) onAck(ack);
    });
  }

  /**
   * Notificar al servidor que se empezó/terminó de escribir con Debounce
   */
  public handleTypingActivity(targetRoom?: string, targetUserId?: string, conversationId?: string): void {
    if (!this.socket) return;

    // Si no estábamos marcados como escribiendo, emitir typing:start de inmediato
    if (!this.isCurrentlyTyping) {
      this.isCurrentlyTyping = true;
      this.socket.emit('typing:start', { targetRoom, targetUserId, conversationId });
    }

    // Reiniciar temporizador debounce (3 segundos de inactividad)
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.isCurrentlyTyping = false;
      this.socket?.emit('typing:stop', { targetRoom, targetUserId, conversationId });
      this.typingTimeout = null;
    }, 2500);
  }

  /**
   * Confirmar lectura ("visto") de mensajes
   */
  public markAsRead(conversationId: string, lastMessageId: string, targetRoom?: string, peerUserId?: string): void {
    if (!this.socket) return;
    this.socket.emit('message:mark_read', {
      conversationId,
      lastMessageId,
      targetRoom,
      peerUserId,
    });
  }

  /**
   * Registrar observadores para notificaciones en vivo y badges
   */
  public onLiveNotification(callback: (data: { notification: any; badgeCount: number }) => void): void {
    if (!this.socket) return;
    this.socket.on('notification:new', callback);
  }

  /**
   * Escuchar anuncios y avisos de materias en vivo
   */
  public onCourseBroadcast(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('course:broadcast', callback);
  }

  /**
   * Escuchar nuevos mensajes entrantes y enviar acuse de recibo de entrega (delivery receipt)
   */
  public onMessageReceived(callback: (message: any) => void): void {
    if (!this.socket) return;
    this.socket.on('message:received', (message: any) => {
      // 1. Confirmar entrega física en este dispositivo
      this.socket?.emit('message:ack_delivery', {
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
      });

      // 2. Notificar a la UI
      callback(message);
    });
  }

  /**
   * Desconectar socket de forma limpia
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new CampusSocketClient();
export default socketClient;
