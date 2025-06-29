import { FCMService } from './FCMService';
import { ChatNotificationService } from './ChatNotificationService';
import { RatingNotificationService } from './RatingNotificationService';
import { PaymentService } from './PaymentService';

/**
 * Gestor centralizado de notificaciones
 * Inicializa y coordina todos los servicios de notificaciones
 */
export class NotificationManager {
  private static initialized = false;

  /**
   * Inicializar todos los servicios de notificaciones
   */
  static async initialize() {
    if (this.initialized) {
      console.log('📱 NotificationManager ya inicializado');
      return;
    }

    try {
      console.log('📱 Iniciando NotificationManager...');

      // Inicializar FCM
      await FCMService.initialize();

      // Iniciar servicios periódicos
      this.iniciarServiciosPeriodicos();

      this.initialized = true;
      console.log('✅ NotificationManager inicializado correctamente');

      // Mostrar estado de configuración
      this.mostrarEstadoConfiguracion();

    } catch (error) {
      console.error('❌ Error inicializando NotificationManager:', error);
      throw error;
    }
  }

  /**
   * Iniciar servicios periódicos
   */
  private static iniciarServiciosPeriodicos() {
    try {
      // Verificación de mensajes no leídos cada 30 minutos
      ChatNotificationService.iniciarVerificacionPeriodica();

      // Recordatorios de calificación cada 6 horas
      RatingNotificationService.iniciarVerificacionPeriodica();

      // Verificación de suscripciones vencidas cada 24 horas
      this.iniciarVerificacionSuscripciones();

      console.log('⏰ Servicios periódicos iniciados');

    } catch (error) {
      console.error('Error iniciando servicios periódicos:', error);
    }
  }

  /**
   * Iniciar verificación periódica de suscripciones
   */
  private static iniciarVerificacionSuscripciones() {
    // Ejecutar cada 24 horas
    setInterval(() => {
      PaymentService.verificarSuscripcionesVencidas().catch(error => {
        console.error('Error en verificación periódica de suscripciones:', error);
      });
    }, 24 * 60 * 60 * 1000);

    console.log('📅 Verificación periódica de suscripciones iniciada (cada 24 horas)');
  }

  /**
   * Mostrar estado de configuración
   */
  private static mostrarEstadoConfiguracion() {
    const fcmStatus = FCMService.getStatus();
    
    console.log('\n📱 === ESTADO DE NOTIFICACIONES ===');
    console.log(`🔧 FCM Configurado: ${fcmStatus.configured ? '✅' : '❌'}`);
    console.log(`🚀 FCM Inicializado: ${fcmStatus.initialized ? '✅' : '❌'}`);
    
    if (fcmStatus.configured) {
      console.log(`📂 Proyecto Firebase: ${fcmStatus.project_id}`);
    } else {
      console.log('⚠️  Variables de entorno FCM faltantes:');
      console.log('   - FIREBASE_PROJECT_ID');
      console.log('   - FIREBASE_PRIVATE_KEY');
      console.log('   - FIREBASE_CLIENT_EMAIL');
    }
    
    console.log('🔄 Servicios periódicos: ✅');
    console.log('📬 Chat notifications: ✅');
    console.log('⭐ Rating notifications: ✅');
    console.log('💳 Payment notifications: ✅');
    console.log('=====================================\n');
  }

  /**
   * Obtener estadísticas generales de notificaciones
   */
  static async obtenerEstadisticasGenerales() {
    try {
      const fcmStats = await FCMService.getStats();
      const fcmStatus = FCMService.getStatus();

      return {
        fcm: {
          ...fcmStatus,
          stats: fcmStats
        },
        services: {
          initialized: this.initialized,
          periodic_services_active: true
        }
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Enviar notificación de prueba del sistema
   */
  static async enviarNotificacionPruebaSistema(userId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Notificaciones de prueba no disponibles en producción');
    }

    try {
      const testNotification = {
        title: '🧪 Prueba del sistema',
        body: 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
        icon: '/icons/test-icon.png',
        data: {
          type: 'system_test',
          timestamp: new Date().toISOString(),
          test_id: Math.random().toString(36).substr(2, 9)
        }
      };

      const result = await FCMService.sendToUser(userId, testNotification);

      return {
        success: true,
        message: 'Notificación de prueba enviada',
        result
      };

    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      throw error;
    }
  }

  /**
   * Verificar salud del sistema de notificaciones
   */
  static async verificarSalud() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          notification_manager: this.initialized,
          fcm_service: FCMService.isConfigured(),
          fcm_initialized: FCMService.getStatus().initialized
        },
        issues: [] as string[]
      };

      // Verificar posibles problemas
      if (!FCMService.isConfigured()) {
        health.issues.push('FCM no está configurado (faltan variables de entorno)');
      }

      if (!FCMService.getStatus().initialized) {
        health.issues.push('FCM no está inicializado');
      }

      if (!this.initialized) {
        health.issues.push('NotificationManager no está inicializado');
      }

      // Determinar estado general
      if (health.issues.length > 0) {
        health.status = health.issues.length > 2 ? 'unhealthy' : 'degraded';
      }

      return health;

    } catch (error) {
      console.error('Error verificando salud del sistema:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Limpiar recursos y detener servicios
   */
  static async shutdown() {
    try {
      console.log('📱 Cerrando NotificationManager...');

      // TODO: Detener intervalos si los guardamos en variables
      // clearInterval(chatInterval);
      // clearInterval(ratingInterval);
      // clearInterval(subscriptionInterval);

      this.initialized = false;
      console.log('✅ NotificationManager cerrado correctamente');

    } catch (error) {
      console.error('Error cerrando NotificationManager:', error);
    }
  }

  /**
   * Verificar si está inicializado
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}