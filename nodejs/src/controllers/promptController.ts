// src/controllers/promptController.ts (Updated - Frontend-First)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { commandResponseService } from '../services/commandResponseService';
import { userAppUsageService } from '../services/userAppUsageService';
import { CommandContext } from '../types/botCommand';

/**
 * Handle /prompt command - Now redirects to frontend
 */
export async function handleSendPrompt(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'prompt');

    // Check if user exists, create if not
    let user = await userService.getUser(userId);
    if (!user) {
      await userService.createOrUpdateUser(userId);
      user = await userService.getUser(userId);
      if (!user) {
        await ctx.reply('Sorry, there was an error setting up your account. Please try /start first.');
        return;
      }
    }

    // Get user app usage for progressive disclosure
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    const commandContext: CommandContext = {
      userId,
      userName,
      userAppUsage,
      commandName: 'prompt'
    };

    // Generate frontend-first response
    const response = commandResponseService.generatePromptResponse(commandContext);

    // Send response with miniapp button
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

    logger.info(`Prompt command handled for user ${userId} - directed to frontend`);
  } catch (error) {
    logger.error('Error in handleSendPrompt:', error);
    await ctx.reply('Sorry, something went wrong. Please try again or use /help for assistance.');
  }
}

/**
 * Handle text messages (when user is in conversation mode)
 * This maintains existing functionality for text-based interactions
 */
export async function handleTextMessage(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const messageText = (ctx.message as any)?.text;
    
    if (!userId || !messageText) {
      return;
    }

    // Check if user has a pending prompt response
    const user = await userService.getUser(userId);
    if (!user || !user.lastPrompt) {
      // No pending prompt - suggest using the app
      await ctx.reply(
        '🤔 It looks like you\'re trying to start a reflection!\n\n' +
        'Use /prompt to get started, or open the full app for the best experience! 🦕',
        {
          reply_markup: {
            inline_keyboard: [
              [{ 
                text: "🚀 Open ThyKnow App", 
                web_app: { 
                  url: `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?page=prompt&action=new&ref=text_message`
                } 
              }]
            ]
          }
        }
      );
      return;
    }

    // Handle the response (existing logic)
    await userService.savePromptResponse(userId, messageText);
    
    // Encourage user to continue in the app
    await ctx.reply(
      '✅ Response saved!\n\n' +
      '🌟 *Great reflection!* Want to see your progress, get insights, and interact with your dino friend?',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "📊 View in App", 
              web_app: { 
                url: `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?page=history&ref=response_saved`
              } 
            }],
            [{ text: "🔄 New Prompt", callback_data: "new_prompt" }]
          ]
        }
      }
    );

    logger.info(`Text response saved for user ${userId}`);
  } catch (error) {
    logger.error('Error in handleTextMessage:', error);
    await ctx.reply('Sorry, there was an error saving your response. Please try again.');
  }
}