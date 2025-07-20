/**
 * This script generates instructions for setting up the Web App with BotFather
 * 
 * Running this script will output the commands you need to send to BotFather
 * to configure your bot with the Web App.
 * 
 * Usage:
 *   npx ts-node scripts/setup-webapp-with-botfather.ts
 */
// scripts/setup-webapp-with-botfather.ts - UPDATED VERSION
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

function generateBotFatherInstructions(): void {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : process.env.BASE_URL || 'http://localhost:3000';
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN is not set.');
      process.exit(1);
    }
    
    let botUsername = 'your_bot';
    try {
      const botId = botToken.split(':')[0];
      botUsername = `${botId}_bot`;
    } catch (error) {
      console.warn('Could not parse bot username from token.');
    }
    
    // UPDATED: React app URL instead of /miniapp
    const webAppUrl = `${baseUrl}/`;
    
    console.log(`
=========================================================
🤖 BotFather Setup Instructions for ThyKnow Bot
=========================================================

1️⃣ Start a chat with @BotFather in Telegram

2️⃣ UPDATE BOT COMMANDS:
   Send: /setcommands
   Select: @${botUsername}
   Send this command list:

start - Initialize the bot and get started
prompt - Get a new reflection prompt
history - View your recent journal entries
streak - View your weekly reflection streak
schedule - Manage your prompt schedule
feedback - Share your thoughts with us
help - Show available commands and usage

3️⃣ OPTIONAL - Set menu button:
   Send: /setmenubutton
   Select: @${botUsername}
   Web App URL: ${webAppUrl}
   Button text: ThyKnow App

4️⃣ VERIFY COMMANDS:
   Send: /getcommands
   Select: @${botUsername}
   
   You should see ONLY the 7 commands listed above.
   Old commands like /choose and /miniapp should be GONE.

Your Web App URL: ${webAppUrl}
=========================================================
`);

    const instructionsPath = path.join(__dirname, '../botfather-setup-updated.txt');
    const instructions = `
BotFather Setup Instructions for ThyKnow Bot

Bot Username: @${botUsername}
Web App URL: ${webAppUrl}

UPDATED COMMAND LIST (copy this exactly):
start - Initialize the bot and get started
prompt - Get a new reflection prompt
history - View your recent journal entries
streak - View your weekly reflection streak
schedule - Manage your prompt schedule
feedback - Share your thoughts with us
help - Show available commands and usage

Steps:
1. Chat with @BotFather
2. Send /setcommands
3. Select your bot
4. Paste the command list above
5. Verify with /getcommands
`;
    
    fs.writeFileSync(instructionsPath, instructions);
    console.log(`📝 Instructions saved to: ${instructionsPath}`);
    
  } catch (error) {
    console.error('Error generating instructions:', error);
    process.exit(1);
  }
}

generateBotFatherInstructions();