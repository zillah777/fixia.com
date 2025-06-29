import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { sanitizeInput, validateUUIDParam } from '@/middleware/validation';
import { requireActiveSubscription } from '@/middleware/subscription';
import {
  crearPreferenciaPago,
  obtenerEstadoPago,
  obtenerHistorialPagos,
  cancelarSuscripcion,
  reactivarSuscripcion,
  obtenerEstadisticasPagos,
  procesarPagoManual,
  verificarSuscripcion
} from '@/controllers/payments';

const router = Router();

// Aplicar sanitización
router.use(sanitizeInput);

// Rate limiters
const paymentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10
});

const webhookLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 100 // Webhooks pueden ser frecuentes
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50
});

// Rutas protegidas
router.use(authenticate);
router.use(generalLimiter);

// Crear preferencia de pago
router.post('/preferencia', 
  authorize('as', 'ambos'),
  paymentLimiter,
  crearPreferenciaPago
);

// Verificar estado de suscripción
router.get('/subscription/status',
  authorize('as', 'ambos'),
  verificarSuscripcion
);

// Obtener estado de un pago específico
router.get('/payment/:payment_id',
  authorize('as', 'ambos'),
  obtenerEstadoPago
);

// Obtener historial de pagos
router.get('/history',
  authorize('as', 'ambos'),
  obtenerHistorialPagos
);

// Cancelar suscripción
router.post('/subscription/cancel',
  authorize('as', 'ambos'),
  requireActiveSubscription,
  cancelarSuscripcion
);

// Reactivar suscripción
router.post('/subscription/reactivate',
  authorize('as', 'ambos'),
  paymentLimiter,
  reactivarSuscripcion
);

// Rutas administrativas (TODO: agregar middleware de admin)
router.get('/admin/stats',
  obtenerEstadisticasPagos
);

router.post('/admin/process-payment',
  procesarPagoManual
);

// Facturas (mantener compatibilidad)
router.get('/invoices', authorize('as', 'ambos'), async (req, res) => {
  res.json({ message: 'Get invoices - En desarrollo' });
});

router.get('/invoices/:id', authorize('as', 'ambos'), async (req, res) => {
  res.json({ message: 'Get invoice by ID - En desarrollo' });
});

export default router;