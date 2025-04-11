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

if [ -z "$MONGODB_URI" ]; then
    echo "ERROR: MONGODB_URI environment variable is not set."
    echo "Please set it using: export MONGODB_URI=your-mongodb-uri"
    exit 1
fi

echo "===== Setting up project environment ====="

# Enable required services if not already enabled
echo "Enabling required GCP services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com pubsub.googleapis.com

# Store secrets in Secret Manager (if they don't exist)
if ! gcloud secrets describe telegram-bot-token --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating Secret Manager secret for TELEGRAM_BOT_TOKEN..."
    echo -n "$TELEGRAM_BOT_TOKEN" | gcloud secrets create telegram-bot-token --data-file=- --project="$PROJECT_ID"
fi

if ! gcloud secrets describe mongodb-uri --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating Secret Manager secret for MONGODB_URI..."
    echo -n "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=- --project="$PROJECT_ID"
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/thyknow-express .

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/thyknow-express

# Deploy to Cloud Run with secrets
echo "Deploying to Cloud Run..."
gcloud run deploy thyknow-express \
  --image gcr.io/$PROJECT_ID/thyknow-express \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="TELEGRAM_BOT_TOKEN=telegram-bot-token:latest,MONGODB_URI=mongodb-uri:latest" \
  --set-env-vars="NODE_ENV=production,TIMEZONE=Asia/Singapore,PROMPT_DAY=1,PROMPT_HOUR=9,MAX_HISTORY=5" \
  --project="$PROJECT_ID"

# Get the service URL
SERVICE_URL=$(gcloud run services describe thyknow-express --platform managed --region us-central1 --format 'value(status.url)' --project="$PROJECT_ID")

# Update BASE_URL environment variable with the actual service URL
echo "Updating BASE_URL environment variable..."
gcloud run services update thyknow-express \
  --platform managed \
  --region us-central1 \
  --set-env-vars="BASE_URL=$SERVICE_URL" \
  --project="$PROJECT_ID"

echo "Deployment completed!"
echo "Your service is running at: $SERVICE_URL"

# Set up webhook
echo "Setting up Telegram webhook..."
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$SERVICE_URL/webhook\"}"

echo "Webhook setup complete! Your bot is ready to use."

# Grant Cloud Pub/Sub invoker permission to the service
echo "Granting Cloud Run service account permission to receive Pub/Sub messages..."
SERVICE_ACCOUNT=$(gcloud run services describe thyknow-express --platform managed --region us-central1 --format 'value(spec.template.spec.serviceAccountName)' --project="$PROJECT_ID")

# If no service account is assigned, use the default compute service account
if [ -z "$SERVICE_ACCOUNT" ]; then
    SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"
fi

gcloud run services add-iam-policy-binding thyknow-express \
  --member="serviceAccount:service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region=us-central1 \
  --platform=managed \
  --project="$PROJECT_ID"

echo "===== GCP SETUP COMPLETE ====="
echo "ThyKnow Express has been successfully deployed to Google Cloud Platform."
echo "Service URL: $SERVICE_URL"
echo "- Telegram webhook is configured"
echo "- Secret Manager is storing sensitive credentials"
echo "- Service is configured to receive Pub/Sub messages"
echo ""
echo "Next steps:"
echo "1. Run ./scripts/setup-pubsub.sh to configure the Cloud Scheduler for weekly prompts"
echo "2. Visit $SERVICE_URL/health to verify the service is running correctly"