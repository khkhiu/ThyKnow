// src/controllers/miniAppController.ts (Updated with Streak Option)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';

/**
 * Handle the /miniapp command to launch the mini app
 * Now generates a new prompt before launching the mini app
 * and offers options for the main app, dino friend, and streak progress
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
    
    // Build URLs for all mini-app pages
    const miniAppUrl = `${config.baseUrl}/miniapp?t=${timeStamp}`;
    const petUrl = `${config.baseUrl}/miniapp/pet?t=${timeStamp}`;
    const streakUrl = `${config.baseUrl}/miniapp/streak?t=${timeStamp}`;
    
    // Log the mini app URLs for debugging
    logger.debug(`Serving mini app URLs: ${miniAppUrl}, ${petUrl}, ${streakUrl}`);
    
    // Send a message with the web app buttons
    await ctx.reply(
      "📱 *ThyKnow Mini App*\n\n" +
      "Experience ThyKnow right inside Telegram with our interactive mini app!\n\n" +
      "🦕 **Main App**: A fresh new prompt has been generated for you!\n" +
      "🦖 **Dino Friend**: Meet your encouraging companion\n" +
      "📊 **Weekly Progress**: Track your reflection streak and milestones\n\n" +
      "Choose your experience:",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🦕 Open ThyKnow App", web_app: { url: miniAppUrl } }],
            [{ text: "🦖 Meet Dino Friend", web_app: { url: petUrl } }],
            [{ text: "📊 Weekly Progress", web_app: { url: streakUrl } }]
          ]
        }
      }
    );
    
    logger.info(`Mini app links sent to user ${userId}`);
  } catch (error) {
    logger.error('Error handling mini app command:', error);
    await ctx.reply('Sorry, there was an error launching the mini app. Please try again later.');
  }
}