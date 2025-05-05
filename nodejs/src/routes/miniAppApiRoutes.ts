// src/routes/miniAppApiRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { logger } from '../utils/logger';
import { validateTelegramRequest } from '../middleware/telegramValidator';
import { PromptType } from '../types';

// Create a router instance
const router = Router();

// Apply Telegram validation middleware to all API routes
router.use(validateTelegramRequest);

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
          text: userWithPrompt.lastPrompt.text, // The text is already preserved with line breaks
          hint: 'Reflect deeply on this prompt to gain new insights.'
        };
        res.json(promptData);
      } else {
        // Generate a new prompt if none exists
        promptService.getNextPromptForUser(userId)
          .then(prompt => {
            // Save as last prompt
            userService.saveLastPrompt(userId, prompt)
              .then(() => {
                const promptData = {
                  type: prompt.type,
                  typeLabel: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
                  text: prompt.text, // The text is already preserved with line breaks
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
 * Handler for GET /api/miniapp/history/:userId
 * Get journal entry history for a user
 */
function getHistory(req: Request, res: Response, next: NextFunction): void {
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
        prompt: entry.prompt, // Line breaks are preserved in the database
        response: entry.response // Line breaks are preserved in the database
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
 * Save a journal entry response and generate a new prompt
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
        
        // Generate a new prompt for the user
        const newPrompt = await promptService.getNextPromptForUser(userId);
        
        // Save the new prompt as the user's last prompt
        await userService.saveLastPrompt(userId, newPrompt);
        
        // Return success with the new prompt data
        res.status(201).json({
          success: true,
          message: 'Response saved successfully',
          entryId,
          newPrompt: {
            type: newPrompt.type,
            typeLabel: newPrompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
            text: newPrompt.text,
            hint: 'Reflect deeply on this prompt to gain new insights.'
          }
        });
        
        logger.info(`Saved response and generated new prompt for user ${userId}`);
      } catch (err) {
        next(err);
      }
    })
    .catch(err => {
      logger.error('Error saving response:', err);
      res.status(500).json({ error: 'An error occurred while saving the response' });
    });
}

// Register routes
router.get('/prompts/today/:userId', getTodaysPrompt);
router.get('/history/:userId', getHistory);
router.post('/responses', saveResponse);

// Export the router
export default router;