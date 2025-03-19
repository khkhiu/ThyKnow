/**
 * Script to set up Telegram webhook to point to Firebase function
 * Run this after deploying your Firebase functions
 */
import axios from 'axios';
import * as functions from 'firebase-functions';
import * as dotenv from 'dotenv';

// Load configuration - run with firebase functions:config:get > .runtimeconfig.json first
dotenv.config({ path: '.runtimeconfig.json' });

interface WebhookResponse {
  ok: boolean;
  description?: string;
  result?: boolean;
}

async function setupWebhook(): Promise<void> {
  try {
    const token = functions.config().telegram.token;
    const functionUrl = `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/botWebhook`;
    
    console.log(`Setting up webhook for ${functionUrl}`);
    
    const response = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${token}/setWebhook?url=${functionUrl}`
    );
    
    console.log('Response:', response.data);
    
    if (response.data.ok) {
      console.log('Webhook setup successful!');
    } else {
      console.error('Webhook setup failed:', response.data.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
  }
}

setupWebhook();