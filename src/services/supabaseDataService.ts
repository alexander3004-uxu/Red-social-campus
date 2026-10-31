/**
 * src/services/supabaseDataService.ts
 * Servicio Base de la Red Social Campus.
 * 
 * 🎓 PROYECTO EDUCATIVO (STARTER KIT):
 * - La base de datos solo almacena `users` y `profiles` para el login de los usuarios demo.
 * - Las publicaciones, market, grupos, historias y chats funcionan en memoria local
 *   para que los alumnos construyan las tablas y su lógica de persistencia.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Story, MarketItem, CommunityGroup, ChatThread, UserSearchResult, FriendRequest, CampusNotification } from '../types';

export const supabaseDataService = {
  // ============================================================================
  // 1. PUBLICACIONES (POSTS) - MOCK LOCAL (Asignación para estudiantes)
  // ============================================================================

  async fetchPosts(userId?: string): Promise<Post[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !postsData) {
        console.warn('[Supabase] Error cargando posts:', error?.message);
        return [];
      }

      // Cargar likes y saves del usuario actual si existe
      let userLikes = new Set<string>();
      let userSaves = new Set<string>();

      if (userId) {
        const [{ data: likesData }, { data: savesData }] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', userId),
          supabase.from('post_saves').select('post_id').eq('user_id', userId),
        ]);

        if (likesData) likesData.forEach((l) => userLikes.add(l.post_id));
        if (savesData) savesData.forEach((s) => userSaves.add(s.post_id));
      }

      return postsData.map((row) => mapPostFromDb(row, userId, userLikes, userSaves));
    } catch (err) {
      console.warn('[Supabase] Fallback a datos locales de posts:', err);
      return [];
    }
  },

  async createPost(_post: Post, _userId?: string): Promise<boolean> {
    // Espacio para que los estudiantes creen la tabla posts y guarden publicaciones
    return true;
  },

  async toggleLikePost(_postId: string, _userId: string, _nextLiked: boolean, _nextLikes: number): Promise<void> {
    // Espacio para que los estudiantes registren los likes en Supabase
  },

  async toggleSavePost(_postId: string, _userId: string, _nextSaved: boolean): Promise<void> {
    // Espacio para que los estudiantes registren los posts guardados
  },

  async updatePostPoll(_postId: string, _pollData: any): Promise<void> {
    // Espacio para que los estudiantes guarden los votos de encuestas
  },

  async updatePostEvent(_postId: string, _eventData: any): Promise<void> {
    // Espacio para que los estudiantes guarden la asistencia a eventos
  },

  subscribeToPosts(
    _onInsert: (post: Post) => void,
    _onUpdate: (post: Post) => void,
    _onDelete: (id: string) => void
  ) {
    // Espacio para que los estudiantes configuren Supabase Realtime en posts
    return () => {};
  },

  // ============================================================================
  // 2. DEMÁS MÓDULOS - MOCK LOCAL (Asignación para estudiantes)
  // ============================================================================

  async fetchStories(): Promise<Story[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }
      return data.map(mapStoryFromDb);
    } catch {
      return [];
    }
  },

  subscribeToStories(_onInsert: (story: Story) => void) {
    return () => {};
  },

  // ============================================================================
  // MARKETPLACE
  // ============================================================================

  async fetchMarketItems(userId?: string): Promise<MarketItem[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      let userFavs = new Set<string>();
      if (userId) {
        const { data: favs } = await supabase
          .from('market_favorites')
          .select('item_id')
          .eq('user_id', userId);
        if (favs) favs.forEach((f) => userFavs.add(f.item_id));
      }

      return data.map((row) => mapMarketItemFromDb(row, userFavs));
    } catch {
      return [];
    }
  },

  async toggleMarketFav(_itemId: string, _userId: string, _nextFav: boolean): Promise<void> {
  },

  subscribeToMarket(_onInsert: any, _onUpdate: any) {
    return () => {};
  },

  // ============================================================================
  // COMUNIDADES / GRUPOS
  // ============================================================================

  async fetchGroups(userId?: string): Promise<CommunityGroup[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return [];
      }

      let userMemberships = new Set<string>();
      if (userId) {
        const { data: mems } = await supabase
          .from('group_memberships')
          .select('group_id')
          .eq('user_id', userId);
        if (mems) mems.forEach((m) => userMemberships.add(m.group_id));
      }

      return data.map((row) => mapGroupFromDb(row, userMemberships));
    } catch {
      return [];
    }
  },

  async toggleJoinGroup(groupId: string, userId: string, isJoined: boolean, nextCount: number): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('community_groups')
        .update({ members_count: nextCount })
        .eq('id', groupId);

      if (isJoined) {
        await supabase.from('group_memberships').insert({ group_id: groupId, user_id: userId });
      } else {
        await supabase.from('group_memberships').delete().eq('group_id', groupId).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('[Supabase] Error en membresía de grupo:', err);
    }
  },

  subscribeToGroups(_onUpdate: any) {
    return () => {};
  },

  async fetchChats(): Promise<ChatThread[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: threads, error: threadErr } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (threadErr || !threads || threads.length === 0) {
        return [];
      }

      const { data: messages, error: msgErr } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      const msgByThread = new Map<string, any[]>();
      if (!msgErr && messages) {
        messages.forEach((m) => {
          if (!msgByThread.has(m.thread_id)) {
            msgByThread.set(m.thread_id, []);
          }
          msgByThread.get(m.thread_id)!.push(m);
        });
      }

      return threads.map((t) => mapChatThreadFromDb(t, msgByThread.get(t.id) || []));
    } catch {
      return [];
    }
  },

  async createChatThread(_thread: ChatThread): Promise<boolean> {
    return true;
  },

  async sendChatMessage(_threadId: string, _message: any): Promise<boolean> {
    return true;
  },

  subscribeToChat(_onNewMessage: any, _onThreadUpdate: any) {
    return () => {};
  },

  /**
   * Búsqueda de usuarios con cálculo de estado de amistad (none, pending_sent, pending_received, friends)
   */
  async searchUsers(query: string, currentUserId?: string): Promise<UserSearchResult[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const term = (query || '').trim();
      let req = supabase.from('profiles').select('id, user_id, username, full_name, avatar_url, university, career, faculty');

      if (currentUserId) {
        req = req.neq('user_id', currentUserId);
      }

      if (term) {
        req = req.or(`username.ilike.%${term}%,full_name.ilike.%${term}%,career.ilike.%${term}%,university.ilike.%${term}%`);
      }

      const { data: profiles, error: profileErr } = await req.limit(40);
      if (profileErr || !profiles) {
        console.warn('[Supabase] Error consultando perfiles:', profileErr);
        return [];
      }

      // Si no hay usuario autenticado (ej. invitado), retornan con 'none'
      if (!currentUserId) {
        return profiles.map((p) => ({
          id: p.user_id || p.id,
          user_id: p.user_id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          university: p.university,
          career: p.career,
          faculty: p.faculty,
          friendship_status: 'none',
        }));
      }

      // Obtener solicitudes y amistades existentes del usuario actual
      const { data: requests } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      const requestMap = new Map<string, { status: string; id: string; sender_id: string }>();
      (requests || []).forEach((r) => {
        const otherUserId = r.sender_id === currentUserId ? r.receiver_id : r.sender_id;
        requestMap.set(otherUserId, { status: r.status, id: r.id, sender_id: r.sender_id });
      });

      return profiles.map((p) => {
        const otherId = p.user_id || p.id;
        const reqInfo = requestMap.get(otherId);
        let friendship_status: 'none' | 'pending_sent' | 'pending_received' | 'friends' = 'none';

        if (reqInfo) {
          if (reqInfo.status === 'accepted') {
            friendship_status = 'friends';
          } else if (reqInfo.status === 'pending') {
            friendship_status = reqInfo.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
          }
        }

        return {
          id: otherId,
          user_id: p.user_id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          university: p.university,
          career: p.career,
          faculty: p.faculty,
          friendship_status,
          request_id: reqInfo?.id,
        };
      });
    } catch (err) {
      console.warn('[Supabase] Error en searchUsers:', err);
      return [];
    }
  },

  /**
   * Enviar solicitud de amistad
   */
  async sendFriendRequest(senderId: string, receiverId: string, senderName?: string): Promise<{ success: boolean; request_id?: string; message?: string }> {
    if (!isSupabaseConfigured()) return { success: false, message: 'Supabase no configurado' };
    if (!senderId || !receiverId || senderId === receiverId) {
      return { success: false, message: 'No puedes enviarte una solicitud a ti mismo.' };
    }

    try {
      // Verificar si ya existe un registro previo
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('id, status, sender_id, receiver_id')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: true, message: 'Ya son amigos.' };
        }
        if (existing.status === 'pending') {
          return { success: true, request_id: existing.id, message: 'Ya existe una solicitud pendiente.' };
        }
        // Si fue cancelada o rechazada, reactivarla
        const { error: updErr } = await supabase
          .from('friend_requests')
          .update({
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updErr) throw updErr;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('friend_requests')
          .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending',
          })
          .select('id')
          .single();

        if (insErr) throw insErr;
      }

      // Enviar notificación al receptor
      await this.createNotification({
        userId: receiverId,
        actorId: senderId,
        type: 'FRIEND_REQUEST',
        title: 'Nueva solicitud de amistad',
        body: `${senderName || 'Un estudiante'} te ha enviado una solicitud de amistad.`,
        entityType: 'friend_request',
      });

      return { success: true };
    } catch (err: any) {
      console.error('[Supabase] Error enviando solicitud de amistad:', err);
      return { success: false, message: err.message || 'Error al enviar la solicitud.' };
    }
  },

  /**
   * Aceptar solicitud de amistad
   */
  async acceptFriendRequest(requestId: string, senderId: string, receiverId: string, receiverName?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      let query = supabase.from('friend_requests').update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      });

      if (requestId) {
        query = query.eq('id', requestId);
      } else {
        query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);
      }

      const { error } = await query;
      if (error) throw error;

      // Establecer seguimiento bidireccional en user_follows para que el Feed muestre publicaciones
      await Promise.allSettled([
        supabase.from('user_follows').upsert({ follower_id: senderId, followed_id: receiverId }, { onConflict: 'follower_id,followed_id' }),
        supabase.from('user_follows').upsert({ follower_id: receiverId, followed_id: senderId }, { onConflict: 'follower_id,followed_id' }),
      ]);

      // Notificar al solicitante original
      await this.createNotification({
        userId: senderId,
        actorId: receiverId,
        type: 'FRIEND_ACCEPTED',
        title: '¡Solicitud aceptada!',
        body: `${receiverName || 'Un compañero'} ha aceptado tu solicitud de amistad.`,
        entityType: 'friend_request',
      });

      return true;
    } catch (err) {
      console.error('[Supabase] Error aceptando solicitud de amistad:', err);
      return false;
    }
  },

  /**
   * Rechazar solicitud de amistad
   */
  async rejectFriendRequest(requestId: string, senderId?: string, receiverId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      let query = supabase.from('friend_requests').update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      });

      if (requestId) {
        query = query.eq('id', requestId);
      } else if (senderId && receiverId) {
        query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);
      }

      const { error } = await query;
      return !error;
    } catch (err) {
      console.error('[Supabase] Error rechazando solicitud:', err);
      return false;
    }
  },

  /**
   * Cancelar solicitud enviada
   */
  async cancelFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending');

      return !error;
    } catch (err) {
      console.error('[Supabase] Error cancelando solicitud:', err);
      return false;
    }
  },

  /**
   * Eliminar amistad
   */
  async removeFriend(userId1: string, userId2: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      await supabase
        .from('friend_requests')
        .delete()
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

      await Promise.allSettled([
        supabase.from('user_follows').delete().eq('follower_id', userId1).eq('followed_id', userId2),
        supabase.from('user_follows').delete().eq('follower_id', userId2).eq('followed_id', userId1),
      ]);

      return true;
    } catch (err) {
      console.error('[Supabase] Error eliminando amistad:', err);
      return false;
    }
  },

  /**
   * Listar solicitudes pendientes de un usuario
   */
  async getFriendRequests(userId: string): Promise<{ received: FriendRequest[]; sent: FriendRequest[] }> {
    if (!isSupabaseConfigured() || !userId) return { received: [], sent: [] };

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status, created_at, updated_at')
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data) return { received: [], sent: [] };

      const userIds = Array.from(new Set(data.map((r) => r.sender_id === userId ? r.receiver_id : r.sender_id)));
      let profileMap = new Map();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, full_name, avatar_url, career, university')
          .in('user_id', userIds);
        profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      }

      const received: FriendRequest[] = [];
      const sent: FriendRequest[] = [];

      data.forEach((item) => {
        const otherProfile = profileMap.get(item.sender_id === userId ? item.receiver_id : item.sender_id);
        const reqObj: FriendRequest = {
          id: item.id,
          sender_id: item.sender_id,
          receiver_id: item.receiver_id,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sender_profile: item.sender_id === userId ? undefined : otherProfile,
          receiver_profile: item.receiver_id === userId ? undefined : otherProfile,
        };

        if (item.receiver_id === userId) {
          received.push(reqObj);
        } else {
          sent.push(reqObj);
        }
      });

      return { received, sent };
    } catch (err) {
      console.warn('[Supabase] Error obteniendo solicitudes:', err);
      return { received: [], sent: [] };
    }
  },

  /**
   * Obtener lista de amigos confirmados
   */
  async getFriends(userId: string): Promise<UserSearchResult[]> {
    if (!isSupabaseConfigured() || !userId) return [];

    try {
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error || !requests || requests.length === 0) return [];

      const friendIds = requests.map((r) => r.sender_id === userId ? r.receiver_id : r.sender_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, username, full_name, avatar_url, university, career, faculty')
        .in('user_id', friendIds);

      return (profiles || []).map((p) => ({
        id: p.user_id || p.id,
        user_id: p.user_id,
        username: p.username,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        university: p.university,
        career: p.career,
        faculty: p.faculty,
        friendship_status: 'friends',
      }));
    } catch (err) {
      console.warn('[Supabase] Error obteniendo amigos:', err);
      return [];
    }
  },

  /**
   * Crear notificación en Supabase
   */
  async createNotification(params: {
    userId: string;
    actorId?: string;
    type: string;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      await supabase.from('notifications').insert({
        user_id: params.userId,
        actor_id: params.actorId || null,
        type: params.type,
        title: params.title,
        body: params.body,
        entity_type: params.entityType || null,
        entity_id: params.entityId || null,
        is_read: false,
      });
      return true;
    } catch (err) {
      console.warn('[Supabase] Error creando notificación:', err);
      return false;
    }
  },

  /**
   * Obtener notificaciones del usuario
   */
  async fetchNotifications(userId: string): Promise<CampusNotification[]> {
    if (!isSupabaseConfigured() || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data) return [];

      const actorIds = Array.from(new Set(data.map((n) => n.actor_id).filter(Boolean)));
      let actorMap = new Map();
      if (actorIds.length > 0) {
        const { data: actors } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, username')
          .in('user_id', actorIds);
        actorMap = new Map((actors || []).map((a) => [a.user_id, a]));
      }

      return data.map((item) => {
        const actor = actorMap.get(item.actor_id);
        return {
          id: item.id,
          user_id: item.user_id,
          actor_id: item.actor_id,
          type: item.type,
          title: item.title,
          body: item.body,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          data: item.data,
          is_read: Boolean(item.is_read),
          created_at: item.created_at,
          actor_name: actor?.full_name,
          actor_avatar: actor?.avatar_url,
          actor_username: actor?.username,
        };
      });
    } catch (err) {
      console.warn('[Supabase] Error obteniendo notificaciones:', err);
      return [];
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      return !error;
    } catch {
      return false;
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !userId) return false;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  },

  subscribeToFriendRequests(userId: string, onChange: () => void) {
    if (!isSupabaseConfigured() || !userId) return () => {};

    const channel = supabase
      .channel(`realtime-friend-requests-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friend_requests' },
        (payload: any) => {
          const rec = payload.new || payload.old;
          if (rec && (rec.sender_id === userId || rec.receiver_id === userId)) {
            onChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToNotifications(userId: string, onNewNotification: (notif: CampusNotification) => void) {
    if (!isSupabaseConfigured() || !userId) return () => {};

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const item = payload.new;
          if (item) {
            onNewNotification({
              id: item.id,
              user_id: item.user_id,
              actor_id: item.actor_id,
              type: item.type,
              title: item.title,
              body: item.body,
              entity_type: item.entity_type,
              entity_id: item.entity_id,
              data: item.data,
              is_read: false,
              created_at: item.created_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
