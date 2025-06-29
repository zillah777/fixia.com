import { query } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { BusquedaServicio } from '@/types';

export class BusquedaService {
  static async crear(data: any, userId: string) {
    try {
      // Verificar que el usuario sea Explorador
      const perfilExplorador = await query(
        'SELECT * FROM perfiles_exploradores WHERE usuario_id = $1',
        [userId]
      );

      if (perfilExplorador.rows.length === 0) {
        throw createError('Solo los Exploradores pueden crear búsquedas', 403);
      }

      const perfil = perfilExplorador.rows[0];

      // Crear búsqueda
      const result = await query(`
        INSERT INTO busquedas_servicios (
          explorador_id, titulo, descripcion, categoria_id,
          direccion_trabajo, latitud_trabajo, longitud_trabajo, radio_busqueda,
          presupuesto_minimo, presupuesto_maximo, tipo_precio,
          fecha_necesaria, hora_necesaria, urgente
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        perfil.id,
        data.titulo,
        data.descripcion,
        data.categoria_id,
        data.direccion_trabajo || perfil.direccion,
        data.latitud_trabajo || perfil.latitud,
        data.longitud_trabajo || perfil.longitud,
        data.radio_busqueda || 10,
        data.presupuesto_minimo,
        data.presupuesto_maximo,
        data.tipo_precio,
        data.fecha_necesaria,
        data.hora_necesaria,
        data.urgente || false
      ]);

      return result.rows[0];

    } catch (error) {
      console.error('Error creando búsqueda:', error);
      throw error;
    }
  }

  static async obtenerPorId(busquedaId: string) {
    const result = await query(`
      SELECT 
        bs.*,
        pe.nombre as explorador_nombre,
        pe.apellido as explorador_apellido,
        pe.foto_perfil as explorador_foto,
        pe.telefono as explorador_telefono,
        pe.latitud as explorador_lat,
        pe.longitud as explorador_lng,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        c.color as categoria_color
      FROM busquedas_servicios bs
      INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
      LEFT JOIN categorias c ON bs.categoria_id = c.id
      WHERE bs.id = $1
    `, [busquedaId]);

    if (result.rows.length === 0) {
      throw createError('Búsqueda no encontrada', 404);
    }

    return result.rows[0];
  }

  static async obtenerBusquedasUsuario(userId: string, estado?: string) {
    let whereCondition = '';
    const params = [userId];
    
    if (estado && estado !== 'todas') {
      whereCondition = 'AND bs.estado = $2';
      params.push(estado);
    }

    const result = await query(`
      SELECT 
        bs.*,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        COUNT(m.id) as total_matches,
        COUNT(m.id) FILTER (WHERE m.estado = 'sugerido') as matches_pendientes,
        COUNT(m.id) FILTER (WHERE m.estado = 'contactado') as matches_contactados
      FROM busquedas_servicios bs
      INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
      LEFT JOIN categorias c ON bs.categoria_id = c.id
      LEFT JOIN matches m ON bs.id = m.busqueda_id
      WHERE pe.usuario_id = $1 ${whereCondition}
      GROUP BY bs.id, c.id
      ORDER BY bs.created_at DESC
    `, params);

    return result.rows;
  }

  static async actualizar(busquedaId: string, data: any, userId: string) {
    try {
      // Verificar ownership
      const ownerCheck = await query(`
        SELECT pe.usuario_id 
        FROM busquedas_servicios bs
        INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
        WHERE bs.id = $1
      `, [busquedaId]);

      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].usuario_id !== userId) {
        throw createError('No tienes permisos para actualizar esta búsqueda', 403);
      }

      const camposActualizables = [
        'titulo', 'descripcion', 'direccion_trabajo', 'latitud_trabajo', 'longitud_trabajo',
        'radio_busqueda', 'presupuesto_minimo', 'presupuesto_maximo', 'fecha_necesaria',
        'hora_necesaria', 'urgente', 'estado'
      ];

      const updates = Object.keys(data)
        .filter(key => camposActualizables.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      if (Object.keys(updates).length === 0) {
        throw createError('No hay campos válidos para actualizar', 400);
      }

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [busquedaId, ...Object.values(updates)];

      await query(`
        UPDATE busquedas_servicios 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $1
      `, values);

      return await this.obtenerPorId(busquedaId);

    } catch (error) {
      throw error;
    }
  }

  static async cambiarEstado(busquedaId: string, estado: string, userId: string) {
    try {
      const busqueda = await this.actualizar(busquedaId, { estado }, userId);
      
      // Si se pausa o cancela, notificar a matches activos
      if (estado === 'pausada' || estado === 'cancelada') {
        await this.notificarCambioBusqueda(busquedaId, estado);
      }

      return busqueda;

    } catch (error) {
      throw error;
    }
  }

  static async eliminar(busquedaId: string, userId: string) {
    return await this.cambiarEstado(busquedaId, 'cancelada', userId);
  }

  static async obtenerBusquedasActivas(limite: number = 20) {
    const result = await query(`
      SELECT 
        bs.*,
        pe.nombre as explorador_nombre,
        pe.foto_perfil as explorador_foto,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        c.color as categoria_color
      FROM busquedas_servicios bs
      INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
      LEFT JOIN categorias c ON bs.categoria_id = c.id
      WHERE bs.estado = 'activa'
      ORDER BY bs.created_at DESC
      LIMIT $1
    `, [limite]);

    return result.rows;
  }

  static async buscarPorUbicacion(lat: number, lng: number, radio: number = 20) {
    const result = await query(`
      SELECT 
        bs.*,
        pe.nombre as explorador_nombre,
        pe.foto_perfil as explorador_foto,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        ROUND(
          6371 * acos(
            cos(radians($1)) * cos(radians(bs.latitud_trabajo)) * 
            cos(radians(bs.longitud_trabajo) - radians($2)) + 
            sin(radians($1)) * sin(radians(bs.latitud_trabajo))
          )::numeric, 2
        ) as distancia
      FROM busquedas_servicios bs
      INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
      LEFT JOIN categorias c ON bs.categoria_id = c.id
      WHERE bs.estado = 'activa'
      AND (
        6371 * acos(
          cos(radians($1)) * cos(radians(bs.latitud_trabajo)) * 
          cos(radians(bs.longitud_trabajo) - radians($2)) + 
          sin(radians($1)) * sin(radians(bs.latitud_trabajo))
        )
      ) <= $3
      ORDER BY distancia ASC
    `, [lat, lng, radio]);

    return result.rows;
  }

  private static async notificarCambioBusqueda(busquedaId: string, nuevoEstado: string) {
    try {
      // Obtener matches relacionados
      const matches = await query(`
        SELECT DISTINCT pa.usuario_id
        FROM matches m
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        WHERE m.busqueda_id = $1 AND m.estado IN ('sugerido', 'contactado')
      `, [busquedaId]);

      // Crear notificaciones
      for (const match of matches.rows) {
        const mensaje = nuevoEstado === 'pausada' 
          ? 'Una búsqueda que te interesaba fue pausada temporalmente'
          : 'Una búsqueda que te interesaba fue cancelada';

        await query(`
          INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_extra)
          VALUES ($1, 'sistema', 'Cambio en búsqueda', $2, $3)
        `, [
          match.usuario_id,
          mensaje,
          JSON.stringify({ busqueda_id: busquedaId, nuevo_estado: nuevoEstado })
        ]);
      }

    } catch (error) {
      console.error('Error notificando cambio de búsqueda:', error);
    }
  }

  static async obtenerEstadisticas(userId: string) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_busquedas,
          COUNT(*) FILTER (WHERE estado = 'activa') as activas,
          COUNT(*) FILTER (WHERE estado = 'completada') as completadas,
          COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas,
          AVG(
            CASE WHEN estado = 'completada' THEN 
              EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 
            END
          ) as horas_promedio_resolucion
        FROM busquedas_servicios bs
        INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
        WHERE pe.usuario_id = $1
      `, [userId]);

      const stats = result.rows[0];
      
      // Obtener matches por búsqueda
      const matchesResult = await query(`
        SELECT 
          COUNT(m.id) as total_matches,
          COUNT(m.id) FILTER (WHERE m.estado = 'contactado') as contactados
        FROM busquedas_servicios bs
        INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
        LEFT JOIN matches m ON bs.id = m.busqueda_id
        WHERE pe.usuario_id = $1
      `, [userId]);

      const matchStats = matchesResult.rows[0];

      return {
        ...stats,
        ...matchStats,
        tasa_exito: stats.total_busquedas > 0 
          ? (stats.completadas / stats.total_busquedas * 100).toFixed(1) + '%'
          : '0%',
        promedio_matches: stats.total_busquedas > 0
          ? (matchStats.total_matches / stats.total_busquedas).toFixed(1)
          : '0'
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de búsquedas:', error);
      throw createError('Error al obtener estadísticas', 500);
    }
  }
}