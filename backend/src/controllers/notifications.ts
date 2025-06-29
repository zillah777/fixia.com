import { Request, Response } from 'express';
import { NotificationService } from '@/services/NotificationService';
import { FCMService } from '@/services/FCMService';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

/**
 * Obtener notificaciones del usuario
 */
export const obtenerNotificaciones = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limite = parseInt(req.query.limite as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const notificaciones = await NotificationService.obtenerNotificaciones(
      userId, 
      limite, 
      offset
    );

    res.json({
      success: true,
      data: notificaciones,
      pagination: {
        limite,
        offset,
        total: notificaciones.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener notificaciones'
    });
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { notification_id } = req.params;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        error: 'ID de notificación requerido'
      });
    }

    const notificacion = await NotificationService.marcarComoLeida(
      notification_id, 
      userId
    );

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      data: notificacion
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar notificación'
    });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const resultado = await NotificationService.marcarTodasComoLeidas(userId);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: resultado
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar notificaciones'
    });
  }
};

/**
 * Contar notificaciones no leídas
 */
export const contarNoLeidas = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const count = await NotificationService.contarNoLeidas(userId);

    res.json({
      success: true,
      data: {
        unread_count: count
      }
    });

  } catch (error) {
    console.error('Error contando notificaciones no leídas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al contar notificaciones'
    });
  }
};

/**
 * Eliminar notificación
 */
export const eliminarNotificacion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { notification_id } = req.params;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        error: 'ID de notificación requerido'
      });
    }

    const notificacion = await NotificationService.eliminarNotificacion(
      notification_id, 
      userId
    );

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar notificación'
    });
  }
};

/**
 * Registrar token FCM para push notifications
 */
export const registrarTokenFCM = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({
        success: false,
        error: 'Token FCM requerido'
      });
    }

    // Validar formato básico del token
    if (typeof fcm_token !== 'string' || fcm_token.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Token FCM inválido'
      });
    }

    const resultado = await NotificationService.registrarFCMToken(userId, fcm_token);

    res.json({
      success: true,
      message: 'Token FCM registrado correctamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error registrando token FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar token de notificaciones'
    });
  }
};

/**
 * Eliminar token FCM
 */
export const eliminarTokenFCM = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const resultado = await NotificationService.eliminarFCMToken(userId);

    res.json({
      success: true,
      message: 'Token FCM eliminado correctamente',
      data: resultado
    });

  } catch (error) {
    console.error('Error eliminando token FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar token de notificaciones'
    });
  }
};

/**
 * Obtener estadísticas de FCM (para administradores)
 */
export const obtenerEstadisticasFCM = async (req: Request, res: Response) => {
  try {
    const stats = await FCMService.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
};

/**
 * Enviar notificación de prueba (desarrollo)
 */
export const enviarNotificacionPrueba = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'No disponible en producción'
      });
    }

    const userId = req.user!.id;
    const { title, body, type = 'sistema' } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Título y mensaje son requeridos'
      });
    }

    // Crear notificación de prueba
    const notificacion = await NotificationService.crearNotificacion({
      usuario_id: userId,
      tipo: type,
      titulo: `🧪 [PRUEBA] ${title}`,
      mensaje: body,
      datos_extra: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Notificación de prueba enviada',
      data: notificacion
    });

  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación de prueba'
    });
  }
};

/**
 * Obtener estado del servicio FCM
 */
export const obtenerEstadoFCM = async (req: Request, res: Response) => {
  try {
    const status = FCMService.getStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error obteniendo estado FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado del servicio'
    });
  }
};

/**
 * Enviar notificación masiva (solo administradores)
 */
export const enviarNotificacionMasiva = async (req: Request, res: Response) => {
  try {
    const { title, body, user_type, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Título y mensaje son requeridos'
      });
    }

    const notification = {
      title,
      body,
      data: data || {},
      icon: '/icons/broadcast-icon.png'
    };

    const result = await FCMService.sendBroadcast(notification, user_type);

    res.json({
      success: true,
      message: 'Notificación masiva enviada',
      data: result
    });

  } catch (error) {
    console.error('Error enviando notificación masiva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación masiva'
    });
  }
};