/**
 * Railway-specific Telegram webhook setup script
 * 
 * This script detects and uses the public Railway domain for the webhook URL.
 * 
 * Usage:
 *   npx ts-node scripts/setup-railway-webhook.ts
 *   
 * Or add to package.json:
 *   "webhook:railway": "ts-node scripts/setup-railway-webhook.ts"
 */
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupRailwayWebhook() {
  try {
    // Get Telegram bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN is not set. Please configure your environment variables.');
      process.exit(1);
    }
    
    // Get Railway domains
    const railwayPublicDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
    const railwayStaticDomain = process.env.RAILWAY_STATIC_URL;
    const customDomain = process.env.CUSTOM_DOMAIN;
    
    // Determine webhook base URL - prioritize secure domains
    let baseUrl;
    
    if (customDomain) {
      baseUrl = `https://${customDomain}`;
      console.log(`Using custom domain: ${baseUrl}`);
    } else if (railwayPublicDomain) {
      baseUrl = `https://${railwayPublicDomain}`;
      console.log(`Using Railway public domain: ${baseUrl}`);
    } else if (railwayStaticDomain) {
      baseUrl = railwayStaticDomain;
      console.log(`Using Railway static URL: ${baseUrl}`);
    } else {
      console.error('❌ No public domain found. Please make sure your Railway service has a public domain assigned.');
      console.error('You can enable this in the Railway dashboard under your service settings.');
      process.exit(1);
    }
    
    // Form webhook URL
    const webhookUrl = `${baseUrl}/webhook`;
    
    console.log('🤖 Setting up Telegram webhook...');
    console.log(`Bot Token: ${botToken.substring(0, 5)}...${botToken.substring(botToken.length - 5)}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    
    // First, delete any existing webhook
    console.log('Removing existing webhook...');
    const deleteResponse = await axios.get(
      `https://api.telegram.org/bot${botToken}/deleteWebhook`
    );
    
    if (deleteResponse.data.ok) {
      console.log('✅ Existing webhook removed successfully');
    } else {
      console.error('❌ Failed to remove existing webhook:', deleteResponse.data.description);
      process.exit(1);
    }
    
    // Set up the new webhook
    console.log(`Setting webhook to: ${webhookUrl}`);
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`
    );
    
    if (response.data.ok) {
      console.log('✅ Webhook setup successful!');
      
      // Verify webhook setup
      const infoResponse = await axios.get(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      );
      
      if (infoResponse.data.ok) {
        console.log('\n📋 Webhook Info:');
        console.log(`URL: ${infoResponse.data.result.url}`);
        console.log(`Max Connections: ${infoResponse.data.result.max_connections}`);
        console.log(`Last Error: ${infoResponse.data.result.last_error_message || 'None'}`);
        console.log(`Pending Updates: ${infoResponse.data.result.pending_update_count}`);
        
        if (infoResponse.data.result.url === webhookUrl) {
          console.log('\n✅ Webhook verification successful - URL matches expected value');
        } else {
          console.warn(`⚠️ Webhook URL mismatch! Expected: ${webhookUrl}, Got: ${infoResponse.data.result.url}`);
        }
      } else {
        console.error('❌ Failed to verify webhook:', infoResponse.data.description);
      }
    } else {
      console.error('❌ Webhook setup failed:', response.data.description);
      process.exit(1);
    }
    
    console.log('\n🎉 Webhook setup complete! Your bot should now receive updates through Railway.');
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

// Run the script
setupRailwayWebhook();