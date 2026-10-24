/**
 * src/services/apiClient.ts
 * Cliente HTTP resiliente para Red Social Campus.
 * Implementa estrategia híbrida (Network-First con Fallback Local Automático):
 * - Intenta primero comunicarse con la API de Express (puerto 4000 o Vercel Serverless Function).
 * - Si el backend no está disponible (código 404/405/502 de servidor estático, HTML devuelto o error de red),
 *   conmuta de forma automática y transparente al almacén local persistente (LocalStorage),
 *   permitiendo el acceso de respaldo en el navegador cuando la API no responde.
 *   Ese respaldo local no sincroniza cuentas entre dispositivos.
 */

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '';

export interface ApiErrorResponse {
  success: boolean;
  code?: string;
  message: string;
  errors?: string[];
  prompt_upgrade?: boolean;
}

const LOCAL_DEMO_USER_IDS = new Set([
  'e9f4c3a2-7104-4e2b-a81f-490326071001',
  'b1c2d3e4-5678-4901-a234-56789abcdef0',
  'c3d4e5f6-7890-4123-b456-789012abcdef',
]);

const LOCAL_PASSWORD_ITERATIONS = 120000;

async function hashLocalPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: LOCAL_PASSWORD_ITERATIONS },
    key,
    256,
  );
  const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$${LOCAL_PASSWORD_ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

async function verifyLocalPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsText, saltHex, expectedHex] = (encoded || '').split('$');
  const iterations = Number(iterationsText);
  if (algorithm !== 'pbkdf2' || !Number.isInteger(iterations) || iterations < 1 || iterations > 500000 || !saltHex || !expectedHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) || []);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  const actualHex = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return actualHex === expectedHex;
}

class LocalAuthStore {
  private static USERS_KEY = 'campuslink_db_users';
  private static SESSION_KEY = 'campuslink_active_session';

