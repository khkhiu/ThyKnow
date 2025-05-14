// src/controllers/scheduleController.ts
import { Context, NarrowedContext } from 'telegraf';
import { Update, CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { userService } from '../services/userService';
import { logger } from '../utils/logger';
import moment from 'moment-timezone';
import config from '../config';

// Define a type for callback query context
type CallbackContext = NarrowedContext<Context, Update.CallbackQueryUpdate>;

/**
 * Handle the /schedule command
 */
export async function handleScheduleCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    let user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Show current schedule setting
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[user.schedulePreference.day];
    const currentHour = user.schedulePreference.hour;
    const currentEnabled = user.schedulePreference.enabled;
    
    const statusText = currentEnabled ? "enabled" : "disabled";
    
    // Get current Singapore time
    const now = moment().tz(config.timezone);
    const currentDayName = dayNames[now.day()];
    const currentHour24 = now.hour();
    const currentMinute = now.minute();
    
    // Calculate time until next prompt
    let nextPromptDay = user.schedulePreference.day;
    let daysToAdd = 0;
    
    // If today is the scheduled day but the hour has passed, next prompt is next week
    if (now.day() === user.schedulePreference.day && 
        (currentHour24 > currentHour || (currentHour24 === currentHour && currentMinute > 0))) {
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
    if (now.day() === user.schedulePreference.day && currentHour24 < currentHour) {
      daysToAdd = 0;
    }
    
    // Calculate next prompt time
    const nextPromptTime = now.clone()
      .add(daysToAdd, 'days')
      .hour(currentHour)
      .minute(0)
      .second(0);
    
    // Format the time until next prompt in a human-readable way
    const diffHours = nextPromptTime.diff(now, 'hours');
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    // Create the message with timezone info included - fix Markdown formatting
    let message = 
      `📅 Your current prompt schedule:\n\n` +
      `Day: ${currentDay}\n` +
      `Time: ${currentHour}:00\n` +
      `Status: ${statusText}\n\n` +
      `⏰ Timezone Information\n` +
      `This bot operates on ${config.timezone} timezone.\n` +
      `Current time: ${now.format('dddd, MMMM D, YYYY HH:mm')}\n\n`;
    
    if (currentEnabled) {
      if (diffDays > 0) {
        message += `Your next prompt will be sent in approximately ${diffDays} day${diffDays > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.\n\n`;
      } else {
        message += `Your next prompt will be sent in approximately ${remainingHours} hour${remainingHours > 1 ? 's' : ''}.\n\n`;
      }
    } else {
      message += `⚠️ Your weekly prompts are currently disabled.\n`;
      message += `Use /schedule_toggle to enable them.\n\n`;
    }
    
    message += 
      `To change your schedule, use one of these commands:\n\n` +
      `/schedule_day - Set the day of the week\n` +
      `/schedule_time - Set the hour of the day\n` +
      `/schedule_toggle - Turn weekly prompts on/off`;
    
    // Send without Markdown to avoid parsing errors
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in schedule command:', error);
    await ctx.reply('Sorry, there was an error checking your schedule. Please try again later.');
  }
}

/**
 * Handle the /schedule_day command
 */
export async function handleScheduleDayCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    let user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Create keyboard with days of the week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const keyboard = dayNames.map((day, index) => {
      // Create a callback button for each day
      return [{
        text: day,
        callback_data: `set_day:${index}`
      }];
    });
    
    await ctx.reply(
      'Select a day to receive your weekly prompts:',
      {
        reply_markup: {
          inline_keyboard: keyboard
        }
      }
    );
    
  } catch (error) {
    logger.error('Error in schedule_day command:', error);
    await ctx.reply('Sorry, there was an error. Please try again later.');
  }
}

/**
 * Handle the /schedule_time command
 */
export async function handleScheduleTimeCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    let user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Create keyboard with hours (0-23)
    const keyboard = [];
    for (let i = 0; i < 24; i += 4) {
      const row = [];
      for (let j = 0; j < 4 && i + j < 24; j++) {
        const hour = i + j;
        row.push({
          text: `${hour}:00`,
          callback_data: `set_time:${hour}`
        });
      }
      keyboard.push(row);
    }
    
    await ctx.reply(
      'Select the hour to receive your weekly prompts (in 24-hour format):',
      {
        reply_markup: {
          inline_keyboard: keyboard
        }
      }
    );
    
  } catch (error) {
    logger.error('Error in schedule_time command:', error);
    await ctx.reply('Sorry, there was an error. Please try again later.');
  }
}

/**
 * Handle the /schedule_toggle command
 */
export async function handleScheduleToggleCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    let user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Toggle current status
    const currentStatus = user.schedulePreference.enabled;
    const newStatus = !currentStatus;
    
    // Update user preference
    await userService.updateSchedulePreference(userId, { enabled: newStatus });
    
    const statusMessage = newStatus 
      ? "Weekly prompts are now enabled." 
      : "Weekly prompts are now disabled.";
    
    await ctx.reply(`✅ ${statusMessage}`);
    
  } catch (error) {
    logger.error('Error in schedule_toggle command:', error);
    await ctx.reply('Sorry, there was an error. Please try again later.');
  }
}

/**
 * Handle callback queries for schedule settings
 */
export async function handleScheduleCallback(ctx: CallbackContext): Promise<void> {
  try {
    // Safety check for ctx.from
    if (!ctx.from) {
      logger.error('User data missing from callback query');
      await ctx.answerCbQuery('Error: User data missing');
      return;
    }
    
    const userId = ctx.from.id.toString();
    
    // Cast to DataQuery type to access the data property
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    
    if (!callbackQuery.data || !callbackQuery.data.includes(':')) {
      await ctx.answerCbQuery('Invalid callback data');
      return;
    }
    
    const [action, value] = callbackQuery.data.split(':');
    const user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.answerCbQuery('User not found');
      return;
    }
    
    // Handle day selection
    if (action === 'set_day') {
      const day = parseInt(value, 10);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Update user with new day preference
      await userService.updateSchedulePreference(userId, { day });
      
      await ctx.answerCbQuery(`Day set to ${dayNames[day]}`);
      await ctx.editMessageText(`✅ You will receive prompts on ${dayNames[day]} at ${user.schedulePreference.hour}:00.`);
    }
    
    // Handle time selection
    if (action === 'set_time') {
      const hour = parseInt(value, 10);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Update user with new hour preference
      await userService.updateSchedulePreference(userId, { hour });
      
      await ctx.answerCbQuery(`Time set to ${hour}:00`);
      await ctx.editMessageText(`✅ You will receive prompts on ${dayNames[user.schedulePreference.day]} at ${hour}:00.`);
    }
    
  } catch (error) {
    logger.error('Error handling callback query:', error);
    await ctx.answerCbQuery('Sorry, an error occurred');
  }
}