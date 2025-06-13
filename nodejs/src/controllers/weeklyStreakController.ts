// File: src/controllers/weeklyStreakController.ts
// New controller for handling weekly streak commands in Telegram bot

import { Context } from 'telegraf';
import { userService } from '../services/userService';
import { logger } from '../utils/logger';
import { Points } from '../models/Points';

// Initialize weekly-enabled user service
const weeklyUserService = new userService.UserService();

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
    
    const streakStats = await weeklyUserService.getStreakStats(userId);
    const currentWeek = weeklyUserService.getCurrentWeekId();
    
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
      streakStats.pointsHistory.slice(0, 3).forEach(entry => {
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
 * Handle the /leaderboard command - show weekly streak leaderboard
 */
export async function handleWeeklyLeaderboardCommand(ctx: Context): Promise<void> {
  try {
    const leaderboard = await weeklyUserService.getLeaderboard(10);
    const systemStats = await weeklyUserService.getSystemStats();
    
    let message = `🏆 Weekly Reflection Leaderboard\n\n`;
    
    if (leaderboard.length === 0) {
      message += `No one has started their weekly reflection journey yet.\nBe the first to begin!\n\n`;
    } else {
      leaderboard.forEach((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
        message += `${medal} #${entry.rank}: ${entry.totalPoints.toLocaleString()} pts (${entry.currentStreak}w streak)\n`;
      });
      message += '\n';
    }
    
    // System statistics
    message += `📊 Community Stats:\n`;
    message += `• ${systemStats.totalActiveStreaks} active streaks\n`;
    message += `• ${systemStats.averageStreak} weeks average streak\n`;
    message += `• ${systemStats.longestCurrentStreak} weeks longest current streak\n`;
    message += `• ${systemStats.usersWithMultipleEntriesThisWeek} users with multiple entries this week\n\n`;
    message += `Weekly reflection builds lasting self-awareness! 🌱`;
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in weekly leaderboard command:', error);
    await ctx.reply('Sorry, there was an error fetching the weekly leaderboard. Please try again later.');
  }
}

/**
 * Handle the /weekinfo command - explain the weekly streak system
 */
export async function handleWeekInfoCommand(ctx: Context): Promise<void> {
  try {
    const currentWeek = Points.getWeekIdentifier();
    
    const message = `
📅 Weekly Reflection System

🌟 How it works:
• Receive a thoughtful prompt each week
• Complete your reflection to maintain your streak
• Earn points based on your consistency
• Reach milestones for bonus rewards

💎 Point System:
• Base: 50 points per weekly reflection
• Streak Bonus: +10 points per week in streak
• Multiple entries: +20 points each
• Milestones: Bonus rewards at 4, 12, 26, 52+ weeks

🏆 Milestones:
• 4 weeks: Monthly Reflector (+200 pts)
• 12 weeks: Quarterly Champion (+500 pts)
• 26 weeks: Half-Year Hero (+1,000 pts)
• 52 weeks: Annual Achiever (+2,500 pts)
• 104 weeks: Biennial Master (+5,000 pts)

📊 Current Week: ${currentWeek}

Weekly reflection builds deeper self-awareness through consistency over frequency. Quality thoughts, sustained over time. 🌱

Use /streak to see your progress!
    `.trim();
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in week info command:', error);
    await ctx.reply('Sorry, there was an error explaining the weekly system. Please try again later.');
  }
}

/**
 * Handle the /mystats command - detailed personal statistics
 */
export async function handleMyStatsCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in my stats command');
      return;
    }
    
    const user = await weeklyUserService.getUser(userId);
    const streakStats = await weeklyUserService.getStreakStats(userId);
    const pointsHistory = await weeklyUserService.getPointsHistory(userId, 10);
    
    if (!user) {
      await ctx.reply('Please start the bot with /start first!');
      return;
    }
    
    // Calculate some interesting stats
    const weeksActive = new Set(pointsHistory.map(p => p.weekIdentifier)).size;
    const totalEntries = user.promptCount;
    const avgPointsPerEntry = totalEntries > 0 ? Math.round(streakStats.totalPoints / totalEntries) : 0;
    const consistency = streakStats.longestStreak > 0 ? 
      Math.round((streakStats.currentStreak / streakStats.longestStreak) * 100) : 100;
    
    let message = `📊 Your Weekly Reflection Statistics\n\n`;
    
    // Core stats
    message += `🔥 Current Streak: ${streakStats.currentStreak} weeks\n`;
    message += `🏆 Personal Best: ${streakStats.longestStreak} weeks\n`;
    message += `💎 Total Points: ${streakStats.totalPoints.toLocaleString()}\n`;
    message += `📝 Total Reflections: ${totalEntries}\n\n`;
    
    // Calculated insights
    message += `📈 Insights:\n`;
    message += `• Active for ${weeksActive} different weeks\n`;
    message += `• Average ${avgPointsPerEntry} points per reflection\n`;
    message += `• Current consistency: ${consistency}% of personal best\n`;
    
    if (streakStats.hasEntryThisWeek) {
      message += `• ✅ Completed this week's reflection\n`;
    } else {
      message += `• ⏳ This week's reflection pending\n`;
    }
    
    // Milestone progress
    if (streakStats.weeksUntilNextMilestone > 0) {
      message += `\n🎯 Next milestone in ${streakStats.weeksUntilNextMilestone} weeks\n`;
      message += `Reward: ${streakStats.nextMilestoneReward} bonus points\n`;
    }
    
    // Recent point sources
    if (pointsHistory.length > 0) {
      message += `\n💰 Recent Points:\n`;
      pointsHistory.slice(0, 5).forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        message += `• ${date}: +${entry.pointsEarned} (${formatReason(entry.reason)})\n`;
      });
    }
    
    await ctx.reply(message);
    
  } catch (error) {
    logger.error('Error in my stats command:', error);
    await ctx.reply('Sorry, there was an error fetching your statistics. Please try again later.');
  }
}

