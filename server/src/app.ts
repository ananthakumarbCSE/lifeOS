import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { loadEnvironment, getEnv } from './config/environment';
import { connectDatabase } from './config/database';
import { createCorsOptions } from './config/cors';
import { createRateLimiter } from './middleware/rate-limit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import goalsRoutes from './routes/goals.routes';
import tasksRoutes from './routes/tasks.routes';
import projectsRoutes from './routes/projects.routes';
import eventsRoutes from './routes/events.routes';
import canvasRoutes from './routes/canvas.routes';
import aiRoutes from './routes/ai.routes';
import progressRoutes from './routes/progress.routes';

async function bootstrap(): Promise<void> {
  // Validate environment first
  loadEnvironment();
  const { PORT, NODE_ENV } = getEnv();

  // Connect to database
  await connectDatabase();

  const app = express();

  // Security
  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(createRateLimiter());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/goals', goalsRoutes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/canvas', canvasRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/progress', progressRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.info(`🚀 LifeOS API server running on port ${PORT} [${NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
