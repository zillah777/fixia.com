import { query } from '@/config/database';
import { FCMService } from './FCMService';
import { NotificationService } from './NotificationService';

export class RatingNotificationService {
  /**
   * Notificar nueva calificación recibida
   */
  static async notificarNuevaCalificacion(ratingId: string) {
    try {
      console.log(`⭐ Notificando nueva calificación ${ratingId}`);

      // Obtener datos de la calificación
      const ratingResult = await query(`
        SELECT 
          c.*,
          u_reviewer.nombre as reviewer_nombre,
          u_reviewer.apellido as reviewer_apellido,
          u_rated.id as rated_user_id,
          u_rated.nombre as rated_nombre,
          u_rated.apellido as rated_apellido,
          s.titulo as servicio_titulo,
          m.id as match_id
        FROM calificaciones c
        INNER JOIN usuarios u_reviewer ON c.calificador_id = u_reviewer.id
        INNER JOIN usuarios u_rated ON c.calificado_id = u_rated.id
        LEFT JOIN servicios s ON c.servicio_id = s.id
        LEFT JOIN matches m ON c.match_id = m.id
        WHERE c.id = $1
      `, [ratingId]);

      if (ratingResult.rows.length === 0) {
        console.log(`⚠️  Calificación ${ratingId} no encontrada`);
        return;
      }

      const rating = ratingResult.rows[0];
      const stars = '⭐'.repeat(rating.puntuacion);
      const reviewerName = `${rating.reviewer_nombre} ${rating.reviewer_apellido}`;

      // Crear notificación en app
      await NotificationService.crearNotificacion({
        usuario_id: rating.rated_user_id,
        tipo: 'calificacion',
        titulo: `${stars} Nueva calificación`,
        mensaje: `${reviewerName} te calificó con ${rating.puntuacion} estrellas${rating.comentario ? ': "' + rating.comentario.substring(0, 50) + (rating.comentario.length > 50 ? '..."' : '"') : ''}`,
        datos_extra: {
          rating_id: ratingId,
          puntuacion: rating.puntuacion,
          reviewer_id: rating.calificador_id,
          reviewer_name: reviewerName,
          comentario: rating.comentario,
          servicio_titulo: rating.servicio_titulo,
          match_id: rating.match_id
        }
      });

      // Enviar push notification
      await FCMService.sendRatingNotification(rating.rated_user_id, {
        id: ratingId,
        puntuacion: rating.puntuacion,
        reviewer_name: reviewerName,
        comentario: rating.comentario
      });

      // Si es una calificación alta (4-5 estrellas), enviar notificación especial
      if (rating.puntuacion >= 4) {
        await this.notificarCalificacionExcelente(rating);
      }

      console.log(`✅ Notificación de calificación enviada a usuario ${rating.rated_user_id}`);

    } catch (error) {
      console.error('Error notificando nueva calificación:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se alcanza un nuevo hito de calificaciones
   */
  static async verificarHitosCalificacion(userId: string) {
    try {
      console.log(`🏆 Verificando hitos de calificación para usuario ${userId}`);

      // Obtener estadísticas de calificaciones del usuario
      const statsResult = await query(`
        SELECT 
          COUNT(*) as total_calificaciones,
          AVG(puntuacion) as promedio,
          COUNT(*) FILTER (WHERE puntuacion = 5) as cinco_estrellas,
          COUNT(*) FILTER (WHERE puntuacion >= 4) as cuatro_mas_estrellas
        FROM calificaciones
        WHERE calificado_id = $1
      `, [userId]);

      if (statsResult.rows.length === 0) {
        return;
      }

      const stats = statsResult.rows[0];
      const totalCalificaciones = parseInt(stats.total_calificaciones);
      const promedio = parseFloat(stats.promedio);
      const cincoEstrellas = parseInt(stats.cinco_estrellas);

      // Verificar hitos de cantidad
      const hitosQuantity = [10, 25, 50, 100, 250, 500];
      for (const hito of hitosQuantity) {
        if (totalCalificaciones === hito) {
          await this.notificarHitoCantidad(userId, hito, promedio);
          break;
        }
      }

      // Verificar hitos de calificaciones perfectas
      const hitosPerfectas = [5, 10, 25, 50, 100];
      for (const hito of hitosPerfectas) {
        if (cincoEstrellas === hito) {
          await this.notificarHitoCalificacionesPerfectas(userId, hito);
          break;
        }
      }

      // Verificar hito de promedio alto
      if (totalCalificaciones >= 10 && promedio >= 4.8) {
        await this.verificarHitoPromedioAlto(userId, promedio, totalCalificaciones);
      }

    } catch (error) {
      console.error('Error verificando hitos de calificación:', error);
    }
  }

  /**
   * Notificar calificación excelente
   */
  private static async notificarCalificacionExcelente(rating: any) {
    try {
      const titulo = rating.puntuacion === 5 
        ? '🌟 ¡Calificación perfecta!' 
        : '⭐ ¡Excelente calificación!';

      const mensaje = rating.puntuacion === 5
        ? '¡Felicitaciones! Recibiste una calificación de 5 estrellas'
        : '¡Muy bien! Recibiste una calificación de 4 estrellas';

      await NotificationService.crearNotificacion({
        usuario_id: rating.rated_user_id,
        tipo: 'sistema',
        titulo,
        mensaje,
        datos_extra: {
          rating_id: rating.id,
          puntuacion: rating.puntuacion,
          tipo_hito: 'calificacion_excelente'
        }
      });

    } catch (error) {
      console.error('Error notificando calificación excelente:', error);
    }
  }

  /**
   * Notificar hito de cantidad de calificaciones
   */
  private static async notificarHitoCantidad(userId: string, cantidad: number, promedio: number) {
    try {
      await NotificationService.crearNotificacion({
        usuario_id: userId,
        tipo: 'sistema',
        titulo: `🏆 ¡Hito alcanzado!`,
        mensaje: `¡Felicitaciones! Alcanzaste ${cantidad} calificaciones con un promedio de ${promedio.toFixed(1)} estrellas`,
        datos_extra: {
          tipo_hito: 'cantidad_calificaciones',
          cantidad,
          promedio: promedio.toFixed(1)
        }
      });

      console.log(`🏆 Hito de cantidad notificado: ${cantidad} calificaciones para usuario ${userId}`);

    } catch (error) {
      console.error('Error notificando hito de cantidad:', error);
    }
  }

  /**
   * Notificar hito de calificaciones perfectas
   */
  private static async notificarHitoCalificacionesPerfectas(userId: string, cantidad: number) {
    try {
      await NotificationService.crearNotificacion({
        usuario_id: userId,
        tipo: 'sistema',
        titulo: `⭐ ¡Increíble logro!`,
        mensaje: `¡Tienes ${cantidad} calificaciones de 5 estrellas! Sos un As excepcional`,
        datos_extra: {
          tipo_hito: 'calificaciones_perfectas',
          cantidad
        }
      });

      console.log(`⭐ Hito de calificaciones perfectas notificado: ${cantidad} para usuario ${userId}`);

    } catch (error) {
      console.error('Error notificando hito de calificaciones perfectas:', error);
    }
  }

  /**
   * Verificar hito de promedio alto
   */
  private static async verificarHitoPromedioAlto(userId: string, promedio: number, totalCalificaciones: number) {
    try {
      // Verificar si ya notificamos este hito recientemente
      const recentNotification = await query(`
        SELECT id FROM notificaciones
        WHERE usuario_id = $1 
        AND tipo = 'sistema'
        AND datos_extra->>'tipo_hito' = 'promedio_alto'
        AND created_at > NOW() - INTERVAL '30 days'
      `, [userId]);

      if (recentNotification.rows.length > 0) {
        return; // Ya notificamos recientemente
      }

      let titulo = '';
      let mensaje = '';

      if (promedio >= 4.9) {
        titulo = '🌟 ¡As de Elite!';
        mensaje = `¡Increíble! Mantienes un promedio de ${promedio.toFixed(2)} estrellas con ${totalCalificaciones} calificaciones`;
      } else if (promedio >= 4.8) {
        titulo = '⭐ ¡As Destacado!';
        mensaje = `¡Excelente! Tu promedio es de ${promedio.toFixed(2)} estrellas con ${totalCalificaciones} calificaciones`;
      }

      if (titulo) {
        await NotificationService.crearNotificacion({
          usuario_id: userId,
          tipo: 'sistema',
          titulo,
          mensaje,
          datos_extra: {
            tipo_hito: 'promedio_alto',
            promedio: promedio.toFixed(2),
            total_calificaciones: totalCalificaciones
          }
        });

        console.log(`🌟 Hito de promedio alto notificado: ${promedio.toFixed(2)} para usuario ${userId}`);
      }

    } catch (error) {
      console.error('Error verificando hito de promedio alto:', error);
    }
  }

  /**
   * Recordar calificar después de un trabajo completado
   */
  static async recordarCalificar(matchId: string) {
    try {
      console.log(`⏰ Enviando recordatorio de calificación para match ${matchId}`);

      // Obtener datos del match
      const matchResult = await query(`
        SELECT 
          m.*,
          pe.usuario_id as explorador_usuario_id,
          pe.nombre as explorador_nombre,
          pa.usuario_id as as_usuario_id,
          pa.nombre as as_nombre,
          pa.apellido as as_apellido,
          s.titulo as servicio_titulo
        FROM matches m
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        LEFT JOIN servicios s ON m.servicio_id = s.id
        WHERE m.id = $1 AND m.estado = 'completado'
      `, [matchId]);

      if (matchResult.rows.length === 0) {
        console.log(`⚠️  Match ${matchId} no encontrado o no completado`);
        return;
      }

      const match = matchResult.rows[0];

      // Verificar si ya hay calificaciones
      const ratingsResult = await query(`
        SELECT calificador_id FROM calificaciones WHERE match_id = $1
      `, [matchId]);

      const existingRaters = ratingsResult.rows.map(r => r.calificador_id);

      // Recordar al Explorador si no ha calificado
      if (!existingRaters.includes(match.explorador_usuario_id)) {
        await NotificationService.crearNotificacion({
          usuario_id: match.explorador_usuario_id,
          tipo: 'sistema',
          titulo: `⭐ ¿Cómo fue tu experiencia?`,
          mensaje: `Calificá a ${match.as_nombre} ${match.as_apellido} por el servicio de ${match.servicio_titulo}`,
          datos_extra: {
            match_id: matchId,
            tipo_recordatorio: 'calificar',
            as_id: match.as_id,
            as_nombre: `${match.as_nombre} ${match.as_apellido}`
          }
        });
      }

      // Recordar al As si no ha calificado
      if (!existingRaters.includes(match.as_usuario_id)) {
        await NotificationService.crearNotificacion({
          usuario_id: match.as_usuario_id,
          tipo: 'sistema',
          titulo: `⭐ Calificá tu experiencia`,
          mensaje: `¿Cómo fue trabajar con ${match.explorador_nombre}? Tu opinión es importante`,
          datos_extra: {
            match_id: matchId,
            tipo_recordatorio: 'calificar',
            explorador_id: match.explorador_id,
            explorador_nombre: match.explorador_nombre
          }
        });
      }

      console.log(`✅ Recordatorios de calificación enviados para match ${matchId}`);

    } catch (error) {
      console.error('Error enviando recordatorio de calificación:', error);
    }
  }

  /**
   * Programar recordatorios de calificación
   */
  static async programarRecordatoriosCalificacion() {
    try {
      console.log(`⏰ Buscando matches completados para recordar calificar...`);

      // Buscar matches completados hace 24-72 horas sin calificaciones
      const matchesResult = await query(`
        SELECT m.id as match_id
        FROM matches m
        WHERE m.estado = 'completado'
        AND m.updated_at BETWEEN NOW() - INTERVAL '72 hours' AND NOW() - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM calificaciones c WHERE c.match_id = m.id
        )
      `);

      for (const match of matchesResult.rows) {
        try {
          await this.recordarCalificar(match.match_id);
          
          // Esperar un poco entre recordatorios para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error programando recordatorio para match ${match.match_id}:`, error);
        }
      }

      console.log(`✅ Recordatorios programados para ${matchesResult.rows.length} matches`);

    } catch (error) {
      console.error('Error programando recordatorios de calificación:', error);
    }
  }

  /**
   * Iniciar verificación periódica de recordatorios
   */
  static iniciarVerificacionPeriodica() {
    // Ejecutar cada 6 horas
    setInterval(() => {
      this.programarRecordatoriosCalificacion().catch(error => {
        console.error('Error en verificación periódica de recordatorios:', error);
      });
    }, 6 * 60 * 60 * 1000);

    console.log('⏰ Verificación periódica de recordatorios de calificación iniciada (cada 6 horas)');
  }
}