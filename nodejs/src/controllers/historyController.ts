// src/controllers/historyController.ts (Updated - Frontend-First)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { commandResponseService } from '../services/commandResponseService';
import { userAppUsageService } from '../services/userAppUsageService';
import { CommandContext } from '../types/botCommand';

/**
 * Handle /history command - Now redirects to frontend
 */
export async function handleShowHistory(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'history');

    // Check if user exists
    const user = await userService.getUser(userId);
    if (!user) {
      await ctx.reply(
        '🦕 Welcome! It looks like you\'re new here.\n\n' +
        'Start your reflection journey first, then you\'ll have history to explore!',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🌟 Start Journey", callback_data: "start" }]
            ]
          }
        }
      );
      return;
    }

    // Get user app usage for progressive disclosure
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    const commandContext: CommandContext = {
      userId,
      userName,
      userAppUsage,
      commandName: 'history'
    };

    // Generate frontend-first response
    const response = commandResponseService.generateHistoryResponse(commandContext);

    // For new users or those who haven't used the app much, show a preview
    if (userAppUsage.miniappUsageCount < 2) {
      // Get a small preview of recent entries
      const recentEntries = await userService.getRecentEntries(userId, 2);
      
      let previewText = '';
      if (recentEntries.length === 0) {
        previewText = '\n\n📝 *Your reflection journey starts here!*\nOnce you complete some reflections, you\'ll see them in your beautiful history.';
      } else {
        previewText = '\n\n📝 *Recent reflections:*\n';
        recentEntries.forEach((entry, index) => {
          const date = new Date(entry.timestamp).toLocaleDateString();
          previewText += `${index + 1}. ${date} - ${entry.prompt.substring(0, 50)}...\n`;
        });
        previewText += '\n*See the full experience with charts and insights in the app!*';
      }
      
      await ctx.reply(
        response.messageText + previewText + '\n\n' + response.promotionMessage,
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
    } else {
      // For experienced users, go straight to app promotion
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
    }

    logger.info(`History command handled for user ${userId} - directed to frontend`);
  } catch (error) {
    logger.error('Error in handleShowHistory:', error);
    await ctx.reply('Sorry, something went wrong accessing your history. Please try again or use /help for assistance.');
  }
}