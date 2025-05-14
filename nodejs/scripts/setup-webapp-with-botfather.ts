/**
 * This script generates instructions for setting up the Web App with BotFather
 * 
 * Running this script will output the commands you need to send to BotFather
 * to configure your bot with the Web App.
 * 
 * Usage:
 *   npx ts-node scripts/setup-webapp-with-botfather.ts
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

function generateBotFatherInstructions(): void {
  try {
    // Get environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : process.env.BASE_URL || 'http://localhost:3000';
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN is not set. Please configure your environment variables.');
      process.exit(1);
    }
    
    // Get bot username from token (if possible)
    let botUsername = 'your_bot';
    try {
      // The token format is usually: <bot_id>:xxxxx
      // We can extract the bot_id from it
      const botId = botToken.split(':')[0];
      botUsername = `${botId}_bot`; // This is just an approximation
    } catch (error) {
      console.warn('Could not parse bot username from token, using placeholder instead.');
    }
    
    // Create the Web App URL
    const webAppUrl = `${baseUrl}/miniapp`;
    
    console.log(`
=========================================================
🤖 BotFather Web App Setup Instructions for ThyKnow Bot
=========================================================

Follow these steps to configure your Telegram Web App:

1️⃣ Start a chat with @BotFather in Telegram

2️⃣ Send this command:
   /setmenubutton

3️⃣ Select your bot:
   @${botUsername}

4️⃣ Send the Web App URL when prompted:
   ${webAppUrl}

5️⃣ Send the menu button text when prompted:
   ThyKnow App

6️⃣ Optionally, set the commands to include a miniapp command:
   /setcommands

7️⃣ Select your bot:
   @${botUsername}

8️⃣ Send the command list:
   start - Initialize the bot and get started
   prompt - Get a new reflection prompt
   choose - Choose a specific type of prompt
   history - View your recent journal entries
   miniapp - Open the ThyKnow mini app
   schedule - Manage your prompt schedule
   help - Show available commands and usage

9️⃣ To verify your setup, send this command:
   /getmenubutton
   
Your Web App URL is: ${webAppUrl}

=========================================================
`);

    // Also save these instructions to a file for reference
    const instructionsPath = path.join(__dirname, '../botfather-webapp-setup.txt');
    fs.writeFileSync(instructionsPath, `BotFather Web App Setup Instructions for ThyKnow Bot\n\nBot Username: @${botUsername}\nWeb App URL: ${webAppUrl}\n\nFollow the steps in the console output to complete the setup.`);
    
    console.log(`📝 Instructions have been saved to: ${instructionsPath}`);
    
  } catch (error) {
    console.error('Error generating BotFather instructions:', error);
    process.exit(1);
  }
}

// Run the script
generateBotFatherInstructions();