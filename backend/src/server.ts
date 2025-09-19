// backend/src/server.ts
// Main server entry point for ThyKnow monorepo
// Updated for monorepo structure with proper frontend serving

import path from 'path';
import fs from 'fs';
import express from 'express';
import app, { bot } from './app';
import config from './config';
import { logger } from './utils/logger';
import { checkDatabaseConnection, initDatabase, closePool } from './database';
import { setupScheduler } from './services/schedulerService';
//import { ensurePublicDirectory } from './utils/ensurePublicDir';

// Utility function to add delay for retry logic
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ensure public directory structure exists for proper deployment
 * Updated for monorepo structure where frontend is built separately
 */
function ensurePublicDirectory(): void {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const frontendDir = path.join(publicDir, 'frontend');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      logger.info(`Created public directory: ${publicDir}`);
    }
    
    // In production, the frontend should be built and copied to public/frontend
    if (process.env.NODE_ENV === 'production') {
      if (!fs.existsSync(frontendDir)) {
        logger.warn(`Frontend directory not found at ${frontendDir}`);
        logger.warn('Make sure the frontend is built and copied to public/frontend during deployment');
      } else {
        logger.info(`Frontend assets found at: ${frontendDir}`);
      }
    } else {
      // In development, frontend runs on its own port
      logger.info('Development mode: Frontend should be running on http://localhost:5173');
    }
    
  } catch (error) {
    logger.error('Error ensuring public directory structure:', error);
  }
}

/**
 * Get the correct webhook URL for the current deployment environment
 * Priority: 1. Custom domain 2. Public domain 3. Static URL 4. Fallback to baseUrl
 */
function getWebhookUrl(): string {
  if (process.env.CUSTOM_DOMAIN) {
    return `https://${process.env.CUSTOM_DOMAIN}/webhook`;
  }
  
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`;
  }
  
  if (process.env.RAILWAY_STATIC_URL) {
    return `${process.env.RAILWAY_STATIC_URL}/webhook`;
  }
  
  // Fallback to config.baseUrl (which should be set correctly in config)
  return `${config.baseUrl}/webhook`;
}

/**
 * Log comprehensive environment information for debugging
 */
function logEnvironmentInfo(): void {
  logger.info('=== ThyKnow Server Environment Info ===');
  logger.info(`Node Environment: ${config.nodeEnv}`);
  logger.info(`Timezone: ${config.timezone}`);
  logger.info(`Server Port: ${config.port}`);
  logger.info(`Current Working Directory: ${process.cwd()}`);
  
  // Log monorepo structure info
  logger.info('=== Monorepo Structure Info ===');
  const frontendPath = path.join(process.cwd(), 'public', 'frontend');
  const backendPath = process.cwd();
  
  logger.info(`Backend Path: ${backendPath}`);
  logger.info(`Frontend Dist Path: ${frontendPath}`);
  logger.info(`Frontend Assets Exist: ${fs.existsSync(frontendPath)}`);
  
  if (fs.existsSync(frontendPath)) {
    try {
      const frontendFiles = fs.readdirSync(frontendPath);
      logger.info(`Frontend Files: ${frontendFiles.join(', ')}`);
    } catch (error) {
      logger.warn('Could not read frontend directory contents');
    }
  }
  
  // Log Railway-specific variables
  if (process.env.RAILWAY_SERVICE_NAME) {
    logger.info('=== Railway Platform Info ===');
    logger.info(`Railway Service: ${process.env.RAILWAY_SERVICE_NAME}`);
    logger.info(`Railway Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'unknown'}`);
    logger.info(`Railway Project: ${process.env.RAILWAY_PROJECT_NAME || 'unknown'}`);
    
    // Log domains without showing possible credentials
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      logger.info(`Railway Public Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    if (process.env.RAILWAY_PRIVATE_DOMAIN) {
      logger.info(`Railway Private Domain: ${process.env.RAILWAY_PRIVATE_DOMAIN}`);
    }
    if (process.env.RAILWAY_STATIC_URL) {
      logger.info(`Railway Static URL: ${process.env.RAILWAY_STATIC_URL}`);
    }
  }
  
  logger.info('=====================================');
}

/**
 * Setup static file serving for the monorepo structure
 * Handles both the existing miniapp and new React frontend
 */
