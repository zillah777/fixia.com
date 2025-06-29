import { Request, Response, NextFunction } from 'express';
import { query } from '@/config/database';
import { createError } from './errorHandler';
import { AuthRequest } from './auth';
import { getCache, setCache } from '@/config/redis';

interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  limits: {
    services: number;
    matches_per_month: number;
    priority_support: boolean;
    advanced_analytics: boolean;
    featured_listings: number;
  };
}

// Planes de suscripción disponibles
const SUBSCRIPTION_PLANS: { [key: string]: SubscriptionPlan } = {
  basico: {
    id: 'basico',
    name: 'Básico',
    features: ['Publicar servicios', 'Recibir matches', 'Chat básico'],
    limits: {
      services: 3,
      matches_per_month: 20,
      priority_support: false,
      advanced_analytics: false,
      featured_listings: 0
    }
  },
  profesional: {
    id: 'profesional',
    name: 'Profesional',
    features: ['Servicios ilimitados', 'Matches ilimitados', 'Soporte prioritario', 'Análisis avanzados'],
    limits: {
      services: -1, // Ilimitado
      matches_per_month: -1, // Ilimitado
      priority_support: true,
      advanced_analytics: true,
      featured_listings: 2
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    features: ['Todo incluido', 'Listados destacados', 'Soporte 24/7', 'API access'],
    limits: {
      services: -1,
      matches_per_month: -1,
      priority_support: true,
      advanced_analytics: true,
      featured_listings: 5
    }
  }
};

// Middleware principal para verificar suscripción activa
export const requireActiveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Verificar si el usuario es As o ambos (solo los Ases necesitan suscripción)
    if (req.user.tipo_usuario === 'explorador') {
      return next(); // Los exploradores no necesitan suscripción
    }

    const asResult = await query(`
      SELECT 
        pa.*,
        s.plan_id,
        s.estado as suscripcion_estado,
        s.fecha_inicio,
        s.fecha_vencimiento,
        s.auto_renovacion
      FROM perfiles_ases pa
      LEFT JOIN suscripciones s ON pa.suscripcion_id = s.id
      WHERE pa.usuario_id = $1
    `, [req.user.id]);

    if (asResult.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Perfil de As no encontrado',
        code: 'AS_PROFILE_NOT_FOUND'
      });
    }

    const asProfile = asResult.rows[0];

    // Verificar si tiene suscripción activa
    if (!asProfile.suscripcion_activa) {
      return res.status(403).json({ 
        error: 'Suscripción requerida para continuar',
        code: 'SUBSCRIPTION_REQUIRED',
        subscription_url: '/api/suscripciones/planes',
        message: 'Necesitas una suscripción activa para usar esta funcionalidad'
      });
    }

    // Verificar si la suscripción ha expirado
    if (asProfile.fecha_vencimiento && new Date() > new Date(asProfile.fecha_vencimiento)) {
      // Marcar suscripción como expirada
      await query(`
        UPDATE perfiles_ases 
        SET suscripcion_activa = false 
        WHERE id = $1
      `, [asProfile.id]);

      return res.status(403).json({ 
        error: 'Tu suscripción ha expirado',
        code: 'SUBSCRIPTION_EXPIRED',
        subscription_url: '/api/suscripciones/renovar',
        expired_date: asProfile.fecha_vencimiento
      });
    }

    // Verificar estado de la suscripción
    if (asProfile.suscripcion_estado === 'suspendida') {
      return res.status(403).json({ 
        error: 'Suscripción suspendida. Contacta al soporte.',
        code: 'SUBSCRIPTION_SUSPENDED'
      });
    }

    if (asProfile.suscripcion_estado === 'cancelada') {
      return res.status(403).json({ 
        error: 'Suscripción cancelada',
        code: 'SUBSCRIPTION_CANCELLED',
        subscription_url: '/api/suscripciones/reactivar'
      });
    }

    // Agregar información de suscripción al request
    req.subscription = {
      plan: SUBSCRIPTION_PLANS[asProfile.plan_id] || SUBSCRIPTION_PLANS.basico,
      active: true,
      expires_at: asProfile.fecha_vencimiento,
      auto_renewal: asProfile.auto_renovacion
    };

    next();

  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno verificando suscripción',
      code: 'SUBSCRIPTION_CHECK_ERROR'
    });
  }
};

