// src/config/index.ts
// Configuration optimized for Railway deployment

import dotenv from 'dotenv';
dotenv.config();

// Define PostgreSQL config interface
interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  maxPoolSize: number;
  idleTimeout: number;
}

// Define application config interface
interface AppConfig {
  port: number;
  nodeEnv: string;
  telegramBotToken: string;
  postgresql: PostgreSQLConfig;
  timezone: string;
  baseUrl: string;
  railway: {
    service: string | null;
    environment: string | null;
    project: string | null;
    publicDomain: string | null;
    privateDomain: string | null;
    staticUrl: string | null;
  };
  scheduler: {
    promptDay: number;
    promptHour: number;
  };
  maxHistory: number;
  logLevel: string;
  validateTelegramRequests: boolean;
}

// Parse DATABASE_URL from Railway if available
const parseDbUrl = (url: string | undefined): PostgreSQLConfig | null => {
  if (!url) return null;
  
  try {
    const dbUrl = new URL(url);
    // Replace localhost with 127.0.0.1 for container compatibility
    const hostname = dbUrl.hostname === 'localhost' ? '127.0.0.1' : dbUrl.hostname;
    
    return {
      host: hostname,
      port: parseInt(dbUrl.port, 10) || 5432,
      database: dbUrl.pathname.substring(1), // Remove leading slash
      user: dbUrl.username,
      password: dbUrl.password,
      ssl: { rejectUnauthorized: false }, // Required for Railway PostgreSQL
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10)
    };
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error);
    return null;
  }
};

// Parse Railway's DATABASE_URL if available
const railwayDbConfig = parseDbUrl(process.env.DATABASE_URL);

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

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  postgresql: railwayDbConfig || {
    // Fallback to individual environment variables if DATABASE_URL is not provided
    // Replace localhost with 127.0.0.1 for container compatibility
    host: (process.env.DB_HOST === 'localhost' ? '127.0.0.1' : process.env.DB_HOST) || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'thyknow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' 
      ? { rejectUnauthorized: false } 
      : false,
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10) 
  } as PostgreSQLConfig,
  timezone: process.env.TIMEZONE || 'Asia/Singapore',
  baseUrl: getBaseUrl(),
  railway: {
    service: process.env.RAILWAY_SERVICE_NAME || null,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || null,
    project: process.env.RAILWAY_PROJECT_NAME || null,
    publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
    privateDomain: process.env.RAILWAY_PRIVATE_DOMAIN || null,
    staticUrl: process.env.RAILWAY_STATIC_URL || null,
  },
  scheduler: {
    promptDay: parseInt(process.env.PROMPT_DAY || '1', 10), // Monday
    promptHour: parseInt(process.env.PROMPT_HOUR || '9', 10), // 9 AM
  },
  maxHistory: parseInt(process.env.MAX_HISTORY || '5', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  validateTelegramRequests: process.env.VALIDATE_TELEGRAM_REQUESTS !== 'false',
} as AppConfig;

// Validate critical config
if (!config.telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

export default config;