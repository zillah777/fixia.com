import { query } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { getCache, setCache } from '@/config/redis';

interface MatchingFactors {
  categoriaCompatibilidad: number;
  proximidadGeografica: number;
  compatibilidadPresupuesto: number;
  disponibilidadTemporal: number;
  reputacionAs: number;
  verificaciones: number;
  historialColaboracion: number;
  preferenciasExplorador: number;
}

export class AdvancedMatchingService {
  static async encontrarMatchesAvanzados(busquedaId: string) {
    try {
      const cacheKey = `advanced_matches:${busquedaId}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      // Obtener búsqueda completa
      const busqueda = await this.obtenerBusquedaCompleta(busquedaId);
      
      // Buscar servicios candidatos
      const serviciosCandidatos = await this.buscarServiciosCercanos(
        busqueda.latitud_trabajo,
        busqueda.longitud_trabajo,
        busqueda.radio_busqueda,
        busqueda.categoria_id
      );

      // Calcular scores avanzados para cada servicio
      const matchesConScore = await Promise.all(
        serviciosCandidatos.map(async (servicio) => {
          const factors = await this.calcularFactoresMatching(busqueda, servicio);
          const score = this.calcularScoreAvanzado(factors);
          const distancia = this.calcularDistancia(
            busqueda.latitud_trabajo,
            busqueda.longitud_trabajo,
            servicio.as_latitud,
            servicio.as_longitud
          );

          return {
            busqueda_id: busquedaId,
            servicio_id: servicio.id,
            as_id: servicio.as_id,
            explorador_id: busqueda.explorador_id,
            score_matching: score,
            distancia_km: distancia,
            factores: factors,
            servicio: servicio,
            explicacion_score: this.generarExplicacionScore(factors)
          };
        })
      );

      // Filtrar y ordenar matches
      const matchesFiltrados = matchesConScore
        .filter(match => match.score_matching >= 0.4) // Score mínimo 40%
        .sort((a, b) => b.score_matching - a.score_matching)
        .slice(0, 25); // Máximo 25 matches

      // Aplicar diversificación (evitar que todos sean del mismo As)
      const matchesDiversificados = this.diversificarMatches(matchesFiltrados);

      const resultado = {
        busqueda,
        matches: matchesDiversificados,
        total_candidatos: serviciosCandidatos.length,
        total_matches: matchesDiversificados.length,
        criterios_aplicados: {
          radio_busqueda: busqueda.radio_busqueda,
          categoria: busqueda.categoria_id,
          presupuesto: {
            minimo: busqueda.presupuesto_minimo,
            maximo: busqueda.presupuesto_maximo
          },
          urgente: busqueda.urgente,
          score_minimo: 0.4
        },
        timestamp: new Date().toISOString()
      };

      // Cachear por 10 minutos
      await setCache(cacheKey, resultado, 600);
      return resultado;

    } catch (error) {
      console.error('Error en matching avanzado:', error);
      throw error;
    }
  }

  private static async obtenerBusquedaCompleta(busquedaId: string) {
    const result = await query(`
      SELECT 
        bs.*,
        pe.nombre as explorador_nombre,
        pe.apellido as explorador_apellido,
        pe.latitud as explorador_lat,
        pe.longitud as explorador_lng,
        pe.usuario_id as explorador_usuario_id,
        c.nombre as categoria_nombre,
        u.fecha_registro as explorador_fecha_registro
      FROM busquedas_servicios bs
      INNER JOIN perfiles_exploradores pe ON bs.explorador_id = pe.id
      INNER JOIN usuarios u ON pe.usuario_id = u.id
      LEFT JOIN categorias c ON bs.categoria_id = c.id
      WHERE bs.id = $1 AND bs.estado = 'activa'
    `, [busquedaId]);

    if (result.rows.length === 0) {
      throw createError('Búsqueda no encontrada o inactiva', 404);
    }

    return result.rows[0];
  }

  private static async buscarServiciosCercanos(
    lat: number, 
    lng: number, 
    radio: number, 
    categoriaId?: string
  ) {
    let whereClause = 's.activo = true AND s.disponible = true AND pa.suscripcion_activa = true';
    const params: any[] = [lat, lng, radio];
    let paramIndex = 4;

    if (categoriaId) {
      whereClause += ` AND s.categoria_id = $${paramIndex}`;
      params.push(categoriaId);
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        s.*,
        pa.id as as_id,
        pa.nombre as as_nombre,
        pa.apellido as as_apellido,
        pa.foto_perfil as as_foto,
        pa.identidad_verificada as as_verificado,
        pa.profesional_verificado as as_profesional,
        pa.tiene_movilidad as as_movilidad,
        pa.latitud as as_latitud,
        pa.longitud as as_longitud,
        pa.nivel_educativo as as_educacion,
        pa.fecha_verificacion as as_fecha_verificacion,
        pa.disponibilidad_horaria as as_disponibilidad,
        pa.dias_disponibles as as_dias_disponibles,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.fecha_registro as as_fecha_registro,
        u.ultimo_acceso as as_ultimo_acceso,
        COALESCE(AVG(cal.puntuacion), 5.0) as rating,
        COUNT(cal.id) as total_calificaciones,
        COUNT(m_hist.id) as trabajos_completados,
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
      LEFT JOIN matches m_hist ON m_hist.as_id = pa.id AND m_hist.estado = 'completado'
      WHERE ${whereClause}
      AND (
        6371 * acos(
          cos(radians($1)) * cos(radians(pa.latitud)) * 
          cos(radians(pa.longitud) - radians($2)) + 
          sin(radians($1)) * sin(radians(pa.latitud))
        )
      ) <= $3
      GROUP BY s.id, pa.id, c.id, u.id
      ORDER BY distancia ASC
      LIMIT 100
    `, params);

    return result.rows;
  }

