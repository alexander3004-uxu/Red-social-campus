/**
 * src/services/supabaseDataService.ts
 * Servicio Base para conectar la Red Social con Supabase en Tiempo Real.
 * 
 * 🎓 PROYECTO EDUCATIVO (STARTER KIT):
 * - Tablas activas en Supabase: `posts`, `users`, `profiles`.
 * - Las demás funcionalidades (Market, Grupos, Historias, Chat) usan datos locales
 *   para que los estudiantes implementen sus propias tablas y endpoints como práctica.
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

// Mapeadores para Publicaciones (DB snake_case <-> App camelCase)
export function mapPostFromDb(row: any): Post {
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
    isLiked: false,
    isSaved: false,
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

export const supabaseDataService = {
  // ============================================================================
  // 1. PUBLICACIONES (POSTS) - CONECTADO A SUPABASE EN TIEMPO REAL
  // ============================================================================

  async fetchPosts(_userId?: string): Promise<Post[]> {
    if (!isSupabaseConfigured()) {
      return INITIAL_POSTS;
    }

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !postsData || postsData.length === 0) {
        return INITIAL_POSTS;
      }

      return postsData.map(mapPostFromDb);
    } catch {
      return INITIAL_POSTS;
    }
  },

  async createPost(post: Post, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const row = mapPostToDb(post, userId);
      const { error } = await supabase.from('posts').insert(row);
      return !error;
    } catch {
      return false;
    }
  },

  async toggleLikePost(postId: string, _userId: string, _nextLiked: boolean, nextLikes: number): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('posts').update({ likes: nextLikes }).eq('id', postId);
    } catch (err) {
      console.warn('[Supabase] Error actualizando like:', err);
    }
  },

  async toggleSavePost(_postId: string, _userId: string, _nextSaved: boolean): Promise<void> {
    // Espacio para que los estudiantes creen la tabla post_saves
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
  // 2. MÓDULOS PARA DESARROLLO DE LOS ESTUDIANTES (MOCK LOCAL)
  // ============================================================================

  async fetchStories(): Promise<Story[]> {
    return STORIES;
  },

  subscribeToStories(_onInsert: (story: Story) => void) {
    return () => {};
  },

  async fetchMarketItems(_userId?: string): Promise<MarketItem[]> {
    return INITIAL_MARKET_ITEMS;
  },

  async createMarketItem(_item: MarketItem, _userId?: string): Promise<boolean> {
    // Espacio para que los estudiantes creen la tabla market_items
    return true;
  },

  async toggleMarketFav(_itemId: string, _userId: string, _nextFav: boolean): Promise<void> {
    // Espacio para que los estudiantes creen la tabla market_favorites
  },

  subscribeToMarket(_onInsert: any, _onUpdate: any) {
    return () => {};
  },

  async fetchGroups(_userId?: string): Promise<CommunityGroup[]> {
    return COMMUNITY_GROUPS;
  },

  async toggleJoinGroup(_groupId: string, _userId: string, _isJoined: boolean, _nextCount: number): Promise<void> {
    // Espacio para que los estudiantes creen la tabla community_groups
  },

  subscribeToGroups(_onUpdate: any) {
    return () => {};
  },

  async fetchChats(): Promise<ChatThread[]> {
    return INITIAL_CHATS;
  },

  async createChatThread(_thread: ChatThread): Promise<boolean> {
    // Espacio para que los estudiantes creen la tabla chat_threads
    return true;
  },

  async sendChatMessage(_threadId: string, _message: any): Promise<boolean> {
    // Espacio para que los estudiantes creen la tabla chat_messages
    return true;
  },

  subscribeToChat(_onNewMessage: any, _onThreadUpdate: any) {
    return () => {};
  },
};
