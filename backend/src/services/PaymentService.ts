import { query } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { NotificationService } from './NotificationService';
import { FCMService } from './FCMService';
import { getCache, setCache } from '@/config/redis';

interface MercadoPagoPayment {
  id: string;
  status: string;
  transaction_amount: number;
  currency_id: string;
  date_approved: string;
  payment_method_id: string;
  payer: {
    email: string;
    id: string;
  };
  metadata: {
    usuario_id: string;
    plan_id: string;
  };
}

interface PaymentInfo {
  transaction_amount: number;
  currency_id: string;
  date_approved: string;
  payment_method_id: string;
  payer_email: string;
  payer_id: string;
  plan_id: string;
}

export class PaymentService {
  /**
   * Procesar webhook de MercadoPago
   */
  static async procesarWebhookMercadoPago(paymentId: string, status: string) {
    try {
      console.log(`📦 Procesando webhook MercadoPago: ${paymentId} - ${status}`);

      // Verificar si ya procesamos este pago
      const existingPayment = await query(`
        SELECT id FROM pagos WHERE mercadopago_payment_id = $1
      `, [paymentId]);

      if (existingPayment.rows.length > 0) {
        console.log(`⚠️  Pago ${paymentId} ya fue procesado`);
        return { processed: false, reason: 'already_processed' };
      }

      // Obtener información del pago desde MercadoPago
      const paymentInfo = await this.obtenerInfoPagoMercadoPago(paymentId);
      
      if (!paymentInfo) {
        throw createError('No se pudo obtener información del pago', 400);
      }

      // Procesar según el estado del pago
      switch (status.toLowerCase()) {
        case 'approved':
          await this.procesarPagoAprobado(paymentId, paymentInfo);
          break;
        case 'rejected':
          await this.procesarPagoRechazado(paymentId, paymentInfo);
          break;
        case 'pending':
          await this.procesarPagoPendiente(paymentId, paymentInfo);
          break;
        case 'cancelled':
          await this.procesarPagoCancelado(paymentId, paymentInfo);
          break;
        default:
          console.log(`⚠️  Estado de pago desconocido: ${status}`);
      }

      return { processed: true, status };

    } catch (error) {
      console.error('Error procesando webhook MercadoPago:', error);
      throw error;
    }
  }

