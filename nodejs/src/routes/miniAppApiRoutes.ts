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
          text: userWithPrompt.lastPrompt.text,
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
 * Generate a new prompt for a user
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
          userService.saveLastPrompt(userId, prompt)
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
 * Save a journal entry response without generating a new prompt
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
function getRandomAffirmation(req: Request, res: Response): void {
  try {
    // List of pet
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
function getRandomDinoMessage(req: Request, res: Response): void {
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

// Register routes
router.get('/prompts/today/:userId', getTodaysPrompt);
router.post('/prompts/new/:userId', generateNewPrompt);
router.get('/history/:userId', getHistory);
router.post('/responses', saveResponse);
router.get('/pet/random', getRandomAffirmation);
router.post('/pet/share', shareAffirmation);
router.get('/dinoMessages/random', getRandomDinoMessage);

// Export the router
export default router;