  private static async calcularFactoresMatching(busqueda: any, servicio: any): Promise<MatchingFactors> {
    // Factor 1: Compatibilidad de categoría (30% del peso)
    const categoriaCompatibilidad = busqueda.categoria_id === servicio.categoria_id ? 1.0 : 0.0;

    // Factor 2: Proximidad geográfica (mejor score para distancias menores)
    const distancia = servicio.distancia;
    const proximidadGeografica = Math.max(0, 1 - (distancia / busqueda.radio_busqueda));

    // Factor 3: Compatibilidad de presupuesto (20% del peso)
    const compatibilidadPresupuesto = this.calcularCompatibilidadPresupuesto(busqueda, servicio);

    // Factor 4: Disponibilidad temporal (10% del peso)
    const disponibilidadTemporal = await this.calcularDisponibilidadTemporal(busqueda, servicio);

    // Factor 5: Reputación del As (15% del peso basado en rating)
    const reputacionAs = this.calcularReputacion(servicio);

    // Factor 6: Verificaciones (8% del peso)
    const verificaciones = this.calcularPuntajeVerificaciones(servicio);

    // Factor 7: Historial de colaboración previa (7% del peso)
    const historialColaboracion = await this.calcularHistorialColaboracion(
      busqueda.explorador_usuario_id, 
      servicio.as_id
    );

    // Factor 8: Preferencias del Explorador (5% del peso)
    const preferenciasExplorador = await this.calcularPreferenciasExplorador(busqueda, servicio);

    return {
      categoriaCompatibilidad,
      proximidadGeografica,
      compatibilidadPresupuesto,
      disponibilidadTemporal,
      reputacionAs,
      verificaciones,
      historialColaboracion,
      preferenciasExplorador
    };
  }

  private static async contarTagsComunes(busqueda: any, servicio: any): Promise<number> {
    try {
      // Extraer tags de la descripción de la búsqueda y del servicio
      const tagsBusqueda = this.extraerTags(busqueda.descripcion + ' ' + busqueda.titulo);
      const tagsServicio = this.extraerTags(servicio.descripcion + ' ' + servicio.titulo);
      
      if (tagsBusqueda.length === 0 || tagsServicio.length === 0) {
        return 0;
      }

      // Contar tags en común (case insensitive)
      const tagsComunes = tagsBusqueda.filter(tag => 
        tagsServicio.some(sTag => sTag.toLowerCase() === tag.toLowerCase())
      );

      return tagsComunes.length;
    } catch (error) {
      console.error('Error contando tags comunes:', error);
      return 0;
    }
  }

  private static extraerTags(texto: string): string[] {
    if (!texto) return [];
    
    // Palabras clave comunes en servicios
    const palabrasRelevantes = [
      'instalacion', 'reparacion', 'mantenimiento', 'limpieza', 'pintura',
      'electricidad', 'plomeria', 'jardineria', 'carpinteria', 'albañileria',
      'construccion', 'diseño', 'decoracion', 'mudanza', 'transporte',
      'cocina', 'baño', 'techo', 'piso', 'ventana', 'puerta',
      'urgente', 'rapido', 'economico', 'profesional', 'garantia',
      'domicilio', 'presupuesto', 'gratis', 'sin_cargo'
    ];

    const textoLimpio = texto.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(palabra => palabra.length > 2);

    return textoLimpio.filter(palabra => 
      palabrasRelevantes.includes(palabra) || 
      palabrasRelevantes.some(relevante => palabra.includes(relevante))
    );
  }

