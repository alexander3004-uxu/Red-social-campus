/**
 * src/services/supabaseDataService.ts
 * Servicio centralizado para interactuar con Supabase en Tiempo Real.
 * Gestiona consultas, inserciones, actualizaciones y suscripciones Realtime (WebSocket)
 * para Publicaciones, Historias, Marketplace, Grupos y Mensajes.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Story, MarketItem, CommunityGroup, ChatThread } from '../types';
import {
  INITIAL_POSTS,
  STORIES,
  INITIAL_MARKET_ITEMS,
  COMMUNITY_GROUPS,
  INITIAL_CHATS,
} from '../data/mockData';

// Mapeadores de datos (DB snake_case <-> App camelCase)

export function mapPostFromDb(row: any, currentUserId?: string, userLikes = new Set<string>(), userSaves = new Set<string>()): Post {
  return {
    id: row.id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar || '',
    authorTag: row.author_tag || '',
    authorTagColor: row.author_tag_color || 'bg-primary-fixed text-primary',
    timeAgo: row.time_ago || 'Ahora',
    verified: Boolean(row.verified),
    content: row.content,
    pdfAttachment: row.pdf_attachment || undefined,
    poll: row.poll || undefined,
    event: row.event || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    likes: Number(row.likes) || 0,
    comments: Number(row.comments) || 0,
    shares: Number(row.shares) || 0,
    isLiked: userLikes.has(row.id),
    isSaved: userSaves.has(row.id),
  };
}

export function mapPostToDb(post: Post, userId?: string) {
  return {
    id: post.id,
    author_name: post.authorName,
    author_avatar: post.authorAvatar,
    author_tag: post.authorTag,
    author_tag_color: post.authorTagColor,
    time_ago: post.timeAgo || 'Justo ahora',
    verified: post.verified || false,
    content: post.content,
    pdf_attachment: post.pdfAttachment || null,
    poll: post.poll || null,
    event: post.event || null,
    tags: post.tags || [],
    likes: post.likes || 0,
    comments: post.comments || 0,
    shares: post.shares || 0,
    user_id: userId || null,
  };
}

export function mapStoryFromDb(row: any): Story {
  return {
    id: row.id,
    title: row.title,
    userName: row.user_name,
    avatarUrl: row.avatar_url || '',
    storyImage: row.story_image,
    isAdd: Boolean(row.is_add),
    timeAgo: row.time_ago || 'Ahora',
  };
}

export function mapStoryToDb(story: Story) {
  return {
    id: story.id,
    title: story.title,
    user_name: story.userName,
    avatar_url: story.avatarUrl,
    story_image: story.storyImage,
    is_add: story.isAdd || false,
    time_ago: story.timeAgo || 'Ahora',
  };
}

export function mapMarketItemFromDb(row: any, userFavs = new Set<string>()): MarketItem {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price) || 0,
    image: row.image || '',
    faculty: row.faculty || '',
    location: row.location || '',
    rating: Number(row.rating) || 5.0,
    seller: row.seller,
    sellerAvatar: row.seller_avatar || '',
    condition: row.condition || 'Excelente',
    conditionColor: row.condition_color || 'bg-[#6ffbbe]/25 text-[#005338]',
    category: row.category || 'General',
    isDonation: Boolean(row.is_donation),
    isNewToday: Boolean(row.is_new_today),
    description: row.description || '',
    isFav: userFavs.has(row.id),
  };
}

export function mapMarketItemToDb(item: MarketItem, userId?: string) {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    image: item.image,
    faculty: item.faculty,
    location: item.location,
    rating: item.rating || 5.0,
    seller: item.seller,
    seller_avatar: item.sellerAvatar || '',
    condition: item.condition,
    condition_color: item.conditionColor || '',
    category: item.category,
    is_donation: item.isDonation || false,
    is_new_today: item.isNewToday !== false,
    description: item.description || '',
    seller_id: userId || null,
  };
}

export function mapGroupFromDb(row: any, userMemberships = new Set<string>()): CommunityGroup {
  return {
    id: row.id,
    title: row.title,
    categoryTag: row.category_tag || '',
    categoryColor: row.category_color || 'bg-primary-fixed text-primary',
    badgeTag: row.badge_tag || '',
    description: row.description || '',
    membersCount: Number(row.members_count) || 1,
    activityNote: row.activity_note || '',
    activityIcon: row.activity_icon || 'forum',
    activityColor: row.activity_color || 'text-secondary',
    image: row.image || '',
    type: (row.type as 'materias' | 'clubes' | 'carrera') || 'clubes',
    isJoined: userMemberships.has(row.id),
  };
}

export function mapChatThreadFromDb(row: any, messages: any[] = []): ChatThread {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar || '',
    isOnline: Boolean(row.is_online),
    category: row.category || 'general',
    badge: row.badge || '',
    badgeType: row.badge_type || '',
    lastMessage: row.last_message || '',
    time: row.time || 'Ahora',
    unreadCount: Number(row.unread_count) || 0,
    productInfo: row.product_info || undefined,
    groupInfo: row.group_info || undefined,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender as 'me' | 'them',
      text: m.text,
      time: m.time || 'Ahora',
    })),
  };
}

/**
 * SERVICIO PRINCIPAL DE DATOS SUPABASE
 */
