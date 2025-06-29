import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, PerfilAsModel, PerfilExploradorModel } from '@/models/User';
import { generateVerificationToken, generateTokenPair, verifyRefreshToken, revokeRefreshToken, isRefreshTokenValid } from '@/utils/tokens';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import EmailService from '@/services/EmailService';
import { getCache, setCache, delCache } from '@/config/redis';
import { 
  createSession, 
  destroySession, 
  recordFailedAttempt, 
  clearFailedAttempts,
  revokeToken,
  AuthRequest 
} from '@/middleware/auth';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, tipo_usuario, acepta_terminos, ...profileData } = req.body;
  
  // Verificar que no exista el usuario
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw createError('El email ya está registrado', 400);
  }

  // Hash de la contraseña
  const password_hash = await bcrypt.hash(password, 12);
  
  // Generar token de verificación
  const token_verificacion = generateVerificationToken();
  
  try {
    // Crear usuario
    const user = await User.create({
      email,
      password_hash,
      tipo_usuario,
      token_verificacion
    });

    // Crear perfiles según el tipo de usuario
    const profilePromises = [];
    
    if (tipo_usuario === 'as' || tipo_usuario === 'ambos') {
      profilePromises.push(
        PerfilAsModel.create({
          usuario_id: user.id,
          ...profileData
        })
      );
    }
    
    if (tipo_usuario === 'explorador' || tipo_usuario === 'ambos') {
      profilePromises.push(
        PerfilExploradorModel.create({
          usuario_id: user.id,
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          dni: profileData.dni,
          telefono: profileData.telefono,
          direccion: profileData.direccion,
          localidad: profileData.localidad,
          provincia: profileData.provincia,
          codigo_postal: profileData.codigo_postal,
          latitud: profileData.latitud,
          longitud: profileData.longitud
        })
      );
    }

    await Promise.all(profilePromises);

    // Enviar email de verificación (no fallar si no se puede enviar)
    const emailSent = await EmailService.sendVerificationEmail(email, token_verificacion);
    if (!emailSent) {
      console.log(`⚠️ Email de verificación no enviado para ${email}`);
    }

    // Rate limiting para registros
    const registrationKey = `registration_attempts:${req.ip}`;
    const attempts = await getCache(registrationKey) || 0;
    await setCache(registrationKey, attempts + 1, 3600); // 1 hora

    res.status(201).json({
      success: true,
      message: `¡Registro exitoso! Enviamos un email de verificación a ${email}. Revisá tu bandeja de entrada para activar tu cuenta.`,
      data: {
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        verificacion_pendiente: true
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    throw createError('Error interno del servidor durante el registro', 500);
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, remember_me = false } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '';
  
  try {
    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      await recordFailedAttempt(ip, email);
      throw createError('Email o contraseña incorrectos', 401);
    }

    // Verificar si el usuario está bloqueado temporalmente
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      throw createError('Cuenta temporalmente bloqueada por múltiples intentos fallidos', 423);
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await recordFailedAttempt(ip, email);
      
      // Incrementar intentos fallidos del usuario
      await User.incrementFailedAttempts(email);
      
      throw createError('Email o contraseña incorrectos', 401);
    }

    // Verificar que el email esté verificado
    if (!user.email_verificado) {
      throw createError('Debes verificar tu email antes de iniciar sesión. Revisá tu bandeja de entrada.', 401);
    }

    // Verificar estado del usuario
    if (user.estado === 'suspendido') {
      throw createError('Tu cuenta ha sido suspendida. Contactá al soporte.', 401);
    }

    // Comentamos esta validación ya que 'inactivo' no está en el enum
    // if (user.estado === 'inactivo') {
    //   throw createError('Tu cuenta está inactiva. Contactá al soporte.', 401);
    // }

    // Login exitoso - limpiar intentos fallidos
    await clearFailedAttempts(ip, email);
    await User.resetFailedAttempts(email);

    // Crear sesión
    const sessionId = await createSession(user.id);

    // Generar tokens
    const tokens = await generateTokenPair({
      id: user.id,
      email: user.email,
      tipo_usuario: user.tipo_usuario
    });

    // Actualizar último acceso
    await User.updateLastAccess(user.id);

    // Obtener perfiles del usuario
    const userWithProfiles = await User.getUserWithProfiles(user.id);

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: {
        id: user.id,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        estado: user.estado,
        email_verificado: user.email_verificado
      },
      perfiles: {
        as: userWithProfiles?.perfilAs || null,
        explorador: userWithProfiles?.perfilExplorador || null
      },
      tokens
    }
  });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;
  
  // Buscar usuario por token
  const user = await User.findByVerificationToken(token);
  if (!user) {
    throw createError('Token de verificación inválido o expirado', 400);
  }

  // Verificar email
  const verified = await User.verifyEmail(token);
  if (!verified) {
    throw createError('Error al verificar el email', 500);
  }

  // Enviar email de bienvenida
  const userWithProfiles = await User.getUserWithProfiles(user.id);
  const nombre = userWithProfiles?.perfilAs?.nombre || userWithProfiles?.perfilExplorador?.nombre || 'Usuario';
  
  await EmailService.sendWelcomeEmail(user.email, nombre, user.tipo_usuario);

  res.json({
    success: true,
    message: '¡Email verificado exitosamente! Tu cuenta ya está activa.',
    data: {
      email_verificado: true,
      puede_iniciar_sesion: true
    }
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  // Rate limiting para reset de contraseña
  const resetKey = `password_reset:${req.ip}:${email}`;
  const attempts = await getCache(resetKey) || 0;
  
  if (attempts >= 3) {
    throw createError('Demasiados intentos de reset. Intentá de nuevo en 1 hora.', 429);
  }

  const user = await User.findByEmail(email);
  
  // Siempre responder exitosamente por seguridad (no revelar si el email existe)
  if (user) {
    const resetToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

    await User.setResetPasswordToken(email, resetToken, expiresAt);
    await EmailService.sendPasswordResetEmail(email, resetToken);
  }

  await setCache(resetKey, attempts + 1, 3600);

  res.json({
    success: true,
    message: 'Si el email existe en nuestro sistema, enviaremos las instrucciones para restablecer tu contraseña.'
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;
  
  // Buscar usuario por token de reset
  const user = await User.findByResetToken(token);
  if (!user) {
    throw createError('Token de reset inválido o expirado', 400);
  }

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Actualizar contraseña
  const updated = await User.updatePassword(user.id, hashedPassword);
  if (!updated) {
    throw createError('Error al actualizar la contraseña', 500);
  }

  // Revocar todos los refresh tokens del usuario (forzar re-login)
  await revokeRefreshToken(user.id);

  res.json({
    success: true,
    message: 'Contraseña restablecida exitosamente. Ya podés iniciar sesión con tu nueva contraseña.'
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw createError('Refresh token requerido', 400);
  }

  try {
    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Verificar que el token existe en la base de datos
    const isValid = await isRefreshTokenValid(payload.id, refreshToken);
    if (!isValid) {
      throw createError('Refresh token inválido', 401);
    }

    // Buscar usuario
    const user = await User.findById(payload.id);
    if (!user || user.estado === 'suspendido') {
      throw createError('Usuario no encontrado o suspendido', 401);
    }

    // Generar nuevos tokens
    const tokens = await generateTokenPair({
      id: user.id,
      email: user.email,
      tipo_usuario: user.tipo_usuario
    });

    res.json({
      success: true,
      message: 'Tokens renovados exitosamente',
      data: { tokens }
    });

  } catch (error) {
    throw createError('Refresh token inválido', 401);
  }
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user) {
    // Revocar refresh token
    await revokeRefreshToken(user.id);
  }

  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  const userWithProfiles = await User.getUserWithProfiles(user.id);
  
  if (!userWithProfiles) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json({
    success: true,
    data: {
      user: userWithProfiles.user,
      perfiles: {
        as: userWithProfiles.perfilAs || null,
        explorador: userWithProfiles.perfilExplorador || null
      }
    }
  });
});