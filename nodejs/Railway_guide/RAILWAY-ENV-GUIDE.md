# ThyKnow Railway Environment Variables Guide

This document outlines all environment variables needed for ThyKnow deployment on Railway.

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Token provided by BotFather | `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ` |
| `NODE_ENV` | Application environment | `production` |
| `TIMEZONE` | Timezone for scheduling | `Asia/Singapore` |

## Database Configuration

Railway automatically provides `DATABASE_URL` with connection details. The application automatically parses this URL, so no manual configuration is needed.

## Optional Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Application port | `3000` | `8080` |
| `PROMPT_DAY` | Day of week to send prompts (0=Sunday) | `1` | `1` (Monday) |
| `PROMPT_HOUR` | Hour of day to send prompts (24h) | `9` | `9` (9 AM) |
| `MAX_HISTORY` | Maximum history items to display | `5` | `10` |
| `LOG_LEVEL` | Winston logger level | `info` | `debug` |

## Setting Environment Variables in Railway

### Using Railway CLI

```bash
railway vars set VARIABLE_NAME=value
```

### Using Railway Dashboard

1. Open your project in the Railway dashboard
2. Navigate to the "Variables" tab
3. Add each variable with its corresponding value

## Checking Current Environment Variables

```bash
railway vars
```

## Best Practices

1. **Never commit environment files**: Ensure `.env` files are in your `.gitignore`
2. **Use Railway's variable encryption**: For sensitive values like API tokens
3. **Set up separate environments**: Use Railway's environments feature for dev/staging/prod

## Troubleshooting

If your application fails to start or behaves unexpectedly, check these common environment variable issues:

1. **Missing critical variables**: Ensure `TELEGRAM_BOT_TOKEN` is set
2. **Timezone issues**: Verify `TIMEZONE` is a valid IANA timezone string
3. **Database connection**: Check that your application can access the database using the provided `DATABASE_URL`

You can view Railway logs to diagnose issues:

```bash
railway logs
```