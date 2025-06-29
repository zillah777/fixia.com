import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '@/services/MatchingService';
import { AdvancedMatchingService } from '@/services/AdvancedMatchingService';
import { WhatsAppService } from '@/services/WhatsAppService';
import { NotificationService } from '@/services/NotificationService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export const encontrarMatches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { busqueda_id } = req.params;
  const { algoritmo = 'avanzado' } = req.query;
  
  try {
    let matches;
    
    // Usar algoritmo avanzado por defecto, fallback al básico si hay problemas
    if (algoritmo === 'avanzado') {
      try {
        matches = await AdvancedMatchingService.encontrarMatchesAvanzados(busqueda_id);
      } catch (advancedError) {
        console.error('Error en matching avanzado, usando algoritmo básico:', advancedError);
        matches = await MatchingService.encontrarMatches(busqueda_id);
      }
    } else {
      matches = await MatchingService.encontrarMatches(busqueda_id);
    }
    
    // Enviar notificaciones a Ases relevantes (ejecutar en background)
    NotificationService.notificarNuevaBusqueda(matches.matches).catch(error => {
      console.error('Error enviando notificaciones:', error);
    });
    
    res.json({
      success: true,
      data: matches,
      algoritmo_usado: algoritmo === 'avanzado' ? 'avanzado' : 'basico'
    });

  } catch (error) {
    throw error;
  }
});

export const crearMatch = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { servicio_id, busqueda_id, as_id, explorador_id } = req.body;
  const userId = req.user!.id;
  
  try {
    // Verificar que el usuario tenga permisos para crear el match
    let puedeCrear = false;
    
    if (explorador_id) {
      // Verificar que el usuario sea el explorador
      const exploradorCheck = await query(`
        SELECT usuario_id FROM perfiles_exploradores WHERE id = $1 AND usuario_id = $2
      `, [explorador_id, userId]);
      puedeCrear = exploradorCheck.rows.length > 0;
    }
    
    if (as_id && !puedeCrear) {
      // Verificar que el usuario sea el As
      const asCheck = await query(`
        SELECT usuario_id FROM perfiles_ases WHERE id = $1 AND usuario_id = $2
      `, [as_id, userId]);
      puedeCrear = asCheck.rows.length > 0;
    }
    
    if (!puedeCrear) {
      throw createError('No tienes permisos para crear este match', 403);
    }

    // Verificar que no exista ya un match
    const existingMatch = await query(`
      SELECT id FROM matches 
      WHERE (servicio_id = $1 OR busqueda_id = $2) 
      AND as_id = $3 AND explorador_id = $4
    `, [servicio_id, busqueda_id, as_id, explorador_id]);

    if (existingMatch.rows.length > 0) {
      throw createError('Ya existe un match entre estos usuarios', 400);
    }

    // Calcular distancia si es necesario
    let distancia_km = null;
    if (servicio_id) {
      const distanciaResult = await query(`
        SELECT ROUND(
          6371 * acos(
            cos(radians(pe.latitud)) * cos(radians(pa.latitud)) * 
            cos(radians(pa.longitud) - radians(pe.longitud)) + 
            sin(radians(pe.latitud)) * sin(radians(pa.latitud))
          )::numeric, 2
        ) as distancia
        FROM perfiles_exploradores pe, perfiles_ases pa
        WHERE pe.id = $1 AND pa.id = $2
      `, [explorador_id, as_id]);
      
      if (distanciaResult.rows.length > 0) {
        distancia_km = distanciaResult.rows[0].distancia;
      }
    }

    const match = await MatchingService.crearMatch({
      servicio_id,
      busqueda_id,
      as_id,
      explorador_id,
      distancia_km
    });

    // Notificar a ambas partes
    await NotificationService.notificarNuevoMatch(match.id);

    res.status(201).json({
      success: true,
      message: 'Match creado exitosamente',
      data: match
    });

  } catch (error) {
    throw error;
  }
});

export const contactarAs = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { match_id, metodo_contacto, mensaje_personalizado } = req.body;
  const userId = req.user!.id;
  
  try {
    // Verificar que el usuario sea parte del match
    const matchVerification = await query(`
      SELECT m.*, pe.usuario_id as explorador_usuario_id
      FROM matches m
      INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
      WHERE m.id = $1 AND pe.usuario_id = $2
    `, [match_id, userId]);

    if (matchVerification.rows.length === 0) {
      throw createError('No tienes permisos para contactar en este match', 403);
    }

    const match = await MatchingService.contactar(match_id, metodo_contacto);
    
    // Generar link de WhatsApp si es necesario
    let respuesta: any = { match };
    
    if (metodo_contacto === 'whatsapp') {
      // Validar número de teléfono
      if (!WhatsAppService.validarNumeroArgentino(match.as_telefono)) {
        throw createError('Número de teléfono inválido para WhatsApp', 400);
      }
      
      const whatsappLink = mensaje_personalizado 
        ? WhatsAppService.generarMensajeProfesional(match, mensaje_personalizado)
        : WhatsAppService.generarLink(match);
      
      respuesta.whatsapp_link = whatsappLink;
      respuesta.numero_formateado = WhatsAppService.formatearNumero(match.as_telefono);
    }

    // Notificar al As
    await NotificationService.notificarContacto(match_id, metodo_contacto);

    res.json({
      success: true,
      message: `Contacto iniciado vía ${metodo_contacto}`,
      data: respuesta
    });

  } catch (error) {
    throw error;
  }
});

