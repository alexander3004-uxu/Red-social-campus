/**
 * server/middlewares/authMiddleware.js
 * Middleware de Autenticación mediante JSON Web Tokens (JWT) y Cookies HTTP-only.
 * Protege rutas privadas, valida la integridad de la sesión e inyecta `req.user`.
 */

import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campus_super_secret_jwt_key_2026';

/**
 * Middleware obligatorio de autenticación
 * Acepta tokens desde cabecera Bearer o Cookie HTTP-only
 */
export async function authenticateToken(req, res, next) {
  try {
    let token = null;

    // 1. Extraer desde cabecera Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Extraer desde cookies HTTP-only
    else if (req.cookies && req.cookies.campus_access_token) {
      token = req.cookies.campus_access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Acceso no autorizado: Se requiere token de sesión.',
      });
    }

    // Verificar firma criptográfica
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Token de autenticación inválido o alterado.',
      });
    }

    // Si es sesión de invitado
    if (decoded.isGuest || decoded.role === 'guest') {
      req.user = {
        id: decoded.sub || decoded.id,
        role: 'guest',
        isGuest: true,
        email: decoded.email || 'invitado@campus.local',
        username: decoded.username || 'invitado',
        full_name: decoded.full_name || 'Invitado del Campus',
      };
      return next();
    }

    // Usuario registrado: verificar vigencia en base de datos
    const user = await db.findUserById(decoded.sub || decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'El usuario asociado a este token no existe o ha sido desactivado.',
      });
    }

    // Cargar perfil básico
    const profile = await db.findProfileByUserId(user.id);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      isGuest: false,
      username: profile?.username || decoded.username,
      full_name: profile?.full_name || decoded.full_name,
    };

    next();
  } catch (error) {
    console.error('[authMiddleware] Error de verificación:', error);
    return res.status(500).json({
      success: false,
      code: 'AUTH_INTERNAL_ERROR',
      message: 'Error interno en la verificación de credenciales.',
    });
  }
}

/**
 * Middleware opcional de autenticación: si hay token lo decodifica, si no, permite continuar
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.campus_access_token) {
      token = req.cookies.campus_access_token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.isGuest || decoded.role === 'guest') {
        req.user = {
          id: decoded.sub || decoded.id,
          role: 'guest',
          isGuest: true,
          username: decoded.username || 'invitado',
          full_name: decoded.full_name || 'Invitado del Campus',
        };
      } else {
        const user = await db.findUserById(decoded.sub || decoded.id);
        if (user && user.is_active) {
          const profile = await db.findProfileByUserId(user.id);
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isGuest: false,
            username: profile?.username || decoded.username,
            full_name: profile?.full_name || decoded.full_name,
          };
        }
      }
    } catch {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
}
