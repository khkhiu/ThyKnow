#!/bin/bash
# Setup script for Cloud Pub/Sub resources

set -e

# Check if required variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: PROJECT_ID environment variable is not set."
    echo "Please set it using: export PROJECT_ID=your-project-id"
    exit 1
fi

# Create the topic for weekly prompts
echo "Creating Pub/Sub topic for weekly prompts..."
gcloud pubsub topics create weekly-prompts --project="$PROJECT_ID"

# Create the scheduler job
echo "Creating Cloud Scheduler job for weekly prompts..."
gcloud scheduler jobs create pubsub weekly-prompt-scheduler \
  --schedule="0 9 * * 1" \
  --topic=weekly-prompts \
  --message-body='{"action":"sendPrompts"}' \
  --time-zone="Asia/Singapore" \
  --project="$PROJECT_ID"

# Grant the scheduler service account permission to publish to the topic
echo "Granting permissions..."
SERVICE_ACCOUNT=$(gcloud scheduler jobs describe weekly-prompt-scheduler --format="value(pubsubTarget.serviceAccountEmail)" --project="$PROJECT_ID")
gcloud pubsub topics add-iam-policy-binding weekly-prompts \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/pubsub.publisher" \
  --project="$PROJECT_ID"

echo "Pub/Sub setup complete! The scheduler will trigger every Monday at 9:00 AM (Singapore time)."