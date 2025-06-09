import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction // Prefix with underscore
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    error: err.stack
  });
  
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    }
  });
};