// firebase/src/controllers/botController.ts
import { Context, Telegraf, NarrowedContext } from 'telegraf';
import { Update, Message, CallbackQuery } from 'telegraf/typings/core/types/typegram';
import moment from 'moment-timezone';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { FEEDBACK, MESSAGES, TIMEZONE } from '../constants';
import { logger } from '../utils/logger';
import config from '../config';

// Define a type for callback query context
type CallbackContext = NarrowedContext<Context, Update.CallbackQueryUpdate>;

/**
 * Start command handler
 */
async function handleStart(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Create or get user
    await userService.createOrUpdateUser(userId);
    
    // Send welcome message
    await ctx.reply(MESSAGES.WELCOME);
    logger.info(`Started session for user ${userId}`);
  } catch (error) {
    logger.error('Error in start command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Send prompt command handler
 */
async function handleSendPrompt(ctx: Context): Promise<void> {
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
    
    // Get next prompt for this user
    const prompt = await promptService.getNextPromptForUser(userId);
    
    // Save current prompt to user's data
    await userService.saveLastPrompt(userId, prompt);
    
    // Determine category emoji and name
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    await ctx.reply(
      `${categoryEmoji} ${categoryName} Reflection:\n\n${prompt.text}\n\n` +
      "Take your time to reflect and respond when you're ready. " +
      "Your response will be saved in your journal.\n\n" +
      "You can use other commands like /history while thinking - " +
      "just reply directly to this message when you're ready."
    );
    
    logger.info(`Sent prompt to user ${userId}`);
  } catch (error) {
    logger.error('Error in prompt command:', error);
    await ctx.reply('Sorry, there was an error getting your prompt. Please try again.');
  }
}

/**
 * Show history command handler
 */
async function handleShowHistory(ctx: Context): Promise<void> {
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
    
    const entries = await userService.getRecentEntries(userId, config.maxHistory);
    
    if (entries.length === 0) {
      await ctx.reply(MESSAGES.NO_HISTORY);
      return;
    }
    
    let historyText = "📖 Your Recent Journal Entries:\n\n";
    
    for (const entry of entries) {
      const date = moment(entry.timestamp).tz(config.timezone).format('YYYY-MM-DD HH:mm');
      historyText += `📅 ${date}\n`;
      historyText += `Q: ${entry.prompt}\n`;
      historyText += `A: ${entry.response}\n\n`;
    }
    
    // Split message if it's too long
    if (historyText.length > 4000) {
      const chunks = [];
      for (let i = 0; i < historyText.length; i += 4000) {
        chunks.push(historyText.substring(i, i + 4000));
      }
      
      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    } else {
      await ctx.reply(historyText);
    }
    
    logger.info(`Showed history to user ${userId}`);
  } catch (error) {
    logger.error('Error in history command:', error);
    await ctx.reply('Sorry, there was an error retrieving your history. Please try again.');
  }
}

/**
 * Show timezone command handler
 */
async function handleShowTimezone(ctx: Context): Promise<void> {
  await ctx.reply(MESSAGES.TIMEZONE);
  logger.info(`Showed timezone info to user ${ctx.from?.id}`);
}

/**
 * Show help command handler
 */
async function handleShowHelp(ctx: Context): Promise<void> {
  const helpText = MESSAGES.HELP + 
    "\n\nSchedule Management:\n" +
    "• /schedule - View your current prompt schedule\n" +
    "• /schedule_day - Set the day to receive prompts\n" +
    "• /schedule_time - Set the time to receive prompts\n" +
    "• /schedule_toggle - Turn weekly prompts on/off";
    
  await ctx.reply(helpText);
  logger.info(`Showed help to user ${ctx.from?.id}`);
}

/**
 * Handle the /schedule command
 */
async function handleScheduleCommand(ctx: Context): Promise<void> {
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
    
    const message = 
      `📅 Your current prompt schedule:\n\n` +
      `Day: ${currentDay}\n` +
      `Time: ${currentHour}:00\n` +
      `Status: ${statusText}\n\n` +
      `To change your schedule, use one of these commands:\n\n` +
      `/schedule_day - Set the day of the week\n` +
      `/schedule_time - Set the hour of the day\n` +
      `/schedule_toggle - Turn weekly prompts on/off`;
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in schedule command:', error);
    await ctx.reply('Sorry, there was an error checking your schedule. Please try again later.');
  }
}

/**
 * Handle the /schedule_day command
 */
async function handleScheduleDayCommand(ctx: Context): Promise<void> {
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
async function handleScheduleTimeCommand(ctx: Context): Promise<void> {
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
async function handleScheduleToggleCommand(ctx: Context): Promise<void> {
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
async function handleCallbackQuery(ctx: CallbackContext): Promise<void> {
  
  try {
    // Safety check for ctx.from
    if (!ctx.from) {
      logger.error('User data missing from callback query');
      await ctx.answerCbQuery('Error: User data missing');
      return;
    }
    
    const userId = ctx.from.id.toString();
    
    // The proper way to access the data property in Telegraf 4.x
    // It's accessed directly from the callback query context
    if (!ctx.callbackQuery || typeof ctx.callbackQuery !== 'object') {
      logger.error('Invalid callback query');
      await ctx.answerCbQuery('Error: Invalid callback');
      return;
    }
    
    // For Telegraf 4.x, we can use a type assertion to access the data
    // as it's not properly typed in some versions
    const callbackData = ctx.callbackQuery.data as string | undefined;

    if (!callbackData || !callbackData.includes(':')) {
      await ctx.answerCbQuery('Invalid callback data');
      return;
    }
    
    const [action, value] = callbackData.split(':');
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