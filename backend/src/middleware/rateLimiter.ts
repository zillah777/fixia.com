import { Request, Response, NextFunction } from 'express';
import redisClient from '@/config/redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later'
};

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = defaultConfig;
    const key = `rate_limit:${req.ip}`;
    
    const current = await redisClient.get(key);
    
    if (current === null) {
      // First request
      await redisClient.setEx(key, Math.ceil(config.windowMs / 1000), '1');
      return next();
    }
    
    const count = parseInt(current);
    
    if (count >= config.maxRequests) {
      return res.status(429).json({
        success: false,
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
    
    // Increment counter
    await redisClient.incr(key);
    next();
  } catch (error) {
    console.error('❌ Rate limiter error:', error);
    // Continue without rate limiting if Redis fails
    next();
  }
};

export const createRateLimiter = (config: Partial<RateLimitConfig>) => {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${req.ip}:${req.route?.path || req.path}`;
      
      const current = await redisClient.get(key);
      
      if (current === null) {
        await redisClient.setEx(key, Math.ceil(finalConfig.windowMs / 1000), '1');
        return next();
      }
      
      const count = parseInt(current);
      
      if (count >= finalConfig.maxRequests) {
        return res.status(429).json({
          success: false,
          error: finalConfig.message,
          retryAfter: Math.ceil(finalConfig.windowMs / 1000)
        });
      }
      
      await redisClient.incr(key);
      next();
    } catch (error) {
      console.error('❌ Rate limiter error:', error);
      next();
    }
  };
};