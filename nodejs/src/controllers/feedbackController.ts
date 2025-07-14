// src/controllers/feedbackController.ts
import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { userService } from '../services/userService';
import { feedbackService } from '../services/feedbackService';
import { MESSAGES } from '../constants';
import { logger } from '../utils/logger';

// User states map to track who is in feedback mode - EXPORTED for consistency
export const userStates = new Map<string, { inFeedbackMode: boolean }>();

/**
 * Start feedback command handler
 */
export async function handleFeedbackCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Check if user exists
    const user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Set user in feedback mode
    userStates.set(userId, { inFeedbackMode: true });
    
    // Send feedback intro message
    await ctx.reply(
      MESSAGES.FEEDBACK.INTRO,
      {
        reply_markup: {
          force_reply: true,
          selective: true
        }
      }
    );
    
    logger.info(`User ${userId} initiated feedback submission`);
  } catch (error) {
    logger.error('Error in feedback command:', error);
    await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
  }
}

/**
 * Handle the /cancel command to exit feedback mode
 */
export async function handleCancelCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    const userState = userStates.get(userId);
    
    // Only respond to cancel if user is in feedback mode
    if (userState && userState.inFeedbackMode) {
      // Reset user state
      userStates.set(userId, { inFeedbackMode: false });
      
      // Send canceled message
      await ctx.reply(MESSAGES.FEEDBACK.CANCELED);
      
      logger.info(`User ${userId} canceled feedback submission`);
    }
  } catch (error) {
    logger.error('Error in cancel command:', error);
    await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
  }
}

/**
 * Handle text messages for feedback
 */
export async function handleFeedbackText(ctx: Context, next: () => Promise<void>): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      return next();
    }
    
    const userState = userStates.get(userId);
    
    // Only process as feedback if user is in feedback mode
    if (userState && userState.inFeedbackMode) {
      // Get message text
      const message = ctx.message as Message.TextMessage;
      const feedbackText = message.text;
      
      if (!feedbackText) {
        await ctx.reply('Please provide your feedback as text.');
        return; // Explicit return here
      }
      
      // Save feedback to database
      await feedbackService.submitFeedback(userId, feedbackText);
      
      // Reset user state
      userStates.set(userId, { inFeedbackMode: false });
      
      // Send thank you message
      await ctx.reply(MESSAGES.FEEDBACK.THANK_YOU);
      
      logger.info(`User ${userId} submitted feedback`);
      return; // Explicit return here
    } else {
      // Not in feedback mode, continue to next middleware
      return next();
    }
  } catch (error) {
    logger.error('Error handling feedback text:', error);
    await ctx.reply(MESSAGES.FEEDBACK.ERROR);
    
    // Reset user state on error
    if (ctx.from?.id) {
      userStates.set(ctx.from.id.toString(), { inFeedbackMode: false });
    }
    return; // Explicit return here for the catch block
  }
}