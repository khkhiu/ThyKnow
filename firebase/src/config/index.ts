// File: src/config/index.ts
// Configuration for PostgreSQL

import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  postgresql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'thyknow',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10) // 30 seconds
  },
  timezone: process.env.TIMEZONE || 'Asia/Singapore',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
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