// src/controllers/miniAppController.ts
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';

/**
 * Handle the /miniapp command to launch the mini app
 * Now generates a new prompt before launching the mini app
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
    await userService.saveLastPrompt(userId, prompt);
    
    logger.info(`Generated new prompt for user ${userId} before launching mini-app`);
    
    // Build the mini app URL
    const miniAppUrl = `${config.baseUrl}/miniapp`;
    
    // Add a timestamp parameter to force the mini-app to reload fresh content
    const timeStamp = new Date().getTime();
    const miniAppUrlWithTimestamp = `${miniAppUrl}?t=${timeStamp}`;
    
    // Log the mini app URL for debugging
    logger.debug(`Serving mini app URL: ${miniAppUrlWithTimestamp}`);
    
    // Send a message with the web app button
    await ctx.reply(
      "📱 *ThyKnow Mini App*\n\n" +
      "Experience ThyKnow right inside Telegram with our interactive mini app!\n\n" +
      "• A fresh new prompt has been generated for you! 🦕\n" +
      "• View and respond to your prompt\n" +
      "• Browse your previous journal entries\n\n" +
      "Tap the button below to launch the app:",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🦕 Open ThyKnow App", web_app: { url: miniAppUrlWithTimestamp } }]
          ]
        }
      }
    );
    
    logger.info(`Mini app link sent to user ${userId}`);
  } catch (error) {
    logger.error('Error handling mini app command:', error);
    await ctx.reply('Sorry, there was an error launching the mini app. Please try again later.');
  }
}