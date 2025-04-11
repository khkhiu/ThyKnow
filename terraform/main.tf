# Terraform configuration for ThyKnow Telegram Bot on GCP

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.34.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.34.0"
    }
  }

  # You can uncomment this to use Terraform Cloud or GCS for state storage
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "thyknow"
  # }
}

# Configure the Google Cloud provider
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "cloudrun.googleapis.com",
    "cloudbuild.googleapis.com", 
    "secretmanager.googleapis.com", 
    "cloudscheduler.googleapis.com", 
    "pubsub.googleapis.com",
    "artifactregistry.googleapis.com"
  ])
  
  service = each.key
  
  disable_on_destroy = false
}

# Create a Docker repository in Artifact Registry
resource "google_artifact_registry_repository" "thyknow_repo" {
  depends_on = [google_project_service.services]
  
  location      = var.region
  repository_id = "thyknow"
  format        = "DOCKER"
  description   = "Docker repository for ThyKnow Telegram bot"
}

# Create a service account for Cloud Run
resource "google_service_account" "thyknow_service_account" {
  account_id   = "thyknow-service-account"
  display_name = "ThyKnow Service Account"
  description  = "Service account for ThyKnow Telegram bot on Cloud Run"
}

# Create secret for Telegram Bot Token
resource "google_secret_manager_secret" "telegram_bot_token" {
  depends_on = [google_project_service.services]
  
  secret_id = "telegram-bot-token"
  
  replication {
    user_managed {
        replicas {
            location = var.region
        }
    }
  }
}

# Create secret version for Telegram Bot Token
resource "google_secret_manager_secret_version" "telegram_bot_token_version" {
  secret      = google_secret_manager_secret.telegram_bot_token.id
  secret_data = var.telegram_bot_token
}

# Create secret for MongoDB URI
resource "google_secret_manager_secret" "mongodb_uri" {
  depends_on = [google_project_service.services]
  
  secret_id = "mongodb-uri"
  
  replication {
    user_managed {
        replicas {
            location = var.region
        }
    }
  }
}

# Create secret version for MongoDB URI
resource "google_secret_manager_secret_version" "mongodb_uri_version" {
  secret      = google_secret_manager_secret.mongodb_uri.id
  secret_data = var.mongodb_uri
}

# Grant access to secrets for service account
resource "google_secret_manager_secret_iam_member" "telegram_token_access" {
  secret_id = google_secret_manager_secret.telegram_bot_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.thyknow_service_account.email}"
}

resource "google_secret_manager_secret_iam_member" "mongodb_uri_access" {
  secret_id = google_secret_manager_secret.mongodb_uri.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.thyknow_service_account.email}"
}

# Create a Pub/Sub topic for scheduled prompts
resource "google_pubsub_topic" "weekly_prompts" {
  depends_on = [google_project_service.services]
  
  name = var.topic_name
}

# Create a Pub/Sub subscription for the Cloud Run service
resource "google_pubsub_subscription" "thyknow_subscription" {
  name  = "thyknow-subscription"
  topic = google_pubsub_topic.weekly_prompts.name
  
  push_config {
    push_endpoint = "${google_cloud_run_service.thyknow_service.status[0].url}/pubsub/messages"
    
    attributes = {
      x-goog-version = "v1"
    }
    
    oidc_token {
      service_account_email = google_service_account.thyknow_service_account.email
    }
  }
  
  # Configure exponential backoff
  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
  
  # Set message retention duration
  message_retention_duration = "604800s" # 7 days
  
  # Enable duplicate detection
  enable_message_ordering = false
  
  # Set expiration policy
  expiration_policy {
    ttl = "2592000s" # 30 days
  }
  
  depends_on = [google_cloud_run_service.thyknow_service]
}

# Create a Cloud Scheduler job for weekly prompts
resource "google_cloud_scheduler_job" "weekly_prompt_scheduler" {
  depends_on = [google_project_service.services]
  
  name        = var.schedule_name
  description = "Weekly journal prompts for ThyKnow users"
  schedule    = var.schedule_time
  time_zone   = var.timezone
  
  pubsub_target {
    topic_name = google_pubsub_topic.weekly_prompts.id
    data       = base64encode("{\"action\":\"sendPrompts\"}")
  }
}

# Create a Cloud Run service for the ThyKnow bot
resource "google_cloud_run_service" "thyknow_service" {
  depends_on = [
    google_project_service.services,
    google_secret_manager_secret_version.telegram_bot_token_version,
    google_secret_manager_secret_version.mongodb_uri_version
  ]
  
  name     = "thyknow-express"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.thyknow_service_account.email
      
      containers {
        # You'll need to build and push the image first:
        # docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/thyknow/thyknow-express:latest .
        # docker push ${var.region}-docker.pkg.dev/${var.project_id}/thyknow/thyknow-express:latest
        image = "${var.region}-docker.pkg.dev/${var.project_id}/thyknow/thyknow-express:latest"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        env {
          name  = "TIMEZONE"
          value = var.timezone
        }
        
        env {
          name  = "PROMPT_DAY"
          value = var.prompt_day
        }
        
        env {
          name  = "PROMPT_HOUR"
          value = var.prompt_hour
        }
        
        env {
          name  = "MAX_HISTORY"
          value = var.max_history
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        # Mount Telegram Bot Token from Secret Manager
        env {
          name = "TELEGRAM_BOT_TOKEN"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.telegram_bot_token.secret_id
              key  = "latest"
            }
          }
        }
        
        # Mount MongoDB URI from Secret Manager
        env {
          name = "MONGODB_URI"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.mongodb_uri.secret_id
              key  = "latest"
            }
          }
        }
        
        # Container port
        ports {
          container_port = 8080
        }
      }
      
      # Timeout settings
      timeout_seconds = 300
      
      # Container concurrency
      container_concurrency = 80
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Set IAM policy for Cloud Run service to be publicly accessible
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.thyknow_service.location
  project     = var.project_id
  service     = google_cloud_run_service.thyknow_service.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

# Grant Pub/Sub permission to invoke the Cloud Run service
resource "google_cloud_run_service_iam_member" "pubsub_invoker" {
  location = google_cloud_run_service.thyknow_service.location
  project  = var.project_id
  service  = google_cloud_run_service.thyknow_service.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.thyknow_service_account.email}"
}

# Create an output variable with the service URL
output "service_url" {
  value       = google_cloud_run_service.thyknow_service.status[0].url
  description = "The URL of the deployed service"
}