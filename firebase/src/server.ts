import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app, { bot } from './app';
import config from './config';
import { setupScheduler } from './services/schedulerService';
import { logger } from './utils/logger';

// Connect to MongoDB
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    logger.info('Connected to MongoDB');
    
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
    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });