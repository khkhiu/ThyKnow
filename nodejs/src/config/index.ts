// src/config/index.ts
// Updated configuration to handle Telegram validation settings and all missing properties
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  // Server configuration
  port: number;
  nodeEnv: string;
  logLevel: string;
  
  // Database configuration
  databaseUrl: string;
  
  // Telegram configuration
  telegramBotToken: string;
  telegramWebhookUrl?: string;
  
  // Validation settings
  validateTelegramRequests: boolean;
  allowReactFrontend: boolean;
  
  // Application settings
  timezone: string;
  baseUrl: string;  // ✅ Added missing baseUrl
  maxHistory: number;  // ✅ Added missing maxHistory
  
  // Railway-specific settings
  railway: {
    service: string | null;
    environment: string | null;
    project: string | null;
    publicDomain: string | null;
    privateDomain: string | null;
    staticUrl: string | null;
  };
  
  // Scheduler settings
  scheduler: {
    promptDay: number;
    promptHour: number;
  };
  
  // Security settings
  corsOrigins: string[];
  rateLimitEnabled: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

// Get base URL based on environment variables
function getBaseUrl(): string {
  // Priority order: Custom domain, Railway public domain, Railway static URL, Local URL
  if (process.env.CUSTOM_DOMAIN) {
    return `https://${process.env.CUSTOM_DOMAIN}`;
  }
  
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL;
  }
  
  // Fallback to BASE_URL or localhost
  return process.env.BASE_URL || 'http://localhost:3000';
}

const config: Config = {
  // Server settings
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramWebhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  
  // Validation settings - key additions for React frontend support
  validateTelegramRequests: process.env.VALIDATE_TELEGRAM_REQUESTS !== 'false',
  allowReactFrontend: process.env.ALLOW_REACT_FRONTEND !== 'false',
  
  // Application settings
  timezone: process.env.TIMEZONE || 'Asia/Singapore',
  baseUrl: getBaseUrl(),  // ✅ Now included
  maxHistory: parseInt(process.env.MAX_HISTORY || '10', 10),  // ✅ Now included
  
  // Railway-specific settings
  railway: {
    service: process.env.RAILWAY_SERVICE_NAME || null,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || null,
    project: process.env.RAILWAY_PROJECT_NAME || null,
    publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
    privateDomain: process.env.RAILWAY_PRIVATE_DOMAIN || null,
    staticUrl: process.env.RAILWAY_STATIC_URL || null,
  },
  
  // Scheduler settings
  scheduler: {
    promptDay: parseInt(process.env.PROMPT_DAY || '1', 10), // Monday
    promptHour: parseInt(process.env.PROMPT_HOUR || '9', 10), // 9 AM
  },
  
  // Security settings
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
};

// Validation
if (!config.telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default config;