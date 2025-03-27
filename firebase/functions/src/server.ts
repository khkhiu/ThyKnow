// src/server.ts - A standalone Express.js server for Cloud Run deployment

import express from 'express';
import { Telegraf } from 'telegraf';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import UserService from './services/user-service';
import PromptService from './services/prompt-service';
import BotHandlers from './handlers/bot-handlers';
import ScheduleHandlers from './handlers/schedule-handlers';

// Load environment variables
dotenv.config();

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Initialize Express app
const app = express();
app.use(express.json());

// Get bot token from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

// Initialize Telegram bot
const bot = new Telegraf(botToken);
const botHandlers = new BotHandlers(userService, promptService);
const scheduleHandlers = new ScheduleHandlers(userService);

// Set up bot commands
bot.start(botHandlers.start);
bot.command('prompt', botHandlers.sendPrompt);
bot.command('history', botHandlers.showHistory);
bot.command('timezone', botHandlers.showTimezone);
bot.command('help', botHandlers.showHelp);
bot.command('schedule', scheduleHandlers.handleScheduleCommand);

// Handle text messages
bot.on('text', botHandlers.handleResponse);

// Set up webhook endpoint
app.post('/botWebhook', (req, res) => {
  bot.handleUpdate(req.body, res)
    .then(() => res.status(200).send('OK'))
    .catch(err => {
      console.error('Error in webhook handler:', err);
      res.status(500).send('Error processing webhook');
    });
});

// Set up manual trigger endpoint (protected by API key)
app.post('/manualTriggerWeeklyPrompts', async (req, res) => {
  try {
    // Optional: Add authentication for this endpoint
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      res.status(401).send('Unauthorized');
      return;
    }
    
    // Get all users
    const users = await userService.getAllUsers();
    console.log(`Sending prompts to ${users.length} users`);
    
    // Process in batches to avoid timeouts
    const batchSize = 50;
    const results: Record<string, any>[] = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}`);
      
      const sendPromises = batch.map(user => 
        botHandlers.sendWeeklyPromptToUser(user.id, bot)
          .then(() => ({ userId: user.id, success: true }))
          .catch(err => {
            console.error(`Error sending prompt to user ${user.id}:`, err);
            return { userId: user.id, success: false, error: err.message };
          })
      );
      
      const batchResults = await Promise.all(sendPromises);
      results.push(...batchResults);
    }
    
    // Analyze results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.status(200).json({ 
      message: 'Weekly prompts triggered',
      stats: {
        total: users.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    console.error('Error in manual trigger:', error);
    res.status(500).json({
      error: 'Error triggering weekly prompts',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Thyknow Bot running');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});