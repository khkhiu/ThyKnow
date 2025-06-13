// File: src/routes/miniAppApiRoutes.ts (Updated for Weekly Streaks)
// Mini App API routes with weekly streak and points support

import express, { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { promptService } from '../services';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize userService with weekly configuration
const weeklyStreakUserService = new userService.UserService();

/**
 * Handler for POST /api/miniapp/responses
 * Save a journal entry response and process weekly rewards
 */
function saveResponseWithWeeklyRewards(req: Request, res: Response, next: NextFunction): void {
  const { userId, response } = req.body;
  
  if (!userId || !response) {
    res.status(400).json({ error: 'User ID and response are required' });
    return;
  }
  
  weeklyStreakUserService.getUser(userId)
    .then(async user => {
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
        const result = await weeklyStreakUserService.submitJournalEntry(
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
    .catch(err => {
      logger.error('Error getting user for weekly response submission:', err);
      res.status(500).json({ error: 'An error occurred while processing your weekly response' });
    });
}

/**
 * Handler for GET /api/miniapp/streak/:userId
 * Get comprehensive weekly streak and points information for a user
 */
function getWeeklyStreakInfo(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  weeklyStreakUserService.getStreakStats(userId)
    .then(stats => {
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
          recentHistory: stats.pointsHistory.map(entry => ({
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
    .catch(err => {
      logger.error('Error fetching weekly streak info:', err);
      res.status(500).json({ error: 'Failed to fetch weekly streak information' });
    });
}

/**
 * Handler for GET /api/miniapp/leaderboard
 * Get weekly leaderboard data with optional limit
 */
function getWeeklyLeaderboard(req: Request, res: Response, next: NextFunction): void {
  const limit = parseInt(req.query.limit as string) || 10;
  
  weeklyStreakUserService.getLeaderboard(limit)
    .then(leaderboard => {
      res.json({
        leaderboard: leaderboard.map(entry => ({
          rank: entry.rank,
          userId: entry.userId,
          currentStreak: entry.currentStreak,
          longestStreak: entry.longestStreak,
          totalPoints: entry.totalPoints,
          streakLabel: `${entry.currentStreak} week${entry.currentStreak === 1 ? '' : 's'}`
        })),
        type: 'weekly',
        description: 'Weekly reflection streaks - consistency over frequency'
      });
    })
    .catch(err => {
      logger.error('Error fetching weekly leaderboard:', err);
      res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
    });
}

/**
 * Handler for GET /api/miniapp/prompt/:userId
 * Generate a new prompt and include current weekly streak information
 */
function getPromptWithWeeklyStreak(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  Promise.all([
    weeklyStreakUserService.getUser(userId),
    weeklyStreakUserService.hasEntryThisWeek(userId)
  ])
    .then(async ([user, hasEntryThisWeek]) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      try {
        // Generate a new prompt
        const prompt = await promptService.generatePrompt(userId);
        
        // Create weekly-appropriate context messages
        let streakContext, hint;
        
        if (hasEntryThisWeek) {
          streakContext = `You've already reflected this week! Your ${user.currentStreak}-week streak continues.`;
          hint = 'Additional weekly reflections deepen your self-awareness and earn bonus points.';
        } else {
          if (user.currentStreak === 0) {
            streakContext = 'Start your weekly reflection journey!';
            hint = 'Begin building a powerful habit of weekly self-reflection.';
          } else {
            streakContext = `Keep your ${user.currentStreak}-week streak alive!`;
            hint = 'Maintain your consistency with this week\'s reflection to continue growing.';
          }
        }
        
        const promptData = {
          type: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
          text: prompt.text,
          hint,
          streakContext,
          currentStreak: user.currentStreak,
          totalPoints: user.totalPoints,
          hasEntryThisWeek,
          weekId: weeklyStreakUserService.getCurrentWeekId(),
          isWeeklySystem: true
        };
        
        logger.info(`Generated weekly prompt for user ${userId} with streak context`);
        res.json(promptData);
      } catch (error) {
        logger.error('Error generating prompt with weekly streak info:', error);
        res.status(500).json({ error: 'Failed to generate prompt' });
      }
    })
    .catch(err => {
      logger.error('Error in getPromptWithWeeklyStreak:', err);
      res.status(500).json({ error: 'An error occurred while fetching weekly prompt data' });
    });
}

/**
 * Handler for GET /api/miniapp/history/:userId
 * Get journal entry history with weekly stats
 */
function getHistoryWithWeeklyStats(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  Promise.all([
    weeklyStreakUserService.getRecentEntries(userId, limit),
    weeklyStreakUserService.getPointsHistory(userId, limit)
  ])
    .then(([entries, pointsHistory]) => {
      // Combine entry data with weekly points information
      const entriesWithWeeklyPoints = entries.map(entry => {
        const pointsEntries = pointsHistory.filter(p => p.entryId === entry.id);
        const totalPointsForEntry = pointsEntries.reduce((sum, p) => sum + p.pointsEarned, 0);
        const weeklyData = pointsEntries.find(p => p.reason.includes('weekly') || p.reason.includes('streak'));
        
        return {
          id: entry.id,
          date: entry.timestamp.toISOString().split('T')[0],
          week: pointsEntries[0]?.weekIdentifier || 'N/A',
          promptType: entry.promptType,
          prompt: entry.prompt,
          response: entry.response,
          pointsEarned: totalPointsForEntry,
          streakWeek: weeklyData?.streakWeek || 0,
          wasMultipleEntry: pointsEntries.some(p => p.reason.includes('additional'))
        };
      });
      
      res.json({
        entries: entriesWithWeeklyPoints,
        totalEntries: entries.length,
        systemType: 'weekly',
        description: 'Your weekly reflection journey'
      });
    })
    .catch(err => {
      logger.error('Error fetching enhanced weekly history:', err);
      res.status(500).json({ error: 'Failed to fetch weekly entry history' });
    });
}

/**
 * Handler for GET /api/miniapp/stats
 * Get system-wide weekly streak statistics
 */
function getWeeklySystemStats(req: Request, res: Response, next: NextFunction): void {
  weeklyStreakUserService.getSystemStats()
    .then(stats => {
      res.json({
        system: 'weekly',
        stats: {
          totalActiveStreaks: stats.totalActiveStreaks,
          averageStreak: `${stats.averageStreak} weeks`,
          longestCurrentStreak: `${stats.longestCurrentStreak} weeks`,
          usersWithMultipleEntriesThisWeek: stats.usersWithMultipleEntriesThisWeek,
          currentWeek: stats.currentWeek
        },
        description: 'Global weekly reflection statistics'
      });
    })
    .catch(err => {
      logger.error('Error fetching weekly system stats:', err);
      res.status(500).json({ error: 'Failed to fetch weekly system statistics' });
    });
}

/**
 * Handler for GET /api/miniapp/milestones
 * Get information about weekly streak milestones
 */
function getWeeklyMilestones(req: Request, res: Response, next: NextFunction): void {
  const milestones = [
    { weeks: 4, title: 'Monthly Reflector', description: 'One month of weekly self-reflection', points: 200 },
    { weeks: 12, title: 'Quarterly Champion', description: 'Three months of consistent growth', points: 500 },
    { weeks: 26, title: 'Half-Year Hero', description: 'Six months of dedicated self-awareness', points: 1000 },
    { weeks: 52, title: 'Annual Achiever', description: 'One full year of weekly reflection', points: 2500 },
    { weeks: 104, title: 'Biennial Master', description: 'Two years of incredible commitment', points: 5000 }
  ];

  res.json({
    milestones,
    systemType: 'weekly',
    description: 'Weekly reflection milestone rewards'
  });
}

// Define the routes with the weekly-enabled handlers
router.post('/responses', saveResponseWithWeeklyRewards);
router.get('/streak/:userId', getWeeklyStreakInfo);
router.get('/leaderboard', getWeeklyLeaderboard);
router.get('/prompt/:userId', getPromptWithWeeklyStreak);
router.get('/history/:userId', getHistoryWithWeeklyStats);
router.get('/stats', getWeeklySystemStats);
router.get('/milestones', getWeeklyMilestones);

export default router;