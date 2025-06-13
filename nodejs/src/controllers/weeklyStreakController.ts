// File: src/controllers/weeklyStreakController.ts (Fixed version)
// Fixed controller for handling weekly streak commands in Telegram bot

import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { UserService } from '../services/userService'; // Fixed import
import { logger } from '../utils/logger';
import { IPointsHistory } from '../models/Points';

// Initialize weekly-enabled user service
const weeklyUserService = new UserService(); // Fixed instantiation

// Define types for better type safety
interface IStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  pointsHistory: IPointsHistory[];
}

interface ILeaderboardEntry {
  rank: number;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

interface ISubmissionResult {
  entry: {
    id: number;
    prompt: string;
    response: string;
    timestamp: Date;
  };
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
}

/**
 * Handle the /streak command - show user's weekly streak information
 */
export async function handleWeeklyStreakCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in weekly streak command');
      return;
    }
    
    const streakStats: IStreakStats = await weeklyUserService.getStreakStats(userId);
    const currentWeek: string = weeklyUserService.getCurrentWeekId();
    
    // Create a comprehensive streak report
    let message = `📊 Your Weekly Reflection Journey\n\n`;
    
    // Current streak section
    message += `🔥 Current Streak: ${streakStats.currentStreak} week${streakStats.currentStreak === 1 ? '' : 's'}\n`;
    message += `🏆 Personal Best: ${streakStats.longestStreak} week${streakStats.longestStreak === 1 ? '' : 's'}\n`;
    message += `💎 Total Points: ${streakStats.totalPoints.toLocaleString()}\n\n`;
    
    // This week status
    if (streakStats.hasEntryThisWeek) {
      message += `✅ Week ${currentWeek}: Reflection complete!\n`;
      message += `You can always add more reflections this week for bonus points.\n\n`;
    } else {
      message += `📅 Week ${currentWeek}: Awaiting your weekly reflection\n`;
      if (streakStats.currentStreak > 0) {
        message += `Keep your ${streakStats.currentStreak}-week streak alive!\n\n`;
      } else {
        message += `Start or restart your weekly reflection journey!\n\n`;
      }
    }
    
    // Next milestone information
    if (streakStats.weeksUntilNextMilestone > 0) {
      message += `🎯 Next Milestone: ${streakStats.weeksUntilNextMilestone} week${streakStats.weeksUntilNextMilestone === 1 ? '' : 's'} away\n`;
      message += `Reward: ${streakStats.nextMilestoneReward} bonus points\n\n`;
    }
    
    // Recent activity
    if (streakStats.pointsHistory.length > 0) {
      message += `📈 Recent Activity:\n`;
      streakStats.pointsHistory.slice(0, 3).forEach((entry: IPointsHistory) => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        message += `• ${date}: +${entry.pointsEarned} points (${formatReason(entry.reason)})\n`;
      });
    }
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in weekly streak command:', error);
    await ctx.reply('Sorry, there was an error fetching your weekly streak information. Please try again later.');
  }
}

/**
 * Handle the /leaderboard command - show top weekly performers
 */
export async function handleLeaderboardCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in leaderboard command');
      return;
    }
    
    const leaderboard: ILeaderboardEntry[] = await weeklyUserService.getLeaderboard(10);
    
    let message = `🏆 Weekly Reflection Leaderboard\n\n`;
    
    if (leaderboard.length === 0) {
      message += `No weekly streaks yet! Be the first to start your journey.\n\n`;
      message += `Use any prompt command to begin your weekly reflection streak!`;
    } else {
      leaderboard.forEach((user: ILeaderboardEntry, index: number) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
        message += `${medal} #${user.rank}: ${user.currentStreak} weeks (${user.totalPoints.toLocaleString()} pts)\n`;
      });
      
      // Find current user's rank in the leaderboard
      const currentUser = leaderboard.find((user: ILeaderboardEntry) => user.userId === userId);
      if (!currentUser && leaderboard.length === 10) {
        // User might be ranked lower than top 10, get extended leaderboard to find them
        try {
          const extendedLeaderboard: ILeaderboardEntry[] = await weeklyUserService.getLeaderboard(100);
          const userInExtended = extendedLeaderboard.find((user: ILeaderboardEntry) => user.userId === userId);
          if (userInExtended) {
            message += `\n⭐ Your rank: #${userInExtended.rank}`;
          }
        } catch (error) {
          // If we can't get extended leaderboard, just skip showing user rank
          logger.warn('Could not fetch extended leaderboard for user rank');
        }
      }
    }
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in leaderboard command:', error);
    await ctx.reply('Sorry, there was an error fetching the leaderboard. Please try again later.');
  }
}

