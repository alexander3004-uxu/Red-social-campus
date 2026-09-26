/**
 * src/lib/supabase.ts
 * Cliente oficial de Supabase para el Frontend (React / Vite).
 * 
 * Configuración requerida en archivo .env:
 * - VITE_SUPABASE_URL: URL de tu proyecto en Supabase (ej. https://xyzcompany.supabase.co)
 * - VITE_SUPABASE_ANON_KEY: Clave pública 'anon' de tu proyecto en Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

/**
 * Valida si las credenciales de Supabase han sido configuradas
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://TU_PROYECTO_SUPABASE.supabase.co' &&
    !supabaseUrl.includes('TU_PROYECTO') &&
    supabaseAnonKey !== 'TU_SUPABASE_ANON_KEY'
  );
};

// Instancia de Supabase Client (singleton)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper para obtener el usuario autenticado actualmente en Supabase
 */
export async function getSupabaseUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Helper para subir imágenes/archivos a Supabase Storage
 * @param bucket Nombre del bucket (ej. 'avatars', 'posts', 'documents')
 * @param path Ruta y nombre de archivo dentro del bucket
 * @param file Archivo Blob o File
 */
export async function uploadSupabaseFile(bucket: string, path: string, file: File | Blob) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado. Revisa tu archivo .env');
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
