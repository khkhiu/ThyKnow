# GCP Project settings
project_id  = "your-gcp-project-id"
region      = "us-central1"
environment = "dev"

# Secrets (Don't commit the actual terraform.tfvars file to source control!)
telegram_bot_token = "your_telegram_bot_token_here"
db_password        = "your_secure_database_password"

# Database settings
db_tier = "db-f1-micro"  # Use db-g1-small or larger for production

# Timezone and scheduling
timezone      = "Asia/Singapore"
prompt_day    = 1  # Monday
prompt_hour   = 9  # 9 AM
schedule_time = "0 9 * * 1"  # Monday at 9 AM
topic_name    = "weekly-prompts"
schedule_name = "weekly-journal-prompts"

# App settings
max_history   = 5