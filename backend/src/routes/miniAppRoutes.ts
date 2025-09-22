// src/routes/miniAppRoutes.ts (Updated with Deep Link Support)
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { 
  trackMiniappAccess, 
  handleDeepLink, 
  getMiniappUsageStats 
} from '../controllers/miniAppController';

const router = express.Router();

/**
 * Serve the React app with deep link and tracking support
 */
function serveReactAppWithTracking(req: Request, res: Response): void {
  try {
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    
    if (!fs.existsSync(indexPath)) {
      logger.error(`React app index.html not found at ${indexPath}`);
      res.status(404).json({ 
        error: 'Mini app not found',
        message: 'The React application files are not available'
      });
      return;
    }

    // Read the HTML file
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Inject deep link parameters if available
    if (res.locals.deepLinkParams) {
      const deepLinkScript = `
        <script>
          window.__DEEP_LINK_PARAMS__ = ${JSON.stringify(res.locals.deepLinkParams)};
        </script>
      `;
      htmlContent = htmlContent.replace('</head>', `${deepLinkScript}</head>`);
    }

    // Inject analytics and tracking
    const trackingScript = `
      <script>
        // Track page view
        if (window.gtag) {
          gtag('event', 'page_view', {
            page_title: 'ThyKnow MiniApp',
            page_location: window.location.href
          });
        }
        
        // Track source if from bot
        if (window.location.search.includes('ref=bot_')) {
          if (window.gtag) {
            gtag('event', 'bot_referral', {
              source: 'telegram_bot'
            });
          }
        }
      </script>
    `;
    htmlContent = htmlContent.replace('</body>', `${trackingScript}</body>`);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
    
    logger.debug(`Served React app for ${req.originalUrl} with tracking`);
  } catch (err: any) {
    logger.error(`Error serving React app for ${req.originalUrl}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to load application',
        message: err.message
      });
    }
  }
}

/**
 * Apply middleware chain for all miniapp routes
 */
router.use('/', trackMiniappAccess, handleDeepLink);

/**
 * Main miniapp route with deep link support
 */
router.get('/', serveReactAppWithTracking);

/**
 * Specific page routes (all serve the same React app with different deep link params)
 */
router.get('/pet', (_req: Request, res: Response, next) => {
  res.locals.deepLinkParams = { page: 'pet', ref: 'direct_url' };
  next();
}, serveReactAppWithTracking);

router.get('/history', (_req: Request, res: Response, next) => {
  res.locals.deepLinkParams = { page: 'history', ref: 'direct_url' };
  next();
}, serveReactAppWithTracking);

router.get('/streak', (_req: Request, res: Response, next) => {
  res.locals.deepLinkParams = { page: 'streak', ref: 'direct_url' };
  next();
}, serveReactAppWithTracking);

router.get('/choose', (_req: Request, res: Response, next) => {
  res.locals.deepLinkParams = { page: 'choose', action: 'choose', ref: 'direct_url' };
  next();
}, serveReactAppWithTracking);

/**
 * Configuration endpoint for the miniapp
 */
router.get('/config', (_req: Request, res: Response) => {
  try {
    const configData = {
      appName: 'ThyKnow',
      version: '2.0.0',
      timezone: 'UTC',
      features: {
        selfAwareness: true,
        connections: true,
        history: true,
        affirmations: true,
        pet: true,
        streaks: true,
        deepLinks: true
      },
      endpoints: {
        prompts: '/api/miniapp/prompts',
        responses: '/api/miniapp/responses', 
        history: '/api/miniapp/history',
        streak: '/api/miniapp/streak',
        pet: '/api/miniapp/pet',
        affirmations: '/api/miniapp/affirmations'
      },
      deepLinkSupport: {
        pages: ['home', 'prompt', 'history', 'streak', 'choose', 'pet'],
        actions: ['new', 'choose', 'view'],
        referenceTracking: true
      }
    };
    
    res.json(configData);
    logger.debug('Mini-app configuration served with deep link support');
  } catch (error) {
    logger.error('Error serving mini-app configuration:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

/**
 * User tracking endpoint
 */
router.post('/track', express.json(), (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;
    const telegramInitData = req.headers['x-telegram-init-data'] as string;
    
    logger.info('Miniapp tracking event:', { event, data, hasTelegramData: !!telegramInitData });
    
    // Here you would typically save to analytics database
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error tracking miniapp event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

/**
 * Analytics endpoint for admin dashboard
 */
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const stats = await getMiniappUsageStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting miniapp analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      deepLinks: true,
      tracking: true,
      reactApp: true
    }
  });
});

export default router;