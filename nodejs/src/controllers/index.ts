// src/controllers/index.ts
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
import { handleMiniAppCommand } from './miniAppController'; // Renamed from handleWebAppCommand
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
  bot.command('miniapp', handleMiniAppCommand);  // Changed from webapp to miniapp
  
  // Register callback query handlers
  bot.on('callback_query', (ctx) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    
    if (!callbackData) return;
    
    if (callbackData.startsWith('set_day:') || callbackData.startsWith('set_time:')) {
      return handleScheduleCallback(ctx);
    }
    
    if (callbackData.startsWith('save_response:') || callbackData === 'new_prompt') {
      return handleResponseCallback(ctx);
    }
    
    if (callbackData.startsWith('choose:')) {
      return handleChooseCallback(ctx);
    }
  });
  
  // Register text message handler
  bot.on('text', handleTextMessage);
  
  // Register error handler
  bot.catch((err, ctx) => {
    logger.error('Bot error:', err);
    ctx.reply(MESSAGES.ERROR);
  });
  
  // Set up bot commands menu
  bot.telegram.setMyCommands([
    { command: 'start', description: 'Initialize the bot and get started' },
    { command: 'prompt', description: 'Get a new reflection prompt' },
    { command: 'choose', description: 'Choose a specific type of prompt' },
    { command: 'history', description: 'View your recent journal entries' },
    { command: 'miniapp', description: 'Open the ThyKnow mini app' },
    { command: 'schedule', description: 'Manage your prompt schedule and check timezone' },
    { command: 'help', description: 'Show available commands and usage' }
  ]);
}