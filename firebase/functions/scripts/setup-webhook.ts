/**
 * Script to set up Telegram webhook to point to Firebase function
 * Run this after deploying your Firebase functions
 * 
 * Usage: 
 *   npm run setup-webhook
 *   
 * Or with command-line args:
 *   npm run setup-webhook -- --project=your-project-id --region=us-central1
 */
import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { program } from 'commander';

// Define command-line options
program
  .option('-p, --project <projectId>', 'Firebase project ID')
  .option('-r, --region <region>', 'Firebase function region', 'us-central1')
  .option('-f, --function <name>', 'Firebase function name', 'botWebhook')
  .option('-t, --token <token>', 'Telegram bot token')
  .parse(process.argv);

const options = program.opts();

// Load environment variables
// 1. First try .env file
dotenv.config();

// 2. Then try Firebase runtime config if it exists
const runtimeConfigPath = path.resolve(process.cwd(), '.runtimeconfig.json');
if (fs.existsSync(runtimeConfigPath)) {
  console.log('Loading Firebase config from .runtimeconfig.json');
  const runtimeConfig = JSON.parse(fs.readFileSync(runtimeConfigPath, 'utf8'));
  process.env.FIREBASE_CONFIG = JSON.stringify(runtimeConfig);
}

interface WebhookResponse {
  ok: boolean;
  description?: string;
  result?: boolean;
}

async function setupWebhook(): Promise<void> {
  try {
    // Determine values with this priority: CLI args > .env > Firebase config > default
    const projectId = options.project || 
                      process.env.PROJECT_ID || 
                      JSON.parse(process.env.FIREBASE_CONFIG || '{}').project?.id;
    
    const region = options.region || 
                   process.env.REGION || 
                   'us-central1';
    
    const functionName = options.function || 
                         process.env.WEBHOOK_FUNCTION_NAME || 
                         'botWebhook';
    
    // Get bot token from various sources
    let token = options.token || 
                process.env.TELEGRAM_BOT_TOKEN;
    
    // Try to get from Firebase config if not found
    if (!token && process.env.FIREBASE_CONFIG) {
      const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      token = firebaseConfig.telegram?.token;
    }
    
    if (!projectId) {
      throw new Error('Firebase project ID not found. Please provide it via .env file or --project option');
    }
    
    if (!token) {
      throw new Error('Telegram bot token not found. Please provide it via Firebase config, .env file, or --token option');
    }
    
    // For Cloud Run V2, the URL format is now:
    const functionUrl = `https://${functionName}-${region}-${projectId}.run.app`;
    
    console.log(`Setting up webhook for ${functionUrl}`);
    
    const response = await axios.get<WebhookResponse>(
      `https://api.telegram.org/bot${token}/setWebhook?url=${functionUrl}`
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