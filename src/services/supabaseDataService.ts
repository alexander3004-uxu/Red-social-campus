/**
 * src/services/supabaseDataService.ts
 * Servicio Base de la Red Social Campus.
 * 
 * 🎓 PROYECTO EDUCATIVO (STARTER KIT):
 * - La base de datos solo almacena `users` y `profiles` para el login de los usuarios demo.
 * - Las publicaciones, market, grupos, historias y chats funcionan en memoria local
 *   para que los alumnos construyan las tablas y su lógica de persistencia.
 */

import { Post, Story, MarketItem, CommunityGroup, ChatThread } from '../types';
import {
  INITIAL_POSTS,
  STORIES,
  INITIAL_MARKET_ITEMS,
  COMMUNITY_GROUPS,
  INITIAL_CHATS,
} from '../data/mockData';

export const supabaseDataService = {
  // ============================================================================
  // 1. PUBLICACIONES (POSTS) - MOCK LOCAL (Asignación para estudiantes)
  // ============================================================================

  async fetchPosts(_userId?: string): Promise<Post[]> {
    return INITIAL_POSTS;
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
    return STORIES;
  },

  subscribeToStories(_onInsert: (story: Story) => void) {
    return () => {};
  },

  async fetchMarketItems(_userId?: string): Promise<MarketItem[]> {
    return INITIAL_MARKET_ITEMS;
  },

  async createMarketItem(_item: MarketItem, _userId?: string): Promise<boolean> {
    return true;
  },

  async toggleMarketFav(_itemId: string, _userId: string, _nextFav: boolean): Promise<void> {
  },

  subscribeToMarket(_onInsert: any, _onUpdate: any) {
    return () => {};
  },

  async fetchGroups(_userId?: string): Promise<CommunityGroup[]> {
    return COMMUNITY_GROUPS;
  },

  async toggleJoinGroup(_groupId: string, _userId: string, _isJoined: boolean, _nextCount: number): Promise<void> {
  },

  subscribeToGroups(_onUpdate: any) {
    return () => {};
  },

  async fetchChats(): Promise<ChatThread[]> {
    return INITIAL_CHATS;
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
};
