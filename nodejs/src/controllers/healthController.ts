// src/controllers/healthController.ts
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { checkDatabaseConnection } from '../database';
import config from '../config';
import { bot } from '../app';
import os from 'os';

/**
 * Comprehensive health check controller for Railway deployment
 * Checks database, telegram bot, and system status
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('Health check requested');
    
    // Check database connectivity
    const dbStatus = await checkDatabaseConnection();
    
    // Check Telegram bot status
    let botStatus = false;
    try {
      const botInfo = await bot.telegram.getMe();
      botStatus = Boolean(botInfo.id);
    } catch (error) {
      logger.error('Error checking Telegram bot status:', error);
    }
    
    // Get system info
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      loadAverage: os.loadavg()
    };
    
    // Determine overall status
    const isHealthy = dbStatus && botStatus;
    
    // Send response
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      checks: {
        database: {
          status: dbStatus ? 'connected' : 'disconnected'
        },
        telegramBot: {
          status: botStatus ? 'connected' : 'disconnected'
        }
      },
      system: systemInfo
    });
    
    logger.debug(`Health check result: ${isHealthy ? 'healthy' : 'unhealthy'}`);
  } catch (error) {
    logger.error('Health check error:', error);
    
    // Send error response
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform health check',
      timestamp: new Date().toISOString()
    });
  }
};