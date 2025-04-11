#!/bin/bash
# Set up Telegram webhook after Terraform deployment

set -e

# Check if required environment variables are set
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: TELEGRAM_BOT_TOKEN environment variable is not set."
    echo "Please set it using: export TELEGRAM_BOT_TOKEN=your_telegram_bot_token"
    exit 1
fi

# Get the service URL from Terraform output
SERVICE_URL=$(terraform output -raw service_url)

if [ -z "$SERVICE_URL" ]; then
    echo "ERROR: Could not retrieve service_url from Terraform output."
    echo "Make sure you've run 'terraform apply' successfully."
    exit 1
fi

# Set the webhook URL
WEBHOOK_URL="${SERVICE_URL}/webhook"
echo "Setting Telegram webhook to: ${WEBHOOK_URL}"

# Call Telegram API to set webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"${WEBHOOK_URL}\"}")

# Check response
SUCCESS=$(echo ${RESPONSE} | grep -o '"ok":true')

if [ ! -z "$SUCCESS" ]; then
    echo "✅ Webhook setup successful!"
else
    echo "❌ Webhook setup failed:"
    echo "${RESPONSE}"
    exit 1
fi

# Verify webhook info
echo "Getting webhook info to verify setup:"
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
echo ""
echo "Webhook setup complete!"