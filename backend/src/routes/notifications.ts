import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { sanitizeInput, validateUUIDParam } from '@/middleware/validation';
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  contarNoLeidas,
  eliminarNotificacion,
  registrarTokenFCM,
  eliminarTokenFCM,
  obtenerEstadisticasFCM,
  enviarNotificacionPrueba,
  obtenerEstadoFCM,
  enviarNotificacionMasiva
} from '@/controllers/notifications';

const router = Router();

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

// Rate limiters específicos
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,
  message: 'Demasiadas solicitudes de notificaciones'
});

const fcmLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  maxRequests: 10,
  message: 'Demasiados registros de token FCM'
});

const broadcastLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 5,
  message: 'Demasiadas notificaciones masivas'
});

// Middleware de autenticación para todas las rutas
router.use(authenticate);

// ========== RUTAS DE NOTIFICACIONES ==========

/**
 * GET /api/notifications
 * Obtener notificaciones del usuario
 */
router.get('/', 
  generalLimiter,
  obtenerNotificaciones
);

/**
 * GET /api/notifications/unread-count
 * Contar notificaciones no leídas
 */
router.get('/unread-count',
  generalLimiter,
  contarNoLeidas
);

/**
 * PUT /api/notifications/:notification_id/read
 * Marcar notificación específica como leída
 */
router.put('/:notification_id/read',
  validateUUIDParam('notification_id'),
  generalLimiter,
  marcarComoLeida
);

/**
 * PUT /api/notifications/mark-all-read
 * Marcar todas las notificaciones como leídas
 */
router.put('/mark-all-read',
  generalLimiter,
  marcarTodasComoLeidas
);

/**
 * DELETE /api/notifications/:notification_id
 * Eliminar notificación específica
 */
router.delete('/:notification_id',
  validateUUIDParam('notification_id'),
  generalLimiter,
  eliminarNotificacion
);

// ========== RUTAS DE FCM (PUSH NOTIFICATIONS) ==========

/**
 * POST /api/notifications/fcm/register
 * Registrar token FCM para push notifications
 */
router.post('/fcm/register',
  fcmLimiter,
  registrarTokenFCM
);

/**
 * DELETE /api/notifications/fcm/unregister
 * Eliminar token FCM
 */
router.delete('/fcm/unregister',
  fcmLimiter,
  eliminarTokenFCM
);

/**
 * GET /api/notifications/fcm/status
 * Obtener estado del servicio FCM
 */
router.get('/fcm/status',
  obtenerEstadoFCM
);

// ========== RUTAS DE ADMINISTRACIÓN ==========

/**
 * GET /api/notifications/admin/stats
 * Obtener estadísticas de FCM (solo administradores)
 * TODO: Agregar middleware de admin cuando esté implementado
 */
router.get('/admin/stats',
  // authorize('admin'), // TODO: Implementar rol de admin
  obtenerEstadisticasFCM
);

/**
 * POST /api/notifications/admin/broadcast
 * Enviar notificación masiva (solo administradores)
 * TODO: Agregar middleware de admin cuando esté implementado
 */
router.post('/admin/broadcast',
  // authorize('admin'), // TODO: Implementar rol de admin
  broadcastLimiter,
  enviarNotificacionMasiva
);

// ========== RUTAS DE DESARROLLO ==========

if (process.env.NODE_ENV === 'development') {
  /**
   * POST /api/notifications/test
   * Enviar notificación de prueba (solo en desarrollo)
   */
  router.post('/test',
    generalLimiter,
    enviarNotificacionPrueba
  );

  /**
   * GET /api/notifications/dev/info
   * Información de desarrollo sobre notificaciones
   */
  router.get('/dev/info', (req, res) => {
    res.json({
      message: 'Endpoints de notificaciones para desarrollo',
      fcm_configured: process.env.FIREBASE_PROJECT_ID ? true : false,
      available_endpoints: [
        'GET /api/notifications - Obtener notificaciones',
        'GET /api/notifications/unread-count - Contar no leídas',
        'PUT /api/notifications/:id/read - Marcar como leída',
        'PUT /api/notifications/mark-all-read - Marcar todas como leídas',
        'DELETE /api/notifications/:id - Eliminar notificación',
        'POST /api/notifications/fcm/register - Registrar token FCM',
        'DELETE /api/notifications/fcm/unregister - Eliminar token FCM',
        'GET /api/notifications/fcm/status - Estado FCM',
        'POST /api/notifications/test - Notificación de prueba',
        'GET /api/notifications/admin/stats - Estadísticas (admin)',
        'POST /api/notifications/admin/broadcast - Notificación masiva (admin)'
      ],
      example_requests: {
        register_fcm: {
          method: 'POST',
          url: '/api/notifications/fcm/register',
          body: {
            fcm_token: 'your_firebase_token_here'
          }
        },
        test_notification: {
          method: 'POST',
          url: '/api/notifications/test',
          body: {
            title: 'Prueba',
            body: 'Esta es una notificación de prueba',
            type: 'sistema'
          }
        },
        broadcast: {
          method: 'POST',
          url: '/api/notifications/admin/broadcast',
          body: {
            title: 'Mantenimiento programado',
            body: 'El sistema estará en mantenimiento el día...',
            user_type: 'as', // o 'explorador' o sin especificar para todos
            data: {
              maintenance_id: '123',
              start_time: '2024-01-01T10:00:00Z'
            }
          }
        }
      }
    });
  });
}

export default router;