import express from 'express';

const router = express.Router();

// Simple health check for development
router.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API test endpoint
router.get('/test', (_req, res) => {
  res.json({ 
    message: 'Serviplay API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;