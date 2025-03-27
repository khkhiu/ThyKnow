// firebase/functions/src/index.ts

import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Telegraf } from 'telegraf';
import PromptService from './services/prompt-service';
import UserService from './services/user-service';
import BotHandlers from './handlers/bot-handlers';
import { startHealthCheckServer } from './health-server';

// Start the health check server for Cloud Run
startHealthCheckServer();

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Define secret for Telegram bot token (V2 way of handling secrets)
const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');

// Initialize Telegram bot
// For local development/testing, fallback to using functions.config()
let botToken = '';
try {
  botToken = process.env.TELEGRAM_BOT_TOKEN || functions.config().telegram?.token || '';
} catch (error) {
  console.warn('Using fallback for bot token');
}

const bot = new Telegraf(botToken);
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
export const botWebhook = onRequest(
  {
    region: 'us-central1',
    cors: true,
    // Cloud Run V2 settings
    concurrency: 80,
    minInstances: 0,
    maxInstances: 10,
    // Extended timeout and memory
    timeoutSeconds: 60,
    memory: '256MiB',
    // Secrets configuration
    secrets: [telegramBotToken]
  }, 
  async (req, res) => {
    try {
      // For health checks
      if (req.path === '/health' || (req.path === '/' && req.method === 'GET')) {
        res.status(200).send({ status: 'healthy' });
        return;
      }

      // Process Telegram webhook
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error in webhook handler:', error);
      res.status(500).send('Error');
    }
  }
);

// Pub/Sub topic handler for weekly prompts
export const weeklyPromptPubSub = onMessagePublished(
  {
    topic: 'weekly-prompts', // This is the Pub/Sub topic name
    region: 'us-central1',
    // Cloud Run V2 settings
    concurrency: 1, // Limit concurrent executions to prevent duplicate sends
    memory: '256MiB',
    retry: true, // Enable retries
    timeoutSeconds: 540, // 9 minutes
    // Secrets configuration
    secrets: [telegramBotToken]
  },
  async (event) => {
    try {
      console.log('Starting weekly prompt job from Pub/Sub trigger');
      
      // Get all users
      const users = await userService.getAllUsers();
      console.log(`Sending prompts to ${users.length} users`);
      
      const sendPromises = users.map(user => 
        botHandlers.sendWeeklyPromptToUser(user.id, bot)
      );
      
      await Promise.all(sendPromises);
      console.log('Completed weekly prompt job');
    } catch (error) {
      console.error('Error in weekly prompt Pub/Sub handler:', error);
      throw error; // Re-throw to indicate failure for retries
    }
  }
);

// Optional HTTP trigger for testing weekly prompts manually
export const manualTriggerWeeklyPrompts = onRequest(
  {
    region: 'us-central1',
    cors: true, 
    // Cloud Run V2 settings
    concurrency: 1,
    memory: '256MiB',
    timeoutSeconds: 540, // 9 minutes
    // Secrets configuration
    secrets: [telegramBotToken]
  }, 
  async (req, res) => {
    try {
      // For health checks
      if (req.path === '/health' || (req.path === '/' && req.method === 'GET')) {
        res.status(200).send({ status: 'healthy' });
        return;
      }

      console.log('Manual trigger for weekly prompts');
      
      // Get all users
      const users = await userService.getAllUsers();
      console.log(`Sending prompts to ${users.length} users`);
      
      const sendPromises = users.map(user => 
        botHandlers.sendWeeklyPromptToUser(user.id, bot)
      );
      
      await Promise.all(sendPromises);
      
      res.status(200).send({ 
        success: true, 
        message: `Prompts sent to ${users.length} users` 
      });
    } catch (error) {
      console.error('Error in manual trigger handler:', error);
      res.status(500).send({ 
        success: false, 
        error: String(error) 
      });
    }
  }
);