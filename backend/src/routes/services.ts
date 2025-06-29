import { Router } from 'express';
import { authenticate, authorize, optionalAuth, preventBruteForce } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { 
  validateService, 
  validateSearchQuery, 
  validateUUIDParam,
  sanitizeInput 
} from '@/middleware/validation';
import { 
  requireActiveSubscription, 
  checkServiceLimit,
  checkFeaturedListingLimit 
} from '@/middleware/subscription';
import { 
  buscarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerMisServicios,
  obtenerCategorias,
  obtenerDestacados
} from '@/controllers/servicios';

const router = Router();

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200
});

const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 60
});

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);
router.use(generalLimiter);

// Rutas públicas (con auth opcional)
router.get('/', optionalAuth, searchLimiter, validateSearchQuery, buscarServicios);
router.get('/categories', obtenerCategorias);
router.get('/featured', obtenerDestacados);
router.get('/:id', optionalAuth, validateUUIDParam('id'), obtenerServicio);

// Rutas protegidas - Solo Ases
router.use(authenticate);

// Crear servicio con todas las validaciones
router.post('/', 
  authorize('as', 'ambos'),
  requireActiveSubscription,
  checkServiceLimit,
  validateService,
  preventBruteForce,
  crearServicio
);

// Actualizar servicio
router.put('/:id', 
  authorize('as', 'ambos'),
  requireActiveSubscription,
  validateUUIDParam('id'),
  validateService,
  actualizarServicio
);

// Eliminar servicio
router.delete('/:id', 
  authorize('as', 'ambos'),
  requireActiveSubscription,
  validateUUIDParam('id'),
  eliminarServicio
);

// Obtener mis servicios
router.get('/my/services', 
  authorize('as', 'ambos'),
  requireActiveSubscription,
  obtenerMisServicios
);

// Subir fotos del servicio
router.post('/:id/photos', 
  authorize('as', 'ambos'),
  requireActiveSubscription,
  validateUUIDParam('id'),
  // validateFileUpload, // Descomentar cuando se implemente multer
  async (req, res) => {
    // TODO: Implementar subida de fotos con Cloudinary
    res.json({ message: 'Upload service photos - TODO' });
  }
);

// Destacar servicio (función premium)
router.post('/:id/feature',
  authorize('as', 'ambos'),
  requireActiveSubscription,
  checkFeaturedListingLimit,
  validateUUIDParam('id'),
  async (req, res) => {
    // TODO: Implementar destacar servicio
    res.json({ message: 'Feature service - TODO' });
  }
);

// Quitar destaque del servicio
router.delete('/:id/feature',
  authorize('as', 'ambos'),
  requireActiveSubscription,
  validateUUIDParam('id'),
  async (req, res) => {
    // TODO: Implementar quitar destaque
    res.json({ message: 'Unfeature service - TODO' });
  }
);

export default router;