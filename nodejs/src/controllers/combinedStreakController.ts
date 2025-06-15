// src/controllers/combinedStreakController.ts
// Combined streak handler that shows text info AND provides miniapp access

import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import config from '../config';
import { UserService } from '../services/userService';

// Initialize services  
const weeklyUserService = new UserService();

// Define types for better type safety
interface IStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  pointsHistory: Array<{
    pointsEarned: number;
    reason: string;
    streakWeek?: number;
    weekIdentifier?: string;
    timestamp: Date;
  }>;
}

/**
 * Combined /streak handler - Shows text summary + miniapp access
 * This gives users immediate information AND visual interface option
 */
export async function handleCombinedStreakCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in combined streak command');
      return;
    }
    
    // Ensure user exists
    let user = await weeklyUserService.getUser(userId);
    if (!user) {
      await weeklyUserService.createOrUpdateUser(userId);
      user = await weeklyUserService.getUser(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    }
    
    // Get streak statistics
    const streakStats: IStreakStats = await weeklyUserService.getStreakStats(userId);
    const currentWeek: string = weeklyUserService.getCurrentWeekId();
    
    // Create concise text summary (shorter than full text version)
    let message = `📊 *Weekly Reflection Summary*\n\n`;
    
    // Key stats in concise format
    message += `🔥 *Current Streak:* ${streakStats.currentStreak} week${streakStats.currentStreak === 1 ? '' : 's'}\n`;
    message += `🏆 *Personal Best:* ${streakStats.longestStreak} week${streakStats.longestStreak === 1 ? '' : 's'}\n`;
    message += `💎 *Total Points:* ${streakStats.totalPoints.toLocaleString()}\n\n`;
    
    // This week status
    if (streakStats.hasEntryThisWeek) {
      message += `✅ *Week ${currentWeek}:* Reflection complete!\n`;
      message += `_You can add more reflections for bonus points._\n\n`;
    } else {
      message += `📅 *Week ${currentWeek}:* Awaiting your reflection\n`;
      if (streakStats.currentStreak > 0) {
        message += `_Keep your ${streakStats.currentStreak}-week streak alive!_\n\n`;
      } else {
        message += `_Ready to start your reflection journey?_\n\n`;
      }
    }
    
    // Next milestone (if applicable)
    if (streakStats.weeksUntilNextMilestone > 0) {
      message += `🎯 *Next Milestone:* ${streakStats.weeksUntilNextMilestone} week${streakStats.weeksUntilNextMilestone === 1 ? '' : 's'} away\n`;
      message += `_Reward: +${streakStats.nextMilestoneReward} bonus points_\n\n`;
    } else {
      message += `🏆 *All milestones achieved!* You're a reflection master!\n\n`;
    }
    
    // Add call-to-action
    message += `📱 *Tap below for detailed visual progress, milestones, and activity history!*`;
    
    // Add timestamp for fresh miniapp loading
    const timeStamp = new Date().getTime();
    const streakUrl = `${config.baseUrl}/miniapp/streak?t=${timeStamp}`;
    
    // Send message with both text info AND miniapp button
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "📊 View Detailed Progress", 
            web_app: { url: streakUrl } 
          }],
          [{ 
            text: "🦕 Get New Prompt", 
            callback_data: "new_prompt" 
          }]
        ]
      }
    });
    
    logger.info(`Combined streak info sent to user ${userId} (streak: ${streakStats.currentStreak}, points: ${streakStats.totalPoints})`);
    
  } catch (error) {
    logger.error('Error in combined streak command:', error);
    await ctx.reply(
      'Sorry, there was an error fetching your streak information. Please try again later.\n\n' +
      'Use /prompt to continue your reflection journey!'
    );
  }
}

/**
 * Handle "Get New Prompt" callback from streak command
 */
export async function handleNewPromptCallback(ctx: Context): Promise<void> {
  try {
    // Import dynamically to avoid circular dependencies
    const { handleSendPrompt } = await import('./promptController');
    
    // Answer the callback query first
    await ctx.answerCbQuery('Getting a new prompt for you...');
    
    // Send a new prompt
    await handleSendPrompt(ctx);
    
  } catch (error) {
    logger.error('Error handling new prompt callback:', error);
    await ctx.answerCbQuery('Error getting prompt. Please use /prompt command.');
  }
}