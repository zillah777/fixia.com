import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '@/config/database';
import { createError } from './errorHandler';
import { getCache, setCache } from '@/config/redis';
import crypto from 'crypto';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo_usuario: 'as' | 'explorador' | 'ambos';
    estado: string;
    email_verificado: boolean;
    ultimo_acceso: Date;
    intentos_fallidos: number;
    bloqueado_hasta?: Date;
  };
}

interface JWTPayload {
  id: string;
  email: string;
  tipo_usuario: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token requerido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ 
        error: 'Token revocado',
        code: 'TOKEN_REVOKED'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Validar sesión activa
    const sessionValid = await validateSession(decoded.sessionId, decoded.id);
    if (!sessionValid) {
      return res.status(401).json({ 
        error: 'Sesión inválida',
        code: 'INVALID_SESSION'
      });
    }
    
    const result = await query(`
      SELECT 
        id, email, tipo_usuario, estado, email_verificado, 
        ultimo_acceso, intentos_fallidos, bloqueado_hasta,
        created_at, updated_at
      FROM usuarios 
      WHERE id = $1
    `, [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const user = result.rows[0];
    
    // Verificar estado del usuario
    if (user.estado === 'suspendido') {
      return res.status(401).json({ 
        error: 'Usuario suspendido',
        code: 'USER_SUSPENDED'
      });
    }

    if (user.estado === 'suspendido') {
      return res.status(401).json({ 
        error: 'Cuenta suspendida',
        code: 'ACCOUNT_SUSPENDED'
      });
    }
    
    // Verificar email verificado
    if (!user.email_verificado) {
      return res.status(401).json({ 
        error: 'Email no verificado',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Verificar si está bloqueado
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      return res.status(401).json({ 
        error: 'Usuario temporalmente bloqueado',
        code: 'USER_BLOCKED',
        blockedUntil: user.bloqueado_hasta
      });
    }

    // Detectar actividad sospechosa
    await detectSuspiciousActivity(req, user);
    
    // Actualizar último acceso
    await updateLastAccess(user.id, req);
    
    req.user = user;
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({ 
      error: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Mantener compatibilidad con el middleware anterior
export const authenticate = authenticateToken;

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('No autorizado', 401));
    }
    
    if (!roles.includes(req.user.tipo_usuario)) {
      return next(createError('No tienes permisos para acceder a este recurso', 403));
    }
    
    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const result = await query(`
        SELECT id, email, tipo_usuario, estado, email_verificado 
        FROM usuarios WHERE id = $1
      `, [decoded.id]);
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Validar sesión activa
async function validateSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const sessionKey = `session:${userId}:${sessionId}`;
    const session = await getCache(sessionKey);
    return !!session;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

// Detectar actividad sospechosa
async function detectSuspiciousActivity(req: Request, user: any): Promise<void> {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const currentFingerprint = generateFingerprint(userAgent, ip);
    
    // Obtener el último fingerprint conocido
    const lastFingerprintKey = `fingerprint:${user.id}`;
    const lastFingerprint = await getCache(lastFingerprintKey);
    
    if (lastFingerprint && lastFingerprint !== currentFingerprint) {
      // Dispositivo/ubicación diferente detectada
      console.log(`🚨 Actividad sospechosa detectada para usuario ${user.email}`);
      
      // Registrar evento de seguridad
      await logSecurityEvent({
        userId: user.id,
        eventType: 'suspicious_device',
        ip,
        userAgent,
        details: { lastFingerprint, currentFingerprint }
      });
      
      // Opcional: Notificar al usuario
      // await NotificationService.crearNotificacion({
      //   usuario_id: user.id,
      //   tipo: 'sistema',
      //   titulo: '🔒 Nuevo dispositivo detectado',
      //   mensaje: 'Se detectó un acceso desde un dispositivo desconocido'
      // });
    }
    
    // Actualizar fingerprint
    await setCache(lastFingerprintKey, currentFingerprint, 30 * 24 * 60 * 60); // 30 días
    
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
  }
}

// Generar fingerprint del dispositivo
function generateFingerprint(userAgent: string, ip: string): string {
  const data = `${userAgent}:${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Actualizar último acceso
async function updateLastAccess(userId: string, req: Request): Promise<void> {
  try {
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    await query(`
      UPDATE usuarios 
      SET ultimo_acceso = NOW(), ultima_ip = $1, ultimo_user_agent = $2
      WHERE id = $3
    `, [ip, userAgent, userId]);
    
  } catch (error) {
    console.error('Error updating last access:', error);
  }
}

// Registrar evento de seguridad
async function logSecurityEvent(event: {
  userId: string;
  eventType: string;
  ip: string;
  userAgent: string;
  details?: any;
}): Promise<void> {
  try {
    await query(`
      INSERT INTO security_logs (usuario_id, event_type, ip_address, user_agent, details, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      event.userId,
      event.eventType,
      event.ip,
      event.userAgent,
      JSON.stringify(event.details || {})
    ]);
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Revocar token (agregar a blacklist)
export async function revokeToken(token: string): Promise<void> {
  try {
    // Obtener tiempo de expiración del token
    const decoded = jwt.decode(token) as any;
    const expirationTime = decoded.exp * 1000 - Date.now();
    
    if (expirationTime > 0) {
      await setCache(`blacklist:${token}`, 'revoked', Math.floor(expirationTime / 1000));
    }
  } catch (error) {
    console.error('Error revoking token:', error);
  }
}

// Crear sesión
export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const sessionKey = `session:${userId}:${sessionId}`;
  
  // Sesión válida por 24 horas
  await setCache(sessionKey, { 
    userId, 
    createdAt: new Date().toISOString() 
  }, 24 * 60 * 60);
  
  return sessionId;
}

// Terminar sesión
export async function destroySession(userId: string, sessionId: string): Promise<void> {
  const sessionKey = `session:${userId}:${sessionId}`;
  await setCache(sessionKey, null, 0); // Eliminar inmediatamente
}

// Middleware para verificar email verificado
export const requireEmailVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (!req.user.email_verificado) {
    return res.status(403).json({ 
      error: 'Email no verificado. Verifica tu email antes de continuar.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

// Middleware para verificar cuentas activas
export const requireActiveAccount = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.estado !== 'activo') {
    return res.status(403).json({ 
      error: 'Cuenta inactiva o suspendida',
      code: 'ACCOUNT_NOT_ACTIVE'
    });
  }

  next();
};

// Middleware para prevenir ataques de fuerza bruta
export const preventBruteForce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || '';
    const email = req.body.email;
    
    if (!email) {
      return next();
    }
    
    // Verificar intentos por IP
    const ipKey = `attempts:ip:${ip}`;
    const ipAttempts = await getCache(ipKey) || 0;
    
    // Verificar intentos por email
    const emailKey = `attempts:email:${email}`;
    const emailAttempts = await getCache(emailKey) || 0;
    
    if (ipAttempts >= 10 || emailAttempts >= 5) {
      return res.status(429).json({
        error: 'Demasiados intentos. Intenta más tarde.',
        code: 'TOO_MANY_ATTEMPTS'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in brute force prevention:', error);
    next();
  }
};

// Registrar intento fallido
export async function recordFailedAttempt(ip: string, email: string): Promise<void> {
  try {
    const ipKey = `attempts:ip:${ip}`;
    const emailKey = `attempts:email:${email}`;
    
    // Incrementar contadores con expiración de 15 minutos
    const currentIpAttempts = await getCache(ipKey) || 0;
    const currentEmailAttempts = await getCache(emailKey) || 0;
    
    await setCache(ipKey, currentIpAttempts + 1, 15 * 60);
    await setCache(emailKey, currentEmailAttempts + 1, 15 * 60);
    
  } catch (error) {
    console.error('Error recording failed attempt:', error);
  }
}

// Limpiar intentos fallidos (después de login exitoso)
export async function clearFailedAttempts(ip: string, email: string): Promise<void> {
  try {
    const ipKey = `attempts:ip:${ip}`;
    const emailKey = `attempts:email:${email}`;
    
    await setCache(ipKey, null, 0);
    await setCache(emailKey, null, 0);
    
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
}