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
              text: "🌟 Open ThyKnow App", 
              web_app: { 
                url: `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?ref=journal_legacy`
              } 
            }]
          ]
        }
      }
    );
  });

  // ============================================
  // CALLBACK HANDLERS
  // ============================================
  
  // Handle all callback queries
  bot.on('callback_query', async (ctx) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    
    if (callbackData.startsWith('choose_')) {
      return handleChooseCallback(ctx);
    } else if (callbackData.startsWith('set_day:') || callbackData.startsWith('set_time:')) {
      // Handle schedule-related callbacks (set_day:X, set_time:X)
      return handleScheduleCallback(ctx);
    } else if (callbackData.startsWith('schedule_')) {
      // Handle other schedule callbacks if any
      return handleScheduleCallback(ctx);
    } else if (callbackData === 'save_response') {
      return handleResponseCallback(ctx);
    } else if (callbackData === 'new_prompt') {
      return handleNewPromptCallback(ctx);
    } else {
      // Unknown callback - redirect to app using proper config
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
  });

  // ============================================
  // TEXT MESSAGE HANDLING
  // ============================================
  
  // Handle text messages (responses, feedback, etc.) - FIXED VERSION
  bot.on('text', async (ctx, next) => {  // Added 'next' parameter
    const userId = ctx.from?.id.toString();
    const messageText = ctx.message.text;
    
    if (!userId || !messageText) return;
    
    // Skip if it's a command
    if (messageText.startsWith('/')) return;
    
    // Check if user is in feedback mode using consistent userStates Map
    const userState = userStates.get(userId);
    if (userState && userState.inFeedbackMode) {
      return handleFeedbackText(ctx, next);  // Pass both arguments
    }
    
    // Handle as prompt response (but encourage app use)
    return handleTextMessage(ctx);
  });

  // ============================================
  // ERROR HANDLING
  // ============================================
  
  bot.catch((err: any, ctx: Context) => {
    logger.error('Bot error occurred:', err);
    
    ctx.reply(
      'Sorry, something went wrong! 😅\n\n' +
      'Try using the app for a more stable experience:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🚀 Open ThyKnow App", 
              web_app: { 
                url: `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?ref=error_recovery`
              } 
            }]
          ]
        }
      }
    );
  });

  // ============================================
  // BOT SETUP COMPLETE
  // ============================================
  
  logger.info('✅ Frontend-first bot commands setup complete!');
  logger.info('📱 All main features now redirect to the React miniapp');
  logger.info('🤖 Bot serves as gateway and quick utility access');
}

/**
 * Get bot command statistics for monitoring
 */
export async function getBotCommandStats(): Promise<any> {
  try {
    // This would query your analytics database
    return {
      totalCommands: 0,
      frontendRedirects: 0,
      conversionRate: 0,
      popularCommands: []
    };
  } catch (error) {
    logger.error('Error getting bot command stats:', error);
    return null;
  }
}