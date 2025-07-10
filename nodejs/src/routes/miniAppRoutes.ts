// src/routes/miniAppApiRoutes.ts
// Simple fix: Conditionally apply Telegram validation middleware
import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { logger } from '../utils/logger';
import { validateTelegramRequest } from '../middleware/telegramValidator';
import { PromptType } from '../types';
//import path from 'path';
import config from '../config';

const router = Router();

/**
 * Conditional validation middleware
 * Only applies Telegram validation for actual Telegram WebApp requests
 */
function conditionalTelegramValidation(req: Request, res: Response, next: NextFunction): void {
  // Check if this is a Telegram WebApp request
  const hasTelegramHeaders = req.headers['x-telegram-init-data'];
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  
  // If it has Telegram headers, validate as Telegram WebApp
  if (hasTelegramHeaders) {
    logger.debug('Telegram WebApp request detected, applying validation');
    return validateTelegramRequest(req, res, next);
  }
  
  // Check if it's from React frontend (same origin)
  const isReactFrontend = (
    userAgent.includes('Mozilla') && 
    (referer.includes('/miniapp') || referer.includes('/journal') ||
     referer.includes(req.get('host') || ''))
  );
  
  if (isReactFrontend && config.allowReactFrontend) {
    logger.debug('React frontend request detected, skipping Telegram validation');
    
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
  logger.warn('Request without proper authentication headers');
  res.status(403).json({ error: 'Authentication required' });
}

// Apply conditional validation to all API routes
router.use(conditionalTelegramValidation);

// Rest of your existing route handlers...
// (Keep all the existing route handlers unchanged)

/**
 * Handler for GET /api/miniapp/prompts/today/:userId
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
      const userWithPrompt = user as any;
      
      if (userWithPrompt.lastPrompt) {
        const promptData = {
          type: userWithPrompt.lastPrompt.type,
          typeLabel: userWithPrompt.lastPrompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
          text: userWithPrompt.lastPrompt.text,
          hint: 'Reflect deeply on this prompt to gain new insights.'
        };
        
        res.json(promptData);
        logger.info(`Served today's prompt to user ${userId}`);
      } else {
        // No existing prompt - generate a new one
        return generateNewPrompt(req, res, next);
      }
    })
    .catch((error: Error) => {
      logger.error(`Error getting today's prompt for user ${userId}:`, error);
      res.status(500).json({ error: 'Failed to get prompt' });
    });
}

/**
 * Handler for POST /api/miniapp/prompts/new/:userId
 */
function generateNewPrompt(req: Request, res: Response, _next: NextFunction): void {
  const { userId } = req.params;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  Promise.all([
    userService.getUser(userId),
    promptService.getNextPromptForUser(userId)
  ])
    .then(([user, prompt]) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Save the new prompt to user's data
      return userService.saveLastPrompt(userId, prompt.text, prompt.type)
        .then(() => {
          const promptData = {
            type: prompt.type,
            typeLabel: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
            text: prompt.text,
            hint: 'Reflect deeply on this prompt to gain new insights.'
          };
          
          res.json(promptData);
          logger.info(`Generated new prompt for user ${userId}`);
        });
    })
    .catch((error: Error) => {
      logger.error(`Error generating new prompt for user ${userId}:`, error);
      res.status(500).json({ error: 'Failed to generate new prompt' });
    });
}

/**
 * Handler for POST /api/miniapp/responses
 */
function saveResponse(req: Request, res: Response): void {
  const { userId, response } = req.body;
  
  if (!userId || !response) {
    res.status(400).json({ error: 'User ID and response are required' });
    return;
  }
  
  // Get the user's last prompt to create a proper journal entry
  userService.getUser(userId)
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const userWithPrompt = user as any;
      if (!userWithPrompt.lastPrompt) {
        res.status(400).json({ error: 'No active prompt found for user' });
        return;
      }
      
      // Create the entry object that saveResponse expects
      const entry = {
        prompt: userWithPrompt.lastPrompt.text,
        promptType: userWithPrompt.lastPrompt.type as PromptType,
        response: response,
        timestamp: new Date()
      };
      
      return userService.saveResponse(userId, entry);
    })
    .then(() => {
      res.json({ success: true, message: 'Response saved successfully' });
      logger.info(`Saved response for user ${userId}`);
    })
    .catch((error: Error) => {
      logger.error(`Error saving response for user ${userId}:`, error);
      res.status(500).json({ error: 'Failed to save response' });
    });
}

/**
 * Handler for GET /api/miniapp/history/:userId
 */
function getHistory(req: Request, res: Response): void {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  
  userService.getRecentEntries(userId, limit)
    .then(entries => {
      res.json(entries);
      logger.info(`Served history for user ${userId} (${entries.length} entries)`);
    })
    .catch((error: Error) => {
      logger.error(`Error getting history for user ${userId}:`, error);
      res.status(500).json({ error: 'Failed to get history' });
    });
}

// Register all routes
router.get('/prompts/today/:userId', getTodaysPrompt);
router.post('/prompts/new/:userId', generateNewPrompt);
router.get('/history/:userId', getHistory);
router.post('/responses', saveResponse);

// Add any other existing routes...
// router.get('/pet/random', getRandomAffirmation);
// router.post('/pet/share', shareAffirmation);
// etc.

export default router;