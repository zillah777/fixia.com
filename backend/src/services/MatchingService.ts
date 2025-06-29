import { query } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { getCache, setCache } from '@/config/redis';

interface MatchCriteria {
  busqueda_id?: string;
  servicio_id?: string;
  explorador_id?: string;
  as_id?: string;
  max_distancia?: number;
  min_score?: number;
}

export class MatchingService {
  static async encontrarMatches(busqueda_id: string) {
    try {
      // Obtener datos de la búsqueda
      const busquedaResult = await query(`
        SELECT 
          bs.*,
          pe.latitud as explorador_lat,
          pe.longitud as explorador_lng,
          pe.nombre as explorador_nombre
        FROM busquedas_servicios bs
        INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
        WHERE bs.id = $1 AND bs.estado = 'activa'
      `, [busqueda_id]);

      if (busquedaResult.rows.length === 0) {
        throw createError('Búsqueda no encontrada o inactiva', 404);
      }

      const busqueda = busquedaResult.rows[0];

      // Buscar servicios que coincidan
      let serviciosQuery = `
        SELECT 
          s.*,
          pa.id as as_perfil_id,
          pa.nombre as as_nombre,
          pa.apellido as as_apellido,
          pa.foto_perfil as as_foto,
          pa.identidad_verificada as as_verificado,
          pa.profesional_verificado as as_profesional,
          pa.tiene_movilidad as as_movilidad,
          pa.latitud as as_lat,
          pa.longitud as as_lng,
          pa.radio_notificaciones,
          pa.monto_minimo_notificacion,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          COALESCE(AVG(cal.puntuacion), 5.0) as rating,
          COUNT(cal.id) as total_calificaciones,
          ROUND(
            6371 * acos(
              cos(radians($1)) * cos(radians(pa.latitud)) * 
              cos(radians(pa.longitud) - radians($2)) + 
              sin(radians($1)) * sin(radians(pa.latitud))
            )::numeric, 2
          ) as distancia
        FROM servicios s
        INNER JOIN perfiles_ases pa ON s.as_id = pa.id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        INNER JOIN categorias c ON s.categoria_id = c.id
        LEFT JOIN calificaciones cal ON cal.calificado_id = u.id AND cal.publica = true
        WHERE s.activo = true AND s.disponible = true
      `;

      const params = [busqueda.explorador_lat, busqueda.explorador_lng];
      let paramIndex = 3;

      // Filtros de la búsqueda
      const whereConditions = [];

      // Filtro por categoría
      if (busqueda.categoria_id) {
        whereConditions.push(`s.categoria_id = $${paramIndex}`);
        params.push(busqueda.categoria_id);
        paramIndex++;
      }

      // Filtro por presupuesto
      if (busqueda.presupuesto_minimo) {
        whereConditions.push(`s.precio_desde >= $${paramIndex}`);
        params.push(busqueda.presupuesto_minimo);
        paramIndex++;
      }
      if (busqueda.presupuesto_maximo) {
        whereConditions.push(`s.precio_desde <= $${paramIndex}`);
        params.push(busqueda.presupuesto_maximo);
        paramIndex++;
      }

      // Filtro por urgencia
      if (busqueda.urgente) {
        whereConditions.push('s.urgente = true');
      }

      // Filtro por texto en título/descripción
      if (busqueda.titulo || busqueda.descripcion) {
        const searchText = `${busqueda.titulo} ${busqueda.descripcion}`.trim();
        whereConditions.push(`(
          s.titulo ILIKE $${paramIndex} OR
          s.descripcion ILIKE $${paramIndex}
        )`);
        params.push(`%${searchText}%`);
        paramIndex++;
      }

      // Filtro por distancia
      const radioMax = busqueda.radio_busqueda || 20;
      whereConditions.push(`(
        6371 * acos(
          cos(radians($1)) * cos(radians(pa.latitud)) * 
          cos(radians(pa.longitud) - radians($2)) + 
          sin(radians($1)) * sin(radians(pa.latitud))
        )
      ) <= ${radioMax}`);

      if (whereConditions.length > 0) {
        serviciosQuery += ` AND ${whereConditions.join(' AND ')}`;
      }

      serviciosQuery += `
        GROUP BY s.id, pa.id, c.id, u.id
        HAVING ROUND(
          6371 * acos(
            cos(radians($1)) * cos(radians(pa.latitud)) * 
            cos(radians(pa.longitud) - radians($2)) + 
            sin(radians($1)) * sin(radians(pa.latitud))
          )::numeric, 2
        ) <= ${radioMax}
        ORDER BY distancia ASC, rating DESC
        LIMIT 50
      `;

      const serviciosResult = await query(serviciosQuery, params);
      const servicios = serviciosResult.rows;

      // Calcular score de matching para cada servicio
      const matches = await Promise.all(
        servicios.map(async (servicio) => {
          const score = this.calcularScoreMatching(busqueda, servicio);
          
          // Verificar si ya existe un match
          const existingMatch = await query(`
            SELECT id, estado FROM matches 
            WHERE busqueda_id = $1 AND servicio_id = $2
          `, [busqueda_id, servicio.id]);

          const matchData = {
            busqueda_id,
            servicio_id: servicio.id,
            as_id: servicio.as_perfil_id,
            explorador_id: busqueda.explorador_id,
            score_matching: score,
            distancia_km: servicio.distancia,
            servicio,
            existe_match: existingMatch.rows.length > 0,
            estado_match: existingMatch.rows[0]?.estado || null
          };

          return matchData;
        })
      );

      // Filtrar por score mínimo y ordenar
      const matchesFiltrados = matches
        .filter(match => match.score_matching >= 0.3) // Score mínimo 30%
        .sort((a, b) => b.score_matching - a.score_matching);

      return {
        busqueda,
        matches: matchesFiltrados,
        total_matches: matchesFiltrados.length,
        criterios_aplicados: {
          radio_busqueda: radioMax,
          categoria: busqueda.categoria_id,
          presupuesto: {
            minimo: busqueda.presupuesto_minimo,
            maximo: busqueda.presupuesto_maximo
          },
          urgente: busqueda.urgente
        }
      };

    } catch (error) {
      console.error('Error encontrando matches:', error);
      throw error;
    }
  }

