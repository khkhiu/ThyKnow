// src/controllers/index.ts (Updated with Combined Streak Handler)
import { Telegraf, Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { handleStart, handleShowHelp } from './userController';
import { handleSendPrompt, handleTextMessage } from './promptController';
import { handleShowHistory } from './historyController';
import { 
  handleScheduleCommand, 
  handleScheduleDayCommand, 
  handleScheduleTimeCommand, 
  handleScheduleToggleCommand, 
  handleScheduleCallback 
} from './scheduleController';
import { handleResponseCallback } from './responseController';
import { handleChooseCommand, handleChooseCallback } from './chooseController';
import { handleMiniAppCommand } from './miniAppController';
import { handleFeedbackCommand, handleCancelCommand, handleFeedbackText } from './feedbackController';
// Import streak handlers
import { 
  handleWeeklyStreakCommand, 
  handleWeeklyJournalSubmission 
} from './weeklyStreakController';
import { handleStreakMiniAppCommand } from './streakMiniAppController';
// Import new combined streak handler
import { 
  handleCombinedStreakCommand, 
  handleNewPromptCallback 
} from './combinedStreakController';
import { logger } from '../utils/logger';
import { MESSAGES } from '../constants';

/**
 * Set up all bot commands and handlers
 */
export function setupBotCommands(bot: Telegraf<Context>): void {
  // Register command handlers
  bot.start(handleStart);
  bot.command('prompt', handleSendPrompt);
  bot.command('history', handleShowHistory);
  bot.command('help', handleShowHelp);
  bot.command('schedule', handleScheduleCommand);
  bot.command('schedule_day', handleScheduleDayCommand);
  bot.command('schedule_time', handleScheduleTimeCommand);
  bot.command('schedule_toggle', handleScheduleToggleCommand);
  bot.command('choose', handleChooseCommand);
  bot.command('miniapp', handleMiniAppCommand);
  bot.command('feedback', handleFeedbackCommand);
  bot.command('cancel', handleCancelCommand);
  
  // MAIN STREAK COMMAND: Combined text + miniapp approach
  bot.command('streak', handleCombinedStreakCommand);
  
  // Alternative commands for specific use cases
  bot.command('streakinfo', handleWeeklyStreakCommand);        // Text-only version
  bot.command('streakapp', handleStreakMiniAppCommand);        // Miniapp-only version
  
  // Register callback query handlers
  bot.on('callback_query', (ctx) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    
    if (!callbackData) return; // Return explicitly
    
    // Schedule-related callbacks
    if (callbackData.startsWith('set_day:') || callbackData.startsWith('set_time:')) {
      return handleScheduleCallback(ctx);
    }
    
    // Response-related callbacks
    if (callbackData.startsWith('save_response:') || callbackData === 'new_prompt') {
      return handleResponseCallback(ctx);
    }
    
    // Choose prompt type callbacks
    if (callbackData.startsWith('choose:')) {
      return handleChooseCallback(ctx);
    }
    
    // NEW: Handle new prompt callback from streak command
    if (callbackData === 'new_prompt') {
      return handleNewPromptCallback(ctx);
    }
    
    // Add a default return
    return; // Ensures all code paths return a value
  });
  
  // Middleware for handling text - try feedback first, then streak submission, then fall back to regular text handling
  bot.on('text', handleFeedbackText, handleWeeklyJournalSubmission, handleTextMessage);
  
  // Register error handler
  bot.catch((err, ctx) => {
    logger.error('Bot error:', err);
    ctx.reply(MESSAGES.ERROR);
  });
  
  // Set up bot commands menu - UPDATED WITH COMBINED APPROACH
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Initialize the bot and get started' },
    { command: 'prompt', description: 'Get a new reflection prompt' },
    { command: 'choose', description: 'Choose a specific type of prompt' },
    { command: 'history', description: 'View your recent journal entries' },
    { command: 'miniapp', description: 'Open the ThyKnow mini app (all pages)' },
    { command: 'streak', description: 'View streak summary + detailed progress' },
    { command: 'feedback', description: 'Share your thoughts with us' },
    { command: 'schedule', description: 'Manage your prompt schedule' },
    { command: 'help', description: 'Show available commands and usage' }
  ]);
}