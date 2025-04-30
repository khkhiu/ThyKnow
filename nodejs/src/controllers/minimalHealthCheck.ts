// src/controllers/minimalHealthCheck.ts
import { Request, Response } from 'express';
import config from '../config';

/**
 * Minimal health check endpoint that returns quickly
 * This is used by Railway for automated health checks
 * It works even when the database is down
 */
export const minimalHealthCheck = (req: Request, res: Response): void => {
  // Always return 200 for Railway's health checks
  // This ensures the service stays up even if the database is temporarily down
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    service: 'ThyKnow Telegram Bot'
  });
};