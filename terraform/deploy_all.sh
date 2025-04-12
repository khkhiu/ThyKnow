#!/bin/bash
# Complete deployment script for ThyKnow Telegram Bot

set -e

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}ERROR: PROJECT_ID environment variable is not set.${NC}"
    echo "Please set it using: export PROJECT_ID=your-gcp-project-id"
    exit 1
fi

if [ -z "$REGION" ]; then
    echo -e "${YELLOW}REGION environment variable is not set. Using default: us-central1${NC}"
    export REGION=us-central1
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo -e "${RED}ERROR: TELEGRAM_BOT_TOKEN environment variable is not set.${NC}"
    echo "Please set it using: export TELEGRAM_BOT_TOKEN=your_telegram_bot_token"
    exit 1
fi

if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}ERROR: MONGODB_URI environment variable is not set.${NC}"
    echo "Please set it using: export MONGODB_URI=your_mongodb_connection_string"
    exit 1
fi

# Function to check if terraform.tfvars exists, create if not
check_tfvars() {
    if [ ! -f terraform.tfvars ]; then
        echo -e "${YELLOW}terraform.tfvars not found. Creating from example file...${NC}"
        cp terraform.tfvars.example terraform.tfvars
        
        # Replace placeholder values with actual values
        sed -i "s|your-gcp-project-id|$PROJECT_ID|g" terraform.tfvars
        sed -i "s|us-central1|$REGION|g" terraform.tfvars
        sed -i "s|your_telegram_bot_token_here|$TELEGRAM_BOT_TOKEN|g" terraform.tfvars
        sed -i "s|mongodb+srv://username:password@cluster.mongodb.net/thyknow?retryWrites=true&w=majority|$MONGODB_URI|g" terraform.tfvars
        
        echo -e "${GREEN}Created terraform.tfvars with your settings.${NC}"
    else
        echo -e "${GREEN}terraform.tfvars already exists. Using existing file.${NC}"
    fi
}

# Step 1: Make sure scripts are executable
chmod +x scripts/build_and_push.sh scripts/setup_webhook.sh

# Step 2: Check and create terraform.tfvars
check_tfvars

# Step 3: Build and push Docker image
echo -e "\n${GREEN}Step 1: Building and pushing Docker image...${NC}"
./scripts/build_and_push.sh

# Step 4: Initialize Terraform
echo -e "\n${GREEN}Step 2: Initializing Terraform...${NC}"
terraform init

# Step 5: Apply Terraform configuration
echo -e "\n${GREEN}Step 3: Applying Terraform configuration...${NC}"
terraform apply -auto-approve

if [ $? -ne 0 ]; then
    echo -e "${RED}Terraform apply failed. Please check the errors above.${NC}"
    exit 1
fi

# Step 6: Set up Telegram webhook
echo -e "\n${GREEN}Step 4: Setting up Telegram webhook...${NC}"
./scripts/setup_webhook.sh

# Step 7: Print outputs
echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Important URLs:${NC}"
echo "Service URL: $(terraform output -raw service_url)"
echo "Webhook URL: $(terraform output -raw webhook_url)"
echo "Docker Repository: $(terraform output -raw docker_repository)"
echo "Pub/Sub Topic: $(terraform output -raw pubsub_topic)"

# Step 8: Test the deployment
echo -e "\n${GREEN}Testing the deployment...${NC}"
echo "Sending a health check request..."
curl -s "$(terraform output -raw service_url)/health"
echo ""

echo -e "\n${GREEN}Sending a test message to Pub/Sub...${NC}"
gcloud pubsub topics publish "$(terraform output -raw pubsub_topic)" --message='{"action":"sendPrompts"}'

echo -e "\n${GREEN}All done! You can now interact with your bot on Telegram.${NC}"

# Print next steps
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Check your bot on Telegram to ensure it's responding"
echo "2. Monitor Cloud Run logs with: gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=thyknow-express\" --limit=20"
echo "3. Test the scheduler by running: gcloud scheduler jobs run weekly-journal-prompts"

echo -e "\n${GREEN}Deployment complete!${NC}"