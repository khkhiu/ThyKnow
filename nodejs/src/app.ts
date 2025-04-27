// src/app.ts (Updated for Railway)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'; // Add Morgan for logging HTTP requests
import { Telegraf } from 'telegraf';
import { setupBotCommands } from './controllers/index';
import { errorHandler } from './middleware/errorHandler';
import config from './config';
import { logger } from './utils/logger';
import { stream } from './utils/logger';
import dotenv from 'dotenv';
import pubSubRoutes from './routes/pubSubRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Telegram bot instance
export const bot = new Telegraf(config.telegramBotToken);

// Setup middleware
app.use(helmet());
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

// Set up Pub/Sub routes (used for scheduled messages)
app.use('/pubsub', pubSubRoutes);

// Import health check controllers
import { healthCheck } from './controllers/healthController';
import { minimalHealthCheck } from './controllers/minimalHealthCheck';

// Health check endpoints (required for Railway)
app.get('/health', minimalHealthCheck); // Fast endpoint for Railway's health checks
app.get('/health/detailed', healthCheck); // Detailed health check for monitoring

// API version and info endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    name: 'ThyKnow API',
    version: '1.0.0',
    description: 'API for ThyKnow Telegram bot',
    environment: config.nodeEnv
  });
});

// Simple home page
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>ThyKnow - API Server</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>ThyKnow API Server</h1>
          <p>This is the ThyKnow API server. It's working correctly!</p>
          <p>Check <a href="/health">health status</a> or <a href="/api/info">API info</a>.</p>
          <p>To interact with ThyKnow, please visit our <a href="https://t.me/your_bot_username">Telegram Bot</a>.</p>
        </div>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  logger.debug(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process in production, as Railway will just restart it
  if (config.nodeEnv !== 'production') {
    process.exit(1);
  }
});

export default app;