export const supabaseDataService = {
  // ============================================================================
  // POSTS (PUBLICACIONES)
  // ============================================================================

  async fetchPosts(userId?: string): Promise<Post[]> {
    if (!isSupabaseConfigured()) {
      return INITIAL_POSTS;
    }

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !postsData) {
        console.warn('[Supabase] Error cargando posts:', error?.message);
        return INITIAL_POSTS;
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
      return INITIAL_POSTS;
    }
  },

  async createPost(post: Post, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const row = mapPostToDb(post, userId);
      const { error } = await supabase.from('posts').insert(row);
      if (error) {
        console.error('[Supabase] Error al insertar post:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Excepción al crear post:', err);
      return false;
    }
  },

  async toggleLikePost(postId: string, userId: string, nextLiked: boolean, nextLikes: number): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      // Actualizar contador en post
      await supabase.from('posts').update({ likes: nextLikes }).eq('id', postId);

      if (nextLiked) {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('[Supabase] Error actualizando like:', err);
    }
  },

  async toggleSavePost(postId: string, userId: string, nextSaved: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      if (nextSaved) {
        await supabase.from('post_saves').insert({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('[Supabase] Error actualizando post guardado:', err);
    }
  },

  async updatePostPoll(postId: string, pollData: any): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('posts').update({ poll: pollData }).eq('id', postId);
    } catch (err) {
      console.warn('[Supabase] Error actualizando encuesta:', err);
    }
  },

  async updatePostEvent(postId: string, eventData: any): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('posts').update({ event: eventData }).eq('id', postId);
    } catch (err) {
      console.warn('[Supabase] Error actualizando evento:', err);
    }
  },

  subscribeToPosts(
    onInsert: (post: Post) => void,
    onUpdate: (post: Post) => void,
    onDelete: (id: string) => void
  ) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            onInsert(mapPostFromDb(payload.new));
          } else if (payload.eventType === 'UPDATE') {
            onUpdate(mapPostFromDb(payload.new));
          } else if (payload.eventType === 'DELETE') {
            onDelete(payload.old.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============================================================================
  // STORIES (HISTORIAS)
  // ============================================================================

  async fetchStories(): Promise<Story[]> {
    if (!isSupabaseConfigured()) return STORIES;

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return STORIES;
      }
      return data.map(mapStoryFromDb);
    } catch {
      return STORIES;
    }
  },

  async createStory(story: Story): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const row = mapStoryToDb(story);
      const { error } = await supabase.from('stories').insert(row);
      return !error;
    } catch {
      return false;
    }
  },

  subscribeToStories(onInsert: (story: Story) => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime-stories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stories' },
        (payload) => {
          onInsert(mapStoryFromDb(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============================================================================
  // MARKETPLACE
  // ============================================================================

  async fetchMarketItems(userId?: string): Promise<MarketItem[]> {
    if (!isSupabaseConfigured()) return INITIAL_MARKET_ITEMS;

    try {
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_MARKET_ITEMS;
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
      return INITIAL_MARKET_ITEMS;
    }
  },

  async createMarketItem(item: MarketItem, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const row = mapMarketItemToDb(item, userId);
      const { error } = await supabase.from('market_items').insert(row);
      return !error;
    } catch {
      return false;
    }
  },

  async toggleMarketFav(itemId: string, userId: string, nextFav: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      if (nextFav) {
        await supabase.from('market_favorites').insert({ item_id: itemId, user_id: userId });
      } else {
        await supabase.from('market_favorites').delete().eq('item_id', itemId).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('[Supabase] Error en favorito de market:', err);
    }
  },

  subscribeToMarket(
    onInsert: (item: MarketItem) => void,
    onUpdate: (item: MarketItem) => void
  ) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime-market')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            onInsert(mapMarketItemFromDb(payload.new));
          } else if (payload.eventType === 'UPDATE') {
            onUpdate(mapMarketItemFromDb(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============================================================================
  // COMUNIDADES / GRUPOS
  // ============================================================================

  async fetchGroups(userId?: string): Promise<CommunityGroup[]> {
    if (!isSupabaseConfigured()) return COMMUNITY_GROUPS;

    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return COMMUNITY_GROUPS;
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
      return COMMUNITY_GROUPS;
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

  subscribeToGroups(onUpdate: (group: CommunityGroup) => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime-groups')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_groups' },
        (payload) => {
          onUpdate(mapGroupFromDb(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============================================================================
  // CHAT Y MENSAJES EN TIEMPO REAL
  // ============================================================================

  async fetchChats(): Promise<ChatThread[]> {
    if (!isSupabaseConfigured()) return INITIAL_CHATS;

    try {
      const { data: threads, error: threadErr } = await supabase
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (threadErr || !threads || threads.length === 0) {
        return INITIAL_CHATS;
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
      return INITIAL_CHATS;
    }
  },

  async createChatThread(thread: ChatThread): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase.from('chat_threads').insert({
        id: thread.id,
        name: thread.name,
        avatar: thread.avatar,
        is_online: thread.isOnline || false,
        category: thread.category,
        badge: thread.badge || '',
        badge_type: thread.badgeType || '',
        last_message: thread.lastMessage,
        time: thread.time,
        unread_count: thread.unreadCount || 0,
        product_info: thread.productInfo || null,
        group_info: thread.groupInfo || null,
      });

      if (!error && thread.messages.length > 0) {
        const msgs = thread.messages.map((m) => ({
          id: m.id,
          thread_id: thread.id,
          sender: m.sender,
          text: m.text,
          time: m.time,
        }));
        await supabase.from('chat_messages').insert(msgs);
      }
      return !error;
    } catch {
      return false;
    }
  },

  async sendChatMessage(
    threadId: string,
    message: { id: string; sender: 'me' | 'them'; text: string; time: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      await Promise.all([
        supabase.from('chat_messages').insert({
          id: message.id,
          thread_id: threadId,
          sender: message.sender,
          text: message.text,
          time: message.time,
        }),
        supabase.from('chat_threads').update({
          last_message: message.text,
          time: message.time,
          updated_at: new Date().toISOString(),
        }).eq('id', threadId),
      ]);
      return true;
    } catch (err) {
      console.warn('[Supabase] Error enviando mensaje de chat:', err);
      return false;
    }
  },

  subscribeToChat(
    onNewMessage: (message: { id: string; thread_id: string; sender: 'me' | 'them'; text: string; time: string }) => void,
    onThreadUpdate: (thread: any) => void
  ) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          onNewMessage({
            id: payload.new.id,
            thread_id: payload.new.thread_id,
            sender: payload.new.sender,
            text: payload.new.text,
            time: payload.new.time,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_threads' },
        (payload) => {
          onThreadUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
