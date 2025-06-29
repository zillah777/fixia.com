import { query } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { FCMService } from './FCMService';

export class NotificationService {
  static async crearNotificacion(data: {
    usuario_id: string;
    tipo: 'match' | 'mensaje' | 'calificacion' | 'sistema' | 'pago';
    titulo: string;
    mensaje: string;
    datos_extra?: any;
  }) {
    try {
      const result = await query(`
        INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos_extra)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        data.usuario_id,
        data.tipo,
        data.titulo,
        data.mensaje,
        JSON.stringify(data.datos_extra || {})
      ]);

      const notificacion = result.rows[0];

      // Enviar push notification automáticamente
      await this.enviarPushNotificationIntegrada(notificacion);

      return notificacion;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw createError('Error al crear notificación', 500);
    }
  }

  static async notificarNuevaBusqueda(matches: any[]) {
    try {
      const notificaciones = [];

      for (const match of matches) {
        const as = match.servicio?.as_id || match.as_id;
        if (!as) continue;

        // Obtener perfil del As con preferencias de notificación
        const asResult = await query(`
          SELECT 
            pa.*,
            u.id as usuario_id,
            u.ultimo_acceso
          FROM perfiles_ases pa
          INNER JOIN usuarios u ON pa.usuario_id = u.id
          WHERE pa.id = $1
        `, [as]);

        if (asResult.rows.length === 0) continue;

        const asPerfiل = asResult.rows[0];

        // Verificar si debe notificar usando nueva lógica
        if (this.debeNotificar(asPerfiل, match)) {
          const notificacion = await this.crearNotificacion({
            usuario_id: asPerfiل.usuario_id,
            tipo: 'match',
            titulo: '🎯 Nueva oportunidad cerca de ti',
            mensaje: `Alguien busca ${match.busqueda?.titulo || match.titulo} a ${match.distancia_km}km`,
            datos_extra: { 
              match_id: match.id,
              busqueda_id: match.busqueda_id,
              distancia: match.distancia_km,
              score: match.score_matching
            }
          });

          // Enviar push notification usando FCMService
          await FCMService.sendProximityAlert(as, match.busqueda || match);

          notificaciones.push(notificacion);
        }
      }

      return notificaciones;
    } catch (error) {
      console.error('Error notificando nueva búsqueda:', error);
      throw error;
    }
  }

  private static debeNotificar(asPerfiل: any, match: any): boolean {
    // Verificar distancia
    if (match.distancia_km > (asPerfiل.radio_notificaciones || 20)) {
      return false;
    }

    // Verificar monto mínimo
    if (asPerfiل.monto_minimo_notificacion && 
        match.busqueda?.presupuesto_maximo && 
        match.busqueda.presupuesto_maximo < asPerfiل.monto_minimo_notificacion) {
      return false;
    }

    // Verificar servicios seleccionados para notificar
    if (asPerfiل.servicios_notificaciones && 
        asPerfiل.servicios_notificaciones.length > 0 && 
        match.servicio_id &&
        !asPerfiل.servicios_notificaciones.includes(match.servicio_id)) {
      return false;
    }

    // Verificar que el As esté activo (último acceso en los últimos 7 días)
    if (asPerfiل.ultimo_acceso) {
      const diasDesdeUltimoAcceso = 
        (Date.now() - new Date(asPerfiل.ultimo_acceso).getTime()) / (1000 * 60 * 60 * 24);
      if (diasDesdeUltimoAcceso > 7) {
        return false;
      }
    }

    return true;
  }

  static async notificarNuevoMatch(matchId: string) {
    try {
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
        WHERE m.id = $1
      `, [matchId]);

      if (matchResult.rows.length === 0) return;

      const match = matchResult.rows[0];

      // Notificar al As
      await this.crearNotificacion({
        usuario_id: match.as_usuario_id,
        tipo: 'match',
        titulo: '🌟 ¡Nuevo match!',
        mensaje: `${match.explorador_nombre} está interesado/a en tu servicio`,
        datos_extra: {
          match_id: matchId,
          explorador_nombre: match.explorador_nombre,
          servicio_titulo: match.servicio_titulo,
          score: match.score_matching
        }
      });

      // Notificar al Explorador
      await this.crearNotificacion({
        usuario_id: match.explorador_usuario_id,
        tipo: 'match',
        titulo: '🎯 ¡Match encontrado!',
        mensaje: `${match.as_nombre} ${match.as_apellido} puede ayudarte`,
        datos_extra: {
          match_id: matchId,
          as_nombre: `${match.as_nombre} ${match.as_apellido}`,
          servicio_titulo: match.servicio_titulo,
          score: match.score_matching
        }
      });

      // Enviar push notifications usando FCMService
      await FCMService.sendMatchNotification(match.as_usuario_id, match);
      await FCMService.sendMatchNotification(match.explorador_usuario_id, match);

    } catch (error) {
      console.error('Error notificando nuevo match:', error);
      throw error;
    }
  }

