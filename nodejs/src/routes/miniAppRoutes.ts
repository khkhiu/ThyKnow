// src/routes/miniAppRoutes.ts
import { Router, Request, Response } from 'express';
import path from 'path';
import config from '../config';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /miniapp
 * Serves the mini-app main entry point
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const indexPath = path.join(__dirname, '../../public/miniapp/index.html');
    res.sendFile(indexPath);
    logger.debug(`Served mini-app at ${req.originalUrl}`);
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
    const petPath = path.join(__dirname, '../../public/miniapp/pet.html');
    res.sendFile(petPath);
    logger.debug(`Served dino friend page at ${req.originalUrl}`);
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
    // Provide necessary configuration to the mini-app front-end
    // Avoid exposing sensitive information
    const miniAppConfig = {
      appName: 'ThyKnow',
      version: '1.0.0', 
      timezone: config.timezone,
      features: {
        selfAwareness: true,
        connections: true,
        history: true,
        affirmations: true,
        pet: true
      }
    };
    
    res.json(miniAppConfig);
  } catch (error) {
    logger.error('Error serving mini-app config:', error);
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

export default router;