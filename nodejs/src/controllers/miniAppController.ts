// src/controllers/miniAppController.ts (Updated - Deep Links & Usage Tracking)
import { Context } from 'telegraf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import config from '../config';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { userAppUsageService } from '../services/userAppUsageService';

/**
 * Handle the /miniapp command to launch the mini app
 */
export async function handleMiniAppCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'miniapp');

    // Get user or create if doesn't exist
    let user = await userService.getUser(userId);
    if (!user) {
      await userService.createOrUpdateUser(userId);
      user = await userService.getUser(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    }

    // Record miniapp usage
    await userAppUsageService.recordMiniappUsage(userId);

    // Generate a new prompt for the user to ensure fresh content
    const prompt = await promptService.getNextPromptForUser(userId);
    await userService.saveLastPrompt(userId, prompt.text, prompt.type);
    
    logger.info(`Generated new prompt for user ${userId} before launching mini-app`);
    
    // Build URL for the main mini-app with tracking
    const timeStamp = new Date().getTime();
    const miniAppUrl = `${config.baseUrl}/miniapp?ref=bot_miniapp_command&t=${timeStamp}`;
    
    // Check user's app usage to customize the message
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    let welcomeMessage: string;
    let buttonText: string;
    
    if (userAppUsage.miniappUsageCount === 0) {
      // First time user
      welcomeMessage = `🦕 *Welcome to ThyKnow, ${userName}!* 🦖\n\n` +
        "🌟 *You're about to discover:*\n" +
        "• Your personalized dino companion\n" +
        "• Beautiful reflection prompts\n" +
        "• Progress tracking & streaks\n" +
        "• Insightful journal history\n\n" +
        "A fresh prompt is waiting for you! Ready to begin your journey?";
      buttonText = "🚀 Start My Journey";
    } else if (userAppUsage.miniappUsageCount < 5) {
      // Casual user
      welcomeMessage = `🦕 *Welcome back, ${userName}!* 🦖\n\n` +
        "Your dino friend missed you! 🤗\n\n" +
        "✨ *What's ready for you:*\n" +
        "• A new reflection prompt\n" +
        "• Your updated progress\n" +
        "• Dino mood & interactions\n\n" +
        "Ready to continue growing?";
      buttonText = "🎯 Continue Journey";
    } else {
      // Regular user
      welcomeMessage = `🦕 *Hey ${userName}!* 🦖\n\n` +
        "Your ThyKnow space is ready! 🌟\n\n" +
        "Fresh prompt generated and your dino friend is excited to see you!";
      buttonText = "🏠 Enter ThyKnow";
    }
    
    await ctx.reply(
      welcomeMessage,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: buttonText, web_app: { url: miniAppUrl } }]
          ]
        }
      }
    );
    
    logger.info(`Mini app opened for user ${userId} (usage count: ${userAppUsage.miniappUsageCount + 1})`);
  } catch (error) {
    logger.error('Error handling mini app command:', error);
    await ctx.reply('Sorry, there was an error launching the mini app. Please try again later.');
  }
}

/**
 * Middleware to track miniapp access and handle deep links
 */
export function trackMiniappAccess(req: Request, _res: Response, next: NextFunction): void {
  // Extract user info from Telegram init data if available
  const telegramInitData = req.headers['x-telegram-init-data'] as string;
  
  if (telegramInitData) {
    try {
      // Parse Telegram init data to get user ID
      const urlParams = new URLSearchParams(telegramInitData);
      const userParam = urlParams.get('user');
      
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        const userId = userData.id?.toString();
        
        if (userId) {
          // Record miniapp usage asynchronously
          userAppUsageService.recordMiniappUsage(userId)
            .then(() => {
              logger.debug(`Tracked miniapp access for user ${userId}`);
            })
            .catch((error) => {
              logger.error('Error tracking miniapp access:', error);
            });
        }
      }
    } catch (error) {
      logger.error('Error parsing Telegram init data for tracking:', error);
    }
  }
  
  // Continue to serve the miniapp
  next();
}

/**
 * Handle deep link parameters and redirect appropriately
 */
export function handleDeepLink(req: Request, res: Response, next: NextFunction): void {
  const { page, action, type, ref } = req.query;
  
  // Log deep link usage for analytics
  if (page || action || type || ref) {
    logger.info('Deep link accessed:', { page, action, type, ref, url: req.originalUrl });
  }
  
  // Add deep link parameters to the response for the frontend to handle
  if (page || action || type) {
    // Store deep link params in a way the frontend can access them
    res.locals.deepLinkParams = {
      page: page as string,
      action: action as string,
      type: type as string,
      ref: ref as string
    };
  }
  
  next();
}

/**
 * Generate usage analytics for admin dashboard
 */
export async function getMiniappUsageStats(): Promise<any> {
  try {
    // This would typically query your analytics database
    // For now, return placeholder data
    return {
      totalUsers: 0,
      activeUsers: 0,
      avgSessionTime: 0,
      popularPages: [],
      conversionFromBot: 0
    };
  } catch (error) {
    logger.error('Error getting miniapp usage stats:', error);
    return null;
  }
}