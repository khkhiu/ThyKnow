// firebase/functions/src/index.ts

import * as functions from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Telegraf } from 'telegraf';
import PromptService from './services/prompt-service';
import UserService from './services/user-service';
import BotHandlers from './handlers/bot-handlers';

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Initialize Telegram bot with token from environment
const bot = new Telegraf(functions.config().telegram.token);
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
    // This is critical for Cloud Run V2
    concurrency: 80,
    minInstances: 0,
    // The function shouldn't timeout quickly
    timeoutSeconds: 60,
  }, 
  async (req, res) => {
    try {
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
    retry: true, // Enable retries
    timeoutSeconds: 540, // 9 minutes
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
    timeoutSeconds: 540, // 9 minutes
  }, 
  async (req, res) => {
    try {
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