// src/controllers/minimalHealthCheck.ts
import { Request, Response } from 'express';
import config from '../config';

/**
 * Minimal health check endpoint that returns quickly
 * This is used by Railway for automated health checks
 */
export const minimalHealthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
};