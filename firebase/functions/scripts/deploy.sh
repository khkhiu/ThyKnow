#!/bin/bash
# firebase/functions/scripts/deploy.sh
set -e  # Exit on error

# Load environment variables - Source with proper quoting
set -a  # automatically export all variables
if [ -f .env ]; then
  # Use . instead of source for better compatibility
  . ./.env
fi
set +a

# Check for required environment variables
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Error: TELEGRAM_BOT_TOKEN not set"
  echo "Please set the TELEGRAM_BOT_TOKEN environment variable"
  exit 1
fi

# Set default values
PROJECT_ID=${PROJECT_ID:-$(firebase use | grep 'active' | awk '{print $3}')}
REGION=${REGION:-"us-central1"}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not determine PROJECT_ID"
  echo "Please set PROJECT_ID environment variable or make sure you're in a Firebase project directory"
  exit 1
fi

echo "=== ThyKnow Bot Deployment ==="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Step 1: Set Firebase config
echo "Setting Firebase configuration..."
firebase functions:config:set telegram.token="$TELEGRAM_BOT_TOKEN" --project $PROJECT_ID

# Step 2: Build the project
echo "Building TypeScript code..."
npm run build

# Step 3: Deploy Firebase Functions
echo "Deploying Firebase Functions..."
firebase deploy --only functions --project $PROJECT_ID

# Step 4: Set up the webhook
echo "Setting up Telegram webhook..."
npm run setup-webhook -- --project $PROJECT_ID --region $REGION

# Step 5: Set up the Cloud Scheduler
echo "Setting up Cloud Scheduler..."
chmod +x scripts/setup-scheduler.sh

# Export variables explicitly for the scheduler script
export PROJECT_ID=$PROJECT_ID
export REGION=$REGION
export SCHEDULE_TIME="$SCHEDULE_TIME"
export TIMEZONE="$TIMEZONE"
export TOPIC_NAME="$TOPIC_NAME"
export SCHEDULE_NAME="$SCHEDULE_NAME"

./scripts/setup-scheduler.sh

echo "=== Deployment Complete ==="
echo "Manual test commands:"
echo "- Test webhook: curl https://botWebhook-$REGION-$PROJECT_ID.run.app"
echo "- Run scheduler manually: gcloud scheduler jobs run ${SCHEDULE_NAME:-weekly-journal-prompts} --project $PROJECT_ID --location $REGION"
echo "- View logs: firebase functions:log --project $PROJECT_ID"