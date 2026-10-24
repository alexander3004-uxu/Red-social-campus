/**
 * src/context/AuthContext.tsx
 * Proveedor de Contexto Global de Autenticación, Sesiones y Perfiles.
 * Maneja el ciclo de vida del usuario registrado, autenticación por contraseña y perfiles.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { supabase, isSupabaseConfigured, uploadSupabaseFile } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  role: 'guest' | 'student' | 'professor' | 'admin';
  is_verified?: boolean;
  isGuest?: boolean;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  university?: string;
  faculty?: string;
  career?: string;
  semester?: string;
  student_id?: string;
  reputation?: number;
  social_links?: Array<{ platform: string; url: string }>;
  email?: string;
  role?: string;
  is_verified?: boolean;
  profile_completed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  role: 'guest' | 'student' | 'professor' | 'admin' | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  guestSessionId: string | null;
  // Modal de upgrade para invitados
  isUpgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  // Acciones de autenticación
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (formData: any) => Promise<any>;
  loginAsGuest: () => Promise<any>;
  logout: () => Promise<void>;
  // Gestión de perfil
  updateProfile: (patchData: Partial<UserProfile>) => Promise<UserProfile>;
  uploadAvatar: (file: File) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  // Guard de acciones de invitado
  requireAuthAction: (actionCallback: () => void, featureName?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => apiClient.getToken());
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('campus_guest_session_id');
    } catch {
      return null;
    }
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  const openUpgradeModal = (featureName?: string) => {
    setUpgradeModalFeature(featureName || 'esta funcionalidad');
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalFeature(null);
  };

  /**
   * Validador interactivo: Si el usuario es invitado, abre el modal de conversión;
   * si es usuario registrado, ejecuta la acción inmediatamente.
   */
  const requireAuthAction = (actionCallback: () => void, featureName?: string): boolean => {
    if (!user || user.role === 'guest' || user.isGuest) {
      openUpgradeModal(featureName);
      return false;
    }
    actionCallback();
    return true;
  };

  /**
   * Inicialización: verificar si hay sesión activa al cargar la aplicación
   */
  /**
   * Inicialización: verificar si hay sesión activa al cargar la aplicación (Supabase o Fallback)
   */
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      // 1. Prioridad: Supabase Auth si está configurado en .env
      if (isSupabaseConfigured()) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            if (isMounted) {
              setUser(null);
              setProfile(null);
              setToken(null);
              setIsInitialLoading(false);
            }
            return;
          }

          const sbUser = session.user;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', sbUser.id)
            .maybeSingle();

          const activeProfile: UserProfile = profileData || {
            user_id: sbUser.id,
            username: sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'estudiante',
            full_name: sbUser.user_metadata?.full_name || 'Estudiante Campus',
            university: sbUser.user_metadata?.university || '',
            faculty: sbUser.user_metadata?.faculty || '',
            career: sbUser.user_metadata?.career || '',
            semester: sbUser.user_metadata?.semester || '',
            profile_completed: true,
          };

          if (isMounted) {
            setUser({
              id: sbUser.id,
              email: sbUser.email || '',
              role: (sbUser.user_metadata?.role as any) || 'student',
              is_verified: Boolean(sbUser.email_confirmed_at),
              isGuest: false,
            });
            setProfile(activeProfile);
            setToken(session.access_token);
            apiClient.setToken(session.access_token);
          }
        } catch (e) {
          console.warn('[Supabase Auth] Error al verificar sesión:', e);
        } finally {
          if (isMounted) setIsInitialLoading(false);
        }
        return;
      }

      // 2. Fallback: API Local / Express
      try {
        const storedToken = apiClient.getToken();
        if (!storedToken) {
          if (isMounted) setIsInitialLoading(false);
          return;
        }

        const data = await apiClient.auth.getMe();
        if (isMounted && data && data.success) {
          setUser(data.user);
          setProfile(data.profile);
          setToken(storedToken);
          if (data.isGuest) {
            setGuestSessionId(data.user.id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          apiClient.setToken(null);
          setUser(null);
          setProfile(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    }

    checkSession();

    // Suscribirse a cambios en tiempo real del estado de autenticación de Supabase
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setProfile(null);
          setToken(null);
          apiClient.setToken(null);
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          const sbUser = session.user;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', sbUser.id)
            .maybeSingle();

          const activeProfile: UserProfile = profileData || {
            user_id: sbUser.id,
            username: sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'estudiante',
            full_name: sbUser.user_metadata?.full_name || 'Estudiante Campus',
            university: sbUser.user_metadata?.university || '',
            faculty: sbUser.user_metadata?.faculty || '',
            career: sbUser.user_metadata?.career || '',
            semester: sbUser.user_metadata?.semester || '',
            profile_completed: true,
          };

          setUser({
            id: sbUser.id,
            email: sbUser.email || '',
            role: (sbUser.user_metadata?.role as any) || 'student',
            is_verified: Boolean(sbUser.email_confirmed_at),
            isGuest: false,
          });
          setProfile(activeProfile);
          setToken(session.access_token);
          apiClient.setToken(session.access_token);
        }
      });
      authSubscription = subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  /**
   * Inicio de Sesión Tradicional (Supabase Auth / Local Fallback)
   */
  const loginWithEmail = async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          let msg = error.message;
          if (msg.includes('Invalid login credentials')) {
            msg = 'Correo electrónico o contraseña incorrectos en Supabase.';
          } else if (msg.includes('Email not confirmed')) {
            msg = 'Por favor, confirma tu correo electrónico antes de ingresar (o desactiva Confirm email en Supabase Auth).';
          }
          throw new Error(msg);
        }

        const sbUser = data.user;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', sbUser.id)
          .maybeSingle();

        let activeProfile: UserProfile = profileData;
        if (!activeProfile) {
          activeProfile = {
            user_id: sbUser.id,
            username: sbUser.user_metadata?.username || email.split('@')[0],
            full_name: sbUser.user_metadata?.full_name || 'Estudiante Campus',
            university: sbUser.user_metadata?.university || '',
            faculty: sbUser.user_metadata?.faculty || '',
            career: sbUser.user_metadata?.career || '',
            semester: sbUser.user_metadata?.semester || '',
            profile_completed: true,
          };
          try {
            await supabase.from('profiles').upsert(activeProfile, { onConflict: 'user_id' });
          } catch {}
        }

        const userObj: User = {
          id: sbUser.id,
          email: sbUser.email || email,
          role: 'student',
          is_verified: Boolean(sbUser.email_confirmed_at),
          isGuest: false,
        };

        apiClient.setToken(data.session.access_token);
        setToken(data.session.access_token);
        setUser(userObj);
        setProfile(activeProfile);
        setGuestSessionId(null);
        try {
          localStorage.removeItem('campus_guest_session_id');
        } catch {}

        return { success: true, user: userObj, profile: activeProfile, token: data.session.access_token };
      }

      // Fallback a API local Express
      const res = await apiClient.auth.login({ email, password, rememberMe });
      if (res && res.success) {
        apiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setGuestSessionId(null);
        try {
          localStorage.removeItem('campus_guest_session_id');
        } catch {}
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro Tradicional (Supabase Auth / Local Fallback)
   */
  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { email, password, full_name, username, university, faculty, career, semester } = formData;
        const cleanUsername = (username || email.split('@')[0]).replace(/^@/, '').toLowerCase().trim();

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name,
              username: cleanUsername,
              university: university || '',
              faculty: faculty || '',
              career: career || '',
              semester: semester || '',
            },
          },
        });

        if (error) {
          let msg = error.message;
          if (msg.includes('User already registered')) {
            msg = 'Ya existe una cuenta universitaria registrada con este correo en Supabase.';
          } else if (msg.includes('Password should be')) {
            msg = 'La contraseña debe tener al menos 8 caracteres.';
          }
          throw new Error(msg);
        }

        if (!data.user) {
          throw new Error('No se pudo crear la cuenta en Supabase.');
        }

        const newProfile: UserProfile = {
          user_id: data.user.id,
          username: cleanUsername,
          full_name: full_name || 'Estudiante Universitario',
          bio: '',
          avatar_url: '',
          banner_url: '',
          university: university || '',
          faculty: faculty || '',
          career: career || '',
          semester: semester || '',
          student_id: `UC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          reputation: 5.0,
          social_links: [],
          profile_completed: true,
        };

        // Guardar perfil en la tabla 'profiles' de Supabase
        try {
          await supabase.from('profiles').upsert(newProfile, { onConflict: 'user_id' });
        } catch (profErr) {
          console.warn('[Supabase] Error guardando perfil en tabla profiles:', profErr);
        }

        const userObj: User = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'student',
          is_verified: Boolean(data.user.email_confirmed_at),
          isGuest: false,
        };

        const sessionToken = data.session?.access_token || `sb_${data.user.id}`;
        apiClient.setToken(sessionToken);
        setToken(sessionToken);
        setUser(userObj);
        setProfile(newProfile);
        setGuestSessionId(null);
        try {
          localStorage.removeItem('campus_guest_session_id');
        } catch {}

        return { success: true, user: userObj, profile: newProfile, token: sessionToken };
      }

      // Fallback a API local
      const payload = {
        ...formData,
        guestSessionId: guestSessionId || undefined,
      };
      const res = await apiClient.auth.register(payload);
      if (res && res.success) {
        apiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setGuestSessionId(null);
        try {
          localStorage.removeItem('campus_guest_session_id');
        } catch {}
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Acceso en Modo Invitado
   */
  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.guest();
      if (res && res.success) {
        apiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setGuestSessionId(res.guestSessionId || res.user.id);
        try {
          localStorage.setItem('campus_guest_session_id', res.guestSessionId || res.user.id);
        } catch {}
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar Sesión (Supabase / Local)
   */
  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await apiClient.auth.logout();
    } catch {
      // Ignorar errores de red en logout
    } finally {
      apiClient.setToken(null);
      setUser(null);
      setProfile(null);
      setToken(null);
      setGuestSessionId(null);
      try {
        localStorage.removeItem('campus_guest_session_id');
        localStorage.removeItem('campuslink_active_session');
      } catch {}
    }
  };

  /**
   * Actualizar Perfil de Usuario (Supabase / Local)
   */
  const updateProfile = async (patchData: Partial<UserProfile>): Promise<UserProfile> => {
    if (isSupabaseConfigured() && user?.id) {
      const { data, error } = await supabase
        .from('profiles')
        .update(patchData)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      }
    }

    const res = await apiClient.users.updateProfile(patchData);
    if (res && res.success && res.profile) {
      setProfile(res.profile);
      return res.profile;
    }
    throw new Error(res?.message || 'Error al actualizar perfil');
  };

  /**
   * Subir Avatar (Supabase Storage / Local)
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${user?.id || 'avatar'}_${Date.now()}.${fileExt}`;
        const avatarUrl = await uploadSupabaseFile('avatars', fileName, file);
        if (avatarUrl) {
          await updateProfile({ avatar_url: avatarUrl });
          return avatarUrl;
        }
      } catch (err) {
        console.warn('[Supabase Avatar] Fallback a subida local:', err);
      }
    }

    const res = await apiClient.users.uploadAvatar(file);
    if (res && res.success && res.avatar_url) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : null));
      return res.avatar_url;
    }
    throw new Error(res?.message || 'Error al subir avatar');
  };

  /**
   * Cambiar Contraseña Segura (Supabase Auth / Local)
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Contraseña actualizada en Supabase con éxito.' };
    }
    return apiClient.users.changePassword({ currentPassword, newPassword });
  };

  const isAuthenticated = Boolean(user && token);
  const isGuest = Boolean(user?.role === 'guest' || user?.isGuest);
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        role,
        isAuthenticated,
        isGuest,
        isLoading,
        isInitialLoading,
        guestSessionId,
        isUpgradeModalOpen,
        upgradeModalFeature,
        openUpgradeModal,
        closeUpgradeModal,
        loginWithEmail,
        register,
        loginAsGuest,
        logout,
        updateProfile,
        uploadAvatar,
        changePassword,
        requireAuthAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
