import { Request, Response, NextFunction } from 'express';
import { ServicioService } from '@/services/ServicioService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

export const buscarServicios = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    query, categoria, lat, lng, radio = 10, 
    precio_min, precio_max, verificados_solo, urgentes_solo,
    con_movilidad, disponible_ahora, tags, ordenar_por = 'relevancia',
    pagina = 1, por_pagina = 20
  } = req.query;

  try {
    const filtros = {
      query: query as string,
      ubicacion: lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined,
      radio: Number(radio),
      categoria: categoria as string,
      precio_min: precio_min ? Number(precio_min) : undefined,
      precio_max: precio_max ? Number(precio_max) : undefined,
      verificados_solo: verificados_solo === 'true',
      urgentes_solo: urgentes_solo === 'true',
      con_movilidad: con_movilidad === 'true',
      disponible_ahora: disponible_ahora === 'true',
      tags: tags ? (tags as string).split(',').map(t => t.trim()) : [],
      ordenar_por: ordenar_por as any,
      pagina: Number(pagina),
      por_pagina: Math.min(Number(por_pagina), 50) // Máximo 50 por página
    };

    const resultados = await ServicioService.buscarConFiltros(filtros);
    
    res.json({
      success: true,
      data: resultados
    });

  } catch (error) {
    console.error('Error en búsqueda de servicios:', error);
    throw createError('Error al buscar servicios', 500);
  }
});

export const obtenerServicio = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  try {
    const servicio = await ServicioService.obtenerPorId(id);
    
    res.json({
      success: true,
      data: servicio
    });

  } catch (error) {
    throw error; // ServicioService ya maneja el error 404
  }
});

export const crearServicio = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  
  try {
    const servicio = await ServicioService.crear(req.body, userId);
    
    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: servicio
    });

  } catch (error) {
    throw error; // ServicioService ya maneja los errores específicos
  }
});

export const actualizarServicio = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  try {
    // Verificar que el servicio pertenece al usuario
    const servicioExistente = await ServicioService.obtenerPorId(id);
    
    // Verificar ownership a través de la relación as_id -> usuario_id
    const ownerCheck = await query(`
      SELECT pa.usuario_id 
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      WHERE s.id = $1
    `, [id]);
    
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].usuario_id !== userId) {
      throw createError('No tienes permisos para actualizar este servicio', 403);
    }

    // Actualizar servicio
    const camposActualizables = [
      'titulo', 'descripcion', 'tipo_precio', 'precio_desde', 'precio_hasta',
      'disponible', 'urgente', 'requiere_matricula', 'matricula_numero', 'titulo_profesional'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => camposActualizables.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(updates).length === 0) {
      throw createError('No hay campos válidos para actualizar', 400);
    }

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    await query(`
      UPDATE servicios 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1
    `, values);

    // Actualizar tags si se proporcionan
    if (req.body.tags) {
      // Eliminar tags existentes
      await query('DELETE FROM servicio_tags WHERE servicio_id = $1', [id]);
      
      // Agregar nuevos tags
      await ServicioService.agregarTags(id, req.body.tags);
    }

    const servicioActualizado = await ServicioService.obtenerPorId(id);
    
    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: servicioActualizado
    });

  } catch (error) {
    throw error;
  }
});

export const eliminarServicio = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  try {
    // Verificar ownership
    const ownerCheck = await query(`
      SELECT pa.usuario_id 
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      WHERE s.id = $1
    `, [id]);
    
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].usuario_id !== userId) {
      throw createError('No tienes permisos para eliminar este servicio', 403);
    }

    // Soft delete - marcar como inactivo
    await query(`
      UPDATE servicios 
      SET activo = false, updated_at = NOW() 
      WHERE id = $1
    `, [id]);
    
    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerMisServicios = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { estado = 'todos', pagina = 1, por_pagina = 20 } = req.query;
  
  try {
    let whereCondition = '';
    if (estado === 'activos') {
      whereCondition = 'AND s.activo = true';
    } else if (estado === 'inactivos') {
      whereCondition = 'AND s.activo = false';
    }

    const offset = (Number(pagina) - 1) * Number(por_pagina);
    
    const serviciosResult = await query(`
      SELECT 
        s.*,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        c.color as categoria_color,
        COUNT(m.id) as total_matches,
        COUNT(m.id) FILTER (WHERE m.estado = 'contactado') as matches_contactados,
        COALESCE(AVG(cal.puntuacion), 5.0) as rating
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      INNER JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN matches m ON s.id = m.servicio_id
      LEFT JOIN calificaciones cal ON cal.calificado_id = pa.usuario_id AND cal.publica = true
      WHERE pa.usuario_id = $1 ${whereCondition}
      GROUP BY s.id, pa.id, c.id
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, Number(por_pagina), offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      WHERE pa.usuario_id = $1 ${whereCondition}
    `, [userId]);

    const servicios = serviciosResult.rows;
    const total = parseInt(countResult.rows[0].total);

    // Obtener tags para cada servicio
    if (servicios.length > 0) {
      const servicioIds = servicios.map(s => s.id);
      const tagsResult = await query(`
        SELECT st.servicio_id, t.id, t.nombre
        FROM servicio_tags st
        INNER JOIN tags t ON st.tag_id = t.id
        WHERE st.servicio_id = ANY($1)
      `, [servicioIds]);

      const tagsByServicio = tagsResult.rows.reduce((acc, row) => {
        if (!acc[row.servicio_id]) acc[row.servicio_id] = [];
        acc[row.servicio_id].push({ id: row.id, nombre: row.nombre });
        return acc;
      }, {});

      servicios.forEach(servicio => {
        servicio.tags = tagsByServicio[servicio.id] || [];
      });
    }

    res.json({
      success: true,
      data: {
        servicios,
        total,
        pagina: Number(pagina),
        por_pagina: Number(por_pagina),
        total_paginas: Math.ceil(total / Number(por_pagina))
      }
    });

  } catch (error) {
    console.error('Error obteniendo mis servicios:', error);
    throw createError('Error al obtener servicios', 500);
  }
});

export const obtenerCategorias = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categorias = await ServicioService.obtenerCategorias();
    
    res.json({
      success: true,
      data: categorias
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw createError('Error al obtener categorías', 500);
  }
});

export const obtenerDestacados = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { limite = 10 } = req.query;
  
  try {
    const servicios = await ServicioService.buscarDestacados(Number(limite));
    
    res.json({
      success: true,
      data: servicios
    });

  } catch (error) {
    console.error('Error obteniendo servicios destacados:', error);
    throw createError('Error al obtener servicios destacados', 500);
  }
});

// Helper para importar query desde donde sea necesario
import { query } from '@/config/database';