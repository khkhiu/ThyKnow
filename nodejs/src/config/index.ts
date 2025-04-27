// src/config/index.ts
// Configuration with Railway support - fixed types

import dotenv from 'dotenv';
dotenv.config();

// Define PostgreSQL config interface
interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  maxPoolSize: number;
  idleTimeout: number;
}

// Parse DATABASE_URL from Railway if available
const parseDbUrl = (url: string | undefined): PostgreSQLConfig | null => {
  if (!url) return null;
  
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
      database: dbUrl.pathname.substring(1), // Remove leading slash
      username: dbUrl.username,
      password: dbUrl.password,
      ssl: true, // Railway PostgreSQL uses SSL
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

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  postgresql: railwayDbConfig || {
    // Fallback to individual environment variables if DATABASE_URL is not provided
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'thyknow',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10) // 30 seconds
  } as PostgreSQLConfig,
  timezone: process.env.TIMEZONE || 'Asia/Singapore',
  baseUrl: process.env.RAILWAY_STATIC_URL || process.env.BASE_URL || 'http://localhost:3000',
  scheduler: {
    promptDay: parseInt(process.env.PROMPT_DAY || '1', 10), // Monday
    promptHour: parseInt(process.env.PROMPT_HOUR || '9', 10), // 9 AM
  },
  maxHistory: parseInt(process.env.MAX_HISTORY || '5', 10),
};

// Validate critical config
if (!config.telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

export default config;