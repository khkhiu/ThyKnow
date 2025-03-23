#!/bin/bash
set -e

# Check if required variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: PROJECT_ID environment variable is not set."
    echo "Please set it using: export PROJECT_ID=your-project-id"
    exit 1
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: TELEGRAM_BOT_TOKEN environment variable is not set."
    echo "Please set it using: export TELEGRAM_BOT_TOKEN=your-telegram-bot-token"
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/firebase-functions .

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/firebase-functions

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy firebase-functions \
  --image gcr.io/$PROJECT_ID/firebase-functions \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN,PORT=8080

echo "Deployment completed!"
echo "Your Firebase functions should now be running on Cloud Run."

# Set up webhook
echo "Setting up Telegram webhook..."
FUNCTION_URL=$(gcloud run services describe firebase-functions --platform managed --region us-central1 --format 'value(status.url)')

curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$FUNCTION_URL/botWebhook\"}"

echo "Webhook setup complete!"