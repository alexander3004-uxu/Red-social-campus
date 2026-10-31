import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Valida si las credenciales de Supabase han sido configuradas correctamente
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

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Inicia el flujo de autenticación con Google mediante Supabase OAuth.
 * Redirige al usuario al consentimiento de Google y luego de vuelta a la app.
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Cierra la sesión activa en Supabase.
 */
export const signOutFromSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};
