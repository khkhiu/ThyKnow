#!/bin/bash
# firebase/functions/scripts/test-scheduler.sh
set -e

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Default values
PROJECT_ID=${PROJECT_ID:-$(firebase use | grep 'active' | awk '{print $3}')}
REGION=${REGION:-"us-central1"}
SCHEDULER_JOB=${SCHEDULER_JOB:-"weekly-journal-prompts"}
FUNCTION_NAME=${FUNCTION_NAME:-"manualTriggerWeeklyPrompts"}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not determine PROJECT_ID"
  echo "Please set PROJECT_ID environment variable or make sure you're in a Firebase project directory"
  exit 1
fi

echo "=== ThyKnow Bot Scheduler Test ==="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Test method selection
echo "How would you like to test the scheduler?"
echo "1. Trigger Cloud Scheduler job manually (requires gcloud CLI)"
echo "2. Call the HTTP function directly (requires curl)"
echo "3. Publish directly to Pub/Sub topic (requires gcloud CLI)"
read -p "Select an option (1-3): " test_option

case $test_option in
  1)
    echo "Triggering Cloud Scheduler job manually..."
    gcloud scheduler jobs run $SCHEDULER_JOB --project $PROJECT_ID --location $REGION
    ;;
  
  2)
    echo "Calling HTTP function directly..."
    FUNCTION_URL="https://$REGION-$PROJECT_ID.cloudfunctions.net/$FUNCTION_NAME"
    echo "Calling $FUNCTION_URL"
    curl -X POST $FUNCTION_URL
    echo ""  # Add newline after curl output
    ;;
  
  3)
    echo "Publishing directly to Pub/Sub topic..."
    TOPIC_NAME=${TOPIC_NAME:-"weekly-prompts"}
    MESSAGE='{"action":"send_weekly_prompts"}'
    
    gcloud pubsub topics publish $TOPIC_NAME \
      --project $PROJECT_ID \
      --message="$MESSAGE"
    
    echo "Message published to topic: $TOPIC_NAME"
    ;;
  
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac

echo "Test triggered. Check Firebase Function logs for results:"
echo "firebase functions:log --project $PROJECT_ID"