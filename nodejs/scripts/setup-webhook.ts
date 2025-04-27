/**
 * Script to set up Telegram webhook
 * 
 * Usage: 
 *   npm run setup-webhook
 *   
 * Or with command-line args:
 *   npm run setup-webhook -- --url=https://your-server.com
 */
import axios from 'axios';
import dotenv from 'dotenv';
import { program } from 'commander';

// Load environment variables
dotenv.config();

// Define command-line options
program
  .option('-u, --url <url>', 'Base URL for your server')
  .option('-t, --token <token>', 'Telegram bot token')
  .parse(process.argv);

const options = program.opts();

interface WebhookResponse {
  ok: boolean;
  description?: string;
  result?: boolean;
}

async function setupWebhook(): Promise<void> {
  try {
    // Get options from command line, env vars, or defaults
    const botToken = options.token || process.env.TELEGRAM_BOT_TOKEN;
    const baseUrl = options.url || process.env.BASE_URL;
    
    if (!botToken) {
      throw new Error('Telegram bot token not found. Please provide it via .env file or --token option');
    }
    
    if (!baseUrl) {
      throw new Error('Base URL not found. Please provide it via .env file or --url option');
    }
    
    const webhookUrl = `${baseUrl}/webhook`;
    
    console.log(`Setting up webhook for ${webhookUrl}`);
    
    const response = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`
    );
    
    console.log('Response:', response.data);
    
    if (response.data.ok) {
      console.log('✅ Webhook setup successful!');
    } else {
      console.error('❌ Webhook setup failed:', response.data.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();