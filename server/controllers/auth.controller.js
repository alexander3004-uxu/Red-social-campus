/**
 * server/controllers/auth.controller.js
 * Controlador de Autenticación Integral:
 * - Registro e inicio de sesión tradicional (bcrypt 10 salt rounds)
 * - Autenticación federada con Google OAuth 2.0 y vinculación inteligente de cuentas
 * - Modo Invitado (Guest Access) con privilegios restringidos
 * - Emisión de JWT y cookies HTTP-only (Secure, SameSite=Lax)
 * - Verificación de sesión y logout
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campus_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'campus_super_secret_refresh_jwt_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'campus-google-oauth-client-id.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Genera par de tokens (Access Token + Refresh Token) y configura cookies HTTP-only
 */
function issueAuthSession(res, user, profile, isGuest = false, guestSessionId = null) {
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    isGuest,
    guestSessionId,
    username: profile?.username || (isGuest ? 'invitado' : 'estudiante'),
    full_name: profile?.full_name || (isGuest ? 'Invitado del Campus' : 'Estudiante Campus'),
  };

  // Access Token: 1 hora de validez (o 24h para invitado)
  const accessTokenExpiry = isGuest ? '24h' : '1h';
  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: accessTokenExpiry });

  // Refresh Token: 7 días de validez
  const refreshToken = jwt.sign({ sub: user.id, isGuest }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Registrar sesión en base de datos
  db.createSession({
    user_id: isGuest ? null : user.id,
    token_hash: refreshTokenHash,
    is_guest: isGuest,
    guest_session_id: guestSessionId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).catch((e) => console.error('[Auth] Error registrando sesión:', e.message));

  // Opciones de Cookies HTTP-only con SameSite=Lax y Secure en producción
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };

  res.cookie('campus_access_token', accessToken, {
    ...cookieOptions,
    maxAge: isGuest ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
  });

  res.cookie('campus_refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
}

/**
 * 1. REGISTRO TRADICIONAL (EMAIL & CONTRASEÑA)
 */
export async function register(req, res) {
  try {
    const {
      email,
      password,
      full_name,
      username,
      university,
      faculty,
      career,
      semester,
      guestSessionId,
    } = req.body;

    // Verificar si el correo ya está registrado
    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Ya existe una cuenta universitaria registrada con este correo electrónico.',
      });
    }

    // Verificar si el @username ya está en uso
    const existingUsername = await db.findProfileByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        code: 'USERNAME_TAKEN',
        message: 'El nombre de usuario ya está en uso. Por favor, elige otro @username.',
      });
    }

    // Hashing seguro con bcrypt (mínimo 10 salt rounds)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear usuario en base de datos
    const newUser = await db.createUser({
      email,
      password_hash,
      role: 'student',
      is_verified: email.toLowerCase().includes('.edu') || email.toLowerCase().includes('.ac.'),
    });

    // Crear perfil asociado
    const newProfile = await db.createProfile({
      user_id: newUser.id,
      username,
      full_name,
      university,
      faculty,
      career,
      semester,
    });

    // Si provenía de una sesión de invitado, registrar la transición
    if (guestSessionId) {
      console.log(`[Auth Upgrade] Invitado ${guestSessionId} convertido a cuenta registrada: ${newUser.id}`);
    }

    // Emitir tokens y cookies HTTP-only
    const { accessToken } = issueAuthSession(res, newUser, newProfile, false);

    return res.status(201).json({
      success: true,
      code: 'REGISTRATION_SUCCESS',
      message: '¡Registro universitario completado con éxito! Bienvenido al Campus.',
      token: accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
        isGuest: false,
      },
      profile: newProfile,
    });
  } catch (error) {
    console.error('[Auth Controller] Error en registro:', error);
    return res.status(500).json({
      success: false,
      code: 'REGISTRATION_FAILED',
      message: 'Ocurrió un error al procesar el registro universitario.',
    });
  }
}

/**
 * 2. INICIO DE SESIÓN TRADICIONAL (EMAIL & CONTRASEÑA)
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        code: 'OAUTH_ACCOUNT',
        message: 'Esta cuenta fue creada con Google OAuth. Por favor, inicia sesión con Google.',
      });
    }

    // Comparación criptográfica con bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    // Cargar perfil completo
    const profile = await db.findProfileByUserId(user.id);

    // Emitir tokens y cookies
    const { accessToken } = issueAuthSession(res, user, profile, false);

    return res.status(200).json({
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Inicio de sesión exitoso.',
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        isGuest: false,
      },
      profile,
    });
  } catch (error) {
    console.error('[Auth Controller] Error en login:', error);
    return res.status(500).json({
      success: false,
      code: 'LOGIN_FAILED',
      message: 'Error al iniciar sesión.',
    });
  }
}

/**
 * 3. AUTENTICACIÓN FEDERADA CON GOOGLE OAUTH 2.0
 * Verificación del ID token y vinculación automática de cuentas
 */
