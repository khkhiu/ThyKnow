variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for deploying resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, prod, etc.)"
  type        = string
  default     = "dev"
}

variable "telegram_bot_token" {
  description = "The Telegram Bot Token from BotFather"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the PostgreSQL database user"
  type        = string
  sensitive   = true
}

variable "db_tier" {
  description = "The machine type for the Cloud SQL instance"
  type        = string
  default     = "db-f1-micro"  # Smallest tier for development, increase for production
}

variable "timezone" {
  description = "The timezone for scheduler jobs"
  type        = string
  default     = "Asia/Singapore"
}

variable "topic_name" {
  description = "The name of the Pub/Sub topic for weekly prompts"
  type        = string
  default     = "weekly-prompts"
}

variable "schedule_name" {
  description = "The name of the Cloud Scheduler job"
  type        = string
  default     = "weekly-journal-prompts"
}

variable "schedule_time" {
  description = "The cron schedule expression for when to trigger prompts"
  type        = string
  default     = "0 9 * * 1"  # Monday at 9 AM
}

variable "prompt_day" {
  description = "The day of the week for sending prompts (0-6, Sunday-Saturday)"
  type        = number
  default     = 1  # Monday
}

variable "prompt_hour" {
  description = "The hour of the day for sending prompts (0-23)"
  type        = number
  default     = 9  # 9 AM
}

variable "max_history" {
  description = "Maximum number of journal entries to show in history"
  type        = number
  default     = 5
}