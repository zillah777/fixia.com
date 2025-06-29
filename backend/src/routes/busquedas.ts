import { Router } from 'express';
import { authenticate, authorize, optionalAuth, preventBruteForce } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { 
  validateBusqueda, 
  validateSearchQuery, 
  validateUUIDParam,
  validatePagination,
  sanitizeInput 
} from '@/middleware/validation';
import {
  crearBusqueda,
  obtenerBusqueda,
  obtenerMisBusquedas,
  actualizarBusqueda,
  cambiarEstadoBusqueda,
  eliminarBusqueda,
  obtenerMatchesBusqueda,
  obtenerBusquedasActivas,
  buscarPorUbicacion,
  obtenerEstadisticasBusquedas,
  duplicarBusqueda
} from '@/controllers/busquedas';

const router = Router();

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100
});

const creationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 10 // Máximo 10 búsquedas por hora
});

const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 30
});

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);
router.use(generalLimiter);

// Rutas públicas (con auth opcional)
router.get('/active', searchLimiter, validatePagination, obtenerBusquedasActivas);
router.get('/location', searchLimiter, validateSearchQuery, buscarPorUbicacion);
router.get('/:id', optionalAuth, validateUUIDParam('id'), obtenerBusqueda);

// Rutas protegidas - Solo Exploradores
router.use(authenticate);

// CRUD de búsquedas
router.post('/', 
  authorize('explorador', 'ambos'), 
  creationLimiter, 
  validateBusqueda,
  preventBruteForce,
  crearBusqueda
);

router.get('/', 
  authorize('explorador', 'ambos'), 
  validatePagination,
  obtenerMisBusquedas
);

router.put('/:id', 
  authorize('explorador', 'ambos'), 
  validateUUIDParam('id'),
  validateBusqueda,
  actualizarBusqueda
);

router.delete('/:id', 
  authorize('explorador', 'ambos'), 
  validateUUIDParam('id'),
  eliminarBusqueda
);

// Gestión de estado
router.patch('/:id/status', authorize('explorador', 'ambos'), cambiarEstadoBusqueda);

// Matches para una búsqueda específica
router.get('/:id/matches', searchLimiter, obtenerMatchesBusqueda);

// Estadísticas del usuario
router.get('/my/stats', authorize('explorador', 'ambos'), obtenerEstadisticasBusquedas);

// Duplicar búsqueda
router.post('/:id/duplicate', authorize('explorador', 'ambos'), duplicarBusqueda);

// Funcionalidades avanzadas
router.post('/:id/boost', authorize('explorador', 'ambos'), async (req, res) => {
  // TODO: Implementar boost de búsqueda (feature premium)
  res.json({ message: 'Boost search - TODO' });
});

router.post('/:id/schedule', authorize('explorador', 'ambos'), async (req, res) => {
  // TODO: Implementar programación de búsquedas
  res.json({ message: 'Schedule search - TODO' });
});

export default router;