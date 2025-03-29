import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Telegraf } from 'telegraf';
import { setupBotCommands } from './controllers/botController';
import { errorHandler } from './middleware/errorHandler';
import config from './config';
import { logger } from './utils/logger';

// Create Express app
const app = express();

// Create Telegram bot instance
export const bot = new Telegraf(config.telegramBotToken);

// Setup middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup bot commands and handlers
setupBotCommands(bot);

// Set up webhook endpoint for Telegram
app.use('/webhook', express.json(), (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;