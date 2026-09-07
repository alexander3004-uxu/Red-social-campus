/**
 * src/services/apiClient.ts
 * Cliente HTTP para comunicación con el backend de Red Social Campus.
 * Configurado con credenciales (cookies HTTP-only) y cabeceras de autorización Bearer.
 */

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';

export interface ApiErrorResponse {
  success: boolean;
  code?: string;
  message: string;
  errors?: string[];
  prompt_upgrade?: boolean;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Restaurar token si existía en almacenamiento local
    try {
      this.token = localStorage.getItem('campus_access_token');
    } catch {
      this.token = null;
    }
  }

  public setToken(token: string | null): void {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('campus_access_token', token);
      } else {
        localStorage.removeItem('campus_access_token');
      }
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  /**
   * Petición HTTP genérica con parsing uniforme de errores
   */
  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Agregar Bearer token si existe
    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    // Agregar X-Guest-Session-Id si está en almacenamiento
    try {
      const guestId = localStorage.getItem('campus_guest_session_id');
      if (guestId && !headers.has('X-Guest-Session-Id')) {
        headers.set('X-Guest-Session-Id', guestId);
      }
    } catch {
      // Ignorar si storage no está disponible
    }

    // Si el body no es FormData, fijar Content-Type a json
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Enviar y recibir cookies HTTP-only
    };

    try {
      const response = await fetch(url, config);

      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const error: any = new Error(data.message || `Error HTTP ${response.status}`);
        error.status = response.status;
        error.code = data.code || 'HTTP_ERROR';
        error.errors = data.errors || [];
        error.prompt_upgrade = data.prompt_upgrade || false;
        error.data = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (!err.status) {
        err.message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o el estado del backend.';
        err.code = 'NETWORK_ERROR';
      }
      throw err;
    }
  }

  // ============================================================================
  // MÓDULO DE AUTENTICACIÓN
  // ============================================================================
  public auth = {
    register: (payload: {
      email: string;
      password: string;
      full_name: string;
      username: string;
      university?: string;
      faculty?: string;
      career?: string;
      semester?: string;
      guestSessionId?: string;
    }) => this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

    login: (payload: { email: string; password: string; rememberMe?: boolean }) =>
      this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

    google: (payload: { id_token: string; guestSessionId?: string }) =>
      this.request('/api/auth/google', { method: 'POST', body: JSON.stringify(payload) }),

    guest: () => this.request('/api/auth/guest', { method: 'POST' }),

    upgradeGuest: (payload: { guestSessionId: string; type: 'google' | 'register'; [key: string]: any }) =>
      this.request('/api/auth/upgrade-guest', { method: 'POST', body: JSON.stringify(payload) }),

    getMe: () => this.request('/api/auth/me', { method: 'GET' }),

    logout: () => this.request('/api/auth/logout', { method: 'POST' }),
  };

  // ============================================================================
  // MÓDULO DE PERFILES Y USUARIOS
  // ============================================================================
  public users = {
    getMyProfile: () => this.request('/api/users/profile', { method: 'GET' }),

    getPublicProfile: (username: string) => this.request(`/api/users/${username}`, { method: 'GET' }),

    updateProfile: (patchData: Record<string, any>) =>
      this.request('/api/users/profile', { method: 'PATCH', body: JSON.stringify(patchData) }),

    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return this.request('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
    },

    changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      this.request('/api/users/change-password', { method: 'POST', body: JSON.stringify(payload) }),
  };
}

export const apiClient = new ApiClient();
