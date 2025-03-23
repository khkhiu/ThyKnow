#!/bin/bash
set -e

# Check if required variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: PROJECT_ID environment variable is not set."
    echo "Please set it using: export PROJECT_ID=your-project-id"
    exit 1
fi

if [ -z "$BOT_TOKEN" ]; then
    echo "ERROR: BOT_TOKEN environment variable is not set."
    echo "Please set it using: export BOT_TOKEN=your-telegram-bot-token"
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/telegram-journal-bot .

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/telegram-journal-bot

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy telegram-journal-bot \
  --image gcr.io/$PROJECT_ID/telegram-journal-bot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BOT_TOKEN=$BOT_TOKEN,CLOUD_RUN=true

echo "Deployment completed!"
echo "Your bot should now be running on Cloud Run."