# GCP Project settings
project_id = "your-gcp-project-id"
region     = "us-central1"

# Secrets (Don't commit the actual terraform.tfvars file to source control!)
telegram_bot_token = "your_telegram_bot_token_here"
mongodb_uri        = "mongodb+srv://username:password@cluster.mongodb.net/thyknow?retryWrites=true&w=majority"

# Timezone and scheduling
timezone      = "Asia/Singapore"
prompt_day    = 1  # Monday
prompt_hour   = 9  # 9 AM
schedule_time = "0 9 * * 1"  # Monday at 9 AM
topic_name    = "weekly-prompts"
schedule_name = "weekly-journal-prompts"

# App settings
max_history   = 5