/**
 * server/services/supabase.js
 * Cliente y Servicio de Supabase para el Backend (Node.js / Express).
 * 
 * Permite realizar operaciones con privilegios de administrador (Service Role Key)
 * o con la clave anónima (Anon Key), así como consultas directas y gestión de archivos.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Se prefiere el SERVICE_ROLE_KEY en el servidor para bypass de RLS cuando sea necesario, o ANON_KEY como fallback
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Comprueba si las variables de entorno de Supabase están configuradas en el servidor
 */
export const isSupabaseServerConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'https://TU_PROYECTO_SUPABASE.supabase.co' &&
    !supabaseUrl.includes('TU_PROYECTO') &&
    supabaseKey !== 'TU_SUPABASE_ANON_KEY' &&
    supabaseKey !== 'TU_SUPABASE_SERVICE_ROLE_KEY'
  );
};

export const supabaseServer = isSupabaseServerConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Helper para verificar la conexión con Supabase desde el backend
 */
export async function testSupabaseConnection() {
  if (!supabaseServer) {
    return {
      connected: false,
      message: 'Supabase no está configurado en las variables de entorno.',
    };
  }

  try {
    const { data, error } = await supabaseServer.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, message: 'Conexión a Supabase establecida correctamente.' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
