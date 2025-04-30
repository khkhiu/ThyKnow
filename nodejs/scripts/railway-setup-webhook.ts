/**
 * Script to set up Telegram webhook on Railway
 * 
 * Usage: 
 *   npm run setup-webhook
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
    const baseUrl = process.env.RAILWAY_PRIVATE_DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.BASE_URL;
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }
    
    if (!baseUrl) {
      throw new Error('No Railway URL found. Make sure your app is deployed to Railway and RAILWAY_PRIVATE_DOMAIN or BASE_URL is set');
    }
    
    // Form the webhook URL
    const webhookUrl = `${baseUrl}/webhook`;
    
    console.log(`Setting up webhook for ${webhookUrl}`);
    
    // First, delete any existing webhook
    console.log('Removing any existing webhook...');
    const deleteResponse = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${botToken}/deleteWebhook`
    );
    
    if (deleteResponse.data.ok) {
      console.log('✅ Existing webhook removed successfully');
    } else {
      console.error('❌ Failed to remove existing webhook:', deleteResponse.data.description);
    }
    
    // Call Telegram API to set the new webhook
    console.log(`Setting new webhook to: ${webhookUrl}`);
    const response = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}&drop_pending_updates=true`
    );
    
    if (response.data.ok) {
      console.log('✅ Webhook setup successful!');
      
      // Get webhook info to verify
      console.log('Getting webhook info to verify setup...');
      const infoResponse = await axios.get<any>(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      
      if (infoResponse.data.ok) {
        console.log('Webhook Info:');
        console.log(`URL: ${infoResponse.data.result.url}`);
        console.log(`Pending updates: ${infoResponse.data.result.pending_update_count}`);
        console.log(`Last error: ${infoResponse.data.result.last_error_message || 'None'}`);
      } else {
        console.error('❌ Failed to get webhook info:', infoResponse.data.description);
      }
    } else {
      console.error('❌ Webhook setup failed:', response.data.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();