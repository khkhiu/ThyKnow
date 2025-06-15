// src/controllers/index.ts (Updated with Streaks MiniApp Command)
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
//import { handleStreakMiniAppCommand } from './streakMiniAppController'; // NEW IMPORT
import { handleFeedbackCommand, handleCancelCommand, handleFeedbackText } from './feedbackController';
// ADD WEEKLY STREAK IMPORTS
import { 
  handleWeeklyStreakCommand, 
  //handleLeaderboardCommand, 
  handleWeeklyJournalSubmission 
} from './weeklyStreakController';
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
  //bot.command('streaks', handleStreakMiniAppCommand); // NEW COMMAND FOR DIRECT STREAK ACCESS
  bot.command('feedback', handleFeedbackCommand);
  bot.command('cancel', handleCancelCommand);
  
  // STREAK COMMANDS (text-based)
  bot.command('streak', handleWeeklyStreakCommand);
  //bot.command('leaderboard', handleLeaderboardCommand);
  
  // Register callback query handlers
  bot.on('callback_query', (ctx) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    
    if (!callbackData) return; // Return explicitly
    
    if (callbackData.startsWith('set_day:') || callbackData.startsWith('set_time:')) {
      return handleScheduleCallback(ctx);
    }
    
    if (callbackData.startsWith('save_response:') || callbackData === 'new_prompt') {
      return handleResponseCallback(ctx);
    }
    
    if (callbackData.startsWith('choose:')) {
      return handleChooseCallback(ctx);
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
  
  // Set up bot commands menu - UPDATED WITH NEW COMMANDS
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Initialize the bot and get started' },
    { command: 'prompt', description: 'Get a new reflection prompt' },
    { command: 'choose', description: 'Choose a specific type of prompt' },
    { command: 'history', description: 'View your recent journal entries' },
    { command: 'miniapp', description: 'Open the ThyKnow mini app (all pages)' },
    //{ command: 'streaks', description: 'View your weekly streak progress (mini app)' },
    { command: 'streak', description: 'View your weekly reflection streak (text)' },
    //{ command: 'leaderboard', description: 'See top weekly performers (text)' },
    { command: 'feedback', description: 'Share your thoughts with us' },
    { command: 'schedule', description: 'Manage your prompt schedule' },
    { command: 'help', description: 'Show available commands and usage' }
  ]);
}