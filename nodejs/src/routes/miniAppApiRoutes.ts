// src/routes/miniAppApiRoutes.ts
import { Router, Request, Response } from 'express';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { logger } from '../utils/logger';
import { validateTelegramRequest } from '../middleware/telegramValidator';

const router = Router();

// Apply Telegram validation middleware to all API routes
router.use(validateTelegramRequest);

/**
 * GET /api/miniapp/prompts/today/:userId
 * Get today's prompt for a user
 */
router.get('/prompts/today/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate user exists
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get the last prompt for this user
    const userWithPrompt = user as any; // Using any to simplify access to lastPrompt
    
    let promptData;
    
    if (userWithPrompt.lastPrompt) {
      // Return the user's last prompt
      promptData = {
        type: userWithPrompt.lastPrompt.type,
        typeLabel: userWithPrompt.lastPrompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
        text: userWithPrompt.lastPrompt.text,
        hint: 'Reflect deeply on this prompt to gain new insights.'
      };
    } else {
      // Generate a new prompt if none exists
      const prompt = await promptService.getNextPromptForUser(userId);
      
      // Save as last prompt
      await userService.saveLastPrompt(userId, prompt);
      
      promptData = {
        type: prompt.type,
        typeLabel: prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections',
        text: prompt.text,
        hint: 'Reflect deeply on this prompt to gain new insights.'
      };
    }
    
    res.json(promptData);
  } catch (error) {
    logger.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'An error occurred while fetching the prompt' });
  }
});

/**
 * GET /api/miniapp/history/:userId
 * Get journal entry history for a user
 */
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get recent entries
    const entries = await userService.getRecentEntries(userId, limit);
    
    // Format for the mini app
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      date: entry.timestamp.toISOString().split('T')[0],
      promptType: entry.promptType,
      prompt: entry.prompt,
      response: entry.response
    }));
    
    res.json(formattedEntries);
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({ error: 'An error occurred while fetching the history' });
  }
});

/**
 * POST /api/miniapp/responses
 * Save a journal entry response
 */
router.post('/responses', async (req: Request, res: Response) => {
  try {
    const { userId, response } = req.body;
    
    if (!userId || !response) {
      return res.status(400).json({ error: 'User ID and response are required' });
    }
    
    // Get user with last prompt
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userWithPrompt = user as any;
    
    if (!userWithPrompt.lastPrompt) {
      return res.status(400).json({ error: 'No active prompt found' });
    }
    
    // Create journal entry
    const entry = {
      prompt: userWithPrompt.lastPrompt.text,
      promptType: userWithPrompt.lastPrompt.type,
      response: response,
      timestamp: new Date()
    };
    
    // Save response
    const entryId = await userService.saveResponse(userId, entry);
    
    res.status(201).json({
      success: true,
      message: 'Response saved successfully',
      entryId
    });
  } catch (error) {
    logger.error('Error saving response:', error);
    res.status(500).json({ error: 'An error occurred while saving the response' });
  }
});

export default router;