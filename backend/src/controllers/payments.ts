import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '@/services/PaymentService';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { query } from '@/config/database';

export const crearPreferenciaPago = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { plan_id } = req.body;
  const userId = req.user!.id;

  try {
    // Validar plan
    const planesValidos = ['basico', 'profesional', 'premium', 'anual'];
    if (!planesValidos.includes(plan_id)) {
      throw createError('Plan de suscripción inválido', 400);
    }

    // Verificar que el usuario no tenga ya una suscripción activa
    const suscripcionActual = await query(`
      SELECT pa.suscripcion_activa, s.plan_id, s.fecha_vencimiento
      FROM perfiles_ases pa
      LEFT JOIN suscripciones s ON pa.suscripcion_id = s.id
      WHERE pa.usuario_id = $1
    `, [userId]);

    if (suscripcionActual.rows.length > 0 && suscripcionActual.rows[0].suscripcion_activa) {
      const suscripcion = suscripcionActual.rows[0];
      return res.status(400).json({
        error: 'Ya tienes una suscripción activa',
        code: 'SUBSCRIPTION_EXISTS',
        current_plan: suscripcion.plan_id,
        expires_at: suscripcion.fecha_vencimiento
      });
    }

    // Crear preferencia de pago
    const preference = await PaymentService.crearPreferenciaPago(userId, plan_id);

    res.json({
      success: true,
      message: 'Preferencia de pago creada exitosamente',
      data: {
        preference_id: preference.id,
        init_point: preference.init_point,
        plan_id
      }
    });

  } catch (error) {
    throw error;
  }
});

export const webhookMercadoPago = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📦 Webhook MercadoPago recibido:', req.body);

    const { id, topic, type } = req.body;

    // Validar que sea un webhook de pago
    if (topic !== 'payment' && type !== 'payment') {
      return res.status(200).json({ received: true, ignored: true });
    }

    if (!id) {
      return res.status(400).json({ error: 'Payment ID no proporcionado' });
    }

    // Procesar el pago
    const result = await PaymentService.procesarWebhookMercadoPago(id, 'approved'); // TODO: obtener status real
    
    res.status(200).json({
      received: true,
      processed: result.processed,
      payment_id: id
    });

  } catch (error) {
    console.error('Error en webhook MercadoPago:', error);
    // Siempre responder 200 para que MercadoPago no reintente
    res.status(200).json({ 
      received: true, 
      error: 'Error interno procesando webhook' 
    });
  }
});

export const obtenerEstadoPago = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { payment_id } = req.params;
  const userId = req.user!.id;

  try {
    // Buscar el pago y verificar ownership
    const result = await query(`
      SELECT 
        p.*,
        s.plan_id,
        pa.usuario_id
      FROM pagos p
      INNER JOIN suscripciones s ON p.suscripcion_id = s.id
      INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
      WHERE p.mercadopago_payment_id = $1
    `, [payment_id]);

    if (result.rows.length === 0) {
      throw createError('Pago no encontrado', 404);
    }

    const pago = result.rows[0];

    // Verificar que el pago pertenezca al usuario
    if (pago.usuario_id !== userId) {
      throw createError('No tienes permisos para ver este pago', 403);
    }

    res.json({
      success: true,
      data: {
        payment_id: pago.mercadopago_payment_id,
        status: pago.estado,
        amount: pago.monto,
        currency: pago.moneda,
        plan_id: pago.plan_id,
        payment_date: pago.fecha_pago,
        payment_method: pago.metodo_pago
      }
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerHistorialPagos = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { limite = 20, pagina = 1 } = req.query;

  try {
    const historial = await PaymentService.obtenerHistorialPagos(userId);

    // Paginación simple
    const offset = (Number(pagina) - 1) * Number(limite);
    const paginatedHistorial = historial.slice(offset, offset + Number(limite));

    res.json({
      success: true,
      data: {
        payments: paginatedHistorial.map(pago => ({
          id: pago.mercadopago_payment_id,
          status: pago.estado,
          amount: pago.monto,
          currency: pago.moneda,
          plan_id: pago.plan_id,
          payment_date: pago.fecha_pago,
          payment_method: pago.metodo_pago,
          subscription_expires: pago.fecha_vencimiento
        })),
        total: historial.length,
        page: Number(pagina),
        limit: Number(limite),
        total_pages: Math.ceil(historial.length / Number(limite))
      }
    });

  } catch (error) {
    throw error;
  }
});

export const cancelarSuscripcion = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { motivo } = req.body;

  try {
    // Obtener suscripción actual
    const suscripcionResult = await query(`
      SELECT 
        pa.suscripcion_id,
        pa.suscripcion_activa,
        s.plan_id,
        s.fecha_vencimiento,
        s.auto_renovacion
      FROM perfiles_ases pa
      INNER JOIN suscripciones s ON pa.suscripcion_id = s.id
      WHERE pa.usuario_id = $1 AND pa.suscripcion_activa = true
    `, [userId]);

    if (suscripcionResult.rows.length === 0) {
      throw createError('No tienes una suscripción activa para cancelar', 400);
    }

    const suscripcion = suscripcionResult.rows[0];

    // Actualizar suscripción para que no se renueve automáticamente
    await query(`
      UPDATE suscripciones 
      SET 
        auto_renovacion = false,
        estado = 'cancelada',
        updated_at = NOW()
      WHERE id = $1
    `, [suscripcion.suscripcion_id]);

    // Desactivar inmediatamente la suscripción en el perfil
    await query(`
      UPDATE perfiles_ases 
      SET 
        suscripcion_activa = false,
        updated_at = NOW()
      WHERE usuario_id = $1
    `, [userId]);

    // Registrar motivo de cancelación
    if (motivo) {
      await query(`
        INSERT INTO logs_suscripciones (
          suscripcion_id, accion, detalles, created_at
        ) VALUES ($1, 'cancelacion', $2, NOW())
      `, [suscripcion.suscripcion_id, JSON.stringify({ motivo })]);
    }

    res.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      data: {
        cancelled_plan: suscripcion.plan_id,
        cancelled_at: new Date().toISOString(),
        refund_eligible: false // TODO: lógica de reembolsos
      }
    });

  } catch (error) {
    throw error;
  }
});

