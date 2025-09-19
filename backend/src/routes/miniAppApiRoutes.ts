// src/routes/miniAppApiRoutes.ts
// Complete Mini App API routes with both original functionality and weekly streak support

import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { logger } from '../utils/logger';
import { validateTelegramRequest } from '../middleware/telegramValidator';
import { PromptType } from '../types';

// Also import the weekly streak services
import { UserService } from '../services/userService'; // Weekly streak version
import { PromptService } from '../services/promptService'; // Weekly streak version
import { ISubmissionResult } from '../services/userService';
import path from 'path';
import config from '../config';

const router = Router();

// Initialize both regular and weekly streak services
const weeklyStreakUserService = new UserService(); // For weekly streak features
const weeklyPromptService = new PromptService(); // For weekly streak features

// Apply Telegram validation middleware to all API routes
// Comment out during development if causing issues
// router.use(validateTelegramRequest);

// Define types for weekly streak functionality
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

interface SystemStats {
  totalActiveStreaks: number;
  totalUsers: number;
  weeklyEntriesCount: number;
  averageStreak: number;
}

/**
 * Handler for GET /api/miniapp/prompts/today/:userId
 * Get today's prompt for a user
 */
function getTodaysPrompt(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  userService.getUser(userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Get the last prompt for this user
      const userWithPrompt = user as any; // Using any to simplify access to lastPrompt
      
      if (userWithPrompt.lastPrompt) {
        // Return the user's last prompt
        const promptData = {
          type: userWithPrompt.lastPrompt.type,
          typeLabel: userWithPrompt.lastPrompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
          text: userWithPrompt.lastPrompt.text,
          hint: 'Reflect deeply on this prompt to gain new insights.'
        };
        res.json(promptData);
      } else {
        // Generate a new prompt if none exists
        promptService.getNextPromptForUser(userId)
          .then(prompt => {
            // Save as last prompt
            userService.saveLastPrompt(userId, prompt.text, prompt.type)
              .then(() => {
                const promptData = {
                  type: prompt.type,
                  typeLabel: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
                  text: prompt.text,
                  hint: 'Reflect deeply on this prompt to gain new insights.'
                };
                res.json(promptData);
              })
              .catch(err => next(err));
          })
          .catch(err => next(err));
      }
    })
    .catch(err => {
      logger.error('Error fetching prompt:', err);
      res.status(500).json({ error: 'An error occurred while fetching the prompt' });
    });
}

/**
 * Handler for POST /api/miniapp/prompts/new/:userId
 * Generate a new prompt for a user (ORIGINAL FUNCTIONALITY)
 */
