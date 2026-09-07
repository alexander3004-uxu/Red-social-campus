/**
 * src/context/AuthContext.tsx
 * Proveedor de Contexto Global de Autenticación, Sesiones y Perfiles.
 * Maneja el ciclo de vida del usuario registrado, autenticación con Google y modo invitado.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

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
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  role: 'guest' | 'student' | 'professor' | 'admin' | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  guestSessionId: string | null;
  // Modal de upgrade para invitados
  isUpgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  // Acciones de autenticación
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (formData: any) => Promise<any>;
  loginWithGoogle: (idToken: string) => Promise<any>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
   * Inicialización: verificar si hay sesión activa al recargar la aplicación
   */
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const storedToken = apiClient.getToken();
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const data = await apiClient.auth.getMe();
        if (isMounted && data.success) {
          setUser(data.user);
          setProfile(data.profile);
          setToken(storedToken);
          if (data.isGuest) {
            setGuestSessionId(data.user.id);
          }
        }
      } catch (err: any) {
        // Si el token es inválido o expiró, limpiar estado
        if (isMounted) {
          apiClient.setToken(null);
          setUser(null);
          setProfile(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Inicio de Sesión Tradicional
   */
  const loginWithEmail = async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login({ email, password, rememberMe });
      if (res.success) {
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
   * Registro Tradicional
   */
  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        guestSessionId: guestSessionId || undefined,
      };
      const res = await apiClient.auth.register(payload);
      if (res.success) {
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
   * Autenticación con Google Identity Services
   */
  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.auth.google({
        id_token: idToken,
        guestSessionId: guestSessionId || undefined,
      });
      if (res.success) {
        apiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setGuestSessionId(null);
        try {
          localStorage.removeItem('campus_guest_session_id');
        } catch {}
        closeUpgradeModal();
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
      if (res.success) {
        apiClient.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setProfile(res.profile);
        setGuestSessionId(res.guestSessionId);
        try {
          localStorage.setItem('campus_guest_session_id', res.guestSessionId);
        } catch {}
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierre de Sesión
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.auth.logout();
    } catch {
      // Continuar limpieza local incluso si hay fallo de red
    } finally {
      apiClient.setToken(null);
      setUser(null);
      setProfile(null);
      setToken(null);
      setGuestSessionId(null);
      try {
        localStorage.removeItem('campus_access_token');
        localStorage.removeItem('campus_guest_session_id');
      } catch {}
      setIsLoading(false);
    }
  };

  /**
   * Actualizar Perfil
   */
  const updateProfile = async (patchData: Partial<UserProfile>) => {
    const res = await apiClient.users.updateProfile(patchData);
    if (res.success && res.profile) {
      setProfile(res.profile);
      return res.profile;
    }
    throw new Error(res.message || 'Error actualizando perfil');
  };

  /**
   * Subida de Avatar
   */
  const uploadAvatar = async (file: File) => {
    const res = await apiClient.users.uploadAvatar(file);
    if (res.success && res.avatar_url) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : null));
      return res.avatar_url;
    }
    throw new Error(res.message || 'Error subiendo foto de perfil');
  };

  /**
   * Cambio de Contraseña
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    return apiClient.users.changePassword({ currentPassword, newPassword });
  };

  const isGuest = Boolean(user?.role === 'guest' || user?.isGuest);
  const isAuthenticated = Boolean(user !== null);
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
        guestSessionId,
        isUpgradeModalOpen,
        upgradeModalFeature,
        openUpgradeModal,
        closeUpgradeModal,
        loginWithEmail,
        register,
        loginWithGoogle,
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
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
};
