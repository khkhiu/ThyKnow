// src/controllers/userController.ts
import { Context } from 'telegraf';
import { userService } from '../services/userService';
import { MESSAGES } from '../constants';
import { logger } from '../utils/logger';

/**
 * Start command handler
 */
export async function handleStart(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Create or get user
    await userService.createOrUpdateUser(userId);
    
    // Send welcome message
    await ctx.reply(MESSAGES.WELCOME);
    logger.info(`Started session for user ${userId}`);
  } catch (error) {
    logger.error('Error in start command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Show timezone command handler
 */
export async function handleShowTimezone(ctx: Context): Promise<void> {
  await ctx.reply(MESSAGES.TIMEZONE);
  logger.info(`Showed timezone info to user ${ctx.from?.id}`);
}

/**
 * Show help command handler
 */
export async function handleShowHelp(ctx: Context): Promise<void> {
  const helpText = MESSAGES.HELP + 
    "\n\nSchedule Management:\n" +
    "• /schedule - View your current prompt schedule\n" +
    "• /schedule_day - Set the day to receive prompts\n" +
    "• /schedule_time - Set the time to receive prompts\n" +
    "• /schedule_toggle - Turn weekly prompts on/off";
    
  await ctx.reply(helpText);
  logger.info(`Showed help to user ${ctx.from?.id}`);
}