// src/controllers/chooseController.ts (Updated - Frontend-First)
import { Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { commandResponseService } from '../services/commandResponseService';
import { userAppUsageService } from '../services/userAppUsageService';
import { CommandContext } from '../types/botCommand';

/**
 * Handle /choose command - Now redirects to frontend
 */
export async function handleChooseCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'choose');

    // Check if user exists
    const user = await userService.getUser(userId);
    if (!user) {
      await ctx.reply(
        '🦕 Welcome! Please start your journey first.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🌟 Get Started", callback_data: "start" }]
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
      commandName: 'choose'
    };

    // Generate frontend-first response
    const response = commandResponseService.generateChooseResponse(commandContext);

    // For first-time users, show a quick preview of prompt types
    if (userAppUsage.miniappUsageCount < 2) {
      const promptTypesPreview = `

🎯 *Available Prompt Types:*

🧠 **Self-Awareness** - Understand yourself better
💝 **Connections** - Explore relationships  
🌱 **Growth** - Personal development
🎨 **Creativity** - Express your thoughts
🙏 **Gratitude** - Appreciate life's gifts

*Choose and preview prompts in the app with rich descriptions!*`;

      await ctx.reply(
        response.messageText + promptTypesPreview + '\n\n' + response.promotionMessage,
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
      // For experienced users, direct to app
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

    logger.info(`Choose command handled for user ${userId} - directed to frontend`);
  } catch (error) {
    logger.error('Error in handleChooseCommand:', error);
    await ctx.reply('Sorry, something went wrong. Please try again or use /help for assistance.');
  }
}

/**
 * Handle choose prompt type callbacks (fallback for legacy users)
 */
export async function handleChooseCallback(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    
    if (!userId || !callbackData) {
      await ctx.answerCbQuery('Error processing request');
      return;
    }

    // Instead of processing inline, redirect to app
    const deepLink = `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?page=choose&action=choose&type=${callbackData}&ref=callback_legacy`;
    
    await ctx.answerCbQuery('Opening in app for better experience!');
    await ctx.editMessageText(
      '🎯 *Prompt selection moved to the app!*\n\n' +
      'Get a better experience with prompt previews, descriptions, and your dino friend!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🔍 Choose Prompt Type", 
              web_app: { url: deepLink } 
            }]
          ]
        }
      }
    );

    logger.info(`Choose callback handled for user ${userId} - redirected to frontend`);
  } catch (error) {
    logger.error('Error in handleChooseCallback:', error);
    await ctx.answerCbQuery('Sorry, something went wrong. Please try /choose again.');
  }
}