// src/index.ts - Improved Bot Webhook
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Telegraf } from 'telegraf';
import PromptService from './services/prompt-service';
import UserService from './services/user-service';
import BotHandlers from './handlers/bot-handlers';
import { onSchedule, ScheduleOptions } from 'firebase-functions/v2/scheduler';
import { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { TIMEZONE, WEEKLY_PROMPT } from './constants';
import * as dotenv from 'dotenv';

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Load environment variables early in the execution flow
dotenv.config();
// For debugging
console.log('Environment variables loaded:', process.env.TELEGRAM_BOT_TOKEN ? 'Token found' : 'Token NOT found');
// Use environment variable instead of functions.config()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Add error handling for bot
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('An error occurred while processing your message. Please try again.').catch(console.error);
});

const botHandlers = new BotHandlers(userService, promptService);

// Set up bot commands
bot.start(botHandlers.start);
bot.command('prompt', botHandlers.sendPrompt);
bot.command('history', botHandlers.showHistory);
bot.command('timezone', botHandlers.showTimezone);
bot.command('help', botHandlers.showHelp);

// Register commands with Telegram for better user experience
bot.telegram.setMyCommands([
  { command: 'start', description: 'Initialize the bot and get started' },
  { command: 'prompt', description: 'Get a new reflection prompt' },
  { command: 'history', description: 'View your recent journal entries' },
  { command: 'timezone', description: 'Check prompt timings' },
  { command: 'help', description: 'Show available commands and usage' }
]).catch(err => console.error('Failed to set commands:', err));

// Handle text messages (for journal responses) with improved error handling
bot.on('text', async (ctx, next) => {
  try {
    await botHandlers.handleResponse(ctx);
  } catch (error) {
    console.error('Error handling text message:', error);
    ctx.reply('Sorry, there was an error processing your message. Please try again.').catch(console.error);
  }
  return next();
});

// Set up cloud function for webhook with improved error handling
export const botWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Manual trigger for sending weekly prompts (for testing)
export const manualTriggerWeeklyPrompts = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    // Optional: Add authentication for this endpoint
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      res.status(401).send('Unauthorized');
      return;
    }
    
    // Trigger weekly prompts
    const users = await userService.getAllUsers();
    console.log(`Sending prompts to ${users.length} users`);
    
    const results = await Promise.allSettled(
      users.map(user => botHandlers.sendWeeklyPromptToUser(user.id, bot))
    );
    
    // Analyze results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    res.status(200).json({ 
      message: 'Weekly prompts triggered',
      stats: {
        total: users.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error in manual trigger:', error);
    res.status(500).send('Error triggering weekly prompts');
  }
});

const scheduleOptions: ScheduleOptions = {
  schedule: `0 ${WEEKLY_PROMPT.HOUR} * * ${WEEKLY_PROMPT.DAY}`,
  timeZone: TIMEZONE,
  retryCount: 3 // Retry up to 3 times if the function fails
};

// Using Firebase Functions v2 scheduler with correct return type
export const weeklyPromptScheduler = onSchedule(
  scheduleOptions, 
  async (event: ScheduledEvent): Promise<void> => {
    try {
      console.log('Starting weekly prompt job via scheduler');
      
      // Get all users
      const users = await userService.getAllUsers();
      console.log(`Sending prompts to ${users.length} users`);
      
      // Process in batches to avoid timeouts
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}`);
        
        const sendPromises = batch.map(user => 
          botHandlers.sendWeeklyPromptToUser(user.id, bot)
            .catch(err => {
              console.error(`Error sending prompt to user ${user.id}:`, err);
              return { userId: user.id, error: err.message };
            })
        );
        
        await Promise.all(sendPromises);
      }
      
      console.log('Completed weekly prompt job');
      // Don't return null - either return nothing (implicit void) or return Promise<void>
    } catch (error) {
      console.error('Error in weekly prompt job:', error);
      throw error; // Rethrowing will trigger retries if configured
    }
  }
 
)