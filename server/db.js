/**
 * server/db.js
 * Capa de Persistencia y Acceso a Datos (Data Access Layer) para Red Social Campus.
 * Arquitectura híbrida y tolerante a fallos:
 * - Si PostgreSQL está disponible (DATABASE_URL), ejecuta queries vía pg.Pool.
 * - Si PostgreSQL no está instalado o no responde, conmuta de forma transparente
 *   a un almacén temporal en memoria sin cuentas de demostración.
 */

import crypto from 'crypto';

function formatTimeAgo(value) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Ahora';
  if (elapsedSeconds < 3600) return `Hace ${Math.floor(elapsedSeconds / 60)} min`;
  if (elapsedSeconds < 86400) return `Hace ${Math.floor(elapsedSeconds / 3600)} h`;
  return `Hace ${Math.floor(elapsedSeconds / 86400)} d`;
}

/**
 * Almacén en memoria estructurado
 */
const inMemoryStore = {
  users: [],
  profiles: [],
  auth_providers: [],
  user_sessions: [],
  user_follows: [],
  campus_posts: [],
  campus_post_likes: [],
};

// Conexión dinámica a PostgreSQL si pg estuviera instalado y configurado
let pgPool = null;
let usePostgres = false;

async function initDatabase() {
  const isPostgresEnabled = process.env.ENABLE_POSTGRES === 'true' || (Boolean(process.env.DATABASE_URL) && process.env.ENABLE_POSTGRES !== 'false');

  if (process.env.DATABASE_URL && isPostgresEnabled) {
    try {
      const { Pool } = await import('pg');
      const needsSsl = Boolean(
        process.env.DATABASE_URL.includes('supabase') ||
        process.env.DATABASE_URL.includes('sslmode=require') ||
        process.env.DATABASE_URL.includes('.pooler.supabase.com') ||
        process.env.VERCEL ||
        process.env.NODE_ENV === 'production'
      );

      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
        max: process.env.VERCEL ? 1 : 20,
        idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
        connectionTimeoutMillis: 10000,
      });

      // Probar conexión
      const res = await pgPool.query('SELECT NOW()');
      console.log(`[DB] Conectado exitosamente a PostgreSQL (${res.rows[0].now})`);
      usePostgres = true;
    } catch (err) {
      console.warn(`[DB] PostgreSQL no disponible (${err.message}). Utilizando persistencia en memoria.`);
      usePostgres = false;
      // No lanzar excepción no controlada en Vercel para evitar FUNCTION_INVOCATION_FAILED
    }
  } else {
    console.log('[DB] Operando con Almacén Estructurado en Memoria (Optimizado para desarrollo rápido y pruebas).');
  }
}

// Inicializar la base de datos de forma segura sin interrumpir la carga del módulo
try {
  await initDatabase();
} catch (err) {
  console.error('[DB] Error de inicialización:', err.message);
  usePostgres = false;
}

/**
 * MÉTODOS DEL REPOSITORIO DE DATOS (DATA ACCESS OBJECT)
 */
