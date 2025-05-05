// src/controllers/userController.ts
import { Context } from 'telegraf';
import { userService } from '../services/userService';
import { MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import moment from 'moment-timezone';
import config from '../config';
import { handleChooseCommand } from './chooseController';

/**
 * Start command handler
 */
export async function handleStart(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Check if user already exists
    const existingUser = await userService.getUser(userId);
    const isFirstStart = !existingUser;
    
    // Create or get user
    await userService.createOrUpdateUser(userId);
    
    // Send welcome message
    await ctx.reply(MESSAGES.WELCOME);
    logger.info(`Started session for user ${userId} (firstTime: ${isFirstStart})`);
    
    // If this is the first start, also trigger the choose command
    if (isFirstStart) {
      logger.info(`First time user ${userId}, triggering choose command`);
      
      // Add a small delay to ensure welcome message is seen first
      setTimeout(() => {
        handleChooseCommand(ctx);
        
        // After another small delay, introduce the mini app
        setTimeout(async () => {
          // Import dynamically to avoid circular dependencies
          const { handleMiniAppCommand } = require('./miniAppController');
          await handleMiniAppCommand(ctx);
        }, 2000);
      }, 500);
    }
  } catch (error) {
    logger.error('Error in start command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Show timezone command handler
 */
export async function handleShowTimezone(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Get the user's schedule preference
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const scheduleDay = dayNames[user.schedulePreference.day];
    const scheduleHour = user.schedulePreference.hour;
    const scheduleEnabled = user.schedulePreference.enabled;
    
    // Get current Singapore time
    const now = moment().tz(config.timezone);
    const currentDayName = dayNames[now.day()];
    const currentHour = now.hour();
    const currentMinute = now.minute();
    
    // Create a personalized timezone message
    let message = `⏰ *Timezone Information*\n\n`;
    message += `This bot operates on Singapore timezone (${config.timezone}).\n`;
    message += `Current Singapore time: ${now.format('dddd, MMMM D, YYYY HH:mm')}\n\n`;
    
    if (scheduleEnabled) {
      message += `✅ Your prompts are scheduled for *${scheduleDay}s at ${scheduleHour}:00* (Singapore time).\n\n`;
      
      // Calculate time until next prompt
      let nextPromptDay = user.schedulePreference.day;
      let daysToAdd = 0;
      
      // If today is the scheduled day but the hour has passed, next prompt is next week
      if (now.day() === user.schedulePreference.day && 
          (currentHour > scheduleHour || (currentHour === scheduleHour && currentMinute > 0))) {
        daysToAdd = 7;
      } 
      // If today is before the scheduled day, calculate days until that day
      else if (now.day() < user.schedulePreference.day) {
        daysToAdd = user.schedulePreference.day - now.day();
      } 
      // If today is after the scheduled day, calculate days until next week
      else if (now.day() > user.schedulePreference.day) {
        daysToAdd = 7 - (now.day() - user.schedulePreference.day);
      }
      
      // If it's the scheduled day and hour hasn't passed yet
      if (now.day() === user.schedulePreference.day && currentHour < scheduleHour) {
        daysToAdd = 0;
      }
      
      // Calculate next prompt time
      const nextPromptTime = now.clone()
        .add(daysToAdd, 'days')
        .hour(scheduleHour)
        .minute(0)
        .second(0);
      
      // Format the time until next prompt in a human-readable way
      const diffHours = nextPromptTime.diff(now, 'hours');
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      
      if (diffDays > 0) {
        message += `Your next prompt will be sent in approximately *${diffDays} day${diffDays > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours > 1 ? 's' : ''}*.\n`;
      } else {
        message += `Your next prompt will be sent in approximately *${remainingHours} hour${remainingHours > 1 ? 's' : ''}*.\n`;
      }
    } else {
      message += `⚠️ Your weekly prompts are currently *disabled*.\n`;
      message += `Use /schedule_toggle to enable them or /schedule to manage your preferences.\n`;
    }
    
    message += `\nYou can customize your prompt schedule using the /schedule command.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    logger.info(`Showed timezone info to user ${userId}`);
  } catch (error) {
    logger.error('Error in timezone command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Show help command handler
 */
export async function handleShowHelp(ctx: Context): Promise<void> {
  const helpText = MESSAGES.HELP
  /* 
    "\n\nSchedule Management:\n" +
    "• /schedule - View your current prompt schedule\n" +
    "• /schedule_day - Set the day to receive prompts\n" +
    "• /schedule_time - Set the time to receive prompts\n" +
    "• /schedule_toggle - Turn weekly prompts on/off";
  */  
  await ctx.reply(helpText);
  logger.info(`Showed help to user ${ctx.from?.id}`);
}