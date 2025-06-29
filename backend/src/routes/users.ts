import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';

const router = Router();

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100
});

// Todas las rutas requieren autenticación
router.use(authenticate);
router.use(generalLimiter);

// Obtener perfil completo del usuario
router.get('/profile', async (req, res) => {
  // Implementar obtener perfil completo
  res.json({ message: 'Get user profile - TODO' });
});

// Actualizar perfil
router.put('/profile', async (req, res) => {
  // Implementar actualización de perfil
  res.json({ message: 'Update user profile - TODO' });
});

// Subir foto de perfil
router.post('/profile/photo', async (req, res) => {
  // Implementar subida de foto
  res.json({ message: 'Upload profile photo - TODO' });
});

// Rutas específicas para Ases
router.get('/as/dashboard', authorize('as', 'ambos'), async (req, res) => {
  // Dashboard del As
  res.json({ message: 'As dashboard - TODO' });
});

router.get('/as/services', authorize('as', 'ambos'), async (req, res) => {
  // Servicios del As
  res.json({ message: 'As services - TODO' });
});

router.get('/as/matches', authorize('as', 'ambos'), async (req, res) => {
  // Matches del As
  res.json({ message: 'As matches - TODO' });
});

// Rutas específicas para Exploradores
router.get('/explorador/dashboard', authorize('explorador', 'ambos'), async (req, res) => {
  // Dashboard del Explorador
  res.json({ message: 'Explorador dashboard - TODO' });
});

router.get('/explorador/searches', authorize('explorador', 'ambos'), async (req, res) => {
  // Búsquedas del Explorador
  res.json({ message: 'Explorador searches - TODO' });
});

router.get('/explorador/matches', authorize('explorador', 'ambos'), async (req, res) => {
  // Matches del Explorador
  res.json({ message: 'Explorador matches - TODO' });
});

export default router;