/**
 * Format point earning reasons for display
 */
function formatReason(reason: string): string {
  const reasonMap: { [key: string]: string } = {
    'weekly_entry': 'Weekly reflection',
    'streak_continuation': 'Streak maintained', 
    'streak_restart': 'Fresh start',
    'additional_weekly_entry': 'Bonus reflection',
    'milestone_4_weeks': '1 month milestone',
    'milestone_12_weeks': '3 month milestone',
    'milestone_26_weeks': '6 month milestone',
    'milestone_52_weeks': '1 year milestone',
    'milestone_104_weeks': '2 year milestone',
  };
  
  return reasonMap[reason] || reason.replace(/_/g, ' ');
}

/**
 * Enhanced response handler that includes weekly streak rewards
 * This replaces or enhances your existing response handling
 */
export async function handleWeeklyReflectionResponse(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const responseText = ctx.message?.text;
    
    if (!userId || !responseText) {
      return;
    }
    
    // Check if user has a pending prompt
    const user = await weeklyUserService.getUser(userId);
    if (!user || !user.lastPrompt) {
      return; // Let other handlers deal with this
    }
    
    // Process the weekly reflection entry
    const result = await weeklyUserService.submitJournalEntry(
      userId,
      user.lastPrompt.text,
      user.lastPrompt.type,
      responseText
    );
    
    // Generate motivational response
    const motivationalMessage = weeklyUserService.generateMotivationalMessage(result);
    
    // Create a comprehensive response
    let response = `${motivationalMessage}\n\n`;
    
    // Add specific achievement details
    if (result.milestoneReached) {
      response += `🎉 MILESTONE BONUS: You've reached ${result.milestoneReached} weeks of consistent reflection!\n\n`;
    }
    
    if (result.isNewRecord) {
      response += `📈 NEW PERSONAL RECORD: ${result.newStreak} weeks is your longest streak ever!\n\n`;
    }
    
    if (result.isMultipleEntry) {
      response += `✨ Additional reflection this week! Bonus points earned for going deeper.\n\n`;
    }
    
    // Add point breakdown
    response += `💎 Points Earned: ${result.pointsAwarded}\n`;
    response += `🔥 Current Streak: ${result.newStreak} weeks\n`;
    response += `💰 Total Points: ${result.totalPoints.toLocaleString()}\n\n`;
    
    response += `Thank you for your thoughtful reflection! 🌱\n\n`;
    response += `Use /streak to see your full progress, or /schedule to manage your weekly prompts.`;
    
    await ctx.reply(response);
    
    logger.info(`Processed weekly reflection for user ${userId}: ${result.pointsAwarded} points, ${result.newStreak} week streak`);
    
  } catch (error) {
    logger.error('Error handling weekly reflection response:', error);
    await ctx.reply('Thank you for your reflection! There was a small issue processing your streak, but your entry has been saved.');
  }
}