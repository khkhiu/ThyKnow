// src/routes/miniAppRoutes.ts - Updated for React Frontend
import { Router, Request, Response } from 'express';
import path from 'path';
import config from '../config';
import { logger } from '../utils/logger';

const router = Router();

// Helper function to serve the React app
function serveReactApp(res: Response, route: string = '') {
  const frontendPath = path.join(process.cwd(), 'dist', 'frontend');
  const indexPath = path.join(frontendPath, 'index.html');
  
  logger.debug(`Serving React app for route: ${route} from ${indexPath}`);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error(`Error serving React app for ${route}:`, err);
      res.status(500).send(`Error loading application: ${err.message}`);
    }
  });
}

/**
 * GET /miniapp
 * Serves the React app main entry point
 */
router.get('/', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React miniapp at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React miniapp:', error);
    res.status(500).send('Error loading mini-app');
  }
});

/**
 * GET /miniapp/pet
 * Serves the React app (pet page will be handled by React Router)
 */
router.get('/pet', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app pet page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React pet page:', error);
    res.status(500).send('Error loading pet page');
  }
});

/**
 * GET /miniapp/streak
 * Serves the React app (streak page will be handled by React Router)
 */
router.get('/streak', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app streak page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React streak page:', error);
    res.status(500).send('Error loading streak page');
  }
});

/**
 * GET /miniapp/config
 * Provides configuration data for the mini-app
 */
router.get('/config', (_req: Request, res: Response) => {
  try {
    // Provide necessary configuration to the React app
    // Avoid exposing sensitive information
    const miniAppConfig = {
      appName: 'ThyKnow',
      version: '2.0.0', // Updated version for React app
      timezone: config.timezone,
      features: {
        selfAwareness: true,
        connections: true,
        history: true,
        affirmations: true,
        pet: true,
        weeklyStreaks: true,
        reactUI: true // New feature flag
      },
      apiEndpoints: {
        base: '/api/miniapp',
        prompts: '/api/miniapp/prompts',
        responses: '/api/miniapp/responses',
        history: '/api/miniapp/history',
        streak: '/api/miniapp/streak',
        pet: '/api/miniapp/pet'
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
      appVersion: '2.0.0',
      // Don't include sensitive data here
      preferences: {
        // Public preferences only
        theme: 'light',
        notifications: true
      }
    };
    
    res.json(userData);
  } catch (error) {
    logger.error(`Error serving user data for ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to load user data' });
  }
});

// Handle specific additional routes that might be needed
router.get('/journal', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app journal page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React journal page:', error);
    res.status(500).send('Error loading journal page');
  }
});

router.get('/care', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app care page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React care page:', error);
    res.status(500).send('Error loading care page');
  }
});

router.get('/shop', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app shop page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React shop page:', error);
    res.status(500).send('Error loading shop page');
  }
});

router.get('/achievements', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app achievements page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React achievements page:', error);
    res.status(500).send('Error loading achievements page');
  }
});

router.get('/stats', (req: Request, res: Response) => {
  try {
    logger.debug(`Serving React app stats page at ${req.originalUrl}`);
    serveReactApp(res, req.originalUrl);
  } catch (error) {
    logger.error('Error serving React stats page:', error);
    res.status(500).send('Error loading stats page');
  }
});

export default router;