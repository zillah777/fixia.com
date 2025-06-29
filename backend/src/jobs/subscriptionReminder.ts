import { query } from '@/config/database';
import { NotificationService } from '@/services/NotificationService';
import { FCMService } from '@/services/FCMService';
import { PaymentService } from '@/services/PaymentService';

/**
 * Job para verificar suscripciones que están por vencer
 * y enviar recordatorios de renovación
 */
export class SubscriptionReminderJob {
  
  /**
   * Verificar suscripciones que vencen en los próximos días
   */
  static async checkExpiringSubscriptions() {
    try {
      console.log('🔔 Iniciando verificación de suscripciones por vencer...');

      // Verificar suscripciones que vencen en 7, 3 y 1 día
      await this.checkSubscriptionsExpiringInDays(7);
      await this.checkSubscriptionsExpiringInDays(3);
      await this.checkSubscriptionsExpiringInDays(1);

      // Verificar suscripciones ya vencidas (gracia de 7 días)
      await this.checkExpiredSubscriptions();

      console.log('✅ Verificación de suscripciones completada');

    } catch (error) {
      console.error('❌ Error en verificación de suscripciones:', error);
      throw error;
    }
  }

  /**
   * Verificar suscripciones que vencen en X días
   */
  private static async checkSubscriptionsExpiringInDays(days: number) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + days);

      // Obtener suscripciones que vencen en exactamente X días
      const suscripcionesResult = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento,
          s.precio_mensual,
          pa.id as as_id,
          pa.usuario_id,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_usuario
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.estado = 'activa'
        AND DATE(s.fecha_vencimiento) = DATE($1)
        AND pa.suscripcion_activa = true
      `, [fechaLimite]);

      for (const suscripcion of suscripcionesResult.rows) {
        await this.sendExpirationReminder(suscripcion, days);
      }

      console.log(`📅 Procesadas ${suscripcionesResult.rows.length} suscripciones que vencen en ${days} días`);

    } catch (error) {
      console.error(`Error verificando suscripciones que vencen en ${days} días:`, error);
    }
  }

  /**
   * Verificar suscripciones ya vencidas (período de gracia)
   */
  private static async checkExpiredSubscriptions() {
    try {
      const fechaGracia = new Date();
      fechaGracia.setDate(fechaGracia.getDate() - 7); // 7 días de gracia

      // Obtener suscripciones vencidas dentro del período de gracia
      const suscripcionesResult = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento,
          s.precio_mensual,
          pa.id as as_id,
          pa.usuario_id,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_usuario,
          EXTRACT(DAY FROM NOW() - s.fecha_vencimiento) as dias_vencido
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.estado = 'activa'
        AND s.fecha_vencimiento < NOW()
        AND s.fecha_vencimiento > $1
        AND pa.suscripcion_activa = true
      `, [fechaGracia]);

      for (const suscripcion of suscripcionesResult.rows) {
        await this.sendExpiredNotification(suscripcion);
      }

      console.log(`⏰ Procesadas ${suscripcionesResult.rows.length} suscripciones vencidas en período de gracia`);

    } catch (error) {
      console.error('Error verificando suscripciones vencidas:', error);
    }
  }

  /**
   * Enviar recordatorio de vencimiento
   */
  private static async sendExpirationReminder(suscripcion: any, daysUntilExpiry: number) {
    try {
      const fechaVencimiento = new Date(suscripcion.fecha_vencimiento);
      const fechaFormateada = fechaVencimiento.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      let titulo = '';
      let mensaje = '';
      let urgencia = 'medium';

      switch (daysUntilExpiry) {
        case 7:
          titulo = '📅 Tu suscripción vence en una semana';
          mensaje = `Tu plan ${suscripcion.plan_id} vence el ${fechaFormateada}. ¡Renovalo para no perder trabajos!`;
          urgencia = 'low';
          break;
        case 3:
          titulo = '⚠️ Tu suscripción vence en 3 días';
          mensaje = `¡Atención! Tu plan ${suscripcion.plan_id} vence el ${fechaFormateada}. Renovalo ahora.`;
          urgencia = 'medium';
          break;
        case 1:
          titulo = '🚨 ¡Tu suscripción vence mañana!';
          mensaje = `¡Último aviso! Tu plan ${suscripcion.plan_id} vence mañana. Renovalo para seguir activo.`;
          urgencia = 'high';
          break;
      }

      // Verificar si ya enviamos esta notificación recientemente
      const existingNotification = await query(`
        SELECT id FROM notificaciones
        WHERE usuario_id = $1 
        AND tipo = 'sistema'
        AND datos_extra->>'tipo_recordatorio' = 'vencimiento_suscripcion'
        AND datos_extra->>'dias_vencimiento' = $2
        AND created_at > NOW() - INTERVAL '1 day'
      `, [suscripcion.usuario_id, daysUntilExpiry.toString()]);

      if (existingNotification.rows.length > 0) {
        console.log(`📝 Recordatorio de ${daysUntilExpiry} días ya enviado para usuario ${suscripcion.usuario_id}`);
        return;
      }

      // Crear notificación in-app
      await NotificationService.crearNotificacion({
        usuario_id: suscripcion.usuario_id,
        tipo: 'sistema',
        titulo,
        mensaje,
        datos_extra: {
          tipo_recordatorio: 'vencimiento_suscripcion',
          suscripcion_id: suscripcion.suscripcion_id,
          plan_id: suscripcion.plan_id,
          fecha_vencimiento: fechaFormateada,
          dias_vencimiento: daysUntilExpiry,
          precio_renovacion: suscripcion.precio_mensual,
          urgencia,
          action_url: '/suscripciones/renovar'
        }
      });

      // Enviar push notification específica
      await FCMService.sendToUser(suscripcion.usuario_id, {
        title: titulo,
        body: mensaje,
        icon: urgencia === 'high' ? '/icons/urgent-icon.png' : '/icons/subscription-icon.png',
        data: {
          type: 'subscription_expiring',
          suscripcion_id: suscripcion.suscripcion_id,
          days_until_expiry: daysUntilExpiry.toString(),
          urgencia,
          plan_id: suscripcion.plan_id
        },
        click_action: '/suscripciones/renovar'
      });

      console.log(`📧 Recordatorio de ${daysUntilExpiry} días enviado a ${suscripcion.nombre} ${suscripcion.apellido}`);

    } catch (error) {
      console.error(`Error enviando recordatorio a usuario ${suscripcion.usuario_id}:`, error);
    }
  }

  /**
   * Enviar notificación de suscripción vencida
   */
  private static async sendExpiredNotification(suscripcion: any) {
    try {
      const diasVencido = Math.floor(suscripcion.dias_vencido);
      const diasRestantes = 7 - diasVencido;

      // Verificar si ya enviamos notificación de vencimiento hoy
      const existingNotification = await query(`
        SELECT id FROM notificaciones
        WHERE usuario_id = $1 
        AND tipo = 'sistema'
        AND datos_extra->>'tipo_recordatorio' = 'suscripcion_vencida'
        AND created_at > CURRENT_DATE
      `, [suscripcion.usuario_id]);

      if (existingNotification.rows.length > 0) {
        console.log(`📝 Notificación de vencimiento ya enviada hoy para usuario ${suscripcion.usuario_id}`);
        return;
      }

      const titulo = `🚨 Suscripción vencida - ${diasRestantes} días restantes`;
      const mensaje = `Tu suscripción venció hace ${diasVencido} días. Tenés ${diasRestantes} días más para renovar antes de que se desactive tu cuenta.`;

      // Crear notificación in-app
      await NotificationService.crearNotificacion({
        usuario_id: suscripcion.usuario_id,
        tipo: 'sistema',
        titulo,
        mensaje,
        datos_extra: {
          tipo_recordatorio: 'suscripcion_vencida',
          suscripcion_id: suscripcion.suscripcion_id,
          plan_id: suscripcion.plan_id,
          dias_vencido: diasVencido,
          dias_gracia_restantes: diasRestantes,
          precio_renovacion: suscripcion.precio_mensual,
          urgencia: 'critical',
          action_url: '/suscripciones/renovar'
        }
      });

      // Enviar push notification crítica
      await FCMService.sendToUser(suscripcion.usuario_id, {
        title: titulo,
        body: mensaje,
        icon: '/icons/critical-icon.png',
        data: {
          type: 'subscription_expired',
          suscripcion_id: suscripcion.suscripcion_id,
          days_expired: diasVencido.toString(),
          days_remaining: diasRestantes.toString(),
          plan_id: suscripcion.plan_id
        },
        click_action: '/suscripciones/renovar'
      });

      console.log(`🚨 Notificación de vencimiento enviada a ${suscripcion.nombre} ${suscripcion.apellido} (${diasVencido} días vencido)`);

    } catch (error) {
      console.error(`Error enviando notificación de vencimiento a usuario ${suscripcion.usuario_id}:`, error);
    }
  }

  /**
   * Verificar suscripciones por plan específico
   */
  static async checkSubscriptionsByPlan(planId: string) {
    try {
      console.log(`📊 Verificando suscripciones del plan: ${planId}`);

      const suscripcionesResult = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento,
          s.estado,
          pa.usuario_id,
          u.nombre,
          u.apellido,
          EXTRACT(DAY FROM s.fecha_vencimiento - NOW()) as dias_hasta_vencimiento
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.plan_id = $1 
        AND s.estado = 'activa'
        ORDER BY s.fecha_vencimiento ASC
      `, [planId]);

      const estadisticas = {
        total: suscripcionesResult.rows.length,
        vencen_7_dias: 0,
        vencen_3_dias: 0,
        vencen_1_dia: 0,
        vencidas: 0
      };

      for (const suscripcion of suscripcionesResult.rows) {
        const dias = suscripcion.dias_hasta_vencimiento;
        if (dias < 0) estadisticas.vencidas++;
        else if (dias <= 1) estadisticas.vencen_1_dia++;
        else if (dias <= 3) estadisticas.vencen_3_dias++;
        else if (dias <= 7) estadisticas.vencen_7_dias++;
      }

      console.log(`📈 Estadísticas plan ${planId}:`, estadisticas);
      return estadisticas;

    } catch (error) {
      console.error(`Error verificando suscripciones del plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio personalizado a usuario específico
   */
  static async sendCustomReminder(userId: string, message: string) {
    try {
      // Verificar que el usuario tenga suscripción activa
      const suscripcionResult = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        WHERE pa.usuario_id = $1 
        AND s.estado = 'activa'
        AND pa.suscripcion_activa = true
      `, [userId]);

      if (suscripcionResult.rows.length === 0) {
        console.log(`⚠️  Usuario ${userId} no tiene suscripción activa`);
        return false;
      }

      const suscripcion = suscripcionResult.rows[0];

      await NotificationService.crearNotificacion({
        usuario_id: userId,
        tipo: 'sistema',
        titulo: '📢 Recordatorio de suscripción',
        mensaje: message,
        datos_extra: {
          tipo_recordatorio: 'personalizado',
          suscripcion_id: suscripcion.suscripcion_id,
          plan_id: suscripcion.plan_id,
          action_url: '/suscripciones'
        }
      });

      console.log(`📧 Recordatorio personalizado enviado a usuario ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error enviando recordatorio personalizado a usuario ${userId}:`, error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de recordatorios enviados
   */
  static async getReminderStats(days: number = 30) {
    try {
      const result = await query(`
        SELECT 
          datos_extra->>'tipo_recordatorio' as tipo_recordatorio,
          COUNT(*) as total_enviados,
          COUNT(DISTINCT usuario_id) as usuarios_unicos,
          DATE(created_at) as fecha
        FROM notificaciones
        WHERE tipo = 'sistema'
        AND datos_extra->>'tipo_recordatorio' IN ('vencimiento_suscripcion', 'suscripcion_vencida', 'personalizado')
        AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY datos_extra->>'tipo_recordatorio', DATE(created_at)
        ORDER BY fecha DESC, tipo_recordatorio
      `);

      return result.rows;

    } catch (error) {
      console.error('Error obteniendo estadísticas de recordatorios:', error);
      return [];
    }
  }
}