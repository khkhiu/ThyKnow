import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
}

// Check for Firebase runtime config
const runtimeConfigPath = path.resolve(process.cwd(), '.runtimeconfig.json');
if (fs.existsSync(runtimeConfigPath)) {
  console.log('Loading Firebase config from .runtimeconfig.json');
  const runtimeConfig = JSON.parse(fs.readFileSync(runtimeConfigPath, 'utf8'));
  
  // For local development, make Firebase config values available via process.env
  if (!process.env.TELEGRAM_BOT_TOKEN && runtimeConfig.telegram?.token) {
    process.env.TELEGRAM_BOT_TOKEN = runtimeConfig.telegram.token;
  }
}

export const getBotToken = (): string => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('Telegram bot token not found in environment variables');
  }
  return token;
};