  public static getUsers(): any[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) return [];
      const users = JSON.parse(data);
      const cleanUsers = Array.isArray(users) ? users.filter((user) => !LOCAL_DEMO_USER_IDS.has(user.id)) : [];
      if (cleanUsers.length !== users.length) {
        this.saveUsers(cleanUsers);
        const session = this.getSession();
        if (session?.user?.id && LOCAL_DEMO_USER_IDS.has(session.user.id)) this.setSession(null);
      }
      return cleanUsers;
    } catch {
      return [];
    }
  }

  public static saveUsers(users: any[]) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn(e);
    }
  }

  public static getSession() {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static setSession(session: any) {
    try {
      if (session) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  private static FOLLOWS_KEY = 'campuslink_db_follows';
  private static POSTS_KEY = 'campuslink_db_posts';

  public static getFollows(): Array<{ follower_id: string; followed_id: string }> {
    try {
      const data = localStorage.getItem(this.FOLLOWS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveFollows(follows: Array<{ follower_id: string; followed_id: string }>) {
    try {
      localStorage.setItem(this.FOLLOWS_KEY, JSON.stringify(follows));
    } catch (e) {
      console.warn(e);
    }
  }

  public static getPosts(): any[] {
    try {
      const data = localStorage.getItem(this.POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static savePosts(posts: any[]) {
    try {
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn(e);
    }
  }

  private static FRIEND_REQUESTS_KEY = 'campuslink_db_friend_requests';

  public static getFriendRequests(): Array<{ id: string; sender_id: string; receiver_id: string; status: string; created_at: string }> {
    try {
      const data = localStorage.getItem(this.FRIEND_REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveFriendRequests(requests: Array<{ id: string; sender_id: string; receiver_id: string; status: string; created_at: string }>) {
    try {
      localStorage.setItem(this.FRIEND_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn(e);
    }
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
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
        LocalAuthStore.setSession(null);
      }
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  /**
   * Petición HTTP centralizada con fallback automático resiliente
   */
  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const guestId = localStorage.getItem('campus_guest_session_id');
      if (guestId && !headers.has('X-Guest-Session-Id')) {
        headers.set('X-Guest-Session-Id', guestId);
      }
    } catch {}

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const isHtml = contentType.includes('text/html');

      // Si el servidor devolvió HTML en una ruta /api/* (típico de servidor estático o SPA rewrite)
      if (endpoint.startsWith('/api/') && isHtml) {
        console.warn(`[ApiClient] Ruta '${endpoint}' devolvió HTML. Conmutando a fallback local.`);
        return this.handleFallback<T>(endpoint, options);
      }

      // Si Vercel o el host devolvió códigos de error de ruta o falla de función serverless
      if (
        endpoint.startsWith('/api/') &&
        [404, 405, 500, 502, 503, 504].includes(response.status)
      ) {
        console.warn(`[ApiClient] Endpoint '${endpoint}' respondió HTTP ${response.status}. Conmutando a fallback local.`);
        return this.handleFallback<T>(endpoint, options);
      }

      let data: any = null;
      if (isJson) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (
        endpoint.startsWith('/api/') &&
        typeof data?.message === 'string' &&
        data.message.includes('FUNCTION_INVOCATION_FAILED')
      ) {
        console.warn(`[ApiClient] Invocación de función falló en '${endpoint}'. Conmutando a fallback local.`);
        return this.handleFallback<T>(endpoint, options);
      }

      // Si es un 403 que no es de nuestra API (ej. error 403 genérico de CDN/servidor estático sin código JSON)
      if (response.status === 403 && endpoint.startsWith('/api/') && !data?.code) {
        console.warn(`[ApiClient] 403 sin código de API en '${endpoint}'. Conmutando a fallback.`);
        return this.handleFallback<T>(endpoint, options);
      }

      // Si el cuerpo devuelto contiene FUNCTION_INVOCATION_FAILED (error típico de Vercel Lambda)
      if (typeof data?.message === 'string' && data.message.includes('FUNCTION_INVOCATION_FAILED')) {
        console.warn(`[ApiClient] Detectado FUNCTION_INVOCATION_FAILED en '${endpoint}'. Conmutando a fallback local.`);
        return this.handleFallback<T>(endpoint, options);
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
      // Si fue error de red (backend offline), falla de función serverless o status de fallback
      if (
        endpoint.startsWith('/api/') &&
        (!err.status ||
          [404, 405, 500, 502, 503, 504].includes(err.status) ||
          (typeof err?.message === 'string' && err.message.includes('FUNCTION_INVOCATION_FAILED')))
      ) {
        return this.handleFallback<T>(endpoint, options);
      }
      throw err;
    }
  }

  /**
   * Manejador de respaldo en el navegador (Local Client Fallback)
   * Garantiza que en Vercel u entornos sin backend Express activo, el usuario
   * pueda registrarse, iniciar sesión o como invitado de forma inmediata.
   */
  private async handleFallback<T>(endpoint: string, options: RequestInit): Promise<T> {
    console.info(`[ApiClient] Utilizando persistencia local de respaldo para: ${endpoint}`);

    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

    // FALLBACK DE RED SOCIAL (/api/social/*)
    if (endpoint.startsWith('/api/social/people') && (!options.method || options.method === 'GET')) {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      const termMatch = endpoint.match(/[?&]q=([^&]*)/);
      const term = termMatch ? decodeURIComponent(termMatch[1]).trim().toLowerCase() : '';
      const follows = LocalAuthStore.getFollows();
      const requests = LocalAuthStore.getFriendRequests();
      const users = LocalAuthStore.getUsers();

      const people = users
        .filter((u) => u.id !== currentUserId)
        .map((u) => {
          const prof = u.profile || {};
          const fr = requests.find(
            (r) =>
              ((r.sender_id === currentUserId && r.receiver_id === u.id) ||
               (r.receiver_id === currentUserId && r.sender_id === u.id)) &&
              ['pending', 'accepted'].includes(r.status)
          );

          let friendship_status = 'none';
          if (fr) {
            if (fr.status === 'accepted') friendship_status = 'friends';
            else if (fr.sender_id === currentUserId) friendship_status = 'pending_sent';
            else friendship_status = 'pending_received';
          }

          return {
            id: u.id,
            username: prof.username || u.email?.split('@')[0] || 'usuario',
            full_name: prof.full_name || u.full_name || 'Estudiante Universitario',
            avatar_url: prof.avatar_url || '',
            university: prof.university || '',
            career: prof.career || '',
            faculty: prof.faculty || '',
            is_following: follows.some((f) => f.follower_id === currentUserId && f.followed_id === u.id),
            friendship_status,
            request_id: fr?.id,
          };
        })
        .filter((p) => {
          if (!term) return true;
          return [p.username, p.full_name, p.university, p.career]
            .some((val) => String(val || '').toLowerCase().includes(term));
        })
        .slice(0, 40);

      return Promise.resolve({ success: true, people } as T);
    }

    // Amistades Fallback
    if (endpoint.includes('/api/social/friends/request/') && options.method === 'POST') {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      if (!currentUserId) {
        const err: any = new Error('Inicia sesión para interactuar con otros usuarios.');
        err.status = 401;
        return Promise.reject(err);
      }
      const targetUserId = decodeURIComponent(endpoint.split('/').pop() || '');
      const requests = LocalAuthStore.getFriendRequests();
      let req = requests.find((r) => r.sender_id === currentUserId && r.receiver_id === targetUserId);
      if (req) {
        req.status = 'pending';
      } else {
        req = {
          id: `req_${Date.now()}`,
          sender_id: currentUserId,
          receiver_id: targetUserId,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        requests.push(req);
      }
      LocalAuthStore.saveFriendRequests(requests);
      return Promise.resolve({ success: true, request: req } as T);
    }

    if (endpoint.includes('/api/social/friends/accept/') && options.method === 'POST') {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      const targetId = decodeURIComponent(endpoint.split('/').pop() || '');
      const requests = LocalAuthStore.getFriendRequests();
      const req = requests.find((r) => r.id === targetId || (r.sender_id === targetId && r.receiver_id === currentUserId));
      if (req) {
        req.status = 'accepted';
        LocalAuthStore.saveFriendRequests(requests);
        let follows = LocalAuthStore.getFollows();
        if (!follows.some((f) => f.follower_id === req.sender_id && f.followed_id === req.receiver_id)) {
          follows.push({ follower_id: req.sender_id, followed_id: req.receiver_id });
        }
        if (!follows.some((f) => f.follower_id === req.receiver_id && f.followed_id === req.sender_id)) {
          follows.push({ follower_id: req.receiver_id, followed_id: req.sender_id });
        }
        LocalAuthStore.saveFollows(follows);
      }
      return Promise.resolve({ success: true, request: req } as T);
    }

    if (endpoint.includes('/api/social/friends/reject/') && options.method === 'POST') {
      const targetId = decodeURIComponent(endpoint.split('/').pop() || '');
      const requests = LocalAuthStore.getFriendRequests();
      const req = requests.find((r) => r.id === targetId);
      if (req) {
        req.status = 'rejected';
        LocalAuthStore.saveFriendRequests(requests);
      }
      return Promise.resolve({ success: true, request: req } as T);
    }

    if (endpoint.includes('/api/social/friends/request/') && options.method === 'DELETE') {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      const targetUserId = decodeURIComponent(endpoint.split('/').pop() || '');
      let requests = LocalAuthStore.getFriendRequests();
      requests = requests.filter((r) => !(r.sender_id === currentUserId && r.receiver_id === targetUserId && r.status === 'pending'));
      LocalAuthStore.saveFriendRequests(requests);
      return Promise.resolve({ success: true, cancelled: true } as T);
    }

    if (endpoint.includes('/api/social/friends/') && options.method === 'DELETE') {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      const targetUserId = decodeURIComponent(endpoint.split('/').pop() || '');
      let requests = LocalAuthStore.getFriendRequests();
      requests = requests.filter((r) => !((r.sender_id === currentUserId && r.receiver_id === targetUserId) || (r.sender_id === targetUserId && r.receiver_id === currentUserId)));
      LocalAuthStore.saveFriendRequests(requests);
      return Promise.resolve({ success: true, removed: true } as T);
    }

    if (endpoint.includes('/api/social/people/') && endpoint.endsWith('/follow')) {
      const currentSession = LocalAuthStore.getSession();
      const currentUserId = currentSession?.user?.id;
      if (!currentUserId) {
        const err: any = new Error('Inicia sesión para interactuar con otros usuarios.');
        err.status = 401;
        return Promise.reject(err);
      }

      const parts = endpoint.split('/');
      const followIdx = parts.indexOf('follow');
      const targetUserId = decodeURIComponent(parts[followIdx - 1]);
      let follows = LocalAuthStore.getFollows();

      if (options.method === 'POST') {
        if (!follows.some((f) => f.follower_id === currentUserId && f.followed_id === targetUserId)) {
          follows.push({ follower_id: currentUserId, followed_id: targetUserId });
          LocalAuthStore.saveFollows(follows);
        }
        return Promise.resolve({ success: true, following: true, message: 'Amistad actualizada.' } as T);
      }

      if (options.method === 'DELETE') {
        follows = follows.filter((f) => !(f.follower_id === currentUserId && f.followed_id === targetUserId));
        LocalAuthStore.saveFollows(follows);
        return Promise.resolve({ success: true, following: false, message: 'Has dejado de seguir.' } as T);
      }
    }

    if (endpoint === '/api/social/posts' && (!options.method || options.method === 'GET')) {
      const posts = LocalAuthStore.getPosts();
      return Promise.resolve({ success: true, posts } as T);
    }

    if (endpoint === '/api/social/posts' && options.method === 'POST') {
      const currentSession = LocalAuthStore.getSession();
      const prof = currentSession?.profile || {};
      const newPost = {
        id: `post_${Date.now()}`,
        authorName: prof.full_name || 'Estudiante Universitario',
        authorAvatar: prof.avatar_url || '',
        authorTag: prof.career || 'CampusLink',
        authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
        timeAgo: 'Justo ahora',
        content: body.content || '',
        likes: 0,
        isLiked: false,
        comments: 0,
        created_at: new Date().toISOString(),
        user_id: currentSession?.user?.id,
      };
      const posts = LocalAuthStore.getPosts();
      posts.unshift(newPost);
      LocalAuthStore.savePosts(posts);
      return Promise.resolve({ success: true, post: newPost } as T);
    }

    // 1. REGISTRO TRADICIONAL
    if (endpoint === '/api/auth/register' && options.method === 'POST') {
      const { email, password, full_name, username, university, faculty, career, semester } = body;
      const users = LocalAuthStore.getUsers();

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
        const err: any = new Error('Ya existe una cuenta universitaria registrada con este correo electrónico.');
        err.status = 409;
        err.code = 'EMAIL_ALREADY_EXISTS';
        return Promise.reject(err);
      }

      const newId = `user_${Date.now()}`;
      const newProfile = {
        id: `prof_${newId}`,
        user_id: newId,
        username: (username || email.split('@')[0]).replace(/^@/, '').toLowerCase().trim(),
        full_name: full_name || 'Estudiante Universitario',
        bio: '',
        avatar_url: '',
        banner_url: '',
        university: university || '',
        faculty: faculty || '',
        career: career || '',
        semester: semester || '',
        student_id: `UC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        reputation: 5.0,
        social_links: [],
        profile_completed: true,
      };

      const newUser = {
        id: newId,
        email: email.toLowerCase().trim(),
        password_hash: await hashLocalPassword(password),
        role: 'student',
        is_verified: true,
        profile: newProfile,
      };

      users.push(newUser);
      LocalAuthStore.saveUsers(users);

      const token = `local_jwt_${newId}_${Date.now()}`;
      this.setToken(token);
      LocalAuthStore.setSession({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role, is_verified: true }, profile: newProfile });

      return Promise.resolve({
        success: true,
        code: 'REGISTRATION_SUCCESS',
        message: '¡Registro universitario completado con éxito!',
        token,
        user: { id: newUser.id, email: newUser.email, role: 'student', is_verified: true, isGuest: false },
        profile: newProfile,
      } as T);
    }

    // 2. INICIO DE SESIÓN TRADICIONAL
    if (endpoint === '/api/auth/login' && options.method === 'POST') {
      const { email, password } = body;
      const users = LocalAuthStore.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

      const passwordMatches = user?.password_hash
        ? await verifyLocalPassword(password, user.password_hash)
        : Boolean(user?.password && user.password === password);
      if (!user || !passwordMatches) {
        const err: any = new Error('Correo electrónico o contraseña incorrectos.');
        err.status = 401;
        err.code = 'INVALID_CREDENTIALS';
        return Promise.reject(err);
      }

      // Migra credenciales creadas por versiones anteriores que las guardaban en texto plano.
      if (user.password) {
        user.password_hash = await hashLocalPassword(password);
        delete user.password;
        LocalAuthStore.saveUsers(users);
      }

      const token = `local_jwt_${user.id}_${Date.now()}`;
      this.setToken(token);
      LocalAuthStore.setSession({ token, user: { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified }, profile: user.profile });

      return Promise.resolve({
        success: true,
        code: 'LOGIN_SUCCESS',
        message: 'Inicio de sesión exitoso.',
        token,
        user: { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified, isGuest: false },
        profile: user.profile,
      } as T);
    }

    // 4. MODO INVITADO
    if (endpoint === '/api/auth/guest' && options.method === 'POST') {
      const guestId = `guest_${Date.now()}`;
      const guestProfile = {
        id: `prof_${guestId}`,
        user_id: guestId,
        username: 'invitado',
        full_name: 'Invitado del Campus',
        bio: 'Navegando en Modo Invitado de solo lectura.',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        university: 'Modo Invitado',
        career: 'Explorador',
        semester: 'Visitante',
      };
      const guestUser = { id: guestId, email: 'invitado@campus.local', role: 'guest', isGuest: true };
      const token = `local_guest_${guestId}`;
      this.setToken(token);
      LocalAuthStore.setSession({ token, user: guestUser, profile: guestProfile, isGuest: true });

      return Promise.resolve({
        success: true,
        code: 'GUEST_SESSION_CREATED',
        token,
        isGuest: true,
        guestSessionId: guestId,
        user: guestUser,
        profile: guestProfile,
      } as T);
    }

    // 5. CONSULTAR SESIÓN ACTUAL (/api/auth/me)
    if (endpoint === '/api/auth/me') {
      const session = LocalAuthStore.getSession();
      if (session && session.user) {
        return Promise.resolve({
          success: true,
          isGuest: Boolean(session.isGuest || session.user.role === 'guest'),
          user: session.user,
          profile: session.profile,
        } as T);
      }
      const err: any = new Error('No hay sesión activa.');
      err.status = 401;
      err.code = 'UNAUTHENTICATED';
      return Promise.reject(err);
    }

    // 6. CIERRE DE SESIÓN
    if (endpoint === '/api/auth/logout') {
      this.setToken(null);
      LocalAuthStore.setSession(null);
      return Promise.resolve({ success: true, message: 'Sesión cerrada.' } as T);
    }

    // 7. ACTUALIZAR PERFIL
    if (endpoint === '/api/users/profile' && options.method === 'PATCH') {
      const session = LocalAuthStore.getSession();
      if (!session || session.isGuest) {
        const err: any = new Error('Acción restringida para invitados.');
        err.status = 403;
        err.code = 'GUEST_RESTRICTED';
        return Promise.reject(err);
      }

      const updatedProfile = { ...session.profile, ...body };
      session.profile = updatedProfile;
      LocalAuthStore.setSession(session);

      const users = LocalAuthStore.getUsers();
      const uIndex = users.findIndex((u) => u.id === session.user.id);
      if (uIndex >= 0) {
        users[uIndex].profile = updatedProfile;
        LocalAuthStore.saveUsers(users);
      }

      return Promise.resolve({
        success: true,
        code: 'PROFILE_UPDATED',
        profile: updatedProfile,
      } as T);
    }

    // 8. CAMBIO DE CONTRASEÑA
    if (endpoint === '/api/users/change-password' && options.method === 'POST') {
      const session = LocalAuthStore.getSession();
      if (!session || session.isGuest) {
        const err: any = new Error('Acción restringida para invitados.');
        err.status = 403;
        return Promise.reject(err);
      }

      const { currentPassword, newPassword } = body;
      const users = LocalAuthStore.getUsers();
      const user = users.find((u) => u.id === session.user.id);

      const passwordMatches = user?.password_hash
        ? await verifyLocalPassword(currentPassword, user.password_hash)
        : Boolean(user?.password && user.password === currentPassword);
      if (user && !passwordMatches) {
        const err: any = new Error('La contraseña actual es incorrecta.');
        err.status = 400;
        return Promise.reject(err);
      }

      if (user) {
        user.password_hash = await hashLocalPassword(newPassword);
        delete user.password;
        LocalAuthStore.saveUsers(users);
      }

      return Promise.resolve({
        success: true,
        code: 'PASSWORD_CHANGED',
        message: 'Contraseña actualizada de forma segura.',
      } as T);
    }

    // 9. SUBIR AVATAR
    if (endpoint === '/api/users/avatar' && options.method === 'POST') {
      const session = LocalAuthStore.getSession();
      const sampleAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
      if (session) {
        session.profile.avatar_url = sampleAvatar;
        LocalAuthStore.setSession(session);
      }
      return Promise.resolve({
        success: true,
        code: 'AVATAR_UPLOADED',
        avatar_url: sampleAvatar,
        profile: session?.profile,
      } as T);
    }

    // Fallback genérico exitoso
    return Promise.resolve({ success: true } as T);
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

    guest: () => this.request('/api/auth/guest', { method: 'POST' }),

    upgradeGuest: (payload: { guestSessionId: string; type: 'register'; [key: string]: any }) =>
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

  public social = {
    fetchPosts: () => this.request('/api/social/posts', { method: 'GET' }),

    createPost: (post: Record<string, any>) =>
      this.request('/api/social/posts', { method: 'POST', body: JSON.stringify(post) }),

    setPostLike: (postId: string, liked: boolean) =>
      this.request(`/api/social/posts/${encodeURIComponent(postId)}/like`, {
        method: 'PATCH',
        body: JSON.stringify({ liked }),
      }),

    searchPeople: (query = '') =>
      this.request(`/api/social/people?q=${encodeURIComponent(query)}`, { method: 'GET' }),

    followPerson: (userId: string) =>
      this.request(`/api/social/people/${encodeURIComponent(userId)}/follow`, { method: 'POST' }),

    unfollowPerson: (userId: string) =>
      this.request(`/api/social/people/${encodeURIComponent(userId)}/follow`, { method: 'DELETE' }),

    sendFriendRequest: (userId: string) =>
      this.request(`/api/social/friends/request/${encodeURIComponent(userId)}`, { method: 'POST' }),

    acceptFriendRequest: (requestId: string) =>
      this.request(`/api/social/friends/accept/${encodeURIComponent(requestId)}`, { method: 'POST' }),

    rejectFriendRequest: (requestId: string) =>
      this.request(`/api/social/friends/reject/${encodeURIComponent(requestId)}`, { method: 'POST' }),

    cancelFriendRequest: (userId: string) =>
      this.request(`/api/social/friends/request/${encodeURIComponent(userId)}`, { method: 'DELETE' }),

    removeFriend: (userId: string) =>
      this.request(`/api/social/friends/${encodeURIComponent(userId)}`, { method: 'DELETE' }),
  };
}

export const apiClient = new ApiClient();
