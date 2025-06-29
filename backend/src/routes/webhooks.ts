import { Router, Request, Response } from 'express';
import { PaymentService } from '@/services/PaymentService';
import { MercadoPagoService } from '@/services/MercadoPagoService';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { sanitizeInput } from '@/middleware/validation';
import crypto from 'crypto';

const router = Router();

// Rate limiter específico para webhooks
const webhookLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 200, // Webhooks pueden ser muy frecuentes
  message: 'Demasiados webhooks recibidos'
});

// Middleware para validar webhooks de MercadoPago
const validateMercadoPagoWebhook = (req: Request, res: Response, next: Function) => {
  try {
    // TODO: Implementar validación de firma de MercadoPago
    // const signature = req.headers['x-signature'];
    // const requestId = req.headers['x-request-id'];
    
    // Por ahora, validamos que tenga la estructura básica
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    next();
  } catch (error) {
    console.error('Error validating MercadoPago webhook:', error);
    res.status(400).json({ error: 'Invalid webhook signature' });
  }
};

// Aplicar middlewares comunes
router.use(sanitizeInput);
router.use(webhookLimiter);

// Webhook de MercadoPago
router.post('/mercadopago', validateMercadoPagoWebhook, async (req: Request, res: Response) => {
  try {
    console.log('📦 Webhook MercadoPago recibido:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { type, action, data } = req.body;

    // Validar estructura del webhook
    if (!type || !data) {
      console.log('⚠️  Webhook MercadoPago con estructura inválida');
      return res.status(400).json({ 
        error: 'Invalid webhook structure',
        received: true 
      });
    }

    // Procesar según el tipo de evento
    switch (type) {
      case 'payment':
        await handlePaymentWebhook(data, action);
        break;
        
      case 'subscription':
        await handleSubscriptionWebhook(data, action);
        break;
        
      case 'invoice':
        await handleInvoiceWebhook(data, action);
        break;
        
      default:
        console.log(`📋 Tipo de webhook no manejado: ${type}`);
        break;
    }

    // Siempre responder 200 para que MercadoPago no reintente
    res.status(200).json({ 
      received: true,
      processed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando webhook MercadoPago:', error);
    
    // Responder 200 para evitar reintentos, pero logear el error
    res.status(200).json({ 
      received: true,
      processed: false,
      error: 'Internal processing error',
      timestamp: new Date().toISOString()
    });
  }
});

// Función para manejar webhooks de pagos
async function handlePaymentWebhook(data: any, action: string) {
  try {
    const paymentId = data.id;
    
    if (!paymentId) {
      console.log('⚠️  Webhook de pago sin ID');
      return;
    }

    console.log(`💳 Procesando webhook de pago: ${paymentId} - Acción: ${action}`);

    // Usar MercadoPagoService para procesar el webhook
    await MercadoPagoService.procesarWebhook(paymentId);

  } catch (error) {
    console.error('Error manejando webhook de pago:', error);
    throw error;
  }
}

// Función para manejar webhooks de suscripciones
async function handleSubscriptionWebhook(data: any, action: string) {
  try {
    console.log(`📅 Procesando webhook de suscripción: ${data.id} - Acción: ${action}`);

    // TODO: Implementar manejo de suscripciones recurrentes
    switch (action) {
      case 'subscription.created':
        console.log('Nueva suscripción creada:', data.id);
        break;
      case 'subscription.updated':
        console.log('Suscripción actualizada:', data.id);
        break;
      case 'subscription.cancelled':
        console.log('Suscripción cancelada:', data.id);
        break;
      default:
        console.log(`📋 Acción de suscripción no manejada: ${action}`);
    }

  } catch (error) {
    console.error('Error manejando webhook de suscripción:', error);
    throw error;
  }
}

// Función para manejar webhooks de facturas
async function handleInvoiceWebhook(data: any, action: string) {
  try {
    console.log(`🧾 Procesando webhook de factura: ${data.id} - Acción: ${action}`);

    // TODO: Implementar manejo de facturas
    switch (action) {
      case 'invoice.created':
        console.log('Nueva factura creada:', data.id);
        break;
      case 'invoice.updated':
        console.log('Factura actualizada:', data.id);
        break;
      default:
        console.log(`📋 Acción de factura no manejada: ${action}`);
    }

  } catch (error) {
    console.error('Error manejando webhook de factura:', error);
    throw error;
  }
}

// Función para obtener estado de pago desde MercadoPago API
async function getMercadoPagoPaymentStatus(paymentId: string): Promise<string> {
  try {
    // TODO: Implementar llamada real a MercadoPago API
    console.log(`🔍 Consultando estado de pago ${paymentId} en MercadoPago`);
    
    // Placeholder - reemplazar con llamada real
    const mockStatuses = ['approved', 'rejected', 'pending', 'cancelled'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    console.log(`📊 Estado obtenido para pago ${paymentId}: ${randomStatus}`);
    return randomStatus;

  } catch (error) {
    console.error('Error consultando estado de pago en MercadoPago:', error);
    return 'pending';
  }
}

// Webhook de prueba para desarrollo
if (process.env.NODE_ENV === 'development') {
  router.post('/test/payment', async (req: Request, res: Response) => {
    try {
      const { payment_id, status } = req.body;
      
      if (!payment_id || !status) {
        return res.status(400).json({ 
          error: 'payment_id y status son requeridos' 
        });
      }

      console.log(`🧪 Webhook de prueba: ${payment_id} - ${status}`);
      
      await PaymentService.procesarWebhookMercadoPago(payment_id, status);
      
      res.json({
        success: true,
        message: 'Webhook de prueba procesado',
        payment_id,
        status
      });

    } catch (error) {
      console.error('Error en webhook de prueba:', error);
      res.status(500).json({ 
        error: 'Error procesando webhook de prueba' 
      });
    }
  });

  router.post('/test/subscription', async (req: Request, res: Response) => {
    try {
      const { subscription_id, action } = req.body;
      
      console.log(`🧪 Webhook de suscripción de prueba: ${subscription_id} - ${action}`);
      
      await handleSubscriptionWebhook({ id: subscription_id }, action);
      
      res.json({
        success: true,
        message: 'Webhook de suscripción de prueba procesado',
        subscription_id,
        action
      });

    } catch (error) {
      console.error('Error en webhook de suscripción de prueba:', error);
      res.status(500).json({ 
        error: 'Error procesando webhook de suscripción de prueba' 
      });
    }
  });
}

// Webhook genérico para otros servicios
router.post('/generic/:service', async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    
    console.log(`🔔 Webhook genérico recibido para servicio: ${service}`, {
      body: req.body,
      headers: req.headers
    });

    // TODO: Implementar manejo de webhooks para otros servicios
    // Por ejemplo: Cloudinary, SendGrid, etc.
    
    res.status(200).json({ 
      received: true,
      service,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error procesando webhook para servicio ${req.params.service}:`, error);
    res.status(500).json({ 
      error: 'Error procesando webhook' 
    });
  }
});

// Endpoint para verificar salud de webhooks
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Endpoint para obtener logs de webhooks (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  router.get('/logs', (req: Request, res: Response) => {
    // TODO: Implementar sistema de logs de webhooks
    res.json({
      message: 'Webhook logs endpoint - En desarrollo',
      available_endpoints: [
        'POST /webhooks/mercadopago',
        'POST /webhooks/test/payment',
        'POST /webhooks/test/subscription',
        'POST /webhooks/generic/:service',
        'GET /webhooks/health'
      ]
    });
  });
}

export default router;