export const actualizarEstadoMatch = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { estado } = req.body;
  const userId = req.user!.id;
  
  const estadosValidos = ['sugerido', 'contactado', 'rechazado', 'completado'];
  if (!estadosValidos.includes(estado)) {
    throw createError('Estado de match inválido', 400);
  }

  try {
    const match = await MatchingService.actualizarEstadoMatch(id, estado, userId);
    
    // Si se completa el match, notificar para calificación
    if (estado === 'completado') {
      await NotificationService.crearNotificacion({
        usuario_id: userId,
        tipo: 'sistema',
        titulo: '⭐ ¡Calificá tu experiencia!',
        mensaje: 'Ayudá a otros usuarios calificando este servicio',
        datos_extra: { match_id: id, accion: 'calificar' }
      });
    }

    res.json({
      success: true,
      message: 'Estado del match actualizado',
      data: match
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerMisMatches = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const tipoUsuario = req.user!.tipo_usuario;
  const { estado, pagina = 1, por_pagina = 20 } = req.query;
  
  try {
    let matches = await MatchingService.obtenerMatchesUsuario(userId, tipoUsuario);
    
    // Filtrar por estado si se especifica
    if (estado && estado !== 'todos') {
      matches = matches.filter(match => match.estado === estado);
    }

    // Paginación
    const total = matches.length;
    const offset = (Number(pagina) - 1) * Number(por_pagina);
    const matchesPaginados = matches.slice(offset, offset + Number(por_pagina));

    res.json({
      success: true,
      data: {
        matches: matchesPaginados,
        total,
        pagina: Number(pagina),
        por_pagina: Number(por_pagina),
        total_paginas: Math.ceil(total / Number(por_pagina))
      }
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerEstadisticasMatching = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const tipoUsuario = req.user!.tipo_usuario;
  
  try {
    const estadisticas = await MatchingService.obtenerEstadisticasMatching(userId, tipoUsuario);
    
    // Calcular métricas adicionales
    const tasaContacto = estadisticas.total_matches > 0 
      ? (estadisticas.contactados / estadisticas.total_matches * 100).toFixed(1)
      : '0';
      
    const tasaCompletado = estadisticas.contactados > 0
      ? (estadisticas.completados / estadisticas.contactados * 100).toFixed(1)
      : '0';

    res.json({
      success: true,
      data: {
        ...estadisticas,
        metricas: {
          tasa_contacto: `${tasaContacto}%`,
          tasa_completado: `${tasaCompletado}%`,
          score_promedio: estadisticas.score_promedio ? 
            (estadisticas.score_promedio * 100).toFixed(1) + '%' : 'N/A'
        }
      }
    });

  } catch (error) {
    throw error;
  }
});

export const rechazarMatch = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { motivo } = req.body;
  const userId = req.user!.id;
  
  try {
    const match = await MatchingService.actualizarEstadoMatch(id, 'rechazado', userId);
    
    // Registrar motivo del rechazo si se proporciona
    if (motivo) {
      await query(`
        UPDATE matches 
        SET datos_extra = COALESCE(datos_extra, '{}'::jsonb) || $1
        WHERE id = $2
      `, [JSON.stringify({ motivo_rechazo: motivo }), id]);
    }

    res.json({
      success: true,
      message: 'Match rechazado',
      data: match
    });

  } catch (error) {
    throw error;
  }
});

export const completarMatch = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  try {
    const match = await MatchingService.actualizarEstadoMatch(id, 'completado', userId);
    
    // Obtener información de ambas partes para notificaciones de calificación
    const matchInfo = await query(`
      SELECT 
        m.*,
        pe.usuario_id as explorador_usuario_id,
        pa.usuario_id as as_usuario_id
      FROM matches m
      INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
      INNER JOIN perfiles_ases pa ON m.as_id = pa.id
      WHERE m.id = $1
    `, [id]);

    if (matchInfo.rows.length > 0) {
      const matchData = matchInfo.rows[0];
      
      // Notificar a ambas partes para que califiquen
      await Promise.all([
        NotificationService.crearNotificacion({
          usuario_id: matchData.explorador_usuario_id,
          tipo: 'sistema',
          titulo: '⭐ ¡Calificá al As!',
          mensaje: 'Ayudá a otros Exploradores compartiendo tu experiencia',
          datos_extra: { match_id: id, tipo_calificacion: 'explorador_califica_as' }
        }),
        NotificationService.crearNotificacion({
          usuario_id: matchData.as_usuario_id,
          tipo: 'sistema',
          titulo: '⭐ ¡Calificá al Explorador!',
          mensaje: 'Compartí tu experiencia con este Explorador',
          datos_extra: { match_id: id, tipo_calificacion: 'as_califica_explorador' }
        })
      ]);
    }

    res.json({
      success: true,
      message: 'Match completado. ¡No olvides calificar tu experiencia!',
      data: match
    });

  } catch (error) {
    throw error;
  }
});

// Helper import
import { query } from '@/config/database';