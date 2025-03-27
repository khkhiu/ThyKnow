#!/bin/bash
# firebase/functions/scripts/setup-secrets.sh
set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
  set -a  # automatically export all variables
  . ./.env
  set +a
fi

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

echo "=== Setting up Firebase Functions V2 Secrets ==="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Set up secrets for Firebase Functions V2
echo "Setting up TELEGRAM_BOT_TOKEN secret..."

# Check if Secret Manager API is enabled
if ! gcloud services list --enabled --project "$PROJECT_ID" | grep -q secretmanager.googleapis.com; then
  echo "Enabling Secret Manager API..."
  gcloud services enable secretmanager.googleapis.com --project "$PROJECT_ID"
fi

# Check if secret already exists
if ! gcloud secrets describe TELEGRAM_BOT_TOKEN --project "$PROJECT_ID" &>/dev/null; then
  echo "Creating new secret TELEGRAM_BOT_TOKEN..."
  echo -n "$TELEGRAM_BOT_TOKEN" | gcloud secrets create TELEGRAM_BOT_TOKEN \
    --data-file=- \
    --replication-policy="automatic" \
    --project "$PROJECT_ID"
else
  echo "Updating existing secret TELEGRAM_BOT_TOKEN..."
  echo -n "$TELEGRAM_BOT_TOKEN" | gcloud secrets versions add TELEGRAM_BOT_TOKEN \
    --data-file=- \
    --project "$PROJECT_ID"
fi

# Grant access to the Cloud Functions service account
echo "Granting access to the Cloud Functions service account..."
SERVICE_ACCOUNT="$PROJECT_ID@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding TELEGRAM_BOT_TOKEN \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"

echo "=== Secret Setup Complete ==="
echo "The TELEGRAM_BOT_TOKEN secret is now available to your Firebase Functions."
echo "Make sure to reference it in your function code using defineSecret('TELEGRAM_BOT_TOKEN')"