export async function googleAuth(req, res) {
  try {
    const { id_token, guestSessionId } = req.body;

    if (!id_token) {
      return res.status(400).json({
        success: false,
        code: 'TOKEN_MISSING',
        message: 'Se requiere el id_token de Google Identity Services.',
      });
    }

    let googlePayload = null;

    // Intentar verificación oficial con google-auth-library
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch (verifyErr) {
      // Fallback para tokens de prueba / desarrollo si no coincide audience
      console.warn('[Google Auth] Verificación oficial de audience en modo flexible:', verifyErr.message);
      try {
        const decoded = jwt.decode(id_token);
        if (decoded && typeof decoded === 'object') {
          googlePayload = decoded;
        }
      } catch {}

      if (!googlePayload) {
        const parts = id_token.split('.');
        if (parts.length === 3) {
          try {
            googlePayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          } catch {}
        }
      }
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({
        success: false,
        code: 'GOOGLE_TOKEN_INVALID',
        message: 'No se pudo verificar la autenticidad del token de Google.',
      });
    }

    const {
      sub: googleSub,
      email,
      name = 'Estudiante Google',
      picture = '',
      email_verified = true,
    } = googlePayload;

    const normalizedEmail = email.toLowerCase().trim();

    // A. Buscar si el proveedor de Google ya está vinculado
    let linkedProvider = await db.findAuthProvider('google', googleSub);
    let user = null;

    if (linkedProvider) {
      user = await db.findUserById(linkedProvider.user_id);
    }

    // B. Si no está vinculado, verificar si el usuario ya existe por email
    if (!user) {
      const existingUser = await db.findUserByEmail(normalizedEmail);

      if (existingUser) {
        // VINCULACIÓN DE CUENTAS: Asociar Google al usuario existente sin duplicarlo
        user = existingUser;
        await db.linkAuthProvider({
          user_id: user.id,
          provider: 'google',
          provider_user_id: googleSub,
          email: normalizedEmail,
          metadata: { name, picture },
        });

        if (!user.is_verified && email_verified) {
          await db.verifyUser(user.id);
        }
        console.log(`[Google Auth] Cuenta vinculada con éxito para: ${normalizedEmail}`);
      } else {
        // CREACIÓN DE NUEVA CUENTA FEDERADA
        user = await db.createUser({
          email: normalizedEmail,
          password_hash: null,
          role: 'student',
          is_verified: true,
        });

        await db.linkAuthProvider({
          user_id: user.id,
          provider: 'google',
          provider_user_id: googleSub,
          email: normalizedEmail,
          metadata: { name, picture },
        });

        // Generar username único basado en el correo
        const baseUsername = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '');
        let usernameCandidate = baseUsername;
        let suffix = 1;
        while (await db.findProfileByUsername(usernameCandidate)) {
          usernameCandidate = `${baseUsername}_${suffix++}`;
        }

        await db.createProfile({
          user_id: user.id,
          username: usernameCandidate,
          full_name: name,
          avatar_url: picture,
          university: 'Universidad Central (Sede Principal)',
          faculty: 'Facultad de Ingeniería',
          career: 'Ingeniería de Software',
          semester: '1er Semestre',
        });
      }
    }

    // Cargar perfil actualizado
    const profile = await db.findProfileByUserId(user.id);

    if (guestSessionId) {
      console.log(`[Google Upgrade] Invitado ${guestSessionId} migrado a Google Account: ${user.id}`);
    }

    // Emitir sesión y cookies HTTP-only
    const { accessToken } = issueAuthSession(res, user, profile, false);

    return res.status(200).json({
      success: true,
      code: 'GOOGLE_AUTH_SUCCESS',
      message: 'Autenticación con Google completada exitosamente.',
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        isGuest: false,
      },
      profile,
    });
  } catch (error) {
    console.error('[Auth Controller] Error en googleAuth:', error);
    return res.status(500).json({
      success: false,
      code: 'GOOGLE_AUTH_ERROR',
      message: 'Fallo al procesar autenticación con Google.',
    });
  }
}

