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
docker build -t gcr.io/$PROJECT_ID/thyknow-express .

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/thyknow-express

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy thyknow-express \
  --image gcr.io/$PROJECT_ID/thyknow-express \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN,MONGODB_URI=$MONGODB_URI,BASE_URL=https://thyknow-express-xxxx-xx.a.run.app

echo "Deployment completed!"
echo "Your bot should now be running on Cloud Run."

# Set up webhook
echo "Setting up Telegram webhook..."
SERVICE_URL=$(gcloud run services describe thyknow-express --platform managed --region us-central1 --format 'value(status.url)')

curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$SERVICE_URL/webhook\"}"

echo "Webhook setup complete! Your bot is ready to use."