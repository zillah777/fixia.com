import { Router } from 'express';
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  refreshToken, 
  logout, 
  getProfile 
} from '@/controllers/auth';
import { authenticate, preventBruteForce } from '@/middleware/auth';
import { createRateLimiter } from '@/middleware/rateLimiter';
import { 
  validateRegister, 
  validateLogin, 
  sanitizeInput,
  validateSensitiveData 
} from '@/middleware/validation';

const router = Router();

// Aplicar sanitización y validación de datos sensibles
router.use(sanitizeInput);
router.use(validateSensitiveData);

// Rate limiters for auth routes
const strictAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos'
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20
});

const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Demasiados registros desde esta IP, intenta de nuevo en 1 hora'
});

// Public routes
router.post('/register', 
  registrationLimiter, 
  validateRegister,
  preventBruteForce,
  register
);

router.post('/login', 
  strictAuthLimiter, 
  validateLogin,
  preventBruteForce,
  login
);

router.post('/verify-email', 
  generalLimiter, 
  verifyEmail
);

router.post('/forgot-password', 
  strictAuthLimiter, 
  preventBruteForce,
  forgotPassword
);

router.post('/reset-password', 
  strictAuthLimiter, 
  resetPassword
);

router.post('/refresh-token', 
  generalLimiter, 
  refreshToken
);

// Protected routes
router.get('/me', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;