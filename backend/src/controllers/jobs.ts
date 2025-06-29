import { Request, Response } from 'express';
import { JobScheduler } from '@/jobs/JobScheduler';
import { SubscriptionReminderJob } from '@/jobs/subscriptionReminder';
import { AuthRequest } from '@/middleware/auth';

/**
 * Obtener estado de todos los trabajos cron
 */
export const obtenerEstadoJobs = async (req: Request, res: Response) => {
  try {
    const status = JobScheduler.getJobsStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error obteniendo estado de jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado de trabajos'
    });
  }
};

/**
 * Ejecutar trabajo específico manualmente
 */
export const ejecutarJob = async (req: Request, res: Response) => {
  try {
    const { job_name } = req.params;

    if (!job_name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de trabajo requerido'
      });
    }

    // Validar que el trabajo existe
    const validJobs = [
      'subscription-reminders',
      'payment-verification', 
      'notification-cleanup',
      'rating-reminders',
      'performance-optimization'
    ];

    if (!validJobs.includes(job_name)) {
      return res.status(400).json({
        success: false,
        error: 'Trabajo no válido',
        valid_jobs: validJobs
      });
    }

    await JobScheduler.runJob(job_name);

    res.json({
      success: true,
      message: `Trabajo ${job_name} ejecutado correctamente`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error ejecutando job:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error ejecutando trabajo'
    });
  }
};

/**
 * Detener trabajo específico
 */
export const detenerJob = async (req: Request, res: Response) => {
  try {
    const { job_name } = req.params;

    if (!job_name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de trabajo requerido'
      });
    }

    const stopped = JobScheduler.stopJob(job_name);

    if (!stopped) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Trabajo ${job_name} detenido correctamente`
    });

  } catch (error) {
    console.error('Error deteniendo job:', error);
    res.status(500).json({
      success: false,
      error: 'Error al detener trabajo'
    });
  }
};

/**
 * Iniciar trabajo específico
 */
export const iniciarJob = async (req: Request, res: Response) => {
  try {
    const { job_name } = req.params;

    if (!job_name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de trabajo requerido'
      });
    }

    const started = JobScheduler.startJob(job_name);

    if (!started) {
      return res.status(404).json({
        success: false,
        error: 'Trabajo no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Trabajo ${job_name} iniciado correctamente`
    });

  } catch (error) {
    console.error('Error iniciando job:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar trabajo'
    });
  }
};

/**
 * Verificar suscripciones por vencer para plan específico
 */
export const verificarSuscripcionesPlan = async (req: Request, res: Response) => {
  try {
    const { plan_id } = req.params;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        error: 'ID de plan requerido'
      });
    }

    const estadisticas = await SubscriptionReminderJob.checkSubscriptionsByPlan(plan_id);

    res.json({
      success: true,
      data: {
        plan_id,
        estadisticas,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error verificando suscripciones por plan:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar suscripciones'
    });
  }
};

/**
 * Enviar recordatorio personalizado a usuario
 */
export const enviarRecordatorioPersonalizado = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario y mensaje son requeridos'
      });
    }

    if (message.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no puede exceder 200 caracteres'
      });
    }

    const sent = await SubscriptionReminderJob.sendCustomReminder(user_id, message);

    if (!sent) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado o sin suscripción activa'
      });
    }

    res.json({
      success: true,
      message: 'Recordatorio personalizado enviado correctamente',
      user_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error enviando recordatorio personalizado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar recordatorio'
    });
  }
};

/**
 * Obtener estadísticas de recordatorios
 */
export const obtenerEstadisticasRecordatorios = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        error: 'Los días deben estar entre 1 y 365'
      });
    }

    const stats = await SubscriptionReminderJob.getReminderStats(days);

    // Procesar estadísticas para mejor visualización
    const processed = {
      total_recordatorios: stats.reduce((sum, stat) => sum + parseInt(stat.total_enviados), 0),
      usuarios_unicos: new Set(stats.map(stat => stat.usuarios_unicos)).size,
      por_tipo: {} as Record<string, any>,
      por_fecha: {} as Record<string, any>
    };

    // Agrupar por tipo
    for (const stat of stats) {
      const tipo = stat.tipo_recordatorio;
      if (!processed.por_tipo[tipo]) {
        processed.por_tipo[tipo] = {
          total: 0,
          usuarios_unicos: 0
        };
      }
      processed.por_tipo[tipo].total += parseInt(stat.total_enviados);
      processed.por_tipo[tipo].usuarios_unicos += parseInt(stat.usuarios_unicos);
    }

    // Agrupar por fecha
    for (const stat of stats) {
      const fecha = stat.fecha;
      if (!processed.por_fecha[fecha]) {
        processed.por_fecha[fecha] = {
          total: 0,
          tipos: {} as Record<string, number>
        };
      }
      processed.por_fecha[fecha].total += parseInt(stat.total_enviados);
      processed.por_fecha[fecha].tipos[stat.tipo_recordatorio] = parseInt(stat.total_enviados);
    }

    res.json({
      success: true,
      data: {
        periodo_dias: days,
        estadisticas: processed,
        datos_raw: stats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de recordatorios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
};

/**
 * Obtener trabajos disponibles
 */
export const obtenerJobsDisponibles = async (req: Request, res: Response) => {
  try {
    const jobs = [
      {
        name: 'subscription-reminders',
        description: 'Verificar suscripciones que están por vencer y enviar recordatorios',
        schedule: 'Cada 4 horas',
        category: 'subscriptions'
      },
      {
        name: 'payment-verification',
        description: 'Verificar pagos vencidos y desactivar suscripciones',
        schedule: 'Cada 6 horas',
        category: 'payments'
      },
      {
        name: 'notification-cleanup',
        description: 'Limpiar notificaciones y estadísticas antiguas',
        schedule: 'Diario a las 2:00 AM',
        category: 'maintenance'
      },
      {
        name: 'rating-reminders',
        description: 'Enviar recordatorios para calificar trabajos completados',
        schedule: 'Cada 6 horas',
        category: 'notifications'
      },
      {
        name: 'performance-optimization',
        description: 'Optimizar base de datos y actualizar índices',
        schedule: 'Domingos a las 3:00 AM',
        category: 'maintenance'
      }
    ];

    res.json({
      success: true,
      data: {
        total_jobs: jobs.length,
        jobs,
        categories: ['subscriptions', 'payments', 'notifications', 'maintenance']
      }
    });

  } catch (error) {
    console.error('Error obteniendo jobs disponibles:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener trabajos disponibles'
    });
  }
};