  static calcularScoreMatching(busqueda: any, servicio: any): number {
    let score = 0;
    let maxScore = 0;

    // Factor 1: Coincidencia de categoría (peso: 40%)
    maxScore += 40;
    if (busqueda.categoria_id === servicio.categoria_id) {
      score += 40;
    }

    // Factor 2: Distancia (peso: 25%)
    maxScore += 25;
    const distancia = servicio.distancia;
    if (distancia <= 5) score += 25;
    else if (distancia <= 10) score += 20;
    else if (distancia <= 15) score += 15;
    else if (distancia <= 20) score += 10;
    else score += 5;

    // Factor 3: Compatibilidad de presupuesto (peso: 20%)
    maxScore += 20;
    if (busqueda.presupuesto_minimo && busqueda.presupuesto_maximo) {
      const precioServicio = servicio.precio_desde;
      if (precioServicio >= busqueda.presupuesto_minimo && 
          precioServicio <= busqueda.presupuesto_maximo) {
        score += 20;
      } else if (precioServicio <= busqueda.presupuesto_maximo * 1.2) {
        score += 15; // Tolerancia del 20%
      } else {
        score += 5;
      }
    } else {
      score += 15; // Puntaje neutro si no hay presupuesto especificado
    }

    // Factor 4: Rating del As (peso: 10%)
    maxScore += 10;
    const rating = servicio.rating || 5;
    score += Math.round((rating / 5) * 10);

    // Factor 5: Verificación y profesionalismo (peso: 5%)
    maxScore += 5;
    if (servicio.as_verificado) score += 3;
    if (servicio.as_profesional) score += 2;

    // Bonus por coincidencias especiales
    if (busqueda.urgente && servicio.urgente) {
      score += 10; // Bonus por urgencia matching
      maxScore += 10;
    }

    if (servicio.as_movilidad && busqueda.descripcion && 
        busqueda.descripcion.toLowerCase().includes('domicilio')) {
      score += 5; // Bonus por movilidad cuando se solicita a domicilio
      maxScore += 5;
    }

    // Retornar score normalizado (0-1)
    return Math.min(score / maxScore, 1);
  }

