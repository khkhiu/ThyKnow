#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found"
  exit 1
fi

if [ -z "$BOT_TOKEN" ]; then
  echo "Error: BOT_TOKEN not set in .env file"
  exit 1
fi

# Function to get bot info
get_bot_info() {
  curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe"
}

# Function to check Telegram webhook status (for Firebase functions)
check_webhook() {
  curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"
}

# Check if the bot is running
echo "Checking if Python Telegram bot container is running..."
if docker ps | grep -q "telegram-journal-bot"; then
  echo "✅ Telegram bot container is running"
else
  echo "❌ Telegram bot container is not running"
fi

# Check if Firebase functions container is running
echo "Checking if Firebase functions container is running..."
if docker ps | grep -q "firebase-functions"; then
  echo "✅ Firebase functions container is running"
else
  echo "❌ Firebase functions container is not running"
fi

# Check if the bot token is valid
echo "Checking if Telegram bot token is valid..."
INFO=$(get_bot_info)
if echo "$INFO" | grep -q "\"ok\":true"; then
  BOT_USERNAME=$(echo "$INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Bot token is valid. Bot username: @$BOT_USERNAME"
  
  echo "You can test the bot by sending commands to @$BOT_USERNAME in Telegram:"
  echo "  /start - Initialize the bot"
  echo "  /prompt - Get a reflection prompt"
  echo "  /history - View your journal entries"
  echo "  /help - Show available commands"
else
  echo "❌ Bot token is invalid or bot is not accessible"
  echo "$INFO"
fi

# Check webhook status (only relevant for Firebase functions)
echo "Checking Telegram webhook status..."
WEBHOOK_INFO=$(check_webhook)
if echo "$WEBHOOK_INFO" | grep -q "\"url\":\"\""; then
  echo "ℹ️ No webhook is set. This is normal for the Python bot version."
else
  WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
  echo "ℹ️ Webhook is set to: $WEBHOOK_URL"
fi

# Check Telegram bot logs
echo "Last 10 lines of Telegram bot logs:"
docker logs telegram-journal-bot --tail 10

# Print instructions
echo ""
echo "To verify the bot is working:"
echo "1. Open Telegram and message @$BOT_USERNAME"
echo "2. Send the /start command"
echo "3. Try other commands like /prompt and /history"
echo ""
echo "If the bot responds, it's working correctly!"