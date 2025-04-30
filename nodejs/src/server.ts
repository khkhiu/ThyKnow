// src/server.ts
// Server startup optimized for Railway with improved diagnostics

import dotenv from 'dotenv';
dotenv.config();

import app, { bot } from './app';
import config from './config';
import { setupScheduler } from './services/schedulerService';
import { logger } from './utils/logger';
import { initDatabase, checkDatabaseConnection, closePool } from './database';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Print Railway-specific environment information for debugging
function logRailwayEnvironment() {
  logger.info('=== Railway Environment Variables ===');
  // List important environment variables for Railway
  const railwayVars = [
    'PORT',
    'RAILWAY_STATIC_URL', 
    'RAILWAY_PUBLIC_DOMAIN',
    'RAILWAY_SERVICE_NAME',
    'RAILWAY_PROJECT_NAME',
    'RAILWAY_ENVIRONMENT_NAME',
    'NODE_ENV'
  ];
  
  for (const varName of railwayVars) {
    logger.info(`${varName}: ${process.env[varName] || 'not set'}`);
  }
  
  // Log if DATABASE_URL exists (without showing the actual value for security)
  logger.info(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      logger.info(`Database host: ${url.hostname}`);
      logger.info(`Database port: ${url.port}`);
      logger.info(`Database name: ${url.pathname.substring(1)}`);
      logger.info(`Database user: ${url.username}`);
      // Don't log password
    } catch (error) {
      logger.error('Error parsing DATABASE_URL:', error);
    }
  }
  logger.info('=====================================');
}

// Main function to start the server
async function startServer() {
  try {
    // Log startup info
    logger.info(`Starting ThyKnow server in ${config.nodeEnv} mode`);
    logger.info(`Using timezone: ${config.timezone}`);
    
    // Log Railway-specific environment info
    if (process.env.RAILWAY_SERVICE_NAME) {
      logger.info('Running on Railway platform');
      logRailwayEnvironment();
    }
    
    // Initialize and connect to PostgreSQL with retry logic for Railway startup
    logger.info('Connecting to PostgreSQL database...');
    
    let isConnected = false;
    let retryCount = 0;
    const maxRetries = 10; // Increase max retries
    const initialRetryDelay = 5000; // Initial delay of 5 seconds
    
    while (!isConnected && retryCount < maxRetries) {
      try {
        // First check if we can connect before trying to initialize
        isConnected = await checkDatabaseConnection();
        
        if (isConnected) {
          logger.info('Connected to PostgreSQL database successfully');
          // Now initialize the database schema
          await initDatabase();
          logger.info('Database schema initialized successfully');
        } else {
          retryCount++;
          // Exponential backoff with randomization
          const retryDelay = initialRetryDelay * Math.pow(1.5, retryCount - 1) 
            * (0.9 + Math.random() * 0.2); // Add ±10% jitter
          
          logger.warn(`Database connection attempt ${retryCount}/${maxRetries} failed. Retrying in ${Math.round(retryDelay/1000)} seconds...`);
          await delay(retryDelay);
        }
      } catch (error) {
        retryCount++;
        // Exponential backoff with randomization
        const retryDelay = initialRetryDelay * Math.pow(1.5, retryCount - 1) 
          * (0.9 + Math.random() * 0.2); // Add ±10% jitter
        
        logger.error(`Database connection attempt ${retryCount}/${maxRetries} failed with error:`, error);
        logger.warn(`Retrying in ${Math.round(retryDelay/1000)} seconds...`);
        await delay(retryDelay);
      }
    }
    
    if (!isConnected) {
      logger.error(`Failed to connect to PostgreSQL database after ${maxRetries} attempts`);
      // In production (Railway), we'll continue without DB for minimal health checks
      if (config.nodeEnv !== 'production') {
        process.exit(1);
      } else {
        logger.warn('*** CONTINUING STARTUP DESPITE DATABASE CONNECTION FAILURE (PRODUCTION MODE) ***');
        logger.warn('The application will run with limited functionality');
      }
    }
    
    // Start the Express server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      
      // Set up bot webhook if in production
      if (config.nodeEnv === 'production') {
        const webhookUrl = `${config.baseUrl}/webhook`;
        logger.info(`Setting webhook URL to: ${webhookUrl}`);
        
        bot.telegram.setWebhook(webhookUrl)
          .then(() => logger.info(`Webhook set to ${webhookUrl}`))
          .catch(error => {
            logger.error('Failed to set webhook:', error);
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
      
      // Set up scheduler for weekly prompts only if database is connected
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
      
      // First stop accepting new requests
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Then close database connections
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
    
    // Handle various termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Error starting server:', error);
    // In production, log the error but don't terminate
    if (config.nodeEnv !== 'production') {
      process.exit(1);
    } else {
      logger.warn('Continuing despite startup error (production mode)');
    }
  }
}

// Start the server
startServer();