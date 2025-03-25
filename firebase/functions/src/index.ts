// firebase/functions/src/index.ts

import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Telegraf } from 'telegraf';
import PromptService from './services/prompt-service';
import UserService from './services/user-service';
import BotHandlers from './handlers/bot-handlers';
import ScheduleHandlers from './handlers/schedule-handlers';
import { TIMEZONE } from './constants';

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Initialize services
const userService = new UserService(db);
const promptService = new PromptService(db);

// Initialize Telegram bot
const bot = new Telegraf(functions.config().telegram.token);
const botHandlers = new BotHandlers(userService, promptService);
const scheduleHandlers = new ScheduleHandlers(userService);

// Set up bot commands
bot.start(botHandlers.start);
bot.command('prompt', botHandlers.sendPrompt);
bot.command('history', botHandlers.showHistory);
bot.command('timezone', botHandlers.showTimezone);
bot.command('help', botHandlers.showHelp);

// Add new schedule commands
bot.command('schedule', scheduleHandlers.setupSchedule);
bot.command('toggle_prompts', scheduleHandlers.togglePrompts);
bot.command('mySchedule', scheduleHandlers.showSchedule);

// Handle text messages (for journal responses)
bot.on('text', botHandlers.handleResponse);

// Handle callback queries for inline buttons
bot.on('callback_query', scheduleHandlers.handleScheduleCallback);

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

// Scheduled function to check and send prompts every hour
export const hourlyPromptCheck = onSchedule({ 
  schedule: '0 * * * *',  // Run every hour at minute 0
  timeZone: TIMEZONE 
}, async (event: ScheduledEvent): Promise<void> => {
  try {
    console.log('Starting hourly prompt check');
    
    // Get current hour and day in Singapore timezone
    const now = new Date();
    const sgTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const currentHour = sgTime.getHours();
    const currentDay = sgTime.getDay(); // 0-6, Sunday-Saturday
    
    console.log(`Current time in ${TIMEZONE}: Day ${currentDay}, Hour ${currentHour}`);
    
    // Get all users who should receive prompts at this hour/day
    const eligibleUsers = await userService.getUsersDueForPrompt(currentHour, currentDay);
    console.log(`Found ${eligibleUsers.length} users scheduled for prompts now`);
    
    // Send prompts to eligible users
    const sendPromises = eligibleUsers.map(user => 
      botHandlers.sendWeeklyPromptToUser(user.id, bot)
    );
    
    await Promise.all(sendPromises);
    console.log('Completed hourly prompt check');
  } catch (error) {
    console.error('Error in hourly prompt check:', error);
  }
});