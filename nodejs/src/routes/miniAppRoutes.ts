// src/routes/miniAppRoutes.ts
import { Router, Request, Response } from 'express';
import path from 'path';
import config from '../config';
import { logger } from '../utils/logger';

const router = Router();

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

/**
 * GET /miniapp/streak
 * Serves the mini-app weekly streak page
 */
router.get('/streak', (req: Request, res: Response) => {
  try {
    const streakPath = resolvePublicPath('miniapp/streak.html');
    logger.debug(`Serving weekly streak page at ${req.originalUrl} from ${streakPath}`);
    res.sendFile(streakPath, (err) => {
      if (err) {
        logger.error(`Error sending file ${streakPath}:`, err);
        res.status(500).send(`Error loading weekly streak page: ${err.message}`);
      }
    });
  } catch (error) {
    logger.error('Error serving weekly streak page:', error);
    res.status(500).send('Error loading weekly streak page');
  }
});

export default router;