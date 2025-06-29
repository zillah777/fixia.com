import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import {
  encontrarMatches,
  crearMatch,
  contactarAs,
  actualizarEstadoMatch,
  obtenerMisMatches,
  obtenerEstadisticasMatching,
  rechazarMatch,
  completarMatch
} from '@/controllers/matching';

const router = Router();

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100
});

// Todas las rutas requieren autenticación
router.use(authenticate);
router.use(generalLimiter);

// Obtener matches del usuario
router.get('/', obtenerMisMatches);

// Obtener estadísticas de matching
router.get('/stats', obtenerEstadisticasMatching);

// Encontrar matches para una búsqueda específica
router.get('/busqueda/:busqueda_id', encontrarMatches);

// Crear match entre Explorador y As
router.post('/', crearMatch);

// Contactar As a través de un match
router.post('/contact', contactarAs);

// Actualizar estado del match
router.put('/:id/status', actualizarEstadoMatch);

// Rechazar match
router.post('/:id/reject', rechazarMatch);

// Completar match
router.post('/:id/complete', completarMatch);

// Calificar match
router.post('/:id/rate', async (req, res) => {
  // TODO: Implementar sistema de calificaciones
  res.json({ message: 'Rate match - TODO' });
});

export default router;