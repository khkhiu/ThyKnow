# ThyKnow Telegram Bot - GCP Deployment Guide

This guide provides comprehensive instructions for deploying the ThyKnow Telegram bot to Google Cloud Platform (GCP) using a fully automated Terraform infrastructure as code approach.

## Architecture Overview

The deployed architecture consists of the following components:

![Architecture Diagram](https://i.imgur.com/placeholder.png)

1. **Cloud Run Service**: Hosts the ThyKnow Express application, automatically scales based on load
2. **Artifact Registry**: Stores the Docker container images
3. **Secret Manager**: Securely stores sensitive credentials (Telegram Bot Token and MongoDB URI)
4. **Pub/Sub Topic**: Receives scheduled events to trigger prompt delivery
5. **Cloud Scheduler**: Schedules weekly prompts according to the configured schedule
6. **MongoDB Atlas**: External database service (not managed by Terraform)

## Prerequisites

Before starting the deployment, ensure you have:

1. **Google Cloud Account**: With billing enabled
2. **Google Cloud SDK**: Installed and configured on your local machine
3. **Terraform**: Version 1.0.0 or higher installed
4. **Docker**: Installed and configured
5. **Telegram Bot**: Created via BotFather with its API token
6. **MongoDB Database**: Set up on MongoDB Atlas with connection string

## Step 1: Project Preparation

### 1.1 Clone the Repository

```bash
git clone https://github.com/your-username/thyknow.git
cd thyknow
```

### 1.2 Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Required: Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Required: MongoDB Connection String (see mongodb_setup_guide.md)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thyknow?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=production
BASE_URL=https://your-cloud-run-service-url.a.run.app

# Timezone Settings
TIMEZONE=Asia/Singapore

# Scheduler Settings
PROMPT_DAY=1  # Monday
PROMPT_HOUR=9  # 9 AM

# Maximum history entries to show
MAX_HISTORY=5

# GCP Project Settings
PROJECT_ID=your-gcp-project-id
REGION=us-central1

# Cloud Scheduler Settings
SCHEDULE_TIME="0 9 * * 1"  # Monday at 9 AM
TOPIC_NAME=weekly-prompts
SCHEDULE_NAME=weekly-journal-prompts
```

Then export the essential environment variables:

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export TELEGRAM_BOT_TOKEN=your_telegram_bot_token
export MONGODB_URI=your_mongodb_connection_string
```

## Step 2: Infrastructure Deployment with Terraform

### 2.1 Navigate to the Terraform Directory

```bash
cd terraform
```

### 2.2 Run the Automated Deployment Script

The `deploy_all.sh` script will:
1. Create `terraform.tfvars` from your environment variables
2. Build and push the Docker image to Artifact Registry
3. Apply the Terraform configuration
4. Set up the Telegram webhook

```bash
chmod +x deploy_all.sh
./deploy_all.sh
```

This process may take 5-10 minutes to complete.

### 2.3 Verify the Deployment

After successful deployment, you'll see output with important URLs:
- Service URL
- Webhook URL
- Docker Repository
- Pub/Sub Topic

Verify the deployment by:
1. Checking if your bot responds on Telegram
2. Viewing the logs in Cloud Logging
3. Testing the health endpoint

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=thyknow-express" --limit=20

# Test the health endpoint
curl $(terraform output -raw service_url)/health
```

## Step 3: Understanding the Deployment

### 3.1 Main Components

#### Cloud Run Service

The ThyKnow Express application runs in a containerized environment on Cloud Run:
- Automatically scales from 0 to multiple instances based on traffic
- Uses the Docker image from Artifact Registry
- Accesses secrets securely from Secret Manager

#### Pub/Sub and Cloud Scheduler

Weekly prompts are triggered by:
1. Cloud Scheduler creates a job that runs every Monday at 9 AM (Singapore time)
2. The scheduler job publishes a message to the Pub/Sub topic
3. Pub/Sub pushes the message to the Cloud Run service's `/pubsub/messages` endpoint
4. The application processes the message and sends prompts to eligible users

### 3.2 Security

The deployment includes several security best practices:
- Sensitive credentials stored in Secret Manager
- Service account with least privilege permissions
- MongoDB connection using secure authentication

## Step 4: Operations and Maintenance

### 4.1 Updating the Application

When you make changes to the code:

1. Push changes to your repository
2. Rebuild and redeploy:

```bash
# From the terraform directory
./scripts/build_and_push.sh
terraform apply
```

### 4.2 Manual Testing

Test pub/sub functionality by manually publishing a message:

```bash
gcloud pubsub topics publish weekly-prompts --message='{"action":"sendPrompts"}'
```

Test sending a prompt to a specific user:

```bash
gcloud pubsub topics publish weekly-prompts --message='{"action":"sendPromptToUser", "userId":"TELEGRAM_USER_ID"}'
```

### 4.3 Monitoring

Monitor your application using Cloud Logging and Monitoring:

```bash
# View application logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=thyknow-express" --limit=20

# View Pub/Sub subscription logs
gcloud logging read "resource.type=pubsub_subscription" --limit=10
```

Set up alerting for critical errors through the GCP console.

### 4.4 Cleanup

To remove all created resources when no longer needed:

```bash
# From the terraform directory
terraform destroy
```

## Troubleshooting Common Issues

### 1. Bot Not Responding on Telegram

**Solution**:
1. Check webhook status: `curl -X GET https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`
2. Verify in logs that webhook requests are reaching your service
3. Run webhook setup again: `./scripts/setup_webhook.sh`

### 2. Prompt Schedule Not Running

**Solution**:
1. Check Cloud Scheduler job status in GCP Console
2. Verify that the timezone settings are correct
3. Check Pub/Sub subscription configuration
4. Manually trigger the job to test: `gcloud scheduler jobs run weekly-journal-prompts`

### 3. Database Connection Issues

**Solution**:
1. Verify MongoDB Atlas connection string
2. Check if IP whitelist includes `0.0.0.0/0` or GCP's IP ranges
3. Test connection directly using MongoDB Compass or CLI
4. Check Secret Manager to ensure the secret was created correctly

### 4. Docker Image Build or Push Failures

**Solution**:
1. Verify you have proper permissions to Artifact Registry
2. Check if Artifact Registry API is enabled
3. Make sure Docker is authenticated with GCP: `gcloud auth configure-docker ${REGION}-docker.pkg.dev`

## Advanced Customization

### Custom Domain

To use a custom domain with your Cloud Run service:

1. Add a domain mapping in GCP Console
2. Update DNS records to point to the service
3. Update the Telegram webhook to use the custom domain

### High Availability Configuration

For increased reliability, consider:

1. Setting minimum instances > 0 to avoid cold starts
2. Deploying to multiple regions
3. Setting up automated database backups

## Conclusion

Your ThyKnow Telegram bot is now successfully deployed to Google Cloud Platform using a robust, scalable, and secure architecture. The combination of Cloud Run, Pub/Sub, and Cloud Scheduler ensures that your prompts are delivered reliably while minimizing operational costs.

For additional questions or customizations, refer to the official documentation for each GCP service or reach out to the community.