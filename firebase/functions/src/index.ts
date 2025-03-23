import * as functions from 'firebase-functions';
import { onSchedule, ScheduleOptions } from 'firebase-functions/v2/scheduler';
import { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Telegraf } from 'telegraf';
import PromptService from './services/prompt-service';
import UserService from './services/user-service';
import BotHandlers from './handlers/bot-handlers';
import { TIMEZONE, WEEKLY_PROMPT } from './constants';
import './utils/env'; // Load environment variables

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Get bot token from environment or Firebase config
const getBotToken = (): string => {
  // For local development with .env file
  if (process.env.TELEGRAM_BOT_TOKEN) {
    return process.env.TELEGRAM_BOT_TOKEN;
  }
  
  // For deployed functions or local emulator with firebase config
  try {
    return functions.config().telegram.token;
  } catch (error) {
    console.error('Bot token not found in config:', error);
    throw new Error('Telegram bot token not configured. Set it with firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"');
  }
};

// Initialize Telegram bot
const bot = new Telegraf(getBotToken());
const botHandlers = new BotHandlers(userService, promptService);

// Set up bot commands
bot.start(botHandlers.start);
bot.command('prompt', botHandlers.sendPrompt);
bot.command('history', botHandlers.showHistory);
bot.command('timezone', botHandlers.showTimezone);
bot.command('help', botHandlers.showHelp);

// Handle text messages (for journal responses)
bot.on('text', botHandlers.handleResponse);

// Set up cloud function for webhook
export const botWebhook = functions.https.onRequest(async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).send('Error');
  }
});

// For local development - start the bot in polling mode when running the script directly
if (require.main === module) {
  const startPolling = async () => {
    console.log('Starting bot in polling mode for local development...');
    try {
      // Register bot commands with Telegram
      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'prompt', description: 'Get a new reflection prompt' },
        { command: 'history', description: 'View your recent journal entries' },
        { command: 'timezone', description: 'Check prompt timings' },
        { command: 'help', description: 'Show all available commands' }
      ]);
      
      // Launch bot in polling mode
      await bot.launch();
      console.log('Bot started successfully in polling mode');
      
      // Enable graceful stop
      process.once('SIGINT', () => bot.stop('SIGINT'));
      process.once('SIGTERM', () => bot.stop('SIGTERM'));
    } catch (error) {
      console.error('Error starting bot in polling mode:', error);
    }
  };
  
  startPolling();
}

// Scheduled function to send weekly prompts (Mondays at 9 AM Singapore time)
const scheduleOptions: ScheduleOptions = {
  schedule: `0 ${WEEKLY_PROMPT.HOUR} * * ${WEEKLY_PROMPT.DAY}`,
  timeZone: TIMEZONE
};

export const sendWeeklyPrompts = onSchedule(scheduleOptions, async (event: ScheduledEvent): Promise<void> => {
  try {
    console.log('Starting weekly prompt job');
    
    // Get all users
    const users = await userService.getAllUsers();
    console.log(`Sending prompts to ${users.length} users`);
    
    const sendPromises = users.map(user => 
      botHandlers.sendWeeklyPromptToUser(user.id, bot)
    );
    
    await Promise.all(sendPromises);
    console.log('Completed weekly prompt job');
  } catch (error) {
    console.error('Error in weekly prompt job:', error);
  }
});