  private static async calcularScoreConTags(busqueda: any, servicio: any): Promise<number> {
    let score = 0;

    // Coincidencia de categoría (peso: 30%)
    if (busqueda.categoria_id === servicio.categoria_id) {
      score += 0.3;
    }

    // Coincidencia de tags (peso: 25%)
    const tagsComunes = await this.contarTagsComunes(busqueda, servicio);
    const tagsBusqueda = this.extraerTags(busqueda.descripcion + ' ' + busqueda.titulo);
    if (tagsBusqueda.length > 0) {
      score += (tagsComunes / tagsBusqueda.length) * 0.25;
    }

    // Precio dentro del rango (peso: 20%)
    if (this.precioEnRango(busqueda, servicio)) {
      score += 0.2;
    }

    // Rating del As (peso: 15%)
    const rating = servicio.rating || 5.0;
    score += (rating / 5.0) * 0.15;

    // Disponibilidad (peso: 10%)
    if (await this.verificarDisponibilidad(busqueda, servicio)) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private static precioEnRango(busqueda: any, servicio: any): boolean {
    if (!busqueda.presupuesto_maximo) return true;
    
    const precioServicio = servicio.precio_desde;
    const presupuestoMin = busqueda.presupuesto_minimo || 0;
    const presupuestoMax = busqueda.presupuesto_maximo;

    return precioServicio >= presupuestoMin && precioServicio <= presupuestoMax;
  }

  private static async verificarDisponibilidad(busqueda: any, servicio: any): Promise<boolean> {
    try {
      // Si la búsqueda es urgente, verificar que el As maneje urgencias
      if (busqueda.urgente && !servicio.urgente) {
        return false;
      }

      // Verificar último acceso del As (activo en las últimas 72 horas)
      if (servicio.as_ultimo_acceso) {
        const horasDesdeUltimoAcceso = 
          (Date.now() - new Date(servicio.as_ultimo_acceso).getTime()) / (1000 * 60 * 60);
        return horasDesdeUltimoAcceso <= 72;
      }

      return true;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return true; // Default optimista
    }
  }

  private static calcularScoreAvanzado(factors: MatchingFactors): number {
    // Pesos para cada factor (deben sumar 1.0)
    const pesos = {
      categoriaCompatibilidad: 0.25,    // 25%
      proximidadGeografica: 0.20,       // 20%
      compatibilidadPresupuesto: 0.15,  // 15%
      disponibilidadTemporal: 0.10,     // 10%
      reputacionAs: 0.10,               // 10%
      verificaciones: 0.08,             // 8%
      historialColaboracion: 0.07,      // 7%
      preferenciasExplorador: 0.05      // 5%
    };

    let score = 0;
    for (const [factor, peso] of Object.entries(pesos)) {
      score += factors[factor as keyof MatchingFactors] * peso;
    }

    return Math.min(Math.max(score, 0), 1); // Asegurar que esté entre 0 y 1
  }

  private static calcularCompatibilidadPresupuesto(busqueda: any, servicio: any): number {
    if (!busqueda.presupuesto_maximo) return 0.8; // Puntaje neutro si no hay presupuesto

    const precioServicio = servicio.precio_desde;
    const presupuestoMin = busqueda.presupuesto_minimo || 0;
    const presupuestoMax = busqueda.presupuesto_maximo;

    if (precioServicio >= presupuestoMin && precioServicio <= presupuestoMax) {
      return 1.0; // Perfecto match
    }

    // Tolerancia del 20% sobre el presupuesto máximo
    if (precioServicio <= presupuestoMax * 1.2) {
      return 0.7;
    }

    // Tolerancia del 50% sobre el presupuesto máximo
    if (precioServicio <= presupuestoMax * 1.5) {
      return 0.4;
    }

    return 0.1; // Muy fuera del presupuesto
  }

  private static async calcularDisponibilidadTemporal(busqueda: any, servicio: any): Promise<number> {
    let score = 0.5; // Score base

    // Si la búsqueda es urgente
    if (busqueda.urgente) {
      if (servicio.urgente) {
        score += 0.4; // Bonus por manejar urgencias
      }
      // Verificar último acceso del As (más reciente = más disponible)
      if (servicio.as_ultimo_acceso) {
        const horasDesdeUltimoAcceso = 
          (Date.now() - new Date(servicio.as_ultimo_acceso).getTime()) / (1000 * 60 * 60);
        if (horasDesdeUltimoAcceso < 24) score += 0.3;
        else if (horasDesdeUltimoAcceso < 72) score += 0.1;
      }
    }

    // Si hay fecha específica requerida
    if (busqueda.fecha_necesaria && servicio.as_disponibilidad) {
      // TODO: Implementar lógica más sofisticada de disponibilidad
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private static calcularReputacion(servicio: any): number {
    const rating = servicio.rating || 5.0;
    const totalCalificaciones = servicio.total_calificaciones || 0;
    const trabajosCompletados = servicio.trabajos_completados || 0;

    let score = rating / 5.0; // Score base del rating

    // Bonus por número de calificaciones (más calificaciones = más confiable)
    if (totalCalificaciones >= 50) score += 0.2;
    else if (totalCalificaciones >= 20) score += 0.15;
    else if (totalCalificaciones >= 10) score += 0.1;
    else if (totalCalificaciones >= 5) score += 0.05;

    // Bonus por trabajos completados
    if (trabajosCompletados >= 100) score += 0.15;
    else if (trabajosCompletados >= 50) score += 0.1;
    else if (trabajosCompletados >= 20) score += 0.05;

    return Math.min(score, 1.0);
  }

  private static calcularPuntajeVerificaciones(servicio: any): number {
    let score = 0;

    if (servicio.as_verificado) score += 0.6;
    if (servicio.as_profesional) score += 0.4;
    if (servicio.as_educacion && ['universitario', 'posgrado'].includes(servicio.as_educacion)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private static async calcularHistorialColaboracion(exploradorUserId: string, asId: string): Promise<number> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as colaboraciones_previas,
          AVG(cal.puntuacion) as rating_promedio_mutuo
        FROM matches m
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        LEFT JOIN calificaciones cal ON m.id = cal.match_id
        WHERE pe.usuario_id = $1 AND m.as_id = $2 AND m.estado = 'completado'
      `, [exploradorUserId, asId]);

      const data = result.rows[0];
      const colaboraciones = parseInt(data.colaboraciones_previas);

      if (colaboraciones === 0) return 0.0;

      let score = Math.min(colaboraciones * 0.2, 0.8); // Max 0.8 por colaboraciones previas

      // Bonus por buen rating en colaboraciones previas
      if (data.rating_promedio_mutuo >= 4.5) score += 0.2;
      else if (data.rating_promedio_mutuo >= 4.0) score += 0.1;

      return Math.min(score, 1.0);

    } catch (error) {
      console.error('Error calculando historial:', error);
      return 0.0;
    }
  }

  private static async calcularPreferenciasExplorador(busqueda: any, servicio: any): Promise<number> {
    let score = 0.5; // Score base

    // Preferencia por As con movilidad si la búsqueda lo sugiere
    if (servicio.as_movilidad && 
        (busqueda.descripcion?.toLowerCase().includes('domicilio') ||
         busqueda.descripcion?.toLowerCase().includes('casa'))) {
      score += 0.3;
    }

    // Preferencia por As experimentados para trabajos complejos
    const palabrasComplejas = ['instalacion', 'reparacion', 'construccion', 'diseño'];
    const esTrabajoComplejo = palabrasComplejas.some(palabra => 
      busqueda.titulo?.toLowerCase().includes(palabra) ||
      busqueda.descripcion?.toLowerCase().includes(palabra)
    );

    if (esTrabajoComplejo && servicio.as_profesional) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private static diversificarMatches(matches: any[]): any[] {
    const matchesDiversificados = [];
    const asesIncluidos = new Set();
    const maxPorAs = 2; // Máximo 2 servicios por As

    for (const match of matches) {
      const asId = match.as_id;
      const countActual = Array.from(asesIncluidos).filter(id => id === asId).length;

      if (countActual < maxPorAs) {
        matchesDiversificados.push(match);
        asesIncluidos.add(asId);
      }

      if (matchesDiversificados.length >= 20) break; // Máximo final
    }

    return matchesDiversificados;
  }

  private static generarExplicacionScore(factors: MatchingFactors): string {
    const explicaciones = [];

    if (factors.categoriaCompatibilidad >= 0.8) {
      explicaciones.push('✅ Categoría perfecta');
    }

    if (factors.proximidadGeografica >= 0.8) {
      explicaciones.push('📍 Muy cerca de ti');
    } else if (factors.proximidadGeografica >= 0.5) {
      explicaciones.push('📍 Distancia aceptable');
    }

    if (factors.compatibilidadPresupuesto >= 0.8) {
      explicaciones.push('💰 Dentro de tu presupuesto');
    }

    if (factors.reputacionAs >= 0.8) {
      explicaciones.push('⭐ Excelente reputación');
    }

    if (factors.verificaciones >= 0.6) {
      explicaciones.push('✅ As verificado');
    }

    if (factors.historialColaboracion > 0) {
      explicaciones.push('🤝 Ya trabajaron juntos antes');
    }

    return explicaciones.join(' • ');
  }

  private static calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Redondear a 2 decimales
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}