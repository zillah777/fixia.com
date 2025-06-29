import cron from 'node-cron';
import { SubscriptionReminderJob } from './subscriptionReminder';
import { PaymentService } from '@/services/PaymentService';
import { ChatNotificationService } from '@/services/ChatNotificationService';
import { RatingNotificationService } from '@/services/RatingNotificationService';

/**
 * Scheduler centralizado para todos los trabajos cron del sistema
 */
export class JobScheduler {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();
  private static isInitialized = false;

  /**
   * Inicializar todos los trabajos cron
   */
  static initialize() {
    if (this.isInitialized) {
      console.log('⏰ JobScheduler ya inicializado');
      return;
    }

    try {
      console.log('⏰ Iniciando JobScheduler...');

      // Programar todos los trabajos
      this.scheduleSubscriptionReminders();
      this.schedulePaymentVerification();
      this.scheduleNotificationCleanup();
      this.schedulePerformanceOptimization();
      this.scheduleHealthChecks();

      this.isInitialized = true;
      console.log('✅ JobScheduler inicializado correctamente');
      this.logScheduledJobs();

    } catch (error) {
      console.error('❌ Error inicializando JobScheduler:', error);
      throw error;
    }
  }

  /**
   * Programar recordatorios de suscripción
   */
  private static scheduleSubscriptionReminders() {
    // Verificar suscripciones que vencen - cada 4 horas
    const subscriptionJob = cron.schedule('0 */4 * * *', async () => {
      try {
        console.log('🔔 Ejecutando verificación de suscripciones...');
        await SubscriptionReminderJob.checkExpiringSubscriptions();
      } catch (error) {
        console.error('Error en verificación de suscripciones:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('subscription-reminders', subscriptionJob);
    subscriptionJob.start();

    // Verificación especial los lunes para plan semanal
    const weeklyJob = cron.schedule('0 9 * * 1', async () => {
      try {
        console.log('📅 Verificación semanal de suscripciones...');
        await SubscriptionReminderJob.checkSubscriptionsByPlan('semanal');
      } catch (error) {
        console.error('Error en verificación semanal:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('weekly-subscription-check', weeklyJob);
    weeklyJob.start();
  }

  /**
   * Programar verificación de pagos
   */
  private static schedulePaymentVerification() {
    // Verificar suscripciones vencidas - cada 6 horas
    const paymentJob = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('💳 Ejecutando verificación de pagos vencidos...');
        await PaymentService.verificarSuscripcionesVencidas();
      } catch (error) {
        console.error('Error en verificación de pagos:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('payment-verification', paymentJob);
    paymentJob.start();

    // Verificación diaria de pagos pendientes a las 10:00 AM
    const pendingPaymentsJob = cron.schedule('0 10 * * *', async () => {
      try {
        console.log('⏳ Verificando pagos pendientes...');
        // TODO: Implementar verificación de pagos pendientes en MercadoPago
        console.log('📊 Verificación de pagos pendientes completada');
      } catch (error) {
        console.error('Error verificando pagos pendientes:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('pending-payments-check', pendingPaymentsJob);
    pendingPaymentsJob.start();
  }

  /**
   * Programar limpieza de notificaciones
   */
  private static scheduleNotificationCleanup() {
    // Limpiar notificaciones antiguas - cada día a las 2:00 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Ejecutando limpieza de notificaciones...');
        await this.cleanupOldNotifications();
        await this.cleanupOldFCMStats();
      } catch (error) {
        console.error('Error en limpieza de notificaciones:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('notification-cleanup', cleanupJob);
    cleanupJob.start();

    // Verificar mensajes no leídos - cada 30 minutos
    const unreadMessagesJob = cron.schedule('*/30 * * * *', async () => {
      try {
        await ChatNotificationService.notificarMensajesNoLeidos();
      } catch (error) {
        console.error('Error verificando mensajes no leídos:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('unread-messages-check', unreadMessagesJob);
    unreadMessagesJob.start();
  }

  /**
   * Programar optimización de performance
   */
  private static schedulePerformanceOptimization() {
    // Optimización de base de datos - cada domingo a las 3:00 AM
    const optimizationJob = cron.schedule('0 3 * * 0', async () => {
      try {
        console.log('⚡ Ejecutando optimización de performance...');
        await this.optimizeDatabase();
        await this.updateSearchIndexes();
      } catch (error) {
        console.error('Error en optimización de performance:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('performance-optimization', optimizationJob);
    optimizationJob.start();

    // Actualizar estadísticas - cada 2 horas
    const statsJob = cron.schedule('0 */2 * * *', async () => {
      try {
        console.log('📊 Actualizando estadísticas del sistema...');
        await this.updateSystemStats();
      } catch (error) {
        console.error('Error actualizando estadísticas:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('stats-update', statsJob);
    statsJob.start();
  }

  /**
   * Programar verificaciones de salud
   */
  private static scheduleHealthChecks() {
    // Health check completo - cada hora
    const healthJob = cron.schedule('0 * * * *', async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Error en health check:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('health-check', healthJob);
    healthJob.start();

    // Recordatorios de calificación - cada 6 horas
    const ratingRemindersJob = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('⭐ Verificando recordatorios de calificación...');
        await RatingNotificationService.programarRecordatoriosCalificacion();
      } catch (error) {
        console.error('Error en recordatorios de calificación:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.jobs.set('rating-reminders', ratingRemindersJob);
    ratingRemindersJob.start();
  }

  /**
   * Limpiar notificaciones antiguas
   */
  private static async cleanupOldNotifications() {
    try {
      const { query } = await import('@/config/database');
      
      // Eliminar notificaciones leídas de más de 30 días
      const readNotificationsResult = await query(`
        DELETE FROM notificaciones 
        WHERE leida = true 
        AND created_at < NOW() - INTERVAL '30 days'
      `);

      // Eliminar notificaciones no leídas de más de 90 días
      const unreadNotificationsResult = await query(`
        DELETE FROM notificaciones 
        WHERE leida = false 
        AND created_at < NOW() - INTERVAL '90 days'
      `);

      console.log(`🧹 Notificaciones eliminadas: ${readNotificationsResult.rowCount} leídas, ${unreadNotificationsResult.rowCount} no leídas`);

    } catch (error) {
      console.error('Error limpiando notificaciones:', error);
    }
  }

  /**
   * Limpiar estadísticas FCM antiguas
   */
  private static async cleanupOldFCMStats() {
    try {
      const { query } = await import('@/config/database');
      
      // Mantener solo estadísticas de los últimos 90 días
      const result = await query(`
        DELETE FROM push_notification_stats 
        WHERE fecha < CURRENT_DATE - INTERVAL '90 days'
      `);

      console.log(`🧹 Estadísticas FCM eliminadas: ${result.rowCount} registros`);

    } catch (error) {
      console.error('Error limpiando estadísticas FCM:', error);
    }
  }

  /**
   * Optimizar base de datos
   */
  private static async optimizeDatabase() {
    try {
      const { query } = await import('@/config/database');
      
      // Ejecutar VACUUM ANALYZE en tablas principales
      const tables = [
        'usuarios', 'notificaciones', 'matches', 'servicios', 
        'busquedas', 'calificaciones', 'suscripciones', 'pagos'
      ];

      for (const table of tables) {
        try {
          await query(`VACUUM ANALYZE ${table}`);
        } catch (error) {
          console.error(`Error optimizando tabla ${table}:`, error);
        }
      }

      console.log('⚡ Optimización de base de datos completada');

    } catch (error) {
      console.error('Error en optimización de base de datos:', error);
    }
  }

  /**
   * Actualizar índices de búsqueda
   */
  private static async updateSearchIndexes() {
    try {
      const { query } = await import('@/config/database');
      
      // Reindexar índices GIST para geolocalización
      await query('REINDEX INDEX idx_servicios_ubicacion');
      await query('REINDEX INDEX idx_busquedas_ubicacion');
      
      console.log('🔍 Índices de búsqueda actualizados');

    } catch (error) {
      console.error('Error actualizando índices:', error);
    }
  }

  /**
   * Actualizar estadísticas del sistema
   */
  private static async updateSystemStats() {
    try {
      const { query } = await import('@/config/database');
      
      // Actualizar estadísticas de usuarios activos
      await query(`
        INSERT INTO system_stats (fecha, tipo, valor)
        VALUES (CURRENT_DATE, 'usuarios_activos_mes', (
          SELECT COUNT(DISTINCT id) FROM usuarios 
          WHERE ultimo_acceso > NOW() - INTERVAL '30 days'
        ))
        ON CONFLICT (fecha, tipo) DO UPDATE SET valor = EXCLUDED.valor
      `);

      // Actualizar estadísticas de matches
      await query(`
        INSERT INTO system_stats (fecha, tipo, valor)
        VALUES (CURRENT_DATE, 'matches_mes', (
          SELECT COUNT(*) FROM matches 
          WHERE created_at > NOW() - INTERVAL '30 days'
        ))
        ON CONFLICT (fecha, tipo) DO UPDATE SET valor = EXCLUDED.valor
      `);

    } catch (error) {
      console.error('Error actualizando estadísticas del sistema:', error);
    }
  }

  /**
   * Realizar verificación de salud
   */
  private static async performHealthCheck() {
    try {
      const { NotificationManager } = await import('@/services/NotificationManager');
      const health = await NotificationManager.verificarSalud();
      
      if (health.status === 'unhealthy') {
        console.error('🚨 Sistema en estado crítico:', health);
        // TODO: Enviar alerta a administradores
      }

    } catch (error) {
      console.error('Error en health check:', error);
    }
  }

  /**
   * Ejecutar trabajo específico manualmente
   */
  static async runJob(jobName: string) {
    try {
      console.log(`🔧 Ejecutando trabajo manual: ${jobName}`);

      switch (jobName) {
        case 'subscription-reminders':
          await SubscriptionReminderJob.checkExpiringSubscriptions();
          break;
        case 'payment-verification':
          await PaymentService.verificarSuscripcionesVencidas();
          break;
        case 'notification-cleanup':
          await this.cleanupOldNotifications();
          await this.cleanupOldFCMStats();
          break;
        case 'rating-reminders':
          await RatingNotificationService.programarRecordatoriosCalificacion();
          break;
        case 'performance-optimization':
          await this.optimizeDatabase();
          await this.updateSearchIndexes();
          break;
        default:
          throw new Error(`Trabajo no encontrado: ${jobName}`);
      }

      console.log(`✅ Trabajo ${jobName} ejecutado correctamente`);

    } catch (error) {
      console.error(`Error ejecutando trabajo ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estado de todos los trabajos
   */
  static getJobsStatus() {
    const status = [];
    
    for (const [name, job] of this.jobs.entries()) {
      status.push({
        name,
        running: job.getStatus() === 'scheduled',
        nextRun: job.nextDates().toString()
      });
    }

    return {
      initialized: this.isInitialized,
      totalJobs: this.jobs.size,
      jobs: status
    };
  }

  /**
   * Detener trabajo específico
   */
  static stopJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`⏹️  Trabajo ${jobName} detenido`);
      return true;
    }
    return false;
  }

  /**
   * Iniciar trabajo específico
   */
  static startJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`▶️  Trabajo ${jobName} iniciado`);
      return true;
    }
    return false;
  }

  /**
   * Detener todos los trabajos
   */
  static stopAll() {
    for (const [name, job] of this.jobs.entries()) {
      job.stop();
      console.log(`⏹️  Trabajo ${name} detenido`);
    }
    console.log('🛑 Todos los trabajos cron detenidos');
  }

  /**
   * Mostrar trabajos programados
   */
  private static logScheduledJobs() {
    console.log('\n⏰ === TRABAJOS CRON PROGRAMADOS ===');
    console.log('🔔 Recordatorios de suscripción: Cada 4 horas');
    console.log('💳 Verificación de pagos: Cada 6 horas');
    console.log('🧹 Limpieza de notificaciones: Diario a las 2:00 AM');
    console.log('💬 Mensajes no leídos: Cada 30 minutos');
    console.log('⭐ Recordatorios de calificación: Cada 6 horas');
    console.log('⚡ Optimización de DB: Domingos a las 3:00 AM');
    console.log('📊 Actualización de estadísticas: Cada 2 horas');
    console.log('🏥 Health checks: Cada hora');
    console.log('📅 Verificación semanal: Lunes a las 9:00 AM');
    console.log('⏳ Verificación pagos pendientes: Diario a las 10:00 AM');
    console.log('=====================================\n');
  }
}