export const db = {
  /**
   * Buscar usuario por email (case-insensitive)
   */
  async findUserByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();

    if (usePostgres && pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [normalized]);
      return res.rows[0] || null;
    }

    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  },

  /**
   * Buscar usuario por ID
   */
  async findUserById(id) {
    if (!id) return null;

    if (usePostgres && pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }

    const user = inMemoryStore.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  },

  /**
   * Crear nuevo usuario
   */
  async createUser({ email, password_hash = null, role = 'student', is_verified = false }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
        [id, email.trim().toLowerCase(), password_hash, role, is_verified, now]
      );
      return res.rows[0];
    }

    const newUser = {
      id,
      email: email.trim().toLowerCase(),
      password_hash,
      role,
      is_verified,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    inMemoryStore.users.push(newUser);
    return { ...newUser };
  },

  /**
   * Actualizar contraseña de usuario
   */
  async updateUserPassword(userId, password_hash) {
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [password_hash, now, userId]
      );
      return res.rows[0] || null;
    }

    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) return null;
    user.password_hash = password_hash;
    user.updated_at = now;
    return { ...user };
  },

  /**
   * Marcar usuario como verificado
   */
  async verifyUser(userId) {
    const now = new Date().toISOString();
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'UPDATE users SET is_verified = TRUE, updated_at = $1 WHERE id = $2 RETURNING *',
        [now, userId]
      );
      return res.rows[0] || null;
    }

    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (user) {
      user.is_verified = true;
      user.updated_at = now;
      return { ...user };
    }
    return null;
  },

  /**
   * Buscar proveedor de autenticación vinculado (Google, Microsoft)
   */
  async findAuthProvider(provider, provider_user_id) {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM auth_providers WHERE provider = $1 AND provider_user_id = $2',
        [provider, provider_user_id]
      );
      return res.rows[0] || null;
    }

    const match = inMemoryStore.auth_providers.find(
      (ap) => ap.provider === provider && ap.provider_user_id === provider_user_id
    );
    return match ? { ...match } : null;
  },

  /**
   * Vincular proveedor a usuario existente
   */
  async linkAuthProvider({ user_id, provider, provider_user_id, email, metadata = {} }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `INSERT INTO auth_providers (id, user_id, provider, provider_user_id, email, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (provider, provider_user_id) DO UPDATE SET metadata = $6
         RETURNING *`,
        [id, user_id, provider, provider_user_id, email.toLowerCase(), JSON.stringify(metadata), now]
      );
      return res.rows[0];
    }

    const existingIndex = inMemoryStore.auth_providers.findIndex(
      (ap) => ap.provider === provider && ap.provider_user_id === provider_user_id
    );

    if (existingIndex >= 0) {
      inMemoryStore.auth_providers[existingIndex].metadata = metadata;
      return { ...inMemoryStore.auth_providers[existingIndex] };
    }

    const record = {
      id,
      user_id,
      provider,
      provider_user_id,
      email: email.toLowerCase(),
      metadata,
      created_at: now,
    };
    inMemoryStore.auth_providers.push(record);
    return { ...record };
  },

  /**
   * Buscar perfil por user_id
   */
  async findProfileByUserId(userId) {
    if (!userId) return null;

    if (usePostgres && pgPool) {
      const res = await pgPool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      return res.rows[0] || null;
    }

    const profile = inMemoryStore.profiles.find((p) => p.user_id === userId);
    return profile ? { ...profile } : null;
  },

  /**
   * Buscar perfil por username (case-insensitive)
   */
  async findProfileByUsername(username) {
    if (!username) return null;
    const clean = username.replace(/^@/, '').toLowerCase().trim();

    if (usePostgres && pgPool) {
      const res = await pgPool.query('SELECT * FROM profiles WHERE LOWER(username) = LOWER($1)', [clean]);
      return res.rows[0] || null;
    }

    const profile = inMemoryStore.profiles.find((p) => p.username.toLowerCase() === clean);
    return profile ? { ...profile } : null;
  },

  /**
   * Crear perfil inicial de usuario
   */
  async createProfile(profileData) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const cleanUsername = (profileData.username || `estudiante_${Date.now().toString(36)}`)
      .replace(/^@/, '')
      .toLowerCase()
      .trim();

    const record = {
      id,
      user_id: profileData.user_id,
      username: cleanUsername,
      full_name: profileData.full_name || 'Estudiante Campus',
      bio: profileData.bio ?? '',
      avatar_url: profileData.avatar_url ?? '',
      banner_url: profileData.banner_url ?? '',
      university: profileData.university ?? '',
      faculty: profileData.faculty ?? '',
      career: profileData.career ?? '',
      semester: profileData.semester ?? '',
      student_id: profileData.student_id || `UC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      reputation: 5.0,
      social_links: profileData.social_links || [],
      profile_completed: profileData.profile_completed ?? false,
      created_at: now,
      updated_at: now,
    };

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `INSERT INTO profiles (id, user_id, username, full_name, bio, avatar_url, banner_url, university, faculty, career, semester, student_id, reputation, social_links, profile_completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16) RETURNING *`,
        [
          record.id, record.user_id, record.username, record.full_name, record.bio,
          record.avatar_url, record.banner_url, record.university, record.faculty,
          record.career, record.semester, record.student_id, record.reputation,
          JSON.stringify(record.social_links), record.profile_completed, now,
        ]
      );
      return res.rows[0];
    }

    inMemoryStore.profiles.push(record);
    return { ...record };
  },

  /**
   * Actualizar campos del perfil
   */
  async updateProfile(userId, patchData) {
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      // Construcción dinámica de UPDATE
      const allowedFields = [
        'username', 'full_name', 'bio', 'avatar_url', 'banner_url',
        'university', 'faculty', 'career', 'semester', 'student_id', 'social_links', 'profile_completed'
      ];
      const updates = [];
      const values = [];
      let idx = 1;

      for (const field of allowedFields) {
        if (patchData[field] !== undefined) {
          updates.push(`${field} = $${idx}`);
          values.push(field === 'social_links' ? JSON.stringify(patchData[field]) : patchData[field]);
          idx++;
        }
      }

      if (updates.length === 0) {
        return this.findProfileByUserId(userId);
      }

      updates.push(`updated_at = $${idx}`);
      values.push(now);
      idx++;

      values.push(userId);
      const query = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`;
      const res = await pgPool.query(query, values);
      return res.rows[0] || null;
    }

    const profileIndex = inMemoryStore.profiles.findIndex((p) => p.user_id === userId);
    if (profileIndex === -1) return null;

    const current = inMemoryStore.profiles[profileIndex];
    const updated = {
      ...current,
      ...(patchData.username && { username: patchData.username.replace(/^@/, '').toLowerCase().trim() }),
      ...(patchData.full_name !== undefined && { full_name: patchData.full_name }),
      ...(patchData.bio !== undefined && { bio: patchData.bio }),
      ...(patchData.avatar_url !== undefined && { avatar_url: patchData.avatar_url }),
      ...(patchData.banner_url !== undefined && { banner_url: patchData.banner_url }),
      ...(patchData.university !== undefined && { university: patchData.university }),
      ...(patchData.faculty !== undefined && { faculty: patchData.faculty }),
      ...(patchData.career !== undefined && { career: patchData.career }),
      ...(patchData.semester !== undefined && { semester: patchData.semester }),
      ...(patchData.student_id !== undefined && { student_id: patchData.student_id }),
      ...(patchData.social_links !== undefined && { social_links: patchData.social_links }),
      ...(patchData.profile_completed !== undefined && { profile_completed: patchData.profile_completed }),
      updated_at: now,
    };

    inMemoryStore.profiles[profileIndex] = updated;
    return { ...updated };
  },

  async searchPeople(query, currentUserId) {
    const term = String(query || '').trim().toLowerCase();

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `SELECT p.user_id AS id, p.username, p.full_name, p.avatar_url, p.university, p.career,
                EXISTS (SELECT 1 FROM user_follows f WHERE f.follower_id = $1 AND f.followed_id = p.user_id) AS is_following
         FROM profiles p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id <> $1 AND p.profile_completed = TRUE AND u.is_active = TRUE AND u.role <> 'guest'
           AND ($2 = '' OR p.username ILIKE '%' || $2 || '%' OR p.full_name ILIKE '%' || $2 || '%'
                OR p.university ILIKE '%' || $2 || '%' OR p.career ILIKE '%' || $2 || '%')
         ORDER BY p.full_name ASC LIMIT 30`,
        [currentUserId, term]
      );
      return res.rows;
    }

    return inMemoryStore.profiles
      .filter((profile) => profile.user_id !== currentUserId && profile.profile_completed)
      .filter((profile) => {
        if (!term) return true;
        return [profile.username, profile.full_name, profile.university, profile.career]
          .some((value) => String(value || '').toLowerCase().includes(term));
      })
      .slice(0, 30)
      .map((profile) => ({
        id: profile.user_id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        university: profile.university,
        career: profile.career,
        is_following: inMemoryStore.user_follows.some((edge) => edge.follower_id === currentUserId && edge.followed_id === profile.user_id),
      }));
  },

  async followPerson(followerId, followedId) {
    if (!followerId || !followedId || followerId === followedId) {
      const error = new Error('No puedes agregarte a ti mismo.');
      error.code = 'INVALID_FOLLOW';
      throw error;
    }

    const target = await this.findProfileByUserId(followedId);
    if (!target || !target.profile_completed) {
      const error = new Error('No encontramos esa cuenta.');
      error.code = 'PERSON_NOT_FOUND';
      throw error;
    }

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `INSERT INTO user_follows (follower_id, followed_id) VALUES ($1, $2)
         ON CONFLICT (follower_id, followed_id) DO NOTHING RETURNING follower_id`,
        [followerId, followedId]
      );
      return { following: true, created: res.rowCount > 0 };
    }

    const existing = inMemoryStore.user_follows.some((edge) => edge.follower_id === followerId && edge.followed_id === followedId);
    if (!existing) inMemoryStore.user_follows.push({ follower_id: followerId, followed_id: followedId, created_at: new Date().toISOString() });
    return { following: true, created: !existing };
  },

  async unfollowPerson(followerId, followedId) {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND followed_id = $2 RETURNING follower_id',
        [followerId, followedId]
      );
      return { following: false, deleted: res.rowCount > 0 };
    }

    const before = inMemoryStore.user_follows.length;
    inMemoryStore.user_follows = inMemoryStore.user_follows.filter(
      (edge) => !(edge.follower_id === followerId && edge.followed_id === followedId)
    );
    return { following: false, deleted: inMemoryStore.user_follows.length < before };
  },

  async listCampusPosts(currentUserId) {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `SELECT p.id, p.user_id, p.post_data, p.created_at, pr.full_name, pr.username, pr.avatar_url, pr.career,
                (SELECT COUNT(*)::int FROM campus_post_likes l WHERE l.post_id = p.id) AS likes_count,
                EXISTS (SELECT 1 FROM campus_post_likes l WHERE l.post_id = p.id AND l.user_id = $1) AS is_liked
         FROM campus_posts p
         JOIN profiles pr ON pr.user_id = p.user_id
         WHERE pr.profile_completed = TRUE
           AND (p.user_id = $1 OR EXISTS (
             SELECT 1 FROM user_follows f
             WHERE f.follower_id = $1 AND f.followed_id = p.user_id
           ))
         ORDER BY p.created_at DESC LIMIT 100`,
        [currentUserId]
      );
      return res.rows.map((row) => ({
        ...row.post_data,
        id: row.id,
        authorName: row.full_name,
        authorAvatar: row.avatar_url || '',
        authorTag: row.career || 'CampusLink',
        authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
        timeAgo: formatTimeAgo(row.created_at),
        user_id: row.user_id,
        likes: Number(row.likes_count) || 0,
        isLiked: Boolean(row.is_liked),
        comments: Number(row.post_data.comments) || 0,
      }));
    }

    return inMemoryStore.campus_posts
      .filter((post) => inMemoryStore.profiles.some((profile) => profile.user_id === post.user_id && profile.profile_completed))
      .filter((post) => post.user_id === currentUserId || inMemoryStore.user_follows.some(
        (edge) => edge.follower_id === currentUserId && edge.followed_id === post.user_id
      ))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 100)
      .map((post) => {
        const profile = inMemoryStore.profiles.find((item) => item.user_id === post.user_id);
        return {
          ...post.post_data,
          id: post.id,
          authorName: profile.full_name,
          authorAvatar: profile.avatar_url || '',
          authorTag: profile.career || 'CampusLink',
          authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
          timeAgo: formatTimeAgo(post.created_at),
          user_id: post.user_id,
          likes: inMemoryStore.campus_post_likes.filter((like) => like.post_id === post.id).length,
          isLiked: inMemoryStore.campus_post_likes.some((like) => like.post_id === post.id && like.user_id === currentUserId),
        };
      });
  },

  async setCampusPostLike(userId, postId, liked) {
    if (usePostgres && pgPool) {
      const post = await pgPool.query('SELECT 1 FROM campus_posts WHERE id = $1', [postId]);
      if (!post.rowCount) return null;
      if (liked) {
        await pgPool.query(
          'INSERT INTO campus_post_likes (post_id, user_id) SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM campus_posts WHERE id = $1) ON CONFLICT (post_id, user_id) DO NOTHING',
          [postId, userId]
        );
      } else {
        await pgPool.query('DELETE FROM campus_post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      }
      const res = await pgPool.query(
        'SELECT COUNT(*)::int AS likes_count FROM campus_post_likes WHERE post_id = $1',
        [postId]
      );
      return Number(res.rows[0]?.likes_count) || 0;
    }

    if (!inMemoryStore.campus_posts.some((post) => post.id === postId)) return null;
    const index = inMemoryStore.campus_post_likes.findIndex((like) => like.post_id === postId && like.user_id === userId);
    if (liked && index < 0) inMemoryStore.campus_post_likes.push({ post_id: postId, user_id: userId });
    if (!liked && index >= 0) inMemoryStore.campus_post_likes.splice(index, 1);
    return inMemoryStore.campus_post_likes.filter((like) => like.post_id === postId).length;
  },

  async createCampusPost(userId, postData) {
    const profile = await this.findProfileByUserId(userId);
    if (!profile || !profile.profile_completed) {
      const error = new Error('Completa tu perfil antes de publicar.');
      error.code = 'PROFILE_INCOMPLETE';
      throw error;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'INSERT INTO campus_posts (id, user_id, post_data, created_at) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
        [id, userId, JSON.stringify(postData), now]
      );
      return {
        ...postData,
        id: res.rows[0].id,
        authorName: profile.full_name,
        authorAvatar: profile.avatar_url || '',
        authorTag: profile.career || 'CampusLink',
        authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
        timeAgo: formatTimeAgo(res.rows[0].created_at),
        user_id: userId,
      };
    }

    const record = { id, user_id: userId, post_data: postData, created_at: now };
    inMemoryStore.campus_posts.push(record);
    return {
      ...postData,
      id,
      authorName: profile.full_name,
      authorAvatar: profile.avatar_url || '',
      authorTag: profile.career || 'CampusLink',
      authorTagColor: 'bg-[#e2dfff] text-[#3323cc]',
      timeAgo: formatTimeAgo(now),
      user_id: userId,
    };
  },

  /**
   * Crear o registrar sesión activa / Refresh Token
   */
  async createSession({ user_id = null, token_hash, is_guest = false, guest_session_id = null, user_agent = '', ip_address = '', expires_at }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record = {
      id,
      user_id,
      token_hash,
      is_guest,
      guest_session_id,
      user_agent,
      ip_address,
      expires_at: new Date(expires_at).toISOString(),
      created_at: now,
      revoked: false,
      revoked_at: null,
    };

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        `INSERT INTO user_sessions (id, user_id, token_hash, is_guest, guest_session_id, user_agent, ip_address, expires_at, created_at, revoked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE) RETURNING *`,
        [id, user_id, token_hash, is_guest, guest_session_id, user_agent, ip_address, record.expires_at, now]
      );
      return res.rows[0];
    }

    inMemoryStore.user_sessions.push(record);
    return { ...record };
  },

  /**
   * Buscar sesión válida por token hash
   */
  async findValidSession(token_hash) {
    const now = new Date();

    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM user_sessions WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
        [token_hash]
      );
      return res.rows[0] || null;
    }

    const session = inMemoryStore.user_sessions.find(
      (s) => s.token_hash === token_hash && !s.revoked && new Date(s.expires_at) > now
    );
    return session ? { ...session } : null;
  },

  /**
   * Revocar sesión activa (Logout)
   */
  async revokeSession(token_hash) {
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      await pgPool.query(
        'UPDATE user_sessions SET revoked = TRUE, revoked_at = $1 WHERE token_hash = $2',
        [now, token_hash]
      );
      return true;
    }

    const session = inMemoryStore.user_sessions.find((s) => s.token_hash === token_hash);
    if (session) {
      session.revoked = true;
      session.revoked_at = now;
    }
    return true;
  },

  /**
   * Revocar todas las sesiones de un usuario
   */
  async revokeAllUserSessions(userId) {
    const now = new Date().toISOString();

    if (usePostgres && pgPool) {
      await pgPool.query(
        'UPDATE user_sessions SET revoked = TRUE, revoked_at = $1 WHERE user_id = $2',
        [now, userId]
      );
      return true;
    }

    inMemoryStore.user_sessions.forEach((s) => {
      if (s.user_id === userId) {
        s.revoked = true;
        s.revoked_at = now;
      }
    });
    return true;
  },
};
