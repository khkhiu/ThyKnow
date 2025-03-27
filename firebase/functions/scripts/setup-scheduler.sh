#!/bin/bash
# firebase/functions/scripts/setup-scheduler.sh

set -e  # Exit on error

# Load environment variables if not already loaded
if [ -z "$PROJECT_ID" ] && [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

# Check for required environment variables
if [ -z "$PROJECT_ID" ]; then
  # Try to get from Firebase config
  PROJECT_ID=$(firebase use | grep 'active' | awk '{print $3}')
  if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID not found"
    echo "Please set PROJECT_ID environment variable or make sure you're in a Firebase project directory"
    exit 1
  fi
  echo "Using Firebase project: $PROJECT_ID"
fi

# Default values for scheduler
REGION=${REGION:-"us-central1"}
TOPIC_NAME=${TOPIC_NAME:-"weekly-prompts"}
SCHEDULE_NAME=${SCHEDULE_NAME:-"weekly-journal-prompts"}
SCHEDULE_TIME=${SCHEDULE_TIME:-"0 9 * * 1"}  # Monday at 9 AM
TIMEZONE=${TIMEZONE:-"Asia/Singapore"}

echo "Setting up Cloud Scheduler with Pub/Sub for project: $PROJECT_ID"
echo "Schedule time: $SCHEDULE_TIME"
echo "Timezone: $TIMEZONE"

# Step 1: Create Pub/Sub topic if it doesn't exist
echo "Creating Pub/Sub topic: $TOPIC_NAME"
if ! gcloud pubsub topics describe $TOPIC_NAME --project $PROJECT_ID &>/dev/null; then
  gcloud pubsub topics create $TOPIC_NAME --project $PROJECT_ID
  echo "Topic $TOPIC_NAME created successfully"
else
  echo "Topic $TOPIC_NAME already exists"
fi

# Step 2: Create Cloud Scheduler job
echo "Creating Cloud Scheduler job: $SCHEDULE_NAME"

# Check if schedule already exists
if gcloud scheduler jobs describe $SCHEDULE_NAME --project $PROJECT_ID --location $REGION &>/dev/null; then
  echo "Updating existing scheduler job"
  gcloud scheduler jobs update pubsub $SCHEDULE_NAME \
    --project $PROJECT_ID \
    --location $REGION \
    --schedule "$SCHEDULE_TIME" \
    --topic $TOPIC_NAME \
    --message-body '{"action":"send_weekly_prompts"}' \
    --time-zone "$TIMEZONE"
else
  echo "Creating new scheduler job"
  gcloud scheduler jobs create pubsub $SCHEDULE_NAME \
    --project $PROJECT_ID \
    --location $REGION \
    --schedule "$SCHEDULE_TIME" \
    --topic $TOPIC_NAME \
    --message-body '{"action":"send_weekly_prompts"}' \
    --time-zone "$TIMEZONE"
fi

echo "Cloud Scheduler job created/updated successfully!"
echo "----------------------------------------------------"
echo "Job will run at: $SCHEDULE_TIME ($TIMEZONE)"
echo "Triggering Pub/Sub topic: $TOPIC_NAME"
echo "Which triggers Firebase function: weeklyPromptPubSub"
echo ""
echo "To test the scheduler manually, run:"
echo "gcloud scheduler jobs run $SCHEDULE_NAME --project $PROJECT_ID --location $REGION"