export const reactivarSuscripcion = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { plan_id } = req.body;

  try {
    // Verificar que no tenga suscripción activa
    const suscripcionActual = await query(`
      SELECT suscripcion_activa FROM perfiles_ases WHERE usuario_id = $1
    `, [userId]);

    if (suscripcionActual.rows.length > 0 && suscripcionActual.rows[0].suscripcion_activa) {
      throw createError('Ya tienes una suscripción activa', 400);
    }

    // Crear nueva preferencia de pago
    const preference = await PaymentService.crearPreferenciaPago(userId, plan_id);

    res.json({
      success: true,
      message: 'Reactivación de suscripción iniciada',
      data: {
        preference_id: preference.id,
        init_point: preference.init_point,
        plan_id
      }
    });

  } catch (error) {
    throw error;
  }
});

export const obtenerEstadisticasPagos = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Solo para admins - TODO: implementar middleware de admin
    const stats = await PaymentService.obtenerEstadisticasPagos();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    throw error;
  }
});

export const procesarPagoManual = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { payment_id, status } = req.body;
  
  try {
    // Solo para admins - TODO: implementar verificación de admin
    const result = await PaymentService.procesarWebhookMercadoPago(payment_id, status);

    res.json({
      success: true,
      message: 'Pago procesado manualmente',
      data: result
    });

  } catch (error) {
    throw error;
  }
});

export const verificarSuscripcion = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  try {
    // Obtener estado actual de la suscripción
    const result = await query(`
      SELECT 
        pa.suscripcion_activa,
        pa.plan_actual,
        pa.fecha_vencimiento_suscripcion,
        s.estado as suscripcion_estado,
        s.auto_renovacion,
        s.precio_mensual
      FROM perfiles_ases pa
      LEFT JOIN suscripciones s ON pa.suscripcion_id = s.id
      WHERE pa.usuario_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          has_subscription: false,
          message: 'No tienes un perfil de As'
        }
      });
    }

    const suscripcion = result.rows[0];

    // Verificar si la suscripción está vencida
    const isExpired = suscripcion.fecha_vencimiento_suscripcion && 
                     new Date() > new Date(suscripcion.fecha_vencimiento_suscripcion);

    res.json({
      success: true,
      data: {
        has_subscription: suscripcion.suscripcion_activa && !isExpired,
        plan: suscripcion.plan_actual || 'basico',
        status: suscripcion.suscripcion_estado,
        expires_at: suscripcion.fecha_vencimiento_suscripcion,
        auto_renewal: suscripcion.auto_renovacion,
        monthly_price: suscripcion.precio_mensual,
        is_expired: isExpired
      }
    });

  } catch (error) {
    throw error;
  }
});