function setupStaticFileServing(): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, serve the built frontend from public/frontend
    const frontendPath = path.join(process.cwd(), 'public', 'frontend');
    
    if (fs.existsSync(frontendPath)) {
      logger.info(`Setting up React frontend serving from: ${frontendPath}`);
      
      // Serve static assets (JS, CSS, images) with proper caching
      app.use('/assets', express.static(path.join(frontendPath, 'assets'), {
        maxAge: '1y', // Long cache for assets with hashes
        etag: true,
        lastModified: true
      }));
      
      // Serve other static files (without HTML to handle SPA routing)
      app.use(express.static(frontendPath, {
        dotfiles: 'ignore',
        etag: true,
        extensions: ['js', 'css', 'png', 'jpg', 'gif', 'svg', 'ico', 'woff', 'woff2'],
        index: false, // Don't serve index.html automatically
        maxAge: '1h', // Shorter cache for other files
        redirect: false,
        setHeaders: (res, filePath) => {
          // Set cache headers based on file type
          const ext = path.extname(filePath);
          if (['.js', '.css'].includes(ext)) {
            res.set('Cache-Control', 'public, max-age=31536000'); // 1 year for JS/CSS
          } else if (['.png', '.jpg', '.gif', '.svg', '.ico'].includes(ext)) {
            res.set('Cache-Control', 'public, max-age=86400'); // 1 day for images
          }
        }
      }));
      
      // Helper function to serve the React app for SPA routing
      const serveReactApp = (req: express.Request, res: express.Response): void => {
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
      
      // Handle React routes explicitly (but not API routes)
      const reactRoutes = ['/', '/pet', '/journal', '/care', '/shop', '/achievements', '/stats'];
      reactRoutes.forEach(route => {
        app.get(route, (req, res) => {
          serveReactApp(req, res);
        });
      });
      
      // Handle miniapp routes (but not API calls) - preserve existing miniapp functionality
      app.use('/miniapp', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Check if this is an API call (should not be handled by React app)
        if (req.path.startsWith('/api/')) {
          return next();
        }
        
        // All non-API miniapp routes serve the React app
        logger.debug(`Miniapp middleware handling: ${req.originalUrl}`);
        serveReactApp(req, res);
      });
      
      // Catch-all handler for SPA routing (should be last)
      app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.debug(`Catch-all handler for: ${req.originalUrl}`);
        
        // API routes should return JSON errors, not HTML
        if (req.path.startsWith('/api') || 
            req.path.startsWith('/webhook') || 
            req.path.startsWith('/pubsub') ||
            req.path.startsWith('/health')) {
          return next(); // Let API routes handle themselves
        }
        
        // All other routes serve the React app (SPA behavior)
        serveReactApp(req, res);
      });
      
    } else {
      logger.error(`Frontend build not found at ${frontendPath}`);
      logger.error('Make sure to run "npm run build:frontend" to build the frontend before starting the server');
      
      // Fallback: serve existing miniapp if React frontend is not available
      logger.info('Falling back to existing miniapp structure');
      const legacyMiniappPath = path.join(process.cwd(), 'public', 'miniapp');
      if (fs.existsSync(legacyMiniappPath)) {
        app.use('/miniapp', express.static(legacyMiniappPath));
        logger.info(`Serving legacy miniapp from: ${legacyMiniappPath}`);
      }
      
      // Serve a simple error page for missing frontend
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          return res.status(503).json({ error: 'Frontend not available' });
        }
        return res.status(503).send(`
          <html>
            <head><title>ThyKnow - Service Unavailable</title></head>
            <body>
              <h1>Service Temporarily Unavailable</h1>
              <p>The frontend application is not available. Please try again later.</p>
              <p>If you're a developer, make sure to build the frontend first.</p>
            </body>
          </html>
        `);
      });
    }
  } else {
    // In development, frontend runs on port 5173 via Vite
    logger.info('Development mode: Frontend should be running on http://localhost:5173');
    logger.info('API endpoints available on this server, frontend on separate port');
    
    // Serve existing miniapp for development (preserve existing functionality)
    const miniappPath = path.join(process.cwd(), 'public', 'miniapp');
    if (fs.existsSync(miniappPath)) {
      app.use('/miniapp', express.static(miniappPath));
      logger.info(`Serving miniapp from: ${miniappPath}`);
    }
    
    // Development API info endpoint
    app.get('/', (_req, res) => {
      return res.json({
        message: 'ThyKnow Backend API',
        environment: 'development',
        frontend: 'http://localhost:5173',
        miniapp: `http://localhost:${config.port}/miniapp`,
        api: `http://localhost:${config.port}/api`,
        health: `http://localhost:${config.port}/health`
      });
    });
  }
}