// Middleware para verificar límites de servicios
export const checkServiceLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.subscription) {
      return next(); // Si no hay suscripción, otros middlewares se encargarán
    }

    const plan = req.subscription.plan;
    
    // Si el plan permite servicios ilimitados
    if (plan.limits.services === -1) {
      return next();
    }

    // Contar servicios actuales del As
    const serviceCountResult = await query(`
      SELECT COUNT(*) as total_servicios
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      WHERE pa.usuario_id = $1 AND s.activo = true
    `, [req.user!.id]);

    const currentServices = parseInt(serviceCountResult.rows[0].total_servicios);

    if (currentServices >= plan.limits.services) {
      return res.status(403).json({
        error: `Has alcanzado el límite de ${plan.limits.services} servicios para tu plan ${plan.name}`,
        code: 'SERVICE_LIMIT_REACHED',
        current_services: currentServices,
        max_services: plan.limits.services,
        upgrade_url: '/api/suscripciones/upgrade'
      });
    }

    next();

  } catch (error) {
    console.error('Error verificando límite de servicios:', error);
    next(); // Continuar en caso de error para no bloquear la funcionalidad
  }
};

// Middleware para verificar límites de matches mensuales
export const checkMatchLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.subscription) {
      return next();
    }

    const plan = req.subscription.plan;
    
    // Si el plan permite matches ilimitados
    if (plan.limits.matches_per_month === -1) {
      return next();
    }

    // Usar cache para evitar consultas repetidas
    const cacheKey = `match_count:${req.user!.id}:${new Date().getMonth()}`;
    let currentMatches = await getCache(cacheKey);

    if (currentMatches === null) {
      // Contar matches del mes actual
      const matchCountResult = await query(`
        SELECT COUNT(*) as total_matches
        FROM matches m
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        WHERE pa.usuario_id = $1 
        AND m.created_at >= date_trunc('month', CURRENT_DATE)
        AND m.estado != 'rechazado'
      `, [req.user!.id]);

      currentMatches = parseInt(matchCountResult.rows[0].total_matches);
      
      // Cachear por 1 hora
      await setCache(cacheKey, currentMatches, 3600);
    }

    if (currentMatches >= plan.limits.matches_per_month) {
      return res.status(403).json({
        error: `Has alcanzado el límite de ${plan.limits.matches_per_month} matches mensuales para tu plan ${plan.name}`,
        code: 'MATCH_LIMIT_REACHED',
        current_matches: currentMatches,
        max_matches: plan.limits.matches_per_month,
        reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        upgrade_url: '/api/suscripciones/upgrade'
      });
    }

    next();

  } catch (error) {
    console.error('Error verificando límite de matches:', error);
    next();
  }
};

