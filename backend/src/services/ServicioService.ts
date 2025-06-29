import { query } from '@/config/database';
import { Servicio } from '@/types';
import { createError } from '@/middleware/errorHandler';
import { getCache, setCache } from '@/config/redis';

interface FiltrosBusqueda {
  query?: string;
  ubicacion?: { lat: number; lng: number };
  radio?: number;
  categoria?: string;
  precio_min?: number;
  precio_max?: number;
  verificados_solo?: boolean;
  urgentes_solo?: boolean;
  con_movilidad?: boolean;
  disponible_ahora?: boolean;
  tags?: string[];
  ordenar_por?: 'relevancia' | 'distancia' | 'precio' | 'rating' | 'reciente';
  pagina?: number;
  por_pagina?: number;
}

export class ServicioService {
  static async buscarConFiltros(filtros: FiltrosBusqueda) {
    const {
      query: searchQuery,
      ubicacion,
      radio = 10,
      categoria,
      precio_min,
      precio_max,
      verificados_solo = false,
      urgentes_solo = false,
      con_movilidad = false,
      disponible_ahora = false,
      tags = [],
      ordenar_por = 'relevancia',
      pagina = 1,
      por_pagina = 20
    } = filtros;

    // Cache key para búsquedas frecuentes
    const cacheKey = `search:${JSON.stringify(filtros)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const startTime = Date.now();
    let whereConditions: string[] = ['s.activo = true'];
    let params: any[] = [];
    let paramIndex = 1;

    // Base query con joins
    let baseQuery = `
      SELECT DISTINCT
        s.*,
        pa.nombre as as_nombre,
        pa.apellido as as_apellido,
        pa.foto_perfil as as_foto_perfil,
        pa.identidad_verificada as as_verificado,
        pa.profesional_verificado as as_profesional,
        pa.tiene_movilidad as as_movilidad,
        pa.latitud as as_latitud,
        pa.longitud as as_longitud,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        c.color as categoria_color,
        COALESCE(AVG(cal.puntuacion), 5.0) as rating,
        COUNT(cal.id) as total_calificaciones,
        ${ubicacion ? `
          ROUND(
            6371 * acos(
              cos(radians($${paramIndex})) * cos(radians(pa.latitud)) * 
              cos(radians(pa.longitud) - radians($${paramIndex + 1})) + 
              sin(radians($${paramIndex})) * sin(radians(pa.latitud))
            )::numeric, 2
          ) as distancia
        ` : 'NULL as distancia'}
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      INNER JOIN usuarios u ON pa.usuario_id = u.id
      INNER JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN matches m ON s.id = m.servicio_id
      LEFT JOIN calificaciones cal ON cal.calificado_id = u.id AND cal.publica = true
    `;

    // Agregar parámetros de ubicación si existen
    if (ubicacion) {
      params.push(ubicacion.lat, ubicacion.lng);
      paramIndex += 2;
    }

    // Filtro por texto/query
    if (searchQuery) {
      whereConditions.push(`(
        s.titulo ILIKE $${paramIndex} OR
        s.descripcion ILIKE $${paramIndex} OR
        pa.nombre ILIKE $${paramIndex} OR
        pa.apellido ILIKE $${paramIndex} OR
        c.nombre ILIKE $${paramIndex}
      )`);
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Filtro por categoría
    if (categoria) {
      whereConditions.push(`c.nombre ILIKE $${paramIndex}`);
      params.push(categoria);
      paramIndex++;
    }

    // Filtro por precio
    if (precio_min !== undefined) {
      whereConditions.push(`s.precio_desde >= $${paramIndex}`);
      params.push(precio_min);
      paramIndex++;
    }
    if (precio_max !== undefined) {
      whereConditions.push(`s.precio_desde <= $${paramIndex}`);
      params.push(precio_max);
      paramIndex++;
    }

    // Filtro por verificación
    if (verificados_solo) {
      whereConditions.push('pa.identidad_verificada = true');
    }

    // Filtro por urgencia
    if (urgentes_solo) {
      whereConditions.push('s.urgente = true');
    }

    // Filtro por movilidad
    if (con_movilidad) {
      whereConditions.push('pa.tiene_movilidad = true');
    }

    // Filtro por disponibilidad
    if (disponible_ahora) {
      whereConditions.push('s.disponible = true');
    }

    // Filtro por tags
    if (tags.length > 0) {
      baseQuery += `
        INNER JOIN servicio_tags st ON s.id = st.servicio_id
        INNER JOIN tags t ON st.tag_id = t.id
      `;
      whereConditions.push(`t.nombre = ANY($${paramIndex})`);
      params.push(tags);
      paramIndex++;
    }

    // Filtro por radio de distancia
    if (ubicacion) {
      whereConditions.push(`(
        6371 * acos(
          cos(radians($1)) * cos(radians(pa.latitud)) * 
          cos(radians(pa.longitud) - radians($2)) + 
          sin(radians($1)) * sin(radians(pa.latitud))
        )
      ) <= ${radio}`);
    }

    // Construir WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // GROUP BY para agregaciones
    const groupBy = `
      GROUP BY s.id, pa.id, c.id, u.id
    `;

    // Ordenamiento
    let orderBy = '';
    switch (ordenar_por) {
      case 'distancia':
        orderBy = ubicacion ? 'ORDER BY distancia ASC' : 'ORDER BY s.created_at DESC';
        break;
      case 'precio':
        orderBy = 'ORDER BY s.precio_desde ASC';
        break;
      case 'rating':
        orderBy = 'ORDER BY rating DESC, total_calificaciones DESC';
        break;
      case 'reciente':
        orderBy = 'ORDER BY s.created_at DESC';
        break;
      case 'relevancia':
      default:
        if (searchQuery) {
          orderBy = `ORDER BY 
            CASE 
              WHEN s.titulo ILIKE $${params.findIndex(p => p === `%${searchQuery}%`) + 1} THEN 3
              WHEN s.descripcion ILIKE $${params.findIndex(p => p === `%${searchQuery}%`) + 1} THEN 2
              ELSE 1
            END DESC,
            s.destacado DESC,
            rating DESC,
            ${ubicacion ? 'distancia ASC,' : ''}
            s.created_at DESC`;
        } else {
          orderBy = `ORDER BY s.destacado DESC, rating DESC, s.created_at DESC`;
        }
        break;
    }

    // Paginación
    const offset = (pagina - 1) * por_pagina;
    const pagination = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(por_pagina, offset);

    // Query final
    const finalQuery = `${baseQuery} ${whereClause} ${groupBy} ${orderBy} ${pagination}`;

    // Query para contar total
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      INNER JOIN usuarios u ON pa.usuario_id = u.id
      INNER JOIN categorias c ON s.categoria_id = c.id
      ${tags.length > 0 ? `
        INNER JOIN servicio_tags st ON s.id = st.servicio_id
        INNER JOIN tags t ON st.tag_id = t.id
      ` : ''}
      ${whereClause}
    `;

    try {
      const [serviciosResult, countResult] = await Promise.all([
        query(finalQuery, params.slice(0, paramIndex + 1)), // Sin los params de paginación para el count
        query(countQuery, params.slice(0, paramIndex - 1))
      ]);

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

      const endTime = Date.now();
      const result = {
        servicios,
        total,
        pagina,
        por_pagina,
        total_paginas: Math.ceil(total / por_pagina),
        tiempo_busqueda: endTime - startTime,
        filtros_aplicados: filtros
      };

      // Cachear resultado por 5 minutos
      await setCache(cacheKey, result, 300);

      return result;

    } catch (error) {
      console.error('Error en búsqueda de servicios:', error);
      throw createError('Error al buscar servicios', 500);
    }
  }

