// src/server.ts
// Server startup with improved Railway webhook configuration

import dotenv from 'dotenv';
dotenv.config();

import app, { bot } from './app';
import config from './config';
import { setupScheduler } from './services/schedulerService';
import { logger } from './utils/logger';
import { initDatabase, checkDatabaseConnection, closePool } from './database';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get the correct webhook URL for Railway
function getWebhookUrl(): string {
  // Priority: 1. Custom domain 2. Public domain 3. Static URL 4. Fallback to baseUrl
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

// Log environment information
function logEnvironmentInfo() {
  logger.info('=== Environment Info ===');
  logger.info(`Node Environment: ${config.nodeEnv}`);
  logger.info(`Timezone: ${config.timezone}`);
  logger.info(`Server Port: ${config.port}`);
  
  // Log Railway-specific variables
  if (process.env.RAILWAY_SERVICE_NAME) {
    logger.info('Running on Railway platform');
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
  
  logger.info('======================');
}

// Main function to start the server
async function startServer() {
  try {
    // Log startup and environment info
    logger.info('Starting ThyKnow server...');
    logEnvironmentInfo();
    
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
          logger.warn(`Database connection attempt ${retryCount}/${maxRetries} failed. Retrying in ${Math.round(retryDelay/1000)} seconds...`);
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
      logger.info(`Server running on port ${config.port}`);
      
      // Set up bot webhook or polling based on environment
      if (config.nodeEnv === 'production') {
        // Get the correct webhook URL for Railway
        const webhookUrl = getWebhookUrl();
        logger.info(`Setting webhook URL to: ${webhookUrl}`);
        
        bot.telegram.setWebhook(webhookUrl)
          .then(() => logger.info(`Webhook set to ${webhookUrl}`))
          .catch(error => {
            logger.error('Failed to set webhook:', error);
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
          .then(() => logger.info('Bot started in polling mode'))
          .catch(error => {
            logger.error('Failed to start bot:', error);
            process.exit(1);
          });
      }
      
      // Set up scheduler for weekly prompts
      if (isConnected) {
        setupScheduler();
        logger.info('Prompt scheduler initialized');
      } else {
        logger.warn('Prompt scheduler not initialized due to database connection failure');
      }
    });
    
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down server...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        closePool().then(() => {
          logger.info('Database connections closed');
          process.exit(0);
        }).catch(err => {
          logger.error('Error closing database connections:', err);
          process.exit(1);
        });
      });
      
      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Error starting server:', error);
    if (config.nodeEnv !== 'production') {
      process.exit(1);
    } else {
      logger.warn('Continuing despite startup error (production mode)');
    }
  }
}

// Start the server
startServer();