/**
 * Handle text messages for weekly journal submissions
 */
export async function handleWeeklyJournalSubmission(ctx: Context): Promise<void> {
  try {
    // Check if message has text property using type guard
    const message = ctx.message;
    if (!message || !('text' in message)) {
      return;
    }
    
    const textMessage = message as Message.TextMessage;
    const userId = ctx.from?.id.toString();
    const responseText = textMessage.text;
    
    if (!userId || !responseText) {
      logger.error('Missing user ID or response text');
      return;
    }
    
    // Ignore command messages
    if (responseText.startsWith('/')) {
      return;
    }
    
    // Get user data
    const user = await weeklyUserService.getUser(userId);
    
    if (!user) {
      logger.info(`User ${userId} not found, suggesting to start the bot`);
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Check if user has a recent prompt
    const userWithPrompt = user as any; // Temporary any cast for lastPrompt access
    if (!userWithPrompt.lastPrompt) {
      await ctx.reply(
        "I don't see a recent prompt for you. Use /prompt to get a new reflection question!"
      );
      return;
    }
    
    // Submit the weekly journal entry
    const submissionResult: ISubmissionResult = await weeklyUserService.submitJournalEntry(
      userId,
      userWithPrompt.lastPrompt.text,
      userWithPrompt.lastPrompt.type,
      responseText
    );
    
    // Create response message based on submission result
    let responseMessage = '';
    
    if (submissionResult.streakBroken) {
      responseMessage += `😔 Your streak was broken, but you're starting fresh!\n\n`;
    }
    
    if (submissionResult.isNewRecord) {
      responseMessage += `🎉 NEW PERSONAL RECORD!\n`;
      responseMessage += `You've reached ${submissionResult.newStreak} weeks - your longest streak yet!\n\n`;
    } else if (!submissionResult.isMultipleEntry) {
      responseMessage += `🔥 Streak continued: ${submissionResult.newStreak} week${submissionResult.newStreak === 1 ? '' : 's'}!\n\n`;
    }
    
    if (submissionResult.isMultipleEntry) {
      responseMessage += `✨ Bonus reflection this week! `;
    } else {
      responseMessage += `📝 Weekly reflection saved! `;
    }
    
    responseMessage += `+${submissionResult.pointsAwarded} points\n`;
    responseMessage += `💎 Total: ${submissionResult.totalPoints.toLocaleString()} points\n\n`;
    
    if (submissionResult.milestoneReached) {
      responseMessage += `🏆 MILESTONE ACHIEVED! ${submissionResult.milestoneReached} week milestone bonus!\n\n`;
    }
    
    responseMessage += `Use /streak to see your complete weekly journey stats!`;
    
    await ctx.reply(responseMessage);
    
    logger.info(`Weekly journal submission processed for user ${userId}: ${submissionResult.pointsAwarded} points, streak ${submissionResult.newStreak}`);
    
  } catch (error) {
    logger.error('Error processing weekly journal submission:', error);
    await ctx.reply('Sorry, there was an error saving your reflection. Please try again later.');
  }
}

/**
 * Format reason text for display
 */
function formatReason(reason: string): string {
  return reason
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char: string) => char.toUpperCase());
}

/**
 * Get milestone name based on week count
 */
/*
function getMilestoneName(weeks: number): string {
  const milestones: { [key: number]: string } = {
    4: 'Monthly Reflector',
    12: 'Quarterly Champion', 
    26: 'Half-Year Hero',
    52: 'Annual Achiever',
    104: 'Biennial Master'
  };
  return milestones[weeks] || `${weeks}-Week Achievement`;
}
  */