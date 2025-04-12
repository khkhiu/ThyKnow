// File: src/server.ts
// Server startup with PostgreSQL initialization

import dotenv from 'dotenv';
dotenv.config();

import app, { bot } from './app';
import config from './config';
import { setupScheduler } from './services/schedulerService';
import { logger } from './utils/logger';
import { initDatabase, checkDatabaseConnection, closePool } from './database';

// Main function to start the server
async function startServer() {
  try {
    // Initialize and connect to PostgreSQL
    logger.info('Connecting to PostgreSQL database...');
    await initDatabase();
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      logger.error('Failed to connect to PostgreSQL database');
      process.exit(1);
    }
    
    logger.info('Connected to PostgreSQL database');
    
    // Start the Express server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      
      // Set up bot webhook if in production
      if (config.nodeEnv === 'production') {
        const webhookUrl = `${config.baseUrl}/webhook`;
        bot.telegram.setWebhook(webhookUrl)
          .then(() => logger.info(`Webhook set to ${webhookUrl}`))
          .catch(error => logger.error('Failed to set webhook:', error));
      } else {
        // Use polling in development mode
        bot.launch()
          .then(() => logger.info('Bot started in polling mode'))
          .catch(error => logger.error('Failed to start bot:', error));
      }
      
      // Set up scheduler for weekly prompts
      setupScheduler();
    });
    
    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        closePool().then(() => {
          logger.info('Database connections closed');
          process.exit(0);
        });
      });
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();