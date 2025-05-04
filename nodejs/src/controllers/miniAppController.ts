// src/controllers/miniAppController.ts
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Handle the /webapp command to launch the mini app
 */
export async function handleWebAppCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Build the mini app URL
    const miniAppUrl = `${config.baseUrl}/miniapp`;
    
    // Log the mini app URL for debugging
    logger.debug(`Serving mini app URL: ${miniAppUrl}`);
    
    // Send a message with the web app button
    await ctx.reply(
      "📱 *ThyKnow Mini App*\n\n" +
      "Experience ThyKnow right inside Telegram with our interactive mini app!\n\n" +
      "• View and respond to today's prompt\n" +
      "• Browse your previous journal entries\n" +
      "• Track your self-discovery journey\n\n" +
      "Tap the button below to launch the app:",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🦕 Open ThyKnow App", web_app: { url: miniAppUrl } }]
          ]
        }
      }
    );
    
    logger.info(`Mini app link sent to user ${userId}`);
  } catch (error) {
    logger.error('Error handling web app command:', error);
    await ctx.reply('Sorry, there was an error launching the mini app. Please try again later.');
  }
}