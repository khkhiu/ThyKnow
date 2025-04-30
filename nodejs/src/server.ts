// src/server.ts
// Server startup optimized for Railway with improved error handling

import dotenv from 'dotenv';
dotenv.config();

import app, { bot } from './app';
import config from './config';
import { setupScheduler } from './services/schedulerService';
import { logger } from './utils/logger';
import { initDatabase, checkDatabaseConnection, closePool } from './database';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to start the server
async function startServer() {
  try {
    // Log startup info
    logger.info(`Starting ThyKnow server in ${config.nodeEnv} mode`);
    logger.info(`Using timezone: ${config.timezone}`);
    
    // Log database configuration (sanitized)
    logger.info(`Database host: ${config.postgresql.host}`);
    logger.info(`Database name: ${config.postgresql.database}`);
    logger.info(`SSL enabled: ${Boolean(config.postgresql.ssl)}`);
    
    // Initialize and connect to PostgreSQL with retry logic for Railway startup
    logger.info('Connecting to PostgreSQL database...');
    
    let isConnected = false;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (!isConnected && retryCount < maxRetries) {
      try {
        await initDatabase();
        isConnected = await checkDatabaseConnection();
        
        if (isConnected) {
          logger.info('Connected to PostgreSQL database successfully');
        } else {
          retryCount++;
          logger.warn(`Database connection attempt ${retryCount}/${maxRetries} failed. Retrying...`);
          await delay(5000); // Wait 5 seconds before retry
        }
      } catch (error) {
        retryCount++;
        logger.error(`Database connection attempt ${retryCount}/${maxRetries} failed with error:`, error);
        await delay(5000); // Wait 5 seconds before retry
      }
    }
    
    if (!isConnected) {
      logger.error(`Failed to connect to PostgreSQL database after ${maxRetries} attempts`);
      // In production (Railway), we'll continue and hope the database connects later
      if (config.nodeEnv !== 'production') {
        process.exit(1);
      } else {
        logger.warn('Continuing startup despite database connection failure (production mode)');
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
      
      // Set up scheduler for weekly prompts
      setupScheduler();
      logger.info('Prompt scheduler initialized');
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