  static async notificarContacto(matchId: string, metodoContacto: string) {
    try {
      const matchResult = await query(`
        SELECT 
          m.*,
          pe.usuario_id as explorador_usuario_id,
          pe.nombre as explorador_nombre,
          pa.usuario_id as as_usuario_id,
          pa.nombre as as_nombre,
          pa.apellido as as_apellido
        FROM matches m
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        WHERE m.id = $1
      `, [matchId]);

      if (matchResult.rows.length === 0) return;

      const match = matchResult.rows[0];

      // Notificar al As que fue contactado
      await this.crearNotificacion({
        usuario_id: match.as_usuario_id,
        tipo: 'mensaje',
        titulo: '📞 Te contactaron',
        mensaje: `${match.explorador_nombre} te contactó vía ${metodoContacto}`,
        datos_extra: {
          match_id: matchId,
          metodo_contacto: metodoContacto,
          explorador_nombre: match.explorador_nombre
        }
      });

    } catch (error) {
      console.error('Error notificando contacto:', error);
      throw error;
    }
  }

  static async obtenerNotificaciones(userId: string, limite: number = 20, offset: number = 0) {
    try {
      const result = await query(`
        SELECT * FROM notificaciones
        WHERE usuario_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limite, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw createError('Error al obtener notificaciones', 500);
    }
  }

  static async marcarComoLeida(notificacionId: string, userId: string) {
    try {
      const result = await query(`
        UPDATE notificaciones 
        SET leida = true
        WHERE id = $1 AND usuario_id = $2
        RETURNING *
      `, [notificacionId, userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw createError('Error al marcar notificación', 500);
    }
  }

  static async marcarTodasComoLeidas(userId: string) {
    try {
      const result = await query(`
        UPDATE notificaciones 
        SET leida = true
        WHERE usuario_id = $1 AND leida = false
        RETURNING COUNT(*) as actualizadas
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error marcando todas las notificaciones:', error);
      throw createError('Error al marcar notificaciones', 500);
    }
  }

  static async contarNoLeidas(userId: string): Promise<number> {
    try {
      const result = await query(`
        SELECT COUNT(*) as no_leidas
        FROM notificaciones
        WHERE usuario_id = $1 AND leida = false
      `, [userId]);

      return parseInt(result.rows[0].no_leidas);
    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      return 0;
    }
  }

  static async eliminarNotificacion(notificacionId: string, userId: string) {
    try {
      const result = await query(`
        DELETE FROM notificaciones 
        WHERE id = $1 AND usuario_id = $2
        RETURNING *
      `, [notificacionId, userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw createError('Error al eliminar notificación', 500);
    }
  }

  /**
   * Enviar push notification integrada con FCMService
   */
  private static async enviarPushNotificationIntegrada(notificacion: any) {
    try {
      // Mapear tipos de notificación a iconos
      const iconMap = {
        match: '/icons/match-icon.png',
        mensaje: '/icons/chat-icon.png',
        calificacion: '/icons/star-icon.png',
        sistema: '/icons/system-icon.png',
        pago: '/icons/payment-icon.png'
      };

      // Determinar click action basado en el tipo
      const clickActionMap = {
        match: `/matches/${notificacion.datos_extra?.match_id || ''}`,
        mensaje: `/chats/${notificacion.datos_extra?.chat_id || ''}`,
        calificacion: '/profile/ratings',
        sistema: '/dashboard',
        pago: '/payments'
      };

      const pushData = {
        title: notificacion.titulo,
        body: notificacion.mensaje,
        icon: iconMap[notificacion.tipo as keyof typeof iconMap] || '/icons/icon-192x192.png',
        data: {
          type: notificacion.tipo,
          notification_id: notificacion.id,
          ...notificacion.datos_extra
        },
        click_action: clickActionMap[notificacion.tipo as keyof typeof clickActionMap] || '/dashboard'
      };

      await FCMService.sendToUser(notificacion.usuario_id, pushData);

    } catch (error) {
      console.error('Error enviando push notification integrada:', error);
    }
  }

  static async registrarFCMToken(userId: string, fcmToken: string) {
    try {
      const success = await FCMService.registerToken(userId, fcmToken);
      if (!success) {
        throw createError('Error al registrar token de notificaciones', 500);
      }
      return { success: true };
    } catch (error) {
      console.error('Error registrando FCM token:', error);
      throw createError('Error al registrar token de notificaciones', 500);
    }
  }

  static async eliminarFCMToken(userId: string) {
    try {
      const success = await FCMService.unregisterToken(userId);
      if (!success) {
        throw createError('Error al eliminar token de notificaciones', 500);
      }
      return { success: true };
    } catch (error) {
      console.error('Error eliminando FCM token:', error);
      throw createError('Error al eliminar token de notificaciones', 500);
    }
  }
}