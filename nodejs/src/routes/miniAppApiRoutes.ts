// File: src/routes/miniAppApiRoutes.ts (Fixed version)
// Mini App API routes with weekly streak and points support

import express, { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService'; // Fixed import
import { PromptService } from '../services/promptService'; // Fixed import
//import { IJournalEntry } from '../models/JournalEntry'; // Import IJournalEntry
import { logger } from '../utils/logger';
import { ISubmissionResult } from '../services/userService';

const router = express.Router();

// Initialize services correctly
const weeklyStreakUserService = new UserService(); // Fixed instantiation
const promptService = new PromptService(); // Fixed instantiation

// Define types for better type safety
/*
interface SubmissionResult {
  entry: IJournalEntry;
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
  user: {
    id: string;
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
  };
}
*/
interface StreakStats {
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

interface LeaderboardEntry {
  rank: number;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

interface SystemStats {
  totalActiveStreaks: number;
  totalUsers: number;
  weeklyEntriesCount: number;
  averageStreak: number;
}

/**
 * Handler for POST /api/miniapp/responses
 * Save a journal entry response and process weekly rewards
 */
function saveResponseWithWeeklyRewards(req: Request, res: Response, _next: NextFunction): void {
  const { userId, response } = req.body;
  
  if (!userId || !response) {
    res.status(400).json({ error: 'User ID and response are required' });
    return;
  }
  
  weeklyStreakUserService.getUser(userId)
    .then(async (user: any) => { // Fixed type annotation
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const userWithPrompt = user as any;
      
      if (!userWithPrompt.lastPrompt) {
        res.status(400).json({ error: 'No active prompt found' });
        return;
      }
      
      try {
        // Submit the journal entry and process all weekly rewards
        const result: ISubmissionResult = await weeklyStreakUserService.submitJournalEntry(
          userId,
          userWithPrompt.lastPrompt.text,
          userWithPrompt.lastPrompt.type,
          response
        );
        
        // Generate a motivational message based on the weekly achievement
        const motivationalMessage = weeklyStreakUserService.generateMotivationalMessage(result);
        
        // Return comprehensive weekly reward information for the frontend
        res.json({
          success: true,
          entry: {
            id: result.entry.id,
            prompt: result.entry.prompt,
            response: result.entry.response,
            timestamp: result.entry.timestamp
          },
          rewards: {
            pointsAwarded: result.pointsAwarded,
            newStreak: result.newStreak,
            totalPoints: result.totalPoints,
            milestoneReached: result.milestoneReached,
            streakBroken: result.streakBroken,
            isNewRecord: result.isNewRecord,
            isMultipleEntry: result.isMultipleEntry,
            weekId: result.weekId
          },
          motivationalMessage,
          nextPromptHint: result.isMultipleEntry 
            ? 'Great additional reflection! Your weekly streak continues to grow.' 
            : 'Wonderful weekly reflection! See you next week for continued growth.'
        });
        
        logger.info(`Successfully processed weekly journal entry for user ${userId}`);
      } catch (error) {
        logger.error('Error processing weekly journal entry with rewards:', error);
        res.status(500).json({ error: 'Failed to save entry and process weekly rewards' });
      }
    })
    .catch((err: any) => { // Fixed type annotation
      logger.error('Error getting user for weekly response submission:', err);
      res.status(500).json({ error: 'An error occurred while processing your weekly response' });
    });
}

/**
 * Handler for GET /api/miniapp/streak/:userId
 * Get comprehensive weekly streak and points information for a user
 */
function getWeeklyStreakInfo(req: Request, res: Response, _next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  weeklyStreakUserService.getStreakStats(userId)
    .then((stats: StreakStats) => { // Fixed type annotation
      res.json({
        streak: {
          current: stats.currentStreak,
          longest: stats.longestStreak,
          weeksUntilNextMilestone: stats.weeksUntilNextMilestone,
          nextMilestoneReward: stats.nextMilestoneReward,
          hasEntryThisWeek: stats.hasEntryThisWeek,
          currentWeekId: stats.currentWeekId
        },
        points: {
          total: stats.totalPoints,
          recentHistory: stats.pointsHistory.map((entry: any) => ({ // Fixed type annotation
            points: entry.pointsEarned,
            reason: entry.reason,
            streakWeek: entry.streakWeek,
            weekId: entry.weekIdentifier,
            date: entry.timestamp.toISOString().split('T')[0]
          }))
        },
        milestones: {
          4: 'One Month of Weekly Reflection',
          12: 'Three Months of Consistent Growth',
          26: 'Six Months of Self-Awareness',
          52: 'One Full Year of Reflection',
          104: 'Two Years of Incredible Dedication'
        }
      });
    })
    .catch((err: any) => { // Fixed type annotation
      logger.error('Error fetching weekly streak info:', err);
      res.status(500).json({ error: 'Failed to fetch weekly streak information' });
    });
}

/**
 * Handler for GET /api/miniapp/leaderboard
 * Get weekly leaderboard data with optional limit
 */
function getWeeklyLeaderboard(req: Request, res: Response, _next: NextFunction): void {
  const limit = parseInt(req.query.limit as string) || 10;
  
  weeklyStreakUserService.getLeaderboard(limit)
    .then((leaderboard: LeaderboardEntry[]) => { // Fixed type annotation
      res.json({
        leaderboard: leaderboard.map((entry: LeaderboardEntry) => ({ // Fixed type annotation
          rank: entry.rank,
          userId: entry.userId,
          currentStreak: entry.currentStreak,
          longestStreak: entry.longestStreak,
          totalPoints: entry.totalPoints,
          streakLabel: `${entry.currentStreak} week${entry.currentStreak === 1 ? '' : 's'}`
        }))
      });
    })
    .catch((err: any) => { // Fixed type annotation
      logger.error('Error fetching weekly leaderboard:', err);
      res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
    });
}

/**
 * Handler for GET /api/miniapp/prompt/:userId
 * Get a prompt with weekly streak context
 */
function getPromptWithWeeklyStreak(req: Request, res: Response, _next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  Promise.all([
    weeklyStreakUserService.getUser(userId),
    weeklyStreakUserService.getStreakStats(userId)
  ])
    .then(async ([user, streakStats]) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      try {
        const prompt = await promptService.generatePrompt(userId);
        
        // Save the prompt for this user
        await weeklyStreakUserService.saveLastPrompt(userId, prompt);
        
        res.json({
          prompt: {
            text: prompt.text,
            type: prompt.type
          },
          weeklyContext: {
            currentStreak: streakStats.currentStreak,
            hasEntryThisWeek: streakStats.hasEntryThisWeek,
            currentWeekId: streakStats.currentWeekId,
            nextMilestone: streakStats.weeksUntilNextMilestone > 0 
              ? `${streakStats.weeksUntilNextMilestone} weeks until next milestone`
              : 'All milestones achieved!'
          },
          encouragement: streakStats.hasEntryThisWeek
            ? 'Great job on your weekly reflection! Feel free to add more thoughts.'
            : streakStats.currentStreak > 0
              ? `Keep your ${streakStats.currentStreak}-week streak alive!`
              : 'Start your weekly reflection journey today!'
        });
      } catch (error) {
        logger.error('Error generating prompt with weekly context:', error);
        res.status(500).json({ error: 'Failed to generate prompt' });
      }
    })
    .catch((error: any) => {
      logger.error('Error in getPromptWithWeeklyStreak:', error);
      res.status(500).json({ error: 'An error occurred while generating your prompt' });
    });
}

/**
 * Handler for GET /api/miniapp/history/:userId
 * Get journal history with weekly stats
 */
function getHistoryWithWeeklyStats(req: Request, res: Response, _next: NextFunction): void {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  Promise.all([
    weeklyStreakUserService.getRecentEntries(userId, limit),
    weeklyStreakUserService.getStreakStats(userId)
  ])
    .then(([entries, streakStats]) => {
      const pointsHistory = streakStats.pointsHistory;
      
      const entriesWithWeeklyPoints = entries.map((entry: any) => { // Fixed type annotation
        const pointsEntries = pointsHistory.filter((p: any) => p.entryId === entry.id); // Fixed type annotation
        const totalPointsForEntry = pointsEntries.reduce((sum: number, p: any) => sum + p.pointsEarned, 0); // Fixed type annotation
        const weeklyData = pointsEntries.find((p: any) => p.reason.includes('weekly') || p.reason.includes('streak')); // Fixed type annotation
        
        return {
          ...entry,
          weeklyPoints: {
            total: totalPointsForEntry,
            weekId: weeklyData?.weekIdentifier || null,
            streakWeek: weeklyData?.streakWeek || null,
            isMilestone: pointsEntries.some((p: any) => p.reason.includes('milestone')), // Fixed type annotation
            wasMultipleEntry: pointsEntries.some((p: any) => p.reason.includes('additional')) // Fixed type annotation
          }
        };
      });
      
      res.json({
        entries: entriesWithWeeklyPoints,
        streakContext: {
          currentStreak: streakStats.currentStreak,
          longestStreak: streakStats.longestStreak,
          totalPoints: streakStats.totalPoints
        }
      });
    })
    .catch((error: any) => {
      logger.error('Error getting history with weekly stats:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    });
}

/**
 * Handler for GET /api/miniapp/system/stats
 * Get system-wide weekly statistics
 */
function getWeeklySystemStats(_req: Request, res: Response, _next: NextFunction): void {
  weeklyStreakUserService.getSystemStats()
    .then((stats: SystemStats) => { // Fixed type annotation
      res.json({
        system: {
          totalUsers: stats.totalUsers,
          activeStreaks: stats.totalActiveStreaks,
          weeklyEntries: stats.weeklyEntriesCount,
          averageStreak: stats.averageStreak
        },
        timestamp: new Date().toISOString()
      });
    })
    .catch((err: any) => { // Fixed type annotation
      logger.error('Error fetching system stats:', err);
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    });
}

/**
 * Handler for GET /api/miniapp/milestones
 * Get weekly milestone information
 */
function getWeeklyMilestones(_req: Request, res: Response, _next: NextFunction): void {
  res.json({
    milestones: [
      { weeks: 4, title: 'Monthly Reflector', reward: 500, description: 'One month of consistent weekly reflection' },
      { weeks: 12, title: 'Quarterly Champion', reward: 1500, description: 'Three months of dedicated growth' },
      { weeks: 26, title: 'Half-Year Hero', reward: 3000, description: 'Six months of self-awareness journey' },
      { weeks: 52, title: 'Annual Achiever', reward: 6000, description: 'One full year of reflection mastery' },
      { weeks: 104, title: 'Biennial Master', reward: 12000, description: 'Two years of incredible dedication' }
    ],
    description: 'Weekly milestones reward consistent reflection habits with bonus points and recognition.'
  });
}

// Export route handlers
router.post('/responses', saveResponseWithWeeklyRewards);
router.get('/streak/:userId', getWeeklyStreakInfo);
router.get('/leaderboard', getWeeklyLeaderboard);
router.get('/prompt/:userId', getPromptWithWeeklyStreak);
router.get('/history/:userId', getHistoryWithWeeklyStats);
router.get('/system/stats', getWeeklySystemStats);
router.get('/milestones', getWeeklyMilestones);

export default router;