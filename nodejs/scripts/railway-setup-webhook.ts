/**
 * Script to set up Telegram webhook on Railway
 * 
 * Usage: 
 *   npm run railway:webhook
 */
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface WebhookResponse {
  ok: boolean;
  description?: string;
  result?: boolean;
}

async function setupWebhook(): Promise<void> {
  try {
    // Get token and URL from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const baseUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }
    
    if (!baseUrl) {
      throw new Error('No Railway URL found. Make sure your app is deployed to Railway');
    }
    
    // Form the webhook URL
    const webhookUrl = `${baseUrl}/webhook`;
    
    console.log(`Setting up webhook for ${webhookUrl}`);
    
    // Call Telegram API to set the webhook
    const response = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`
    );
    
    console.log('Response:', response.data);
    
    if (response.data.ok) {
      console.log('✅ Webhook setup successful!');
      
      // Get webhook info to verify
      const infoResponse = await axios.get<any>(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      
      console.log('Webhook Info:', infoResponse.data);
    } else {
      console.error('❌ Webhook setup failed:', response.data.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();