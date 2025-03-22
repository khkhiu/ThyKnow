#!/bin/bash
set -e

# Create .env file from environment variables if not already present
if [ ! -f .env ]; then
    echo "Creating .env file from environment variables..."
    echo "BOT_TOKEN=${BOT_TOKEN}" > .env
    echo "USERS_FILE=${USERS_FILE:-data/users.json}" >> .env
    echo "CHECK_INTERVAL=${CHECK_INTERVAL:-3600}" >> .env
    echo "PROMPT_HOUR=${PROMPT_HOUR:-9}" >> .env
    echo "PROMPT_DAY=${PROMPT_DAY:-0}" >> .env
    echo "MAX_HISTORY=${MAX_HISTORY:-5}" >> .env
fi

# If running in Cloud Run, start an HTTP server to handle health checks
if [ "$CLOUD_RUN" = "true" ]; then
    # Start a simple HTTP server on PORT environment variable
    # This runs in background
    python -m http.server $PORT &
fi

# Execute the main application
exec python main.py