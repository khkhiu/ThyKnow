import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/thyknow',
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