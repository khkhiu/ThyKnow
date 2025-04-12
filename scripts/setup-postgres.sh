# File: scripts/setup-postgres.sh
# Script to set up PostgreSQL locally

#!/bin/bash
# Setup PostgreSQL for ThyKnow development environment

set -e

# Configuration
DB_NAME="thyknow"
DB_USER="postgres"
DB_PASSWORD=${DB_PASSWORD:-"postgres"}  # Use environment variable or default

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
if ! psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Creating database: $DB_NAME"
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
else
    echo "Database $DB_NAME already exists."
fi

# Initialize schema
echo "Initializing database schema..."
psql -U $DB_USER -d $DB_NAME << EOF
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,         -- Telegram user ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  prompt_count INTEGER NOT NULL DEFAULT 0,
  schedule_day INTEGER NOT NULL DEFAULT 1,      -- Default: Monday
  schedule_hour INTEGER NOT NULL DEFAULT 9,     -- Default: 9 AM
  schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create Last Prompt table with one-to-one relationship to User
CREATE TABLE IF NOT EXISTS last_prompts (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('self_awareness', 'connections')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Journal Entry table
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  prompt_type VARCHAR(20) NOT NULL CHECK (prompt_type IN ('self_awareness', 'connections')),
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indices for efficient querying
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_timestamp ON journal_entries(user_id, timestamp DESC);
EOF

echo "PostgreSQL setup completed successfully!"
echo "You can now run the ThyKnow application with PostgreSQL support."