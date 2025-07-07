// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { Telegraf } from 'telegraf';
import { setupBotCommands } from './controllers/index';
import { errorHandler } from './middleware/errorHandler';
import config from './config';
import { logger } from './utils/logger';
import { stream } from './utils/logger';
import dotenv from 'dotenv';
import pubSubRoutes from './routes/pubSubRoutes';
import miniAppRoutes from './routes/miniAppRoutes';
import miniAppApiRouter from './routes/miniAppApiRoutes';

// Import health check controllers
import { healthCheck } from './controllers/healthController';
import { minimalHealthCheck } from './controllers/minimalHealthCheck';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Telegram bot instance
export const bot = new Telegraf(config.telegramBotToken);

// Setup middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "telegram.org", "*.telegram.org", "unpkg.com", "cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "telegram.org", "*.telegram.org"],
      frameSrc: ["'self'", "telegram.org", "*.telegram.org"],
      imgSrc: ["'self'", "data:", "telegram.org", "*.telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "cdnjs.cloudflare.com"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add Morgan request logging middleware
app.use(morgan('combined', { stream }));

// Setup bot commands and handlers
setupBotCommands(bot);

// Set up webhook endpoint for Telegram
app.use('/webhook', express.json(), (req, res) => {
  logger.debug('Received webhook request:', {
    body: req.body,
    headers: req.headers
  });
  bot.handleUpdate(req.body, res);
});

// Set up API routes
app.use('/pubsub', pubSubRoutes);
app.use('/api/miniapp', miniAppApiRouter);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ping', minimalHealthCheck);

// Serve React app static files
const frontendPath = path.join(process.cwd(), 'dist', 'frontend');
logger.info(`Serving React app from: ${frontendPath}`);
app.use(express.static(frontendPath));

// Legacy miniapp routes (for backwards compatibility)
app.use('/miniapp', miniAppRoutes);

// Handle React Router (client-side routing)
app.get('*', (req: express.Request, res: express.Response) => {
  // Don't serve the React app for API routes
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/webhook') || 
      req.path.startsWith('/miniapp') ||
      req.path.startsWith('/pubsub') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/ping')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  
  // Serve React app for all other routes
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err: any) => {
    if (err) {
      logger.error('Error serving React app:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to load application' });
      }
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;