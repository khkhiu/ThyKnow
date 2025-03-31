// src/controllers/historyController.ts
import { Context } from 'telegraf';
import moment from 'moment-timezone';
import { userService } from '../services/userService';
import { MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Show history command handler
 */
export async function handleShowHistory(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    const entries = await userService.getRecentEntries(userId, config.maxHistory);
    
    if (entries.length === 0) {
      await ctx.reply(MESSAGES.NO_HISTORY);
      return;
    }
    
    let historyText = "📖 Your Recent Journal Entries:\n\n";
    
    for (const entry of entries) {
      const date = moment(entry.timestamp).tz(config.timezone).format('YYYY-MM-DD HH:mm');
      historyText += `📅 ${date}\n`;
      historyText += `Q: ${entry.prompt}\n`;
      historyText += `A: ${entry.response}\n\n`;
    }
    
    // Split message if it's too long
    if (historyText.length > 4000) {
      const chunks = [];
      for (let i = 0; i < historyText.length; i += 4000) {
        chunks.push(historyText.substring(i, i + 4000));
      }
      
      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    } else {
      await ctx.reply(historyText);
    }
    
    logger.info(`Showed history to user ${userId}`);
  } catch (error) {
    logger.error('Error in history command:', error);
    await ctx.reply('Sorry, there was an error retrieving your history. Please try again.');
  }
}