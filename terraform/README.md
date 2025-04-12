# ThyKnow Telegram Bot - Terraform Deployment

This directory contains Terraform configurations to deploy the ThyKnow Telegram bot to Google Cloud Platform (GCP) using Cloud Run, Pub/Sub, Cloud Scheduler, and Secret Manager.

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) installed (v1.0.0+)
2. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
3. [Docker](https://docs.docker.com/get-docker/) installed
4. A GCP project with billing enabled
5. A Telegram bot token from BotFather
6. A MongoDB Atlas account and cluster (or other MongoDB hosting)

## Setup

### 1. Configure Environment Variables

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export TELEGRAM_BOT_TOKEN=your_telegram_bot_token
export MONGODB_URI=your_mongodb_connection_string
```

### 2. Create `terraform.tfvars` File

Create a copy of the example vars file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Then edit `terraform.tfvars` to set your specific values:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
telegram_bot_token = "your_telegram_bot_token"
mongodb_uri = "your_mongodb_connection_string"
# ... other settings can remain as default or be customized
```

### 3. Build and Push Docker Image

Run the script to build and push the Docker image to Artifact Registry:

```bash
chmod +x scripts/build_and_push.sh
./scripts/build_and_push.sh
```

### 4. Initialize Terraform

```bash
terraform init
```

### 5. Apply Terraform Configuration

```bash
terraform apply
```

Review the plan and type `yes` to proceed with the deployment.

### 6. Set Up Telegram Webhook

After successful deployment, run the webhook setup script:

```bash
chmod +x scripts/setup_webhook.sh
./scripts/setup_webhook.sh
```

## Terraform Resources Created

This Terraform configuration creates the following resources:

- **Service Account** for ThyKnow application
- **Secret Manager Secrets** for Telegram bot token and MongoDB URI
- **Artifact Registry Repository** for Docker images
- **Cloud Run Service** to run the ThyKnow application
- **Pub/Sub Topic** for scheduled messages
- **Pub/Sub Subscription** for the Cloud Run service
- **Cloud Scheduler Job** for sending weekly prompts

## Outputs

After deployment, Terraform will output:

- `service_url`: The URL of the deployed Cloud Run service
- `webhook_url`: The webhook URL to register with Telegram
- `docker_repository`: The Docker repository URL
- `pubsub_topic`: The Pub/Sub topic name
- `service_account`: The service account email

## Managing the Deployment

### Updating the Application

1. Make changes to your application code
2. Rebuild and push the Docker image:
   ```bash
   ./scripts/build_and_push.sh
   ```
3. Redeploy using Terraform:
   ```bash
   terraform apply
   ```

### Destroying the Infrastructure

To delete all created resources:

```bash
terraform destroy
```

## Customizing the Deployment

You can customize the deployment by modifying the variables in your `terraform.tfvars` file:

- Change the region
- Adjust the schedule for sending prompts
- Modify container resource limits
- Change the autoscaling settings

## Troubleshooting

### Common Issues

1. **Image not found**: Make sure you've run the `build_and_push.sh` script
2. **Secret access denied**: Check the IAM permissions for your service account
3. **Webhook not working**: Use the `setup_webhook.sh` script and check for errors

### Viewing Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=thyknow-express" --limit=20
```

### Testing the Pub/Sub Integration

Manually publish a message to the Pub/Sub topic:

```bash
gcloud pubsub topics publish weekly-prompts --message='{"action":"sendPrompts"}'
```

Then check the logs to see if the message was processed correctly.