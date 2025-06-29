import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '@/config/database';

export interface TokenPayload {
  id: string;
  email: string;
  tipo_usuario: string;
  iat?: number;
  exp?: number;
}

// Generar token de verificación/reset
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generar JWT access token
export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const options: SignOptions = {
    expiresIn: '15m',
    issuer: 'serviplay',
    audience: 'serviplay-users'
  };
  return jwt.sign(payload as object, secret, options);
};

// Generar JWT refresh token
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  const options: SignOptions = {
    expiresIn: '7d',
    issuer: 'serviplay',
    audience: 'serviplay-users'
  };
  return jwt.sign(payload as object, secret, options);
};

// Verificar access token
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: 'serviplay',
      audience: 'serviplay-users'
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Verificar refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
      issuer: 'serviplay',
      audience: 'serviplay-users'
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

// Guardar refresh token en base de datos
export const saveRefreshToken = async (userId: string, token: string, expiresAt: Date): Promise<void> => {
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) 
     DO UPDATE SET token = $2, expires_at = $3, updated_at = NOW()`,
    [userId, token, expiresAt]
  );
};

// Verificar si refresh token existe y es válido
export const isRefreshTokenValid = async (userId: string, token: string): Promise<boolean> => {
  const result = await query(
    `SELECT id FROM refresh_tokens 
     WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
    [userId, token]
  );
  
  return result.rows.length > 0;
};

// Revocar refresh token
export const revokeRefreshToken = async (userId: string): Promise<void> => {
  await query(
    'DELETE FROM refresh_tokens WHERE user_id = $1',
    [userId]
  );
};

// Limpiar tokens expirados
export const cleanExpiredTokens = async (): Promise<void> => {
  await query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
};

// Generar tokens de sesión (access + refresh)
export const generateTokenPair = async (user: { id: string; email: string; tipo_usuario: string }) => {
  const payload = {
    id: user.id,
    email: user.email,
    tipo_usuario: user.tipo_usuario
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calcular fecha de expiración del refresh token
  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 días

  // Guardar refresh token
  await saveRefreshToken(user.id, refreshToken, refreshExpiresAt);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutos en segundos
    tokenType: 'Bearer'
  };
};