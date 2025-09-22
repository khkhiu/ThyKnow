// src/middleware/telegramValidator.ts
// Updated to handle both Telegram WebApp and React frontend requests
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { logger } from '../utils/logger';

/**
 * Safely extract client IP address from request
 */
function getClientIp(req: Request): string {
  // Try various ways to get the client IP
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const connectionIp = req.ip;
  const socketIp = req.socket?.remoteAddress;
  
  // Handle x-forwarded-for (can be a comma-separated list)
  if (forwarded) {
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded)) {
      return forwarded[0].trim();
    }
  }
  
  // Try other IP sources
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  if (connectionIp) {
    return connectionIp;
  }
  
  if (socketIp) {
    return socketIp;
  }
  
  // Fallback
  return 'unknown';
}

/**
 * Enhanced Telegram validation middleware that supports both WebApp and React frontend
 */
export function validateTelegramRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    // Skip validation in development mode if configured to do so
    if (config.nodeEnv === 'development' && config.validateTelegramRequests === false) {
      logger.debug('Telegram request validation skipped (development mode)');
      return next();
    }

    // Check if this is a React frontend request vs Telegram WebApp request
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';
    
    // Detect React frontend requests (running on the same domain)
    const isReactFrontend = (
      userAgent.includes('Mozilla') && 
      (referer.includes('/miniapp') || referer.includes('/journal') || 
       origin.includes(req.get('host') || '')) &&
      !req.headers['x-telegram-init-data']
    );

    if (isReactFrontend) {
      logger.debug('React frontend request detected, using alternative validation');
      return validateReactFrontendRequest(req, res, next);
    }

    // For Telegram WebApp requests, use the original validation
    return validateTelegramWebAppRequest(req, res, next);
    
  } catch (error) {
    logger.error('Error in Telegram validation middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Validates React frontend requests with alternative security measures
 */
function validateReactFrontendRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    // For React frontend, we can implement alternative security measures:
    
    // 1. Check that the request comes from the same origin (CSRF protection)
    const origin = req.headers['origin'];
    const host = req.get('host');
    
    if (origin && host && !origin.includes(host)) {
      logger.warn(`React frontend request from invalid origin: ${origin}`);
      res.status(403).json({ error: 'Invalid origin' });
      return;
    }

    // 2. Rate limiting by IP (basic protection)
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      logger.warn(`Rate limited request from IP: ${clientIp}`);
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    // 3. Extract user ID from URL params for React requests
    const userId = req.params.userId;
    if (userId) {
      (req as any).telegramUserId = userId;
      logger.debug(`React frontend request for user ID: ${userId}`);
    }

    // Allow the request to proceed
    next();
    
  } catch (error) {
    logger.error('Error validating React frontend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Original Telegram WebApp validation
 */
function validateTelegramWebAppRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    const initDataString = req.headers['x-telegram-init-data'] as string;
    
    // Ensure init data is provided
    if (!initDataString) {
      logger.warn('No Telegram init data provided in WebApp request');
      res.status(403).json({ error: 'Invalid Telegram WebApp request' });
      return;
    }
    
    // Validate the init data
    const isValid = validateTelegramInitData(initDataString);
    
    if (!isValid) {
      logger.warn(`Invalid Telegram WebApp request from ${req.ip}`);
      res.status(403).json({ error: 'Invalid Telegram WebApp authentication' });
      return;
    }
    
    // Extract user ID for easier access in route handlers
    const userId = extractTelegramUserId(req);
    if (userId) {
      (req as any).telegramUserId = userId;
    }
    
    // Continue to the next middleware
    next();
    
  } catch (error) {
    logger.error('Error validating Telegram WebApp request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Validates Telegram init data using the official algorithm
 */
function validateTelegramInitData(initDataString: string): boolean {
  try {
    // Ensure bot token is configured
    if (!config.telegramBotToken) {
      logger.error('No Telegram bot token configured - cannot validate requests');
      return false;
    }
    
    // Parse the init data
    const initData = new URLSearchParams(initDataString);
    const hash = initData.get('hash');
    
    // Ensure hash is present
    if (!hash) {
      logger.warn('No hash found in Telegram init data');
      return false;
    }
    
    // Remove hash from the data before checking the signature
    initData.delete('hash');
    
    // Sort the init data
    const dataCheckString = Array.from(initData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create the secret key by using the HMAC-SHA-256 algorithm
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();
    
    // Calculate the expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare the expected hash with the provided hash
    return expectedHash === hash;
    
  } catch (error) {
    logger.error('Error validating Telegram init data:', error);
    return false;
  }
}

/**
 * Extract Telegram user ID from init data
 */
export function extractTelegramUserId(req: Request): string | null {
  try {
    const initDataString = req.headers['x-telegram-init-data'] as string;
    
    if (!initDataString) {
      return null;
    }
    
    const initData = new URLSearchParams(initDataString);
    const userDataString = initData.get('user');
    
    if (!userDataString) {
      return null;
    }
    
    const userData = JSON.parse(userDataString);
    return userData?.id?.toString() || null;
  } catch (error) {
    logger.error('Error extracting Telegram user ID:', error);
    return null;
  }
}

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

function isRateLimited(clientIp: string): boolean {
  // Handle unknown IPs
  if (!clientIp || clientIp === 'unknown') {
    return false; // Don't rate limit unknown IPs in this simple implementation
  }
  
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  clientData.count++;
  
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  return false;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);