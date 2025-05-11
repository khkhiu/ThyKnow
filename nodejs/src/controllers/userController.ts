// src/controllers/userController.ts
import { Context } from 'telegraf';
import { userService } from '../services/userService';
import { MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import { handleChooseCommand } from './chooseController';

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
    
    // Check if user already exists
    const existingUser = await userService.getUser(userId);
    const isFirstStart = !existingUser;
    
    // Create or get user
    await userService.createOrUpdateUser(userId);
    
    // Send welcome message
    await ctx.reply(MESSAGES.WELCOME);
    logger.info(`Started session for user ${userId} (firstTime: ${isFirstStart})`);
    
    // If this is the first start, also trigger the choose command
    if (isFirstStart) {
      logger.info(`First time user ${userId}, triggering choose command`);
      
      // Add a small delay to ensure welcome message is seen first
      setTimeout(() => {
        handleChooseCommand(ctx);
        
        // After another small delay, introduce the mini app
        setTimeout(async () => {
          // Import dynamically to avoid circular dependencies
          const { handleMiniAppCommand } = require('./miniAppController');
          await handleMiniAppCommand(ctx);
        }, 2000);
      }, 500);
    }
  } catch (error) {
    logger.error('Error in start command:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}

/**
 * Show help command handler
 */
export async function handleShowHelp(ctx: Context): Promise<void> {
  const helpText = MESSAGES.HELP;
  await ctx.reply(helpText);
  logger.info(`Showed help to user ${ctx.from?.id}`);
}