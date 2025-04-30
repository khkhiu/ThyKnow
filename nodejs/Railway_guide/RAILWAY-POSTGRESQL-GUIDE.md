# ThyKnow PostgreSQL on Railway Guide

This guide covers the setup and management of PostgreSQL for ThyKnow on Railway.

## Database Setup

Railway automatically provisions PostgreSQL when you add it to your project. Here's how to set it up:

```bash
# Add PostgreSQL to your project
railway add postgresql
```

## Database Schema

ThyKnow uses the following schema, which is automatically created on first run:

1. **users** - Stores user information and preferences
2. **last_prompts** - Tracks the last prompt sent to each user
3. **journal_entries** - Stores user responses to prompts

## Accessing the Database

### Using Railway Dashboard

1. Open your project in Railway
2. Select the PostgreSQL service
3. Click on "Connect" and choose "Connect using PostgreSQL GUI"

### Using Command Line

```bash
# Connect to the database CLI
railway connect postgresql

# Run SQL queries
psql $DATABASE_URL
```

## Backup and Restore

### Creating Backups

```bash
# Create a backup using Railway CLI
railway service backup create --service postgresql
```

### Restoring from Backup

```bash
# Restore from backup using Railway CLI
railway service backup restore --service postgresql --backup-id [backup-id]
```

## Monitoring and Management

### Checking Database Status

```bash
# View database status
railway status
```

### Viewing Logs

```bash
# View database logs
railway logs --service postgresql
```

## Common Tasks

### Manual Query Execution

If you need to run manual queries:

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check most recent journal entries
SELECT * FROM journal_entries ORDER BY timestamp DESC LIMIT 10;

-- Count entries by prompt type
SELECT prompt_type, COUNT(*) FROM journal_entries GROUP BY prompt_type;
```

### Database Performance

To optimize database performance:

1. Ensure indices are created (automatically handled by initDatabase function)
2. Monitor query performance using Railway's metrics
3. Consider scaling resources if performance issues arise

## Emergency Recovery

If you need to quickly reset the database:

1. Create a backup first
2. Open Railway dashboard
3. Navigate to your PostgreSQL plugin
4. Use the "Reset" option with caution

## Security Considerations

Railway automatically:
- Enables SSL connections
- Provides secure credential management
- Restricts network access to your app

No additional configuration is needed for basic security.