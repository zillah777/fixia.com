import { PaymentService } from './PaymentService';
import { NotificationService } from './NotificationService';
import { query } from '@/config/database';

export class ScheduledTasksService {
  private static isRunning = false;

  /**
   * Iniciar tareas programadas
   */
  static async iniciar() {
    if (this.isRunning) {
      console.log('⚠️  Tareas programadas ya están ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('🕐 Iniciando tareas programadas...');

    // Ejecutar verificación inicial
    await this.ejecutarTareas();

    // Programar ejecución cada hora
    setInterval(async () => {
      await this.ejecutarTareas();
    }, 60 * 60 * 1000); // 1 hora

    // Programar verificación de suscripciones cada 6 horas
    setInterval(async () => {
      await PaymentService.verificarSuscripcionesVencidas();
    }, 6 * 60 * 60 * 1000); // 6 horas

    // Programar notificaciones de vencimiento cada día
    setInterval(async () => {
      await this.notificarVencimientos();
    }, 24 * 60 * 60 * 1000); // 24 horas

    console.log('✅ Tareas programadas iniciadas exitosamente');
  }

  /**
   * Ejecutar todas las tareas programadas
   */
  private static async ejecutarTareas() {
    try {
      console.log('🔄 Ejecutando tareas programadas...');
      
      const startTime = Date.now();
      
      // Ejecutar tareas en paralelo para mejor rendimiento
      await Promise.allSettled([
        this.limpiarTokensExpirados(),
        this.limpiarSesionesAntiguas(),
        this.actualizarEstadisticasCache(),
        this.limpiarNotificacionesAntiguas(),
        this.verificarMatchesObsoletos()
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Tareas programadas completadas en ${duration}ms`);

    } catch (error) {
      console.error('❌ Error ejecutando tareas programadas:', error);
    }
  }

  /**
   * Limpiar tokens JWT expirados de la blacklist
   */
  private static async limpiarTokensExpirados() {
    try {
      // TODO: Implementar limpieza de tokens en Redis
      console.log('🧹 Limpiando tokens expirados...');
      
      // Esta función sería implementada cuando tengamos Redis configurado
      // await cleanExpiredTokensFromRedis();
      
    } catch (error) {
      console.error('Error limpiando tokens expirados:', error);
    }
  }

  /**
   * Limpiar sesiones de usuarios inactivas
   */
  private static async limpiarSesionesAntiguas() {
    try {
      console.log('🧹 Limpiando sesiones antiguas...');
      
      // Limpiar sesiones de usuarios que no han accedido en 30 días
      await query(`
        UPDATE usuarios 
        SET ultimo_acceso = NULL 
        WHERE ultimo_acceso < NOW() - INTERVAL '30 days'
      `);

      // TODO: Limpiar sesiones en Redis
      // await cleanOldSessionsFromRedis();
      
    } catch (error) {
      console.error('Error limpiando sesiones antiguas:', error);
    }
  }

  /**
   * Actualizar estadísticas en cache
   */
  private static async actualizarEstadisticasCache() {
    try {
      console.log('📊 Actualizando estadísticas en cache...');
      
      // Obtener estadísticas actualizadas
      const stats = await this.calcularEstadisticasGenerales();
      
      // TODO: Guardar en cache Redis
      // await setCache('app:stats:general', stats, 60 * 60); // 1 hora
      
      console.log('✅ Estadísticas actualizadas:', {
        usuarios_activos: stats.usuarios_activos,
        servicios_activos: stats.servicios_activos,
        matches_mes: stats.matches_mes_actual
      });
      
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  /**
   * Calcular estadísticas generales de la plataforma
   */
  private static async calcularEstadisticasGenerales() {
    try {
      const result = await query(`
        SELECT 
          -- Usuarios
          COUNT(DISTINCT u.id) FILTER (WHERE u.ultimo_acceso > NOW() - INTERVAL '7 days') as usuarios_activos,
          COUNT(DISTINCT u.id) as total_usuarios,
          
          -- Servicios
          COUNT(DISTINCT s.id) FILTER (WHERE s.activo = true) as servicios_activos,
          COUNT(DISTINCT s.id) as total_servicios,
          
          -- Matches
          COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > DATE_TRUNC('month', NOW())) as matches_mes_actual,
          COUNT(DISTINCT m.id) as total_matches,
          
          -- Suscripciones
          COUNT(DISTINCT subs.id) FILTER (WHERE subs.estado = 'activa') as suscripciones_activas,
          
          -- Búsquedas
          COUNT(DISTINCT bs.id) FILTER (WHERE bs.estado = 'activa') as busquedas_activas
          
        FROM usuarios u
        LEFT JOIN perfiles_ases pa ON u.id = pa.usuario_id
        LEFT JOIN perfiles_exploradores pe ON u.id = pe.usuario_id
        LEFT JOIN servicios s ON pa.id = s.as_id
        LEFT JOIN matches m ON (pa.id = m.as_id OR pe.id = m.explorador_id)
        LEFT JOIN suscripciones subs ON pa.suscripcion_id = subs.id
        LEFT JOIN busquedas_servicios bs ON pe.id = bs.explorador_id
      `);

      return result.rows[0];

    } catch (error) {
      console.error('Error calculando estadísticas generales:', error);
      return {};
    }
  }

  /**
   * Limpiar notificaciones antiguas
   */
  private static async limpiarNotificacionesAntiguas() {
    try {
      console.log('🧹 Limpiando notificaciones antiguas...');
      
      // Eliminar notificaciones leídas de más de 30 días
      const deletedCount = await query(`
        DELETE FROM notificaciones 
        WHERE leida = true 
        AND created_at < NOW() - INTERVAL '30 days'
      `);

      // Marcar como leídas las notificaciones de más de 7 días
      await query(`
        UPDATE notificaciones 
        SET leida = true 
        WHERE leida = false 
        AND created_at < NOW() - INTERVAL '7 days'
        AND tipo != 'match' -- Mantener notificaciones de match sin leer por más tiempo
      `);

      console.log(`🗑️  ${deletedCount.rowCount || 0} notificaciones antiguas eliminadas`);
      
    } catch (error) {
      console.error('Error limpiando notificaciones:', error);
    }
  }

  /**
   * Verificar y limpiar matches obsoletos
   */
  private static async verificarMatchesObsoletos() {
    try {
      console.log('🔍 Verificando matches obsoletos...');
      
      // Marcar como obsoletos los matches de búsquedas canceladas/completadas
      await query(`
        UPDATE matches 
        SET estado = 'obsoleto'
        WHERE estado = 'sugerido'
        AND busqueda_id IN (
          SELECT id FROM busquedas_servicios 
          WHERE estado IN ('cancelada', 'completada', 'pausada')
        )
      `);

      // Limpiar matches muy antiguos sin actividad
      const oldMatches = await query(`
        UPDATE matches 
        SET estado = 'expirado'
        WHERE estado = 'sugerido'
        AND created_at < NOW() - INTERVAL '30 days'
      `);

      if (oldMatches.rowCount && oldMatches.rowCount > 0) {
        console.log(`🗑️  ${oldMatches.rowCount} matches obsoletos marcados como expirados`);
      }
      
    } catch (error) {
      console.error('Error verificando matches obsoletos:', error);
    }
  }

  /**
   * Notificar vencimientos próximos de suscripciones
   */
  private static async notificarVencimientos() {
    try {
      console.log('📅 Verificando vencimientos próximos...');
      
      // Suscripciones que vencen en 7 días
      const vencenEn7Dias = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento,
          pa.usuario_id,
          u.email
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.estado = 'activa'
        AND s.fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        AND s.fecha_vencimiento > NOW() + INTERVAL '6 days'
      `);

      for (const suscripcion of vencenEn7Dias.rows) {
        await NotificationService.crearNotificacion({
          usuario_id: suscripcion.usuario_id,
          tipo: 'sistema',
          titulo: '⚠️ Tu suscripción vence pronto',
          mensaje: `Tu plan ${suscripcion.plan_id} vence el ${new Date(suscripcion.fecha_vencimiento).toLocaleDateString('es-AR')}. Renovála para no perder acceso.`,
          datos_extra: {
            suscripcion_id: suscripcion.suscripcion_id,
            plan_id: suscripcion.plan_id,
            fecha_vencimiento: suscripcion.fecha_vencimiento,
            accion: 'renovar_suscripcion'
          }
        });
      }

      // Suscripciones que vencen en 1 día
      const vencenEn1Dia = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.fecha_vencimiento,
          pa.usuario_id,
          u.email
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.estado = 'activa'
        AND s.fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '1 day'
        AND s.fecha_vencimiento > NOW() + INTERVAL '23 hours'
      `);

      for (const suscripcion of vencenEn1Dia.rows) {
        await NotificationService.crearNotificacion({
          usuario_id: suscripcion.usuario_id,
          tipo: 'sistema',
          titulo: '🚨 Tu suscripción vence mañana',
          mensaje: `Tu plan ${suscripcion.plan_id} vence mañana. ¡Renovála ahora para evitar la interrupción del servicio!`,
          datos_extra: {
            suscripcion_id: suscripcion.suscripcion_id,
            plan_id: suscripcion.plan_id,
            fecha_vencimiento: suscripcion.fecha_vencimiento,
            urgente: true,
            accion: 'renovar_suscripcion'
          }
        });
      }

      if (vencenEn7Dias.rows.length > 0 || vencenEn1Dia.rows.length > 0) {
        console.log(`📧 Notificaciones de vencimiento enviadas: ${vencenEn7Dias.rows.length + vencenEn1Dia.rows.length}`);
      }
      
    } catch (error) {
      console.error('Error notificando vencimientos:', error);
    }
  }

  /**
   * Detener tareas programadas
   */
  static detener() {
    this.isRunning = false;
    console.log('🛑 Tareas programadas detenidas');
  }

  /**
   * Ejecutar tarea específica manualmente
   */
  static async ejecutarTareaManual(nombreTarea: string) {
    try {
      console.log(`🔧 Ejecutando tarea manual: ${nombreTarea}`);
      
      switch (nombreTarea) {
        case 'verificar_suscripciones':
          await PaymentService.verificarSuscripcionesVencidas();
          break;
        case 'limpiar_notificaciones':
          await this.limpiarNotificacionesAntiguas();
          break;
        case 'actualizar_estadisticas':
          await this.actualizarEstadisticasCache();
          break;
        case 'notificar_vencimientos':
          await this.notificarVencimientos();
          break;
        case 'limpiar_matches':
          await this.verificarMatchesObsoletos();
          break;
        default:
          throw new Error(`Tarea desconocida: ${nombreTarea}`);
      }
      
      console.log(`✅ Tarea manual completada: ${nombreTarea}`);
      return { success: true, message: `Tarea ${nombreTarea} ejecutada correctamente` };
      
    } catch (error) {
      console.error(`❌ Error ejecutando tarea manual ${nombreTarea}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener estado del servicio de tareas programadas
   */
  static obtenerEstado() {
    return {
      running: this.isRunning,
      uptime: process.uptime(),
      next_execution: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Próxima hora
      available_tasks: [
        'verificar_suscripciones',
        'limpiar_notificaciones',
        'actualizar_estadisticas',
        'notificar_vencimientos',
        'limpiar_matches'
      ]
    };
  }
}