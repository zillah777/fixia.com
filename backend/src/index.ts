import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import busquedasRoutes from './routes/busquedas';
import usersRoutes from './routes/users';
import matchesRoutes from './routes/matches';
import notificationsRoutes from './routes/notifications';
import paymentsRoutes from './routes/payments';
import webhooksRoutes from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://serviplay.vercel.app',
  'https://serviplay-git-main-zillah777s-projects.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting (disabled for development)
// app.use(rateLimiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/busquedas', busquedasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to databases
    await connectDB();
    console.log('⚡ Skipping Redis connection for development');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();