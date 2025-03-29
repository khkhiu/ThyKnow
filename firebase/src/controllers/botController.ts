import { Context, Telegraf, NarrowedContext } from 'telegraf';
import { Update, Message } from 'telegraf/typings/core/types/typegram';
import moment from 'moment-timezone';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { FEEDBACK, MESSAGES, TIMEZONE } from '../constants';
import { logger } from '../utils/logger';
import config from '../config';

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
  await ctx.reply(MESSAGES.HELP);
  logger.info(`Showed help to user ${ctx.from?.id}`);
}

/**
 * Handle user text responses
 */
async function handleUserResponse(ctx: NarrowedContext<Context, Update.MessageUpdate<Message.TextMessage>>): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const messageText = ctx.message.text;
    
    if (!userId || !messageText) {
      logger.error('No user ID or message text found in context');
      return;
    }
    
    // Ignore commands
    if (messageText.startsWith('/')) return;
    
    const user = await userService.getUser(userId);
    
    if (!user || !user.lastPrompt) {
      await ctx.reply(MESSAGES.NO_PROMPT);
      return;
    }
    
    // Create journal entry
    const entry = promptService.createJournalEntry(
      user.lastPrompt.text,
      messageText,
      user.lastPrompt.type
    );
    
    // Save response
    await userService.saveResponse(userId, entry);
    
    // Provide feedback based on prompt type
    const feedback = user.lastPrompt.type === 'self_awareness' 
      ? FEEDBACK.SELF_AWARENESS 
      : FEEDBACK.CONNECTIONS;
    
    await ctx.reply(feedback);
    
    logger.info(`Saved response from user ${userId}`);
  } catch (error) {
    logger.error('Error handling user response:', error);
    await ctx.reply(MESSAGES.SAVE_ERROR);
  }
}

/**
 * Set up all bot commands and handlers
 */
export function setupBotCommands(bot: Telegraf): void {
  // Register command handlers
  bot.start(handleStart);
  bot.command('prompt', handleSendPrompt);
  bot.command('history', handleShowHistory);
  bot.command('timezone', handleShowTimezone);
  bot.command('help', handleShowHelp);
  
  // Register message handlers for user responses
  bot.on('text', (ctx) => handleUserResponse(ctx as NarrowedContext<Context, Update.MessageUpdate<Message.TextMessage>>));
  
  // Handle errors
  bot.catch((err, ctx) => {
    logger.error('Telegraf error', err);
    ctx.reply('An error occurred while processing your request. Please try again later.');
  });
  
  // Set bot commands for menu
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Initialize the bot and get started' },
    { command: 'prompt', description: 'Get a new reflection prompt' },
    { command: 'history', description: 'View your recent journal entries' },
    { command: 'timezone', description: 'Check prompt timings' },
    { command: 'help', description: 'Show available commands and usage' }
  ]).catch(error => {
    logger.error('Error setting bot commands:', error);
  });
}