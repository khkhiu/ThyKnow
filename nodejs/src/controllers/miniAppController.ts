// src/controllers/miniAppController.ts (Updated to open new frontend directly)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';

/**
 * Handle the /miniapp command to launch the mini app
 * Now directly opens the new React frontend instead of showing options
 */
export async function handleMiniAppCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Get user or create if doesn't exist
    let user = await userService.getUser(userId);
    if (!user) {
      await userService.createOrUpdateUser(userId);
      user = await userService.getUser(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    }

    // Generate a new prompt for the user
    const prompt = await promptService.getNextPromptForUser(userId);
    
    // Save the prompt as the user's last prompt
    await userService.saveLastPrompt(userId, prompt.text, prompt.type);
    
    logger.info(`Generated new prompt for user ${userId} before launching mini-app`);
    
    // Add a timestamp parameter to force the mini-app to reload fresh content
    const timeStamp = new Date().getTime();
    
    // Build URL for the main mini-app (React frontend)
    const miniAppUrl = `${config.baseUrl}/miniapp?t=${timeStamp}`;
    
    // Log the mini app URL for debugging
    logger.debug(`Serving mini app URL: ${miniAppUrl}`);
    
    // Send a message with the web app button that opens directly
    await ctx.reply(
      "🦕 *Welcome to ThyKnow!* 🦖\n\n" +
      "Your personalized reflection experience awaits! A fresh new prompt has been generated just for you.\n\n" +
      "✨ *Features include:*\n" +
      "• Daily reflection prompts\n" +
      "• Your personal dino companion\n" +
      "• Progress tracking & streaks\n" +
      "• Journal history\n\n" +
      "Ready to discover yourself and connect with others?",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Open ThyKnow App", web_app: { url: miniAppUrl } }]
          ]
        }
      }
    );
    
    logger.info(`Mini app opened directly for user ${userId}`);
  } catch (error) {
    logger.error('Error handling mini app command:', error);
    await ctx.reply('Sorry, there was an error launching the mini app. Please try again later.');
  }
}