/**
 * Main function to start the server with comprehensive error handling
 */
async function startServer(): Promise<void> {
  try {
    // Log startup and environment info
    logger.info('Starting ThyKnow server...');
    logEnvironmentInfo();
    
    // Ensure public directory structure exists
    ensurePublicDirectory();
    
    // Setup static file serving based on environment
    setupStaticFileServing();
    
    // Initialize and connect to PostgreSQL with retry logic
    logger.info('Connecting to PostgreSQL database...');
    
    let isConnected = false;
    let retryCount = 0;
    const maxRetries = 10;
    const initialRetryDelay = 5000; // 5 seconds
    
    while (!isConnected && retryCount < maxRetries) {
      try {
        isConnected = await checkDatabaseConnection();
        
        if (isConnected) {
          logger.info('Connected to PostgreSQL database successfully');
          await initDatabase();
          logger.info('Database schema initialized successfully');
        } else {
          retryCount++;
          const retryDelay = initialRetryDelay * Math.pow(1.5, retryCount - 1) * (0.9 + Math.random() * 0.2);
          logger.warn(`Database connection attempt ${retryCount}/${maxRetries} failed.`);
          logger.warn(`Retrying in ${Math.round(retryDelay/1000)} seconds...`);
          await delay(retryDelay);
        }
      } catch (error) {
        retryCount++;
        const retryDelay = initialRetryDelay * Math.pow(1.5, retryCount - 1) * (0.9 + Math.random() * 0.2);
        logger.error(`Database connection attempt ${retryCount}/${maxRetries} failed with error:`, error);
        logger.warn(`Retrying in ${Math.round(retryDelay/1000)} seconds...`);
        await delay(retryDelay);
      }
    }
    
    if (!isConnected) {
      logger.error(`Failed to connect to PostgreSQL database after ${maxRetries} attempts`);
      if (config.nodeEnv !== 'production') {
        process.exit(1);
      } else {
        logger.warn('Continuing startup despite database connection failure (production mode)');
      }
    }
    
    // Start the Express server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 ThyKnow server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      
      if (config.nodeEnv === 'production') {
        logger.info(`🌐 Application available at: ${config.baseUrl}`);
      } else {
        logger.info(`🔧 Backend API: http://localhost:${config.port}`);
        logger.info(`⚛️  Frontend: http://localhost:5173 (run separately)`);
      }
      
      // Set up bot webhook or polling based on environment
      if (config.nodeEnv === 'production') {
        // Get the correct webhook URL for Railway
        const webhookUrl = getWebhookUrl();
        logger.info(`Setting webhook URL to: ${webhookUrl}`);
        
        bot.telegram.setWebhook(webhookUrl)
          .then(() => logger.info(`✅ Webhook set to ${webhookUrl}`))
          .catch(error => {
            logger.error('❌ Failed to set webhook:', error);
            logger.error('You should run the webhook setup script manually');
            // Don't exit in production
            if (config.nodeEnv !== 'production') {
              process.exit(1);
            }
          });
      } else {
        // Use polling in development mode
        logger.info('Starting bot in polling mode (development)');
        bot.launch()
          .then(() => logger.info('✅ Bot started in polling mode'))
          .catch(error => {
            logger.error('❌ Failed to start bot:', error);
            process.exit(1);
          });
      }
      
      // Set up scheduler for weekly prompts
      if (isConnected) {
        setupScheduler();
        logger.info('✅ Prompt scheduler initialized');
      } else {
        logger.warn('⚠️  Prompt scheduler not initialized due to database connection failure');
      }
    });
    
    // Graceful shutdown handling
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Stop the bot
        if (config.nodeEnv !== 'production') {
          bot.stop('SIGTERM');
          logger.info('Bot stopped');
        }
        
        // Close database connections
        closePool().then(() => {
          logger.info('Database connections closed');
          logger.info('✅ Graceful shutdown complete');
          process.exit(0);
        }).catch(err => {
          logger.error('Error closing database connections:', err);
          process.exit(1);
        });
      });
      
      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      if (config.nodeEnv !== 'production') {
        process.exit(1);
      }
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (config.nodeEnv !== 'production') {
        process.exit(1);
      }
    });
    
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    if (config.nodeEnv !== 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️  Continuing despite startup error (production mode)');
    }
  }
}

// Start the server
startServer().catch(error => {
  logger.error('❌ Fatal error starting server:', error);
  process.exit(1);
});