function generateNewPrompt(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  userService.getUser(userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Generate a new prompt
      promptService.getNextPromptForUser(userId)
        .then(prompt => {
          // Save as last prompt
          userService.saveLastPrompt(userId, prompt.text, prompt.type)
            .then(() => {
              const promptData = {
                type: prompt.type,
                typeLabel: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
                text: prompt.text, 
                hint: 'Reflect deeply on this prompt to gain new insights.'
              };
              
              logger.info(`Generated new prompt for user ${userId} via button click`);
              res.json(promptData);
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => {
      logger.error('Error generating new prompt:', err);
      res.status(500).json({ error: 'An error occurred while generating a new prompt' });
    });
}

/**
 * Handler for GET /api/miniapp/history/:userId
 * Get journal entry history for a user with optional limit
 */
function getHistory(req: Request, res: Response, _next: NextFunction): void {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  userService.getRecentEntries(userId, limit)
    .then(entries => {
      // Format for the mini app
      const formattedEntries = entries.map(entry => ({
        id: entry.id,
        date: entry.timestamp.toISOString().split('T')[0],
        promptType: entry.promptType,
        prompt: entry.prompt,
        response: entry.response
      }));
      
      res.json(formattedEntries);
    })
    .catch(err => {
      logger.error('Error fetching history:', err);
      res.status(500).json({ error: 'An error occurred while fetching the history' });
    });
}

/**
 * Handler for POST /api/miniapp/responses
 * Save a journal entry response without generating a new prompt (ORIGINAL FUNCTIONALITY)
 */
function saveResponse(req: Request, res: Response, next: NextFunction): void {
  const { userId, response } = req.body;
  
  if (!userId || !response) {
    res.status(400).json({ error: 'User ID and response are required' });
    return;
  }
  
  userService.getUser(userId)
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
      
      // Create journal entry
      const entry = {
        prompt: userWithPrompt.lastPrompt.text,
        promptType: userWithPrompt.lastPrompt.type as PromptType,
        response: response,
        timestamp: new Date()
      };
      
      try {
        // Save response
        const entryId = await userService.saveResponse(userId, entry);
        
        // Return success without generating a new prompt
        res.status(201).json({
          success: true,
          message: 'Response saved successfully',
          entryId,
          // Flag to indicate the user needs to press a button for a new prompt
          needsNewPrompt: true
        });
        
        logger.info(`Saved response for user ${userId} - waiting for them to request a new prompt`);
      } catch (err) {
        next(err);
      }
    })
    .catch(err => {
      logger.error('Error saving response:', err);
      res.status(500).json({ error: 'An error occurred while saving the response' });
    });
}

/**
 * Handler for GET /api/miniapp/pet/random
 * Get a random affirmation
 */
function getRandomAffirmation(_req: Request, res: Response): void {
  try {
    // List of pet affirmations
    const pet = [
      {
        text: "You don't have to be perfect to be amazing. Even T-Rex had tiny arms and still ruled the Earth!",
        author: "ThyKnow Dino"
      },
      {
        text: "Your potential is as vast as the prehistoric skies. Embrace every opportunity to grow today.",
        author: "ThyKnow Dino"
      },
      {
        text: "You are stronger than you think, braver than you believe, and smarter than you imagine.",
        author: "ThyKnow Dino"
      },
      {
        text: "Small steps lead to big changes. Dinosaurs didn't evolve in a day!",
        author: "ThyKnow Dino"
      },
      {
        text: "Be kind to yourself today. Self-compassion is the foundation of all growth.",
        author: "ThyKnow Dino"
      },
      {
        text: "Your challenges don't define you—how you respond to them does. Face today with a RAWR!",
        author: "ThyKnow Dino"
      },
      {
        text: "Like fossils buried in rock, your greatest qualities are sometimes hidden from view. They're still there!",
        author: "ThyKnow Dino"
      },
      {
        text: "You have survived 100% of your worst days so far. You've got prehistoric-level resilience!",
        author: "ThyKnow Dino"
      },
      {
        text: "It's okay to take a break. Even the mightiest dinosaurs needed rest!",
        author: "ThyKnow Dino"
      },
      {
        text: "Your journey is uniquely yours. Embrace your path—after all, no two dinosaur tracks are exactly alike!",
        author: "ThyKnow Dino"
      }
    ];
    
    // Get a random affirmation
    const randomIndex = Math.floor(Math.random() * pet.length);
    res.json(pet[randomIndex]);
  } catch (error) {
    logger.error('Error fetching random affirmation:', error);
    res.status(500).json({ error: 'An error occurred while fetching a random affirmation' });
  }
}

/**
 * Handler for POST /api/miniapp/pet/share
 * Share an affirmation to a Telegram chat
 */
function shareAffirmation(req: Request, res: Response): void {
  const { userId, affirmation } = req.body;
  
  if (!userId || !affirmation) {
    res.status(400).json({ error: 'User ID and affirmation are required' });
    return;
  }
  
  try {
    // In a real implementation, this would use the Telegram API to share the affirmation
    // For now, we'll just log it and return success
    logger.info(`User ${userId} shared affirmation: ${affirmation}`);
    
    res.status(200).json({
      success: true,
      message: 'Affirmation shared successfully'
    });
  } catch (error) {
    logger.error('Error sharing affirmation:', error);
    res.status(500).json({ error: 'An error occurred while sharing the affirmation' });
  }
}

/**
 * Handler for GET /api/miniapp/dinoMessages/random
 * Get a random dino speech bubble message
 */
function getRandomDinoMessage(_req: Request, res: Response): void {
  try {
    // List of dino speech messages
    const dinoMessages = [
      "You're doing great!",
      "Rawr! That means 'awesome' in dinosaur!",
      "I believe in you!",
      "You've got this!",
      "Keep going, you're amazing!",
      "You make this dinosaur proud!",
      "Sending prehistoric good vibes!",
      "Your growth mindset is dino-mite!",
      "Remember to be kind to yourself!",
      "Even T-Rex had small arms but a big impact!"
    ];
    
    // Get a random message
    const randomIndex = Math.floor(Math.random() * dinoMessages.length);
    res.json({ message: dinoMessages[randomIndex] });
  } catch (error) {
    logger.error('Error fetching random dino message:', error);
    res.status(500).json({ error: 'An error occurred while fetching a random dino message' });
  }
}

// ===== WEEKLY STREAK FUNCTIONALITY =====

/**
 * Handler for POST /api/miniapp/responses/weekly
 * Save a journal entry response and process weekly rewards
 */
function saveResponseWithWeeklyRewards(req: Request, res: Response, _next: NextFunction): void {
  const { userId, response } = req.body;
  
  if (!userId || !response) {
    res.status(400).json({ error: 'User ID and response are required' });
    return;
  }
  
  weeklyStreakUserService.getUser(userId)
    .then(async (user: any) => {
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
    .catch((err: any) => {
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
    .then((stats: StreakStats) => {
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
          recentHistory: stats.pointsHistory.map((entry: any) => ({
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
    .catch((err: any) => {
      logger.error('Error fetching weekly streak info:', err);
      res.status(500).json({ error: 'Failed to fetch weekly streak information' });
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
        const prompt = await weeklyPromptService.generatePrompt(userId);
        
        // Save the prompt for this user
        await weeklyStreakUserService.saveLastPrompt(userId, prompt.text, prompt.type);
        
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
 * Handler for GET /api/miniapp/history/:userId/weekly
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
      
      const entriesWithWeeklyPoints = entries.map((entry: any) => {
        const pointsEntries = pointsHistory.filter((p: any) => p.entryId === entry.id);
        const totalPointsForEntry = pointsEntries.reduce((sum: number, p: any) => sum + p.pointsEarned, 0);
        const weeklyData = pointsEntries.find((p: any) => p.reason.includes('weekly') || p.reason.includes('streak'));
        
        return {
          ...entry,
          weeklyPoints: {
            total: totalPointsForEntry,
            weekId: weeklyData?.weekIdentifier || null,
            streakWeek: weeklyData?.streakWeek || null,
            isMilestone: pointsEntries.some((p: any) => p.reason.includes('milestone')),
            wasMultipleEntry: pointsEntries.some((p: any) => p.reason.includes('additional'))
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
    .then((stats: SystemStats) => {
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
    .catch((err: any) => {
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

  // Helper function to resolve the correct file path depending on environment
  function resolvePublicPath(relativePath: string): string {
    // In production (Railway), the files will be in a different location after build
    if (config.nodeEnv === 'production') {
      // First try the path relative to the current directory
      const prodPath = path.join(process.cwd(), 'public', relativePath);
      logger.debug(`Resolved production path: ${prodPath}`);
      return prodPath;
    } else {
      // In development, use the path relative to the src directory
      const devPath = path.join(__dirname, '../../public', relativePath);
      logger.debug(`Resolved development path: ${devPath}`);
      return devPath;
    }
  }

  /**
   * GET /miniapp
   * Serves the mini-app main entry point
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const indexPath = resolvePublicPath('miniapp/index.html');
      logger.debug(`Serving mini-app at ${req.originalUrl} from ${indexPath}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error(`Error sending file ${indexPath}:`, err);
          res.status(500).send(`Error loading mini-app: ${err.message}`);
        }
      });
    } catch (error) {
      logger.error('Error serving mini-app:', error);
      res.status(500).send('Error loading mini-app');
    }
  });

  /**
   * GET /miniapp/pet
   * Serves the mini-app dino friend page
   */
  router.get('/pet', (req: Request, res: Response) => {
    try {
      const petPath = resolvePublicPath('miniapp/pet.html');
      logger.debug(`Serving dino friend page at ${req.originalUrl} from ${petPath}`);
      res.sendFile(petPath, (err) => {
        if (err) {
          logger.error(`Error sending file ${petPath}:`, err);
          res.status(500).send(`Error loading dino friend page: ${err.message}`);
        }
      });
    } catch (error) {
      logger.error('Error serving dino friend page:', error);
      res.status(500).send('Error loading dino friend page');
    }
  });

  /**
   * GET /miniapp/config
   * Provides configuration data for the mini-app
   */
  router.get('/config', (_req: Request, res: Response) => {
    try {
      // Provide necessary configuration data for the mini-app
      const configData = {
        apiBaseUrl: '/api/miniapp',
        version: '1.0.0',
        features: {
          weeklyStreaks: true,
          petInteraction: true,
          darkMode: true
        },
        endpoints: {
          prompts: '/api/miniapp/prompts',
          responses: '/api/miniapp/responses',
          history: '/api/miniapp/history',
          streak: '/api/miniapp/streak',
          pet: '/api/miniapp/pet'
        }
      };
      
      res.json(configData);
      logger.debug('Mini-app configuration served');
    } catch (error) {
      logger.error('Error serving mini-app configuration:', error);
      res.status(500).json({ error: 'Failed to load configuration' });
    }
  });

  /**
   * GET /miniapp/user/:userId
   * Provides user data for the mini-app
   */
  router.get('/user/:userId', (req: Request, res: Response) => {
    try {
      // In a real implementation, you would validate the request
      // and fetch actual user data
      const userData = {
        userId: req.params.userId,
        // Don't include sensitive data here
        preferences: {
          // Public preferences only
        }
      };
      
      res.json(userData);
    } catch (error) {
      logger.error(`Error serving user data for ${req.params.userId}:`, error);
      res.status(500).json({ error: 'Failed to load user data' });
    }
  });

/**
 * FIXED: Conditional validation middleware
 * Only applies Telegram validation for actual Telegram WebApp requests
 */
function conditionalTelegramValidation(req: Request, res: Response, next: NextFunction): void {
  // Check if this is a Telegram WebApp request
  const hasTelegramHeaders = req.headers['x-telegram-init-data'];
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const origin = req.headers['origin'] || '';
  const host = req.get('host') || '';
  
  // If it has Telegram headers, validate as Telegram WebApp
  if (hasTelegramHeaders) {
    logger.debug('Telegram WebApp request detected, applying validation');
    return validateTelegramRequest(req, res, next);
  }
  
  // IMPROVED: More permissive React frontend detection
  const isReactFrontend = (
    userAgent.includes('Mozilla') && (
      // Check referer contains our domain
      referer.includes(host) ||
      referer.includes('/miniapp') || 
      referer.includes('/journal') ||
      // Check origin contains our domain  
      origin.includes(host) ||
      // For GET requests, be more permissive if user agent looks like a browser
      (req.method === 'GET' && userAgent.includes('Mozilla') && 
       (referer === '' || origin === '' || referer.includes('localhost') || referer.includes('railway.app')))
    )
  );
  
  if (isReactFrontend) {
    logger.debug(`React frontend request detected (${req.method}), skipping Telegram validation`);
    
    // Extract user ID from URL params for React requests
    const userId = req.params.userId;
    if (userId) {
      (req as any).telegramUserId = userId;
    }
    
    return next();
  }
  
  // In development, allow all requests
  if (config.nodeEnv === 'development') {
    logger.debug('Development mode: allowing request without validation');
    
    // Extract user ID from URL params
    const userId = req.params.userId;
    if (userId) {
      (req as any).telegramUserId = userId;
    }
    
    return next();
  }
  
  // Otherwise, require Telegram validation
  logger.warn(`Request blocked: no Telegram headers or recognized frontend. UA: ${userAgent}, Referer: ${referer}, Origin: ${origin}, Method: ${req.method}`);
  res.status(403).json({ error: 'Invalid request source' });
}

// FIXED: Apply conditional validation instead of strict Telegram validation
router.use(conditionalTelegramValidation);

// ===== REGISTER ALL ROUTES =====

// Original functionality routes
router.get('/prompts/today/:userId', getTodaysPrompt);
router.post('/prompts/new/:userId', generateNewPrompt); // THIS IS THE MISSING ROUTE CAUSING 404
router.get('/history/:userId', getHistory);
router.post('/responses', saveResponse);
router.get('/pet/random', getRandomAffirmation);
router.post('/pet/share', shareAffirmation);
router.get('/dinoMessages/random', getRandomDinoMessage);

// Weekly streak functionality routes
router.post('/responses/weekly', saveResponseWithWeeklyRewards);
router.get('/streak/:userId', getWeeklyStreakInfo);
router.get('/prompt/:userId', getPromptWithWeeklyStreak);
router.get('/history/:userId/weekly', getHistoryWithWeeklyStats);
router.get('/system/stats', getWeeklySystemStats);
router.get('/milestones', getWeeklyMilestones);

// Export the router
export default router;