// Middleware para verificar funcionalidades premium
export const requirePremiumFeature = (feature: 'priority_support' | 'advanced_analytics' | 'featured_listings') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.subscription) {
      return res.status(403).json({
        error: 'Suscripción requerida',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    const plan = req.subscription.plan;
    
    if (!plan.limits[feature]) {
      return res.status(403).json({
        error: `Esta funcionalidad requiere un plan superior`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        required_feature: feature,
        current_plan: plan.name,
        upgrade_url: '/api/suscripciones/upgrade'
      });
    }

    next();
  };
};

// Middleware para verificar límite de listados destacados
export const checkFeaturedListingLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.subscription) {
      return next();
    }

    const plan = req.subscription.plan;
    
    if (plan.limits.featured_listings === 0) {
      return res.status(403).json({
        error: 'Tu plan no incluye listados destacados',
        code: 'FEATURED_LISTINGS_NOT_ALLOWED',
        upgrade_url: '/api/suscripciones/upgrade'
      });
    }

    // Contar listados destacados actuales
    const featuredCountResult = await query(`
      SELECT COUNT(*) as total_destacados
      FROM servicios s
      INNER JOIN perfiles_ases pa ON s.as_id = pa.id
      WHERE pa.usuario_id = $1 AND s.destacado = true AND s.activo = true
    `, [req.user!.id]);

    const currentFeatured = parseInt(featuredCountResult.rows[0].total_destacados);

    if (currentFeatured >= plan.limits.featured_listings) {
      return res.status(403).json({
        error: `Has alcanzado el límite de ${plan.limits.featured_listings} listados destacados`,
        code: 'FEATURED_LIMIT_REACHED',
        current_featured: currentFeatured,
        max_featured: plan.limits.featured_listings,
        upgrade_url: '/api/suscripciones/upgrade'
      });
    }

    next();

  } catch (error) {
    console.error('Error verificando límite de destacados:', error);
    next();
  }
};

// Función para obtener información de suscripción
export const getSubscriptionInfo = async (userId: string) => {
  try {
    const result = await query(`
      SELECT 
        pa.suscripcion_activa,
        s.plan_id,
        s.estado,
        s.fecha_inicio,
        s.fecha_vencimiento,
        s.auto_renovacion,
        s.metodo_pago
      FROM perfiles_ases pa
      LEFT JOIN suscripciones s ON pa.suscripcion_id = s.id
      WHERE pa.usuario_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    const subscription = result.rows[0];
    const plan = SUBSCRIPTION_PLANS[subscription.plan_id] || SUBSCRIPTION_PLANS.basico;

    return {
      active: subscription.suscripcion_activa,
      plan: plan,
      status: subscription.estado,
      start_date: subscription.fecha_inicio,
      end_date: subscription.fecha_vencimiento,
      auto_renewal: subscription.auto_renovacion,
      payment_method: subscription.metodo_pago
    };

  } catch (error) {
    console.error('Error obteniendo información de suscripción:', error);
    return null;
  }
};

// Función para validar y aplicar promociones
export const validatePromoCode = async (promoCode: string, userId: string) => {
  try {
    const result = await query(`
      SELECT 
        id, codigo, descuento_porcentaje, descuento_fijo,
        fecha_vencimiento, usos_maximos, usos_actuales,
        activo, plan_aplicable
      FROM promociones
      WHERE codigo = $1 AND activo = true
      AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())
      AND (usos_maximos IS NULL OR usos_actuales < usos_maximos)
    `, [promoCode]);

    if (result.rows.length === 0) {
      return { valid: false, error: 'Código promocional inválido o expirado' };
    }

    const promo = result.rows[0];

    // Verificar si el usuario ya usó este código
    const usageResult = await query(`
      SELECT id FROM uso_promociones 
      WHERE promocion_id = $1 AND usuario_id = $2
    `, [promo.id, userId]);

    if (usageResult.rows.length > 0) {
      return { valid: false, error: 'Ya has usado este código promocional' };
    }

    return {
      valid: true,
      promo: {
        id: promo.id,
        code: promo.codigo,
        discount_percentage: promo.descuento_porcentaje,
        discount_fixed: promo.descuento_fijo,
        applicable_plan: promo.plan_aplicable
      }
    };

  } catch (error) {
    console.error('Error validando código promocional:', error);
    return { valid: false, error: 'Error al validar código promocional' };
  }
};

// Agregar tipos al Request
declare global {
  namespace Express {
    interface Request {
      subscription?: {
        plan: SubscriptionPlan;
        active: boolean;
        expires_at: string;
        auto_renewal: boolean;
      };
      rateLimit?: {
        windowMs: number;
        maxRequests: number;
        message: string;
      };
    }
  }
}