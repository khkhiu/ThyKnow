// src/controllers/index.ts (Updated - Frontend-First Bot Commands)
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
import { handleFeedbackCommand, handleCancelCommand, handleFeedbackText, userStates } from './feedbackController';
import { 
  handleCombinedStreakCommand, 
  handleNewPromptCallback 
} from './combinedStreakController';
import { handleManageScheduleCallback } from '../services/schedulerService';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Set up all bot commands and handlers (Updated for Frontend-First approach)
 */
export function setupBotCommands(bot: Telegraf<Context>): void {
  logger.info('🤖 Setting up frontend-first bot commands...');

  // ============================================
  // MAIN COMMANDS (Frontend-First)
  // ============================================
  
  // Enhanced start command with app promotion
  bot.start(handleStart);
  
  // Frontend-first commands (redirect to miniapp)
  bot.command('prompt', handleSendPrompt);        // → Miniapp with new prompt
  bot.command('history', handleShowHistory);      // → Miniapp history page
  bot.command('choose', handleChooseCommand);     // → Miniapp prompt chooser
  bot.command('streak', handleCombinedStreakCommand); // → Miniapp streak page
  
  // Direct miniapp launcher
  bot.command('miniapp', handleMiniAppCommand);
  
  // ============================================
  // UTILITY COMMANDS (Keep in Bot)
  // ============================================
  
  // Help with app promotion
  bot.command('help', handleShowHelp);
  
  // Quick settings (but promote app)
  bot.command('schedule', handleScheduleCommand);
  bot.command('schedule_day', handleScheduleDayCommand);
  bot.command('schedule_time', handleScheduleTimeCommand);
  bot.command('schedule_toggle', handleScheduleToggleCommand);
  
  // Feedback system (keep simple in bot)
  bot.command('feedback', handleFeedbackCommand);
  bot.command('cancel', handleCancelCommand);

  // ============================================
  // LEGACY SUPPORT COMMANDS
  // ============================================
  
  // Legacy aliases that redirect to app
  bot.command('journal', (ctx) => {
    ctx.reply(
      '📚 Journal moved to the app!\n\nGet a better experience with search, charts, and more!',
      {
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🚀 Open Journal", 
              web_app: { url: `${config.baseUrl}/miniapp?page=history&ref=legacy_journal` }
            }]
          ]
        }
      }
    );
  });
  
  bot.command('dino', (ctx) => {
    ctx.reply(
      '🦕 Your dino friend is waiting in the app!\n\nSee how your dino evolves with your reflection streak!',
      {
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🦖 Visit Dino", 
              web_app: { url: `${config.baseUrl}/miniapp?page=dino&ref=legacy_dino` }
            }]
          ]
        }
      }
    );
  });

  // ============================================
  // CALLBACK HANDLERS
  // ============================================
  
  // Enhanced callback handler with all the new callbacks
  bot.on('callback_query', async (ctx) => {
    try {
      const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
      const data = callbackQuery?.data;
      
      if (!data) {
        await ctx.answerCbQuery('Invalid callback data');
        return;
      }

      logger.info(`Handling callback: ${data}`);

      // Choose command callbacks
      if (data.startsWith('choose_')) {
        return handleChooseCallback(ctx);
      }
      // Schedule-related callbacks
      else if (data.startsWith('set_day:') || data.startsWith('set_time:')) {
        return handleScheduleCallback(ctx);
      }
      // New: Manage schedule callback from scheduled prompts
      else if (data === 'manage_schedule') {
        return handleManageScheduleCallback(ctx);
      }
      // Response submission callbacks
      else if (data.startsWith('submit_response:') || data.startsWith('cancel_response:') || data === 'save_response') {
        return handleResponseCallback(ctx);
      }
      // New prompt callback from streak view
      else if (data === 'new_prompt') {
        return handleNewPromptCallback(ctx);
      }
      // Fallback for unknown callbacks
      else {
        logger.warn(`Unknown callback data: ${data}`);
        await ctx.answerCbQuery('This feature moved to the app!');
        ctx.reply(
          '🚀 *This feature moved to the app for a better experience!*',
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: "🌟 Open ThyKnow App", 
                  web_app: { 
                    url: `${config.baseUrl}/miniapp?ref=unknown_callback`
                  } 
                }]
              ]
            }
          }
        );
      }
    } catch (error) {
      logger.error('Error handling callback query:', error);
      await ctx.answerCbQuery('Sorry, something went wrong. Please try again.');
    }
  });

  // ============================================
  // TEXT MESSAGE HANDLING
  // ============================================
  
  // Handle text messages (journal responses and feedback)
  bot.on('text', async (ctx, next) => {
    try {
      const userId = ctx.from?.id.toString();
      const messageText = ctx.message.text;
      
      if (!userId || !messageText) return;
      
      // Skip if it's a command
      if (messageText.startsWith('/')) return;
      
      // Check if user is in feedback mode using Map.get()
      const userState = userStates.get(userId);
      if (userState && userState.inFeedbackMode) {
        // Call handleFeedbackText with proper next function
        return handleFeedbackText(ctx, next || (() => Promise.resolve()));
      }
      
      // Handle as prompt response (but encourage app use)
      return handleTextMessage(ctx);
    } catch (error) {
      logger.error('Error handling text message:', error);
      await ctx.reply('Sorry, something went wrong. Please try again or use /help for assistance.');
    }
  });

  // ============================================
  // ERROR HANDLING
  // ============================================
  
  // Global error handler
  bot.catch((err, ctx) => {
    logger.error('Telegraf error:', err);
    ctx.reply('An unexpected error occurred. Please try again or contact support if the issue persists.');
  });

  logger.info('✅ Frontend-first bot commands setup complete');
}