# Telegram Bot Quickstart Guide

This guide will help you quickly set up and verify your Telegram bot is working correctly.

## Setup

1. **Create an environment file**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Telegram bot token:
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

2. **Start the services**

   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Make the test script executable**

   ```bash
   chmod +x test-bot.sh
   ```

## Testing

1. **Run the verification script**

   ```bash
   ./test-bot.sh
   ```

   This will check if:
   - The containers are running
   - Your bot token is valid
   - The webhook status (for Firebase functions)
   - Show recent logs

2. **Test in Telegram**

   - Open Telegram and find your bot by the username shown in the test script
   - Send the `/start` command
   - Try the `/prompt`, `/history`, and `/help` commands
   - If the bot responds to these commands, it's working correctly!

## Troubleshooting

### Python Bot Issues

If the Python bot isn't responding:

1. Check the logs:
   ```bash
   docker logs telegram-journal-bot
   ```

2. Restart the container:
   ```bash
   docker-compose restart telegram-bot
   ```

3. Make sure your bot token is correct

### Firebase Issues

If the Firebase functions aren't working:

1. Check the logs:
   ```bash
   docker logs firebase-functions
   ```

2. Rebuild the container:
   ```bash
   docker-compose build --no-cache firebase
   docker-compose up -d firebase
   ```

## Container Management

- **Stop all containers**
  ```bash
  docker-compose down
  ```

- **View logs**
  ```bash
  docker-compose logs -f
  ```

- **Restart a specific container**
  ```bash
  docker-compose restart telegram-bot
  ```