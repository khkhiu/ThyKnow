#!/bin/bash
# Monitoring and troubleshooting script for ThyKnow on GCP

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get service name from terraform output or fallback to default
SERVICE_NAME=$(terraform output -raw service_name 2>/dev/null || echo "thyknow-express")

# Display menu
show_menu() {
    clear
    echo -e "${BLUE}===== ThyKnow GCP Monitoring Tool =====${NC}"
    echo -e "${GREEN}1.${NC} View latest application logs"
    echo -e "${GREEN}2.${NC} View error logs only"
    echo -e "${GREEN}3.${NC} Check Cloud Run service status"
    echo -e "${GREEN}4.${NC} Check Pub/Sub subscription logs"
    echo -e "${GREEN}5.${NC} Check webhook status"
    echo -e "${GREEN}6.${NC} Test health endpoint"
    echo -e "${GREEN}7.${NC} Manually trigger prompt scheduler"
    echo -e "${GREEN}8.${NC} Test sending prompt to specific user"
    echo -e "${GREEN}9.${NC} Monitor resources (continuous logs)"
    echo -e "${GREEN}0.${NC} Exit"
    echo
    echo -n "Enter your choice: "
}

# View latest application logs
view_logs() {
    echo -e "\n${YELLOW}Fetching latest application logs...${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit=20
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# View error logs only
view_error_logs() {
    echo -e "\n${YELLOW}Fetching error logs...${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME} AND severity>=ERROR" --limit=20
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Check Cloud Run service status
check_service_status() {
    echo -e "\n${YELLOW}Checking Cloud Run service status...${NC}"
    gcloud run services describe ${SERVICE_NAME} --format="yaml(status)"
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Check Pub/Sub subscription logs
check_pubsub_logs() {
    echo -e "\n${YELLOW}Fetching Pub/Sub subscription logs...${NC}"
    gcloud logging read "resource.type=pubsub_subscription" --limit=15
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Check webhook status
check_webhook_status() {
    echo -e "\n${YELLOW}Checking webhook status...${NC}"
    # Need to prompt for bot token since it's a secret
    echo -n "Enter your Telegram Bot Token: "
    read -s BOT_TOKEN
    echo
    
    if [ -z "$BOT_TOKEN" ]; then
        echo -e "${YELLOW}No token provided. Skipping webhook check.${NC}"
    else
        curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq
    fi
    
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Test health endpoint
test_health_endpoint() {
    echo -e "\n${YELLOW}Testing health endpoint...${NC}"
    SERVICE_URL=$(terraform output -raw service_url 2>/dev/null)
    
    if [ -z "$SERVICE_URL" ]; then
        echo -e "${YELLOW}Could not get service URL from Terraform output.${NC}"
        echo -n "Enter your service URL: "
        read SERVICE_URL
    fi
    
    if [ -z "$SERVICE_URL" ]; then
        echo -e "${YELLOW}No service URL provided. Skipping health check.${NC}"
    else
        curl -s "${SERVICE_URL}/health" | jq
    fi
    
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Manually trigger scheduler
trigger_scheduler() {
    echo -e "\n${YELLOW}Triggering Cloud Scheduler job...${NC}"
    SCHEDULE_NAME=$(terraform output -raw schedule_name 2>/dev/null || echo "weekly-journal-prompts")
    gcloud scheduler jobs run ${SCHEDULE_NAME}
    
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Test sending to specific user
send_to_user() {
    echo -e "\n${YELLOW}Testing prompt to specific user...${NC}"
    TOPIC_NAME=$(terraform output -raw pubsub_topic 2>/dev/null || echo "weekly-prompts")
    
    echo -n "Enter the Telegram User ID to send to: "
    read USER_ID
    
    if [ -z "$USER_ID" ]; then
        echo -e "${YELLOW}No user ID provided. Skipping test.${NC}"
    else
        gcloud pubsub topics publish ${TOPIC_NAME} --message="{\"action\":\"sendPromptToUser\", \"userId\":\"${USER_ID}\"}"
        echo -e "${GREEN}Message published. Check logs for results.${NC}"
    fi
    
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Monitor resources continuously
monitor_resources() {
    echo -e "\n${YELLOW}Starting continuous log monitoring (press Ctrl+C to stop)...${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit=20 --format="table(timestamp,severity,textPayload)" --stream
    
    echo -e "\n${GREEN}Press Enter to continue${NC}"
    read
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1) view_logs ;;
        2) view_error_logs ;;
        3) check_service_status ;;
        4) check_pubsub_logs ;;
        5) check_webhook_status ;;
        6) test_health_endpoint ;;
        7) trigger_scheduler ;;
        8) send_to_user ;;
        9) monitor_resources ;;
        0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${YELLOW}Invalid option. Press Enter to continue.${NC}"; read ;;
    esac
done