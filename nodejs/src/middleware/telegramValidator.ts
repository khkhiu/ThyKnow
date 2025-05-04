// src/middleware/telegramValidator.ts
import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppRequest, extractTelegramUserId } from '../utils/telegramValidator';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Middleware to validate requests from Telegram Web App
 * This ensures that requests to our API endpoints are legitimate
 */
export function validateTelegramRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    // Skip validation in development mode if configured to do so
    if (config.nodeEnv === 'development' && config.validateTelegramRequests === false) {
      return next();
    }
    
    // Validate the Telegram init data
    const isValid = validateTelegramWebAppRequest(req);
    
    if (!isValid) {
      logger.warn(`Invalid Telegram request from ${req.ip}`);
      res.status(403).json({ error: 'Invalid request' });
      return;
    }
    
    // Extract user ID for easier access in route handlers
    const userId = extractTelegramUserId(req);
    if (userId) {
      // Attach the Telegram user ID to the request object for later use
      (req as any).telegramUserId = userId;
    }
    
    // Continue to the next middleware
    next();
  } catch (error) {
    logger.error('Error in Telegram validation middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}