  static async crearMatch(data: {
    busqueda_id?: string;
    servicio_id?: string;
    as_id: string;
    explorador_id: string;
    score_matching?: number;
    distancia_km?: number;
  }) {
    try {
      const result = await query(`
        INSERT INTO matches (
          busqueda_id, servicio_id, as_id, explorador_id, 
          score_matching, distancia_km, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, 'sugerido')
        RETURNING *
      `, [
        data.busqueda_id,
        data.servicio_id,
        data.as_id,
        data.explorador_id,
        data.score_matching,
        data.distancia_km
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creando match:', error);
      throw createError('Error al crear match', 500);
    }
  }

  static async contactar(matchId: string, metodoContacto: 'whatsapp' | 'chat_interno' | 'telefono') {
    try {
      // Actualizar estado del match
      const result = await query(`
        UPDATE matches 
        SET estado = 'contactado', fecha_contacto = NOW(), metodo_contacto = $1
        WHERE id = $2
        RETURNING *
      `, [metodoContacto, matchId]);

      if (result.rows.length === 0) {
        throw createError('Match no encontrado', 404);
      }

      const match = result.rows[0];

      // Obtener información completa del match
      const matchCompleto = await query(`
        SELECT 
          m.*,
          pe.nombre as explorador_nombre,
          pe.telefono as explorador_telefono,
          pa.nombre as as_nombre,
          pa.apellido as as_apellido,
          pa.telefono as as_telefono,
          s.titulo as servicio_titulo,
          s.descripcion as servicio_descripcion
        FROM matches m
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        LEFT JOIN servicios s ON m.servicio_id = s.id
        WHERE m.id = $1
      `, [matchId]);

      return matchCompleto.rows[0];

    } catch (error) {
      console.error('Error en contacto:', error);
      throw error;
    }
  }

  static async obtenerMatchesUsuario(userId: string, tipoUsuario: string) {
    try {
      let query_str = '';
      
      if (tipoUsuario === 'explorador' || tipoUsuario === 'ambos') {
        query_str = `
          SELECT 
            m.*,
            s.titulo as servicio_titulo,
            s.precio_desde,
            s.tipo_precio,
            pa.nombre as as_nombre,
            pa.apellido as as_apellido,
            pa.foto_perfil as as_foto,
            pa.identidad_verificada as as_verificado,
            c.nombre as categoria_nombre,
            c.icono as categoria_icono
          FROM matches m
          INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
          LEFT JOIN servicios s ON m.servicio_id = s.id
          LEFT JOIN perfiles_ases pa ON m.as_id = pa.id
          LEFT JOIN categorias c ON s.categoria_id = c.id
          WHERE pe.usuario_id = $1
          ORDER BY m.created_at DESC
        `;
      } else {
        query_str = `
          SELECT 
            m.*,
            s.titulo as servicio_titulo,
            pe.nombre as explorador_nombre,
            pe.foto_perfil as explorador_foto,
            bs.titulo as busqueda_titulo,
            bs.descripcion as busqueda_descripcion,
            c.nombre as categoria_nombre,
            c.icono as categoria_icono
          FROM matches m
          INNER JOIN perfiles_ases pa ON m.as_id = pa.id
          LEFT JOIN servicios s ON m.servicio_id = s.id
          LEFT JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
          LEFT JOIN busquedas_servicios bs ON m.busqueda_id = bs.id
          LEFT JOIN categorias c ON (s.categoria_id = c.id OR bs.categoria_id = c.id)
          WHERE pa.usuario_id = $1
          ORDER BY m.created_at DESC
        `;
      }

      const result = await query(query_str, [userId]);
      return result.rows;

    } catch (error) {
      console.error('Error obteniendo matches:', error);
      throw createError('Error al obtener matches', 500);
    }
  }

  static async actualizarEstadoMatch(matchId: string, estado: string, userId: string) {
    try {
      // Verificar que el usuario sea parte del match
      const verification = await query(`
        SELECT m.* FROM matches m
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        WHERE m.id = $1 AND (pa.usuario_id = $2 OR pe.usuario_id = $2)
      `, [matchId, userId]);

      if (verification.rows.length === 0) {
        throw createError('No tienes permisos para actualizar este match', 403);
      }

      const result = await query(`
        UPDATE matches 
        SET estado = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [estado, matchId]);

      return result.rows[0];

    } catch (error) {
      console.error('Error actualizando match:', error);
      throw error;
    }
  }

  static async obtenerEstadisticasMatching(userId: string, tipoUsuario: string) {
    try {
      const cacheKey = `matching_stats:${userId}:${tipoUsuario}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      let statsQuery = '';
      
      if (tipoUsuario === 'explorador' || tipoUsuario === 'ambos') {
        statsQuery = `
          SELECT 
            COUNT(*) as total_matches,
            COUNT(*) FILTER (WHERE estado = 'sugerido') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'contactado') as contactados,
            COUNT(*) FILTER (WHERE estado = 'completado') as completados,
            COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazados,
            AVG(score_matching) as score_promedio
          FROM matches m
          INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
          WHERE pe.usuario_id = $1
        `;
      } else {
        statsQuery = `
          SELECT 
            COUNT(*) as total_matches,
            COUNT(*) FILTER (WHERE estado = 'sugerido') as pendientes,
            COUNT(*) FILTER (WHERE estado = 'contactado') as contactados,
            COUNT(*) FILTER (WHERE estado = 'completado') as completados,
            COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazados,
            AVG(score_matching) as score_promedio
          FROM matches m
          INNER JOIN perfiles_ases pa ON m.as_id = pa.id
          WHERE pa.usuario_id = $1
        `;
      }

      const result = await query(statsQuery, [userId]);
      const stats = result.rows[0];

      // Cachear por 1 hora
      await setCache(cacheKey, stats, 3600);
      return stats;

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw createError('Error al obtener estadísticas', 500);
    }
  }
}