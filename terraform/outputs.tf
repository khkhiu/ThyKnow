output "service_url" {
  value       = google_cloud_run_service.thyknow_service.status[0].url
  description = "The URL of the deployed ThyKnow service"
}

output "docker_repository" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/thyknow"
  description = "The Docker repository URL where container images should be pushed"
}

output "pubsub_topic" {
  value       = google_pubsub_topic.weekly_prompts.name
  description = "The Pub/Sub topic name for weekly prompts"
}

output "webhook_url" {
  value       = "${google_cloud_run_service.thyknow_service.status[0].url}/webhook"
  description = "The webhook URL to register with Telegram"
}

output "service_account" {
  value       = google_service_account.thyknow_service_account.email
  description = "The service account email used by Cloud Run"
}