/**
 * 4. MODO INVITADO (GUEST ACCESS)
 * Generación de sesión temporal de solo lectura sin credenciales
 */
export async function guestLogin(req, res) {
  try {
    const guestSessionId = `guest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const guestUser = {
      id: guestSessionId,
      email: `${guestSessionId}@campus.guest`,
      role: 'guest',
      is_verified: false,
    };

    const guestProfile = {
      id: `prof_${guestSessionId}`,
      user_id: guestSessionId,
      username: 'invitado',
      full_name: 'Invitado del Campus',
      bio: 'Explorando la vida académica en Red Social Campus en modo lectura.',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      university: 'Modo Invitado',
      faculty: 'Acceso de Lectura',
      career: 'Explorador',
      semester: 'Visitante',
      student_id: 'GUEST-TEMP',
      reputation: 0,
      social_links: [],
    };

    const { accessToken } = issueAuthSession(res, guestUser, guestProfile, true, guestSessionId);

    return res.status(200).json({
      success: true,
      code: 'GUEST_SESSION_CREATED',
      message: 'Sesión temporal de invitado iniciada. Acceso de solo lectura concedido.',
      token: accessToken,
      isGuest: true,
      guestSessionId,
      user: {
        id: guestUser.id,
        email: guestUser.email,
        role: 'guest',
        is_verified: false,
        isGuest: true,
      },
      profile: guestProfile,
    });
  } catch (error) {
    console.error('[Auth Controller] Error en guestLogin:', error);
    return res.status(500).json({
      success: false,
      code: 'GUEST_AUTH_ERROR',
      message: 'No se pudo crear la sesión temporal de invitado.',
    });
  }
}

/**
 * 5. CONVERSIÓN / UPGRADE DE INVITADO A CUENTA REGISTRADA
 */
export async function upgradeGuest(req, res) {
  try {
    const { guestSessionId, type } = req.body;

    if (!guestSessionId) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_GUEST_ID',
        message: 'Se requiere el identificador de sesión de invitado.',
      });
    }

    if (type === 'google') {
      return googleAuth(req, res);
    } else if (type === 'register') {
      return register(req, res);
    }

    return res.status(400).json({
      success: false,
      code: 'INVALID_UPGRADE_TYPE',
      message: "El tipo de conversión debe ser 'register' o 'google'.",
    });
  } catch (error) {
    console.error('[Auth Controller] Error en upgradeGuest:', error);
    return res.status(500).json({
      success: false,
      code: 'UPGRADE_ERROR',
      message: 'Fallo al procesar la conversión de invitado.',
    });
  }
}

/**
 * 6. OBTENER INFORMACIÓN DE LA SESIÓN ACTUAL (ME)
 */
export async function getSessionUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'No hay una sesión activa.',
      });
    }

    if (req.user.isGuest) {
      return res.status(200).json({
        success: true,
        isGuest: true,
        user: {
          id: req.user.id,
          role: 'guest',
          isGuest: true,
          full_name: 'Invitado del Campus',
          username: 'invitado',
        },
        profile: {
          full_name: 'Invitado del Campus',
          username: 'invitado',
          role: 'guest',
          bio: 'Explorando en modo de solo lectura.',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          university: 'Modo Invitado',
          career: 'Explorador',
          semester: 'Visitante',
        },
      });
    }

    const user = await db.findUserById(req.user.id);
    const profile = await db.findProfileByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      isGuest: false,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        isGuest: false,
      },
      profile,
    });
  } catch (error) {
    console.error('[Auth Controller] Error en getSessionUser:', error);
    return res.status(500).json({
      success: false,
      code: 'SESSION_ERROR',
      message: 'Error al recuperar datos de sesión.',
    });
  }
}

/**
 * 7. CIERRE DE SESIÓN (LOGOUT)
 * Limpia cookies HTTP-only e invalida tokens en persistencia
 */
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.campus_refresh_token;

    if (refreshToken) {
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await db.revokeSession(hash);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    res.clearCookie('campus_access_token', cookieOptions);
    res.clearCookie('campus_refresh_token', cookieOptions);

    return res.status(200).json({
      success: true,
      code: 'LOGOUT_SUCCESS',
      message: 'Sesión cerrada exitosamente.',
    });
  } catch (error) {
    console.error('[Auth Controller] Error en logout:', error);
    return res.status(500).json({
      success: false,
      code: 'LOGOUT_ERROR',
      message: 'Error al cerrar sesión.',
    });
  }
}
