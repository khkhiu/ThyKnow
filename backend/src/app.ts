// src/app.ts - Alternative approach with middleware-based routing
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

// Set up API routes FIRST (before static file serving)
app.use('/pubsub', pubSubRoutes);
app.use('/api/miniapp', miniAppApiRouter);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ping', minimalHealthCheck);

// Serve React app static files
const frontendPath = path.join(process.cwd(), 'dist', 'frontend');
logger.info(`Serving React app static files from: ${frontendPath}`);

// Serve static assets (JS, CSS, images) but not HTML files
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use(express.static(frontendPath, {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['js', 'css', 'png', 'jpg', 'gif', 'svg', 'ico'], // Don't include 'html'
  index: false, // Don't serve index.html automatically
  maxAge: '1d',
  redirect: false,
  setHeaders: (res: express.Response, filePath: string) => {
    if (path.extname(filePath) === '.html') {
      res.set('Cache-Control', 'no-cache');
    }
  }
}));

// Helper function to serve the React app
const serveReactApp = (req: express.Request, res: express.Response) => {
  const indexPath = path.join(frontendPath, 'index.html');
  logger.debug(`Serving React app for ${req.originalUrl} from ${indexPath}`);
  
  res.sendFile(indexPath, (err: any) => {
    if (err) {
      logger.error(`Error serving React app for ${req.originalUrl}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to load application',
          message: err.message,
          path: indexPath
        });
      }
    }
  });
};

// Middleware to handle miniapp routes (safer than wildcard routes)
app.use('/miniapp', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check if this is an API call (should not be handled by React app)
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // All miniapp routes serve the React app
  logger.debug(`Miniapp middleware handling: ${req.originalUrl}`);
  serveReactApp(req, res);
});

// Define other React routes explicitly
app.get('/', serveReactApp);
app.get('/pet', serveReactApp);
app.get('/journal', serveReactApp);
app.get('/care', serveReactApp);
app.get('/shop', serveReactApp);
app.get('/achievements', serveReactApp);
app.get('/stats', serveReactApp);

// Catch-all handler for any other routes (should be last)
app.use((req: express.Request, res: express.Response) => {
  logger.debug(`Catch-all handler for: ${req.originalUrl}`);
  
  // API routes should return JSON errors
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/webhook') || 
      req.path.startsWith('/pubsub')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  
  // All other routes serve the React app (SPA behavior)
  serveReactApp(req, res);
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;