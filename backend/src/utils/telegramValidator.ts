// src/utils/telegramValidator.ts
import crypto from 'crypto';
import { Request } from 'express';
import config from '../config';
import { logger } from './logger';

/**
 * Validates that the request is coming from Telegram
 * Based on Telegram's data validation algorithm:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function validateTelegramWebAppRequest(req: Request): boolean {
  try {
    // In a production environment, you should validate the initData
    // For development, we'll assume all requests are valid if validation is disabled
    if (config.nodeEnv === 'development' && !config.validateTelegramRequests) {
      logger.debug('Telegram request validation skipped (development mode)');
      return true;
    }
    
    const initDataString = req.headers['x-telegram-init-data'] as string;
    
    // Ensure init data is provided
    if (!initDataString) {
      logger.warn('No Telegram init data provided in request');
      return false;
    }
    
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
    const isValid = expectedHash === hash;
    
    if (!isValid) {
      logger.warn('Telegram init data validation failed - hash mismatch');
    }
    
    return isValid;
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