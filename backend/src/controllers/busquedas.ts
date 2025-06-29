import { Request, Response, NextFunction } from 'express';
import { BusquedaService } from '@/services/BusquedaService';
import { AdvancedMatchingService } from '@/services/AdvancedMatchingService';
import { NotificationService } from '@/services/NotificationService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export const crearBusqueda = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const busquedaData = req.body;
  
  try {
    const busqueda = await BusquedaService.crear(busquedaData, userId);
    
    // Iniciar búsqueda de matches automáticamente en background
    AdvancedMatchingService.encontrarMatchesAvanzados(busqueda.id).then(matches => {
      // Notificar al explorador sobre matches encontrados
      if (matches.matches.length > 0) {
        NotificationService.crearNotificacion({
          usuario_id: userId,
          tipo: 'sistema',
          titulo: `🎯 ¡${matches.matches.length} Ases encontrados!`,
          mensaje: `Encontramos ${matches.matches.length} Ases perfectos para "${busqueda.titulo}"`,
          datos_extra: { 
            busqueda_id: busqueda.id, 
            total_matches: matches.matches.length,
            accion: 'ver_matches'
          }
        }).catch(error => console.error('Error enviando notificación:', error));
      }
    }).catch(error => {
      console.error('Error en matching automático:', error);
    });
    
    res.status(201).json({
      success: true,
      message: 'Búsqueda creada exitosamente',
      data: busqueda
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerBusqueda = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  try {
    const busqueda = await BusquedaService.obtenerPorId(id);
    
    res.json({
      success: true,
      data: busqueda
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerMisBusquedas = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { estado } = req.query;
  
  try {
    const busquedas = await BusquedaService.obtenerBusquedasUsuario(userId, estado as string);
    
    res.json({
      success: true,
      data: busquedas
    });

  } catch (error) {
    throw error;
  }
});

export const actualizarBusqueda = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const updateData = req.body;
  
  try {
    const busqueda = await BusquedaService.actualizar(id, updateData, userId);
    
    res.json({
      success: true,
      message: 'Búsqueda actualizada exitosamente',
      data: busqueda
    });

  } catch (error) {
    throw error;
  }
});

export const cambiarEstadoBusqueda = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { estado } = req.body;
  const userId = req.user!.id;
  
  const estadosValidos = ['activa', 'pausada', 'completada', 'cancelada'];
  if (!estadosValidos.includes(estado)) {
    throw createError('Estado de búsqueda inválido', 400);
  }
  
  try {
    const busqueda = await BusquedaService.cambiarEstado(id, estado, userId);
    
    // Si se reactiva una búsqueda, buscar nuevos matches
    if (estado === 'activa') {
      AdvancedMatchingService.encontrarMatchesAvanzados(id).then(matches => {
        if (matches.matches.length > 0) {
          NotificationService.crearNotificacion({
            usuario_id: userId,
            tipo: 'sistema',
            titulo: '🔄 Búsqueda reactivada',
            mensaje: `Tu búsqueda "${busqueda.titulo}" está activa nuevamente`,
            datos_extra: { busqueda_id: id, nuevos_matches: matches.matches.length }
          }).catch(error => console.error('Error enviando notificación:', error));
        }
      }).catch(error => {
        console.error('Error en matching de reactivación:', error);
      });
    }
    
    res.json({
      success: true,
      message: `Búsqueda ${estado === 'activa' ? 'activada' : estado}`,
      data: busqueda
    });

  } catch (error) {
    throw error;
  }
});

export const eliminarBusqueda = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  try {
    await BusquedaService.eliminar(id, userId);
    
    res.json({
      success: true,
      message: 'Búsqueda cancelada exitosamente'
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerMatchesBusqueda = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { usar_algoritmo_avanzado = 'true' } = req.query;
  
  try {
    let matches;
    
    if (usar_algoritmo_avanzado === 'true') {
      matches = await AdvancedMatchingService.encontrarMatchesAvanzados(id);
    } else {
      // Fallback al algoritmo básico si es necesario
      const { MatchingService } = await import('@/services/MatchingService');
      matches = await MatchingService.encontrarMatches(id);
    }
    
    res.json({
      success: true,
      data: matches
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerBusquedasActivas = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { limite = 20 } = req.query;
  
  try {
    const busquedas = await BusquedaService.obtenerBusquedasActivas(Number(limite));
    
    res.json({
      success: true,
      data: busquedas
    });

  } catch (error) {
    throw error;
  }
});

export const buscarPorUbicacion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng, radio = 20 } = req.query;
  
  if (!lat || !lng) {
    throw createError('Se requieren coordenadas de ubicación', 400);
  }
  
  try {
    const busquedas = await BusquedaService.buscarPorUbicacion(
      Number(lat), 
      Number(lng), 
      Number(radio)
    );
    
    res.json({
      success: true,
      data: busquedas
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerEstadisticasBusquedas = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  
  try {
    const estadisticas = await BusquedaService.obtenerEstadisticas(userId);
    
    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    throw error;
  }
});

export const duplicarBusqueda = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  try {
    // Obtener búsqueda original
    const busquedaOriginal = await BusquedaService.obtenerPorId(id);
    
    // Verificar ownership
    const perfilExplorador = await import('@/config/database').then(({ query }) => 
      query('SELECT id FROM perfiles_exploradores WHERE usuario_id = $1', [userId])
    );
    
    if (perfilExplorador.rows.length === 0 || 
        perfilExplorador.rows[0].id !== busquedaOriginal.explorador_id) {
      throw createError('No tienes permisos para duplicar esta búsqueda', 403);
    }
    
    // Crear copia de la búsqueda
    const nuevaBusqueda = await BusquedaService.crear({
      titulo: `${busquedaOriginal.titulo} (copia)`,
      descripcion: busquedaOriginal.descripcion,
      categoria_id: busquedaOriginal.categoria_id,
      direccion_trabajo: busquedaOriginal.direccion_trabajo,
      latitud_trabajo: busquedaOriginal.latitud_trabajo,
      longitud_trabajo: busquedaOriginal.longitud_trabajo,
      radio_busqueda: busquedaOriginal.radio_busqueda,
      presupuesto_minimo: busquedaOriginal.presupuesto_minimo,
      presupuesto_maximo: busquedaOriginal.presupuesto_maximo,
      tipo_precio: busquedaOriginal.tipo_precio,
      urgente: busquedaOriginal.urgente
    }, userId);
    
    res.status(201).json({
      success: true,
      message: 'Búsqueda duplicada exitosamente',
      data: nuevaBusqueda
    });

  } catch (error) {
    throw error;
  }
});