// src/controllers/userController.ts (Updated - Enhanced Start & Help)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { commandResponseService } from '../services/commandResponseService';
import { userAppUsageService } from '../services/userAppUsageService';
import { CommandContext } from '../types/botCommand';

/**
 * Enhanced /start command with app promotion
 */
export async function handleStart(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'start');

    // Create or update user
    await userService.createOrUpdateUser(userId);
    
    // Get user app usage for progressive disclosure
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    const commandContext: CommandContext = {
      userId,
      userName,
      userAppUsage,
      commandName: 'start'
    };

    // Generate enhanced start response
    const response = commandResponseService.generateStartResponse(commandContext);

    await ctx.reply(
      response.messageText + 
      (response.fallbackContent ? '\n\n' + response.fallbackContent : '') +
      '\n\n' + response.promotionMessage,
      {
        parse_mode: response.parseMode,
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: response.miniappButton.text, 
              web_app: { url: response.miniappButton.url } 
            }]
          ]
        }
      }
    );

    logger.info(`Enhanced start command handled for user ${userId}`);
  } catch (error) {
    logger.error('Error in handleStart:', error);
    await ctx.reply(
      '🦕 Welcome to ThyKnow! 🦖\n\n' +
      'Something went wrong, but don\'t worry - let\'s get you started!\n\n' +
      'Try using /prompt to begin your reflection journey.'
    );
  }
}

/**
 * Enhanced /help command with app promotion
 */
export async function handleShowHelp(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'help');

    // Get user app usage for progressive disclosure
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    const commandContext: CommandContext = {
      userId,
      userName,
      userAppUsage,
      commandName: 'help'
    };

    // Generate help response with app promotion
    const response = commandResponseService.generateHelpResponse(commandContext);

    await ctx.reply(
      response.messageText + '\n\n' + response.promotionMessage,
      {
        parse_mode: response.parseMode,
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: response.miniappButton.text, 
              web_app: { url: response.miniappButton.url } 
            }]
          ]
        }
      }
    );

    logger.info(`Help command handled for user ${userId} with app promotion`);
  } catch (error) {
    logger.error('Error in handleShowHelp:', error);
    await ctx.reply(
      '🤖 *ThyKnow Bot Commands:*\n\n' +
      '/start - Get started\n' +
      '/prompt - Get reflection prompt\n' +
      '/history - View your history\n' +
      '/streak - Check progress\n' +
      '/miniapp - Open full app\n' +
      '/help - Show this message\n\n' +
      '💡 Use the full app for the best experience!',
      { parse_mode: 'Markdown' }
    );
  }
}

/**
 * Get user profile information (utility function)
 */
export async function getUserProfile(userId: string): Promise<any> {
  try {
    const user = await userService.getUser(userId);
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    const engagementLevel = await userAppUsageService.getUserEngagementLevel(userId);
    
    return {
      user,
      appUsage: userAppUsage,
      engagementLevel,
      shouldPromoteApp: await userAppUsageService.shouldPromoteApp(userId)
    };
  } catch (error) {
    logger.error('Error getting user profile:', error);
    return null;
  }
}