  /**
   * Procesar pago aprobado
   */
  private static async procesarPagoAprobado(paymentId: string, paymentInfo: PaymentInfo) {
    try {
      console.log(`✅ Procesando pago aprobado: ${paymentId}`);

      // Buscar usuario por email del pagador
      const userResult = await query(`
        SELECT id, tipo_usuario FROM usuarios WHERE email = $1
      `, [paymentInfo.payer_email]);

      if (userResult.rows.length === 0) {
        throw createError('Usuario no encontrado para el email del pagador', 404);
      }

      const user = userResult.rows[0];

      // Verificar que el usuario sea As o ambos
      if (user.tipo_usuario === 'explorador') {
        throw createError('Los Exploradores no necesitan suscripción', 400);
      }

      // Obtener perfil del As
      const asResult = await query(`
        SELECT id FROM perfiles_ases WHERE usuario_id = $1
      `, [user.id]);

      if (asResult.rows.length === 0) {
        throw createError('Perfil de As no encontrado', 404);
      }

      const asId = asResult.rows[0].id;

      // Activar suscripción
      await this.activarSuscripcion(asId, user.id, paymentInfo);
      
      // Registrar pago
      const suscripcionId = await this.obtenerSuscripcionId(asId);
      
      await query(`
        INSERT INTO pagos (
          suscripcion_id, mercadopago_payment_id, estado, monto, moneda,
          fecha_pago, metodo_pago, datos_pago
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        suscripcionId,
        paymentId,
        'aprobado',
        paymentInfo.transaction_amount,
        paymentInfo.currency_id,
        new Date(paymentInfo.date_approved),
        paymentInfo.payment_method_id,
        JSON.stringify({
          payer_email: paymentInfo.payer_email,
          payer_id: paymentInfo.payer_id
        })
      ]);
      
      // Notificar al usuario
      await NotificationService.crearNotificacion({
        usuario_id: user.id,
        tipo: 'pago',
        titulo: '✅ ¡Suscripción activada!',
        mensaje: `Tu plan ${paymentInfo.plan_id} está activo. Ya podés publicar servicios y recibir notificaciones de trabajos.`,
        datos_extra: {
          payment_id: paymentId,
          plan_id: paymentInfo.plan_id,
          amount: paymentInfo.transaction_amount
        }
      });

      // Enviar push notification específica para pago aprobado
      await FCMService.sendPaymentNotification(user.id, {
        id: paymentId,
        status: 'approved',
        plan_id: paymentInfo.plan_id,
        amount: paymentInfo.transaction_amount
      });

      // Limpiar cache de suscripción
      await this.limpiarCacheSuscripcion(user.id);

      console.log(`✅ Suscripción activada para usuario ${user.id} - Plan: ${paymentInfo.plan_id}`);

    } catch (error) {
      console.error('Error procesando pago aprobado:', error);
      throw error;
    }
  }

  /**
   * Procesar pago rechazado
   */
  private static async procesarPagoRechazado(paymentId: string, paymentInfo: PaymentInfo) {
    try {
      console.log(`❌ Procesando pago rechazado: ${paymentId}`);

      // Buscar usuario
      const userResult = await query(`
        SELECT id FROM usuarios WHERE email = $1
      `, [paymentInfo.payer_email]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        // Registrar pago rechazado
        await query(`
          INSERT INTO pagos (
            mercadopago_payment_id, estado, monto, moneda,
            metodo_pago, datos_pago, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
          paymentId,
          'rechazado',
          paymentInfo.transaction_amount,
          paymentInfo.currency_id,
          paymentInfo.payment_method_id,
          JSON.stringify({
            payer_email: paymentInfo.payer_email,
            rejection_reason: 'payment_rejected'
          })
        ]);

        // Notificar al usuario
        await NotificationService.crearNotificacion({
          usuario_id: user.id,
          tipo: 'pago',
          titulo: '❌ Pago rechazado',
          mensaje: 'Tu pago fue rechazado. Revisá los datos de tu tarjeta e intentá nuevamente.',
          datos_extra: {
            payment_id: paymentId,
            amount: paymentInfo.transaction_amount,
            retry_url: '/suscripciones/payment'
          }
        });

        // Enviar push notification para pago rechazado
        await FCMService.sendPaymentNotification(user.id, {
          id: paymentId,
          status: 'rejected',
          amount: paymentInfo.transaction_amount
        });
      }

    } catch (error) {
      console.error('Error procesando pago rechazado:', error);
    }
  }

  /**
   * Procesar pago pendiente
   */
  private static async procesarPagoPendiente(paymentId: string, paymentInfo: PaymentInfo) {
    try {
      console.log(`⏳ Procesando pago pendiente: ${paymentId}`);

      // Buscar usuario
      const userResult = await query(`
        SELECT id FROM usuarios WHERE email = $1
      `, [paymentInfo.payer_email]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        // Registrar pago pendiente
        await query(`
          INSERT INTO pagos (
            mercadopago_payment_id, estado, monto, moneda,
            metodo_pago, datos_pago, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (mercadopago_payment_id) 
          DO UPDATE SET estado = $2, updated_at = NOW()
        `, [
          paymentId,
          'pendiente',
          paymentInfo.transaction_amount,
          paymentInfo.currency_id,
          paymentInfo.payment_method_id,
          JSON.stringify({
            payer_email: paymentInfo.payer_email,
            status: 'pending'
          })
        ]);

        // Notificar al usuario
        await NotificationService.crearNotificacion({
          usuario_id: user.id,
          tipo: 'pago',
          titulo: '⏳ Pago en proceso',
          mensaje: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          datos_extra: {
            payment_id: paymentId,
            amount: paymentInfo.transaction_amount
          }
        });

        // Enviar push notification para pago pendiente
        await FCMService.sendPaymentNotification(user.id, {
          id: paymentId,
          status: 'pending',
          amount: paymentInfo.transaction_amount
        });
      }

    } catch (error) {
      console.error('Error procesando pago pendiente:', error);
    }
  }

  /**
   * Procesar pago cancelado
   */
  private static async procesarPagoCancelado(paymentId: string, paymentInfo: PaymentInfo) {
    try {
      console.log(`🚫 Procesando pago cancelado: ${paymentId}`);

      // Actualizar estado del pago si existe
      await query(`
        UPDATE pagos 
        SET estado = 'cancelado', updated_at = NOW()
        WHERE mercadopago_payment_id = $1
      `, [paymentId]);

    } catch (error) {
      console.error('Error procesando pago cancelado:', error);
    }
  }

  /**
   * Activar suscripción para un As
   */
  private static async activarSuscripcion(asId: string, userId: string, paymentInfo: PaymentInfo) {
    try {
      const fechaVencimiento = new Date();
      
      // Calcular fecha de vencimiento según el plan
      switch (paymentInfo.plan_id) {
        case 'profesional':
        case 'premium':
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          break;
        case 'anual':
          fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
          break;
        default:
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
      }

      // Crear o actualizar suscripción
      const suscripcionResult = await query(`
        INSERT INTO suscripciones (
          plan_id, estado, fecha_inicio, fecha_vencimiento,
          precio_mensual, moneda, metodo_pago
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6)
        RETURNING id
      `, [
        paymentInfo.plan_id,
        'activa',
        fechaVencimiento,
        paymentInfo.transaction_amount,
        paymentInfo.currency_id,
        paymentInfo.payment_method_id
      ]);

      const suscripcionId = suscripcionResult.rows[0].id;

      // Actualizar perfil del As
      await query(`
        UPDATE perfiles_ases 
        SET 
          suscripcion_activa = true,
          suscripcion_id = $1,
          plan_actual = $2,
          fecha_vencimiento_suscripcion = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [suscripcionId, paymentInfo.plan_id, fechaVencimiento, asId]);

      console.log(`✅ Suscripción activada: As ${asId} - Plan ${paymentInfo.plan_id}`);

    } catch (error) {
      console.error('Error activando suscripción:', error);
      throw error;
    }
  }

  /**
   * Obtener ID de suscripción de un As
   */
  private static async obtenerSuscripcionId(asId: string): Promise<string | null> {
    try {
      const result = await query(`
        SELECT suscripcion_id FROM perfiles_ases WHERE id = $1
      `, [asId]);

      return result.rows.length > 0 ? result.rows[0].suscripcion_id : null;

    } catch (error) {
      console.error('Error obteniendo ID de suscripción:', error);
      return null;
    }
  }

  /**
   * Obtener información del pago desde MercadoPago API
   */
  private static async obtenerInfoPagoMercadoPago(paymentId: string): Promise<PaymentInfo | null> {
    try {
      console.log(`🔍 Consultando pago ${paymentId} en MercadoPago API`);

      // Usar el servicio de MercadoPago
      const { MercadoPagoService } = await import('./MercadoPagoService');
      const payment = await MercadoPagoService.obtenerPago(paymentId);

      if (!payment) {
        return null;
      }

      // Convertir respuesta de MercadoPago a nuestro formato
      const paymentInfo: PaymentInfo = {
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_approved: payment.date_approved || new Date().toISOString(),
        payment_method_id: payment.payment_method_id,
        payer_email: payment.payer.email,
        payer_id: payment.payer.id,
        plan_id: payment.metadata?.plan_id || 'profesional'
      };

      return paymentInfo;

    } catch (error) {
      console.error('Error obteniendo info de pago MercadoPago:', error);
      return null;
    }
  }

  /**
   * Crear preferencia de pago en MercadoPago
   */
  static async crearPreferenciaPago(userId: string, planId: string) {
    try {
      console.log(`💳 Creando preferencia de pago: Usuario ${userId} - Plan ${planId}`);

      // Obtener información del usuario
      const userResult = await query(`
        SELECT email, tipo_usuario FROM usuarios WHERE id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        throw createError('Usuario no encontrado', 404);
      }

      const user = userResult.rows[0];

      if (user.tipo_usuario === 'explorador') {
        throw createError('Los Exploradores no necesitan suscripción', 400);
      }

      // Obtener precio del plan
      const precios = {
        basico: 0,
        profesional: 2999,
        premium: 4999,
        anual: 29999
      };

      const precio = precios[planId as keyof typeof precios];
      if (precio === undefined) {
        throw createError('Plan inválido', 400);
      }

      // Preparar datos para MercadoPago
      const externalReference = `subscription_${userId}_${planId}_${Date.now()}`;
      
      const preferenceData = {
        items: [{
          title: `Suscripción Serviplay - Plan ${planId}`,
          quantity: 1,
          unit_price: precio,
          currency_id: 'ARS',
          description: `Suscripción mensual al plan ${planId} de Serviplay`
        }],
        payer: {
          email: user.email
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/suscripcion/success`,
          failure: `${process.env.FRONTEND_URL}/suscripcion/failure`,
          pending: `${process.env.FRONTEND_URL}/suscripcion/pending`
        },
        notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`,
        external_reference: externalReference,
        metadata: {
          usuario_id: userId,
          plan_id: planId,
          tipo: 'suscripcion'
        },
        auto_return: 'approved' as const,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      // Crear preferencia usando MercadoPagoService
      const { MercadoPagoService } = await import('./MercadoPagoService');
      const preference = await MercadoPagoService.crearPreferencia(preferenceData);

      return preference;

    } catch (error) {
      console.error('Error creando preferencia de pago:', error);
      throw error;
    }
  }

  /**
   * Verificar y renovar suscripciones vencidas
   */
  static async verificarSuscripcionesVencidas() {
    try {
      console.log('🔄 Verificando suscripciones vencidas...');

      // Buscar suscripciones vencidas
      const vencidas = await query(`
        SELECT 
          s.id as suscripcion_id,
          s.plan_id,
          s.auto_renovacion,
          pa.id as as_id,
          pa.usuario_id,
          u.email
        FROM suscripciones s
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        INNER JOIN usuarios u ON pa.usuario_id = u.id
        WHERE s.estado = 'activa' 
        AND s.fecha_vencimiento < NOW()
        AND pa.suscripcion_activa = true
      `);

      for (const suscripcion of vencidas.rows) {
        try {
          if (suscripcion.auto_renovacion) {
            // TODO: Intentar renovación automática
            console.log(`🔄 Intentando renovación automática: ${suscripcion.suscripcion_id}`);
          } else {
            // Desactivar suscripción
            await this.desactivarSuscripcion(suscripcion.suscripcion_id, suscripcion.as_id);
            
            // Notificar al usuario
            await NotificationService.crearNotificacion({
              usuario_id: suscripcion.usuario_id,
              tipo: 'sistema',
              titulo: '⚠️ Suscripción expirada',
              mensaje: 'Tu suscripción ha expirado. Renovála para seguir usando todas las funcionalidades.',
              datos_extra: {
                plan_id: suscripcion.plan_id,
                renewal_url: '/suscripciones/renovar'
              }
            });
          }
        } catch (error) {
          console.error(`Error procesando suscripción vencida ${suscripcion.suscripcion_id}:`, error);
        }
      }

      console.log(`✅ Verificación completada: ${vencidas.rows.length} suscripciones vencidas procesadas`);

    } catch (error) {
      console.error('Error verificando suscripciones vencidas:', error);
    }
  }

  /**
   * Desactivar suscripción
   */
  private static async desactivarSuscripcion(suscripcionId: string, asId: string) {
    try {
      // Actualizar estado de suscripción
      await query(`
        UPDATE suscripciones 
        SET estado = 'expirada', updated_at = NOW() 
        WHERE id = $1
      `, [suscripcionId]);

      // Desactivar en perfil de As
      await query(`
        UPDATE perfiles_ases 
        SET suscripcion_activa = false, updated_at = NOW() 
        WHERE id = $1
      `, [asId]);

      console.log(`❌ Suscripción desactivada: ${suscripcionId}`);

    } catch (error) {
      console.error('Error desactivando suscripción:', error);
      throw error;
    }
  }

  /**
   * Limpiar cache de suscripción
   */
  private static async limpiarCacheSuscripcion(userId: string) {
    try {
      const cacheKeys = [
        `subscription:${userId}`,
        `user_limits:${userId}`,
        `plan_features:${userId}`
      ];

      for (const key of cacheKeys) {
        await setCache(key, null, 0);
      }

    } catch (error) {
      console.error('Error limpiando cache de suscripción:', error);
    }
  }

  /**
   * Obtener historial de pagos de un usuario
   */
  static async obtenerHistorialPagos(userId: string) {
    try {
      const result = await query(`
        SELECT 
          p.*,
          s.plan_id,
          s.fecha_vencimiento
        FROM pagos p
        INNER JOIN suscripciones s ON p.suscripcion_id = s.id
        INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
        WHERE pa.usuario_id = $1
        ORDER BY p.created_at DESC
        LIMIT 50
      `, [userId]);

      return result.rows;

    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      throw createError('Error al obtener historial de pagos', 500);
    }
  }

  /**
   * Obtener estadísticas de pagos
   */
  static async obtenerEstadisticasPagos() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_pagos,
          COUNT(*) FILTER (WHERE estado = 'aprobado') as pagos_aprobados,
          COUNT(*) FILTER (WHERE estado = 'rechazado') as pagos_rechazados,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as pagos_pendientes,
          SUM(CASE WHEN estado = 'aprobado' THEN monto ELSE 0 END) as ingresos_totales,
          AVG(CASE WHEN estado = 'aprobado' THEN monto ELSE NULL END) as ticket_promedio
        FROM pagos
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `);

      return result.rows[0];

    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error);
      throw createError('Error al obtener estadísticas', 500);
    }
  }
}