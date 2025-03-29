#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found"
  exit 1
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Error: TELEGRAM_BOT_TOKEN not set in .env file"
  exit 1
fi

# Function to get bot info
get_bot_info() {
  curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
}

# Function to check Telegram webhook status
check_webhook() {
  curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
}

# Check MongoDB connection
check_mongodb() {
  echo "Checking MongoDB connection..."
  if command -v mongosh &> /dev/null; then
    # Using mongosh (newer MongoDB shell)
    if mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" --quiet | grep -q "ok"; then
      echo "✅ MongoDB connection successful"
    else
      echo "❌ MongoDB connection failed"
    fi
  elif command -v mongo &> /dev/null; then
    # Using mongo (older MongoDB shell)
    if mongo "$MONGODB_URI" --eval "db.adminCommand('ping')" --quiet | grep -q "ok"; then
      echo "✅ MongoDB connection successful"
    else
      echo "❌ MongoDB connection failed"
    fi
  else
    echo "⚠️ MongoDB client not found. Skipping connection check."
  fi
}

# Check if the Express server is running
check_express_server() {
  echo "Checking if Express server is running..."
  if curl -s "http://localhost:$PORT/health" | grep -q "status.*ok"; then
    echo "✅ Express server is running"
  else
    echo "❌ Express server is not running"
  fi
}

# Check if Docker containers are running (if using Docker)
check_docker() {
  echo "Checking if Docker containers are running..."
  if command -v docker &> /dev/null; then
    if docker ps | grep -q "thyknow-express"; then
      echo "✅ Express server container is running"
    else
      echo "❌ Express server container is not running"
    fi
    
    if docker ps | grep -q "thyknow-mongo"; then
      echo "✅ MongoDB container is running"
    else
      echo "❌ MongoDB container is not running"
    fi
  else
    echo "⚠️ Docker not found. Skipping container check."
  fi
}

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
  echo "  /timezone - Check prompt timings"
  echo "  /help - Show available commands"
else
  echo "❌ Bot token is invalid or bot is not accessible"
  echo "$INFO"
  exit 1
fi

# Check webhook status
echo "Checking Telegram webhook status..."
WEBHOOK_INFO=$(check_webhook)
if echo "$WEBHOOK_INFO" | grep -q "\"url\":\"\""; then
  echo "ℹ️ No webhook is set. Bot is using polling mode (normal for development)."
else
  WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
  echo "ℹ️ Webhook is set to: $WEBHOOK_URL"
  
  # Verify webhook is working
  if curl -s "$WEBHOOK_URL" | grep -q "ok\|error"; then
    echo "✅ Webhook endpoint is accessible"
  else
    echo "❌ Webhook endpoint is not accessible"
  fi
fi

# Check MongoDB connection
check_mongodb

# Check Express server
check_express_server

# Check Docker (if applicable)
check_docker

# Print server logs (if available)
if [ -f "logs/combined.log" ]; then
  echo -e "\nLast 10 lines of server logs:"
  tail -n 10 logs/combined.log
fi

echo -e "\n-------------------------------------------"
echo "Manual Testing Instructions:"
echo "1. Open Telegram and message @$BOT_USERNAME"
echo "2. Send the /start command"
echo "3. Try other commands like /prompt and /history"
echo "4. Check that the bot responds correctly to each command"
echo -e "-------------------------------------------\n"

echo "Would you like to monitor the logs in real-time? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Monitoring logs. Press Ctrl+C to exit."
  tail -f logs/combined.log
fi