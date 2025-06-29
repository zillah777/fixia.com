import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
  isRedisConnected = false;
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
  isRedisConnected = true;
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    isRedisConnected = false;
    // No lanzar error para permitir que la app funcione sin Redis
  }
};

// Fallback in-memory cache cuando Redis no está disponible
const memoryCache = new Map<string, { value: any; expires: number }>();

// Cache helpers
export const setCache = async (key: string, value: any, ttl: number = 3600) => {
  if (!isRedisConnected) {
    // Fallback a memory cache
    const expires = Date.now() + (ttl * 1000);
    memoryCache.set(key, { value, expires });
    return;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('❌ Redis SET error:', error);
    // Fallback a memory cache
    const expires = Date.now() + (ttl * 1000);
    memoryCache.set(key, { value, expires });
  }
};

export const getCache = async (key: string) => {
  if (!isRedisConnected) {
    // Fallback a memory cache
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    if (cached) {
      memoryCache.delete(key); // Limpiar cache expirado
    }
    return null;
  }

  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('❌ Redis GET error:', error);
    // Fallback a memory cache
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    return null;
  }
};

export const delCache = async (key: string) => {
  if (!isRedisConnected) {
    memoryCache.delete(key);
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('❌ Redis DEL error:', error);
    memoryCache.delete(key);
  }
};

export const clearCache = async (pattern: string) => {
  if (!isRedisConnected) {
    // Fallback: limpiar cache en memoria que coincida con el pattern
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('❌ Redis CLEAR error:', error);
    // Fallback a memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
  }
};

export default redisClient;