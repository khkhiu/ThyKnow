import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Telegraf } from 'telegraf';
import { setupBotCommands } from './controllers/botController';
import { errorHandler } from './middleware/errorHandler';
import config from './config';
import { logger } from './utils/logger';
import dotenv from 'dotenv';


// Create Express app
const app = express();
dotenv.config();

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

// Then add a new endpoint right after it
app.get('/health-test-prompt', async (req, res) => {
  try {
    const testUserId = process.env.TEST_USER_ID;
    logger.info(`TESTING: Attempting to send a test prompt to user ${testUserId}`);
    
    // Import the function if needed
    const { sendWeeklyPromptToUser } = require('./services/schedulerService');
    
    await sendWeeklyPromptToUser(testUserId);
    logger.info('TESTING: Successfully sent test prompt');
    res.status(200).json({ 
      status: 'ok', 
      message: 'Test prompt sent successfully',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('TESTING: Error sending test prompt:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to send test prompt'
    });
  }
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