  static async crear(data: any, userId: string) {
    try {
      // Verificar que el usuario sea As y tenga suscripción activa
      const perfilAs = await query(
        'SELECT * FROM perfiles_ases WHERE usuario_id = $1',
        [userId]
      );

      if (perfilAs.rows.length === 0) {
        throw createError('Solo los Ases pueden crear servicios', 403);
      }

      const perfil = perfilAs.rows[0];
      if (!perfil.suscripcion_activa) {
        throw createError('Necesitás una suscripción activa para publicar servicios', 403);
      }

      // Verificar límites según plan de suscripción
      const serviciosActivos = await query(
        'SELECT COUNT(*) as count FROM servicios WHERE as_id = $1 AND activo = true',
        [perfil.id]
      );

      const limitePlan = 10; // TODO: obtener desde configuración del plan
      if (parseInt(serviciosActivos.rows[0].count) >= limitePlan) {
        throw createError(`Alcanzaste el límite de ${limitePlan} servicios activos para tu plan`, 403);
      }

      // Crear servicio
      const servicio = await query(`
        INSERT INTO servicios (
          as_id, categoria_id, titulo, descripcion, tipo_precio,
          precio_desde, precio_hasta, moneda, urgente, requiere_matricula,
          matricula_numero, titulo_profesional
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        perfil.id,
        data.categoria_id,
        data.titulo,
        data.descripcion,
        data.tipo_precio,
        data.precio_desde,
        data.precio_hasta,
        data.moneda || 'ARS',
        data.urgente || false,
        data.requiere_matricula || false,
        data.matricula_numero,
        data.titulo_profesional
      ]);

      const servicioCreado = servicio.rows[0];

      // Generar y agregar tags automáticamente
      if (data.tags && data.tags.length > 0) {
        await this.agregarTags(servicioCreado.id, data.tags);
      }

      // Auto-generar tags basados en título y descripción
      const tagsAutomaticos = await this.generarTagsAutomaticos(data.titulo, data.descripcion);
      if (tagsAutomaticos.length > 0) {
        await this.agregarTags(servicioCreado.id, tagsAutomaticos);
      }

      return await this.obtenerPorId(servicioCreado.id);

    } catch (error) {
      console.error('Error creando servicio:', error);
      throw error;
    }
  }

  static async obtenerPorId(servicioId: string) {
    const result = await query(`
      SELECT 
        s.*,
        pa.nombre as as_nombre,
        pa.apellido as as_apellido,
        pa.foto_perfil as as_foto_perfil,
        pa.identidad_verificada as as_verificado,
        pa.profesional_verificado as as_profesional,
        pa.tiene_movilidad as as_movilidad,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        c.color as categoria_color,
        COALESCE(AVG(cal.puntuacion), 5.0) as rating,
        COUNT(cal.id) as total_calificaciones
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      INNER JOIN usuarios u ON pa.usuario_id = u.id
      INNER JOIN categorias c ON s.categoria_id = c.id
      LEFT JOIN calificaciones cal ON cal.calificado_id = u.id AND cal.publica = true
      WHERE s.id = $1
      GROUP BY s.id, pa.id, c.id, u.id
    `, [servicioId]);

    if (result.rows.length === 0) {
      throw createError('Servicio no encontrado', 404);
    }

    const servicio = result.rows[0];

    // Obtener tags
    const tagsResult = await query(`
      SELECT t.id, t.nombre
      FROM servicio_tags st
      INNER JOIN tags t ON st.tag_id = t.id
      WHERE st.servicio_id = $1
    `, [servicioId]);

    servicio.tags = tagsResult.rows;

    return servicio;
  }

  static async obtenerCategorias() {
    const result = await query(
      'SELECT * FROM categorias WHERE activa = true ORDER BY orden ASC, nombre ASC'
    );
    return result.rows;
  }

  static async agregarTags(servicioId: string, tags: string[]) {
    for (const tagNombre of tags) {
      // Buscar o crear tag
      let tagResult = await query(
        'SELECT id FROM tags WHERE LOWER(nombre) = LOWER($1)',
        [tagNombre.trim()]
      );

      let tagId;
      if (tagResult.rows.length === 0) {
        // Crear nuevo tag
        const newTag = await query(
          'INSERT INTO tags (nombre, uso_count) VALUES ($1, 1) RETURNING id',
          [tagNombre.trim()]
        );
        tagId = newTag.rows[0].id;
      } else {
        tagId = tagResult.rows[0].id;
        // Incrementar contador de uso
        await query(
          'UPDATE tags SET uso_count = uso_count + 1 WHERE id = $1',
          [tagId]
        );
      }

      // Agregar relación servicio-tag (si no existe)
      await query(`
        INSERT INTO servicio_tags (servicio_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (servicio_id, tag_id) DO NOTHING
      `, [servicioId, tagId]);
    }
  }

  static async generarTagsAutomaticos(titulo: string, descripcion: string): Promise<string[]> {
    const texto = `${titulo} ${descripcion}`.toLowerCase();
    const tags: string[] = [];

    // Palabras clave para auto-tagging
    const keywords = {
      'urgente': ['urgente', 'inmediato', 'ya', 'ahora'],
      'económico': ['barato', 'económico', 'accesible', 'bajo costo'],
      'profesional': ['profesional', 'especialista', 'experto', 'certificado'],
      'domicilio': ['domicilio', 'casa', 'hogar', 'residencia'],
      'comercial': ['comercio', 'negocio', 'empresa', 'oficina'],
      'fin de semana': ['fin de semana', 'sábado', 'domingo'],
      'nocturno': ['noche', 'nocturno', 'madrugada']
    };

    for (const [tag, words] of Object.entries(keywords)) {
      if (words.some(word => texto.includes(word))) {
        tags.push(tag);
      }
    }

    return tags;
  }

  static async buscarDestacados(limite: number = 10) {
    const cacheKey = `featured_services:${limite}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const result = await this.buscarConFiltros({
      ordenar_por: 'rating',
      por_pagina: limite
    });

    // Cachear por 1 hora
    await setCache(cacheKey, result, 3600);
    return result;
  }
}