// src/controllers/streakMiniAppController.ts
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';
import { userService } from '../services/userService';

/**
 * Handle the /streaks command to launch directly into the streak page
 */
export async function handleStreakMiniAppCommand(ctx: Context): Promise<void> {
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
    
    // Add a timestamp parameter to force fresh content loading
    const timeStamp = new Date().getTime();
    
    // Build the streak page URL
    const streakUrl = `${config.baseUrl}/miniapp/streak?t=${timeStamp}`;
    
    // Log the URL for debugging
    logger.debug(`Serving streak miniapp URL: ${streakUrl}`);
    
    // Send a message with the streak mini-app button
    await ctx.reply(
      "📊 *Weekly Streak Progress*\n\n" +
      "🔥 View your weekly reflection streak\n" +
      "🏆 Check your position on the leaderboard\n" +
      "💎 See your total points and milestones\n" +
      "📈 Track your progress over time\n\n" +
      "Your weekly reflection journey awaits!",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "📊 View Weekly Progress", web_app: { url: streakUrl } }]
          ]
        }
      }
    );
    
    logger.info(`Streak mini app link sent to user ${userId}`);
  } catch (error) {
    logger.error('Error handling streak mini app command:', error);
    await ctx.reply('Sorry, there was an error launching your streak progress. Please try again later.');
  }
}