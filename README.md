# ThyKnow Telegram Bot - Railway Deployment Guide

This guide provides comprehensive instructions for deploying the ThyKnow Telegram bot to Railway, a modern platform optimized for full-stack applications with excellent support for long-running processes like Telegram bots.

## Architecture Overview

The deployed architecture consists of the following components:

1. **Railway Service**: Hosts the ThyKnow Express application
2. **Railway PostgreSQL**: Managed PostgreSQL database
3. **Telegram Bot API**: External service for bot functionality

## Prerequisites

Before starting the deployment, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install with `npm i -g @railway/cli`
3. **Telegram Bot**: Created via BotFather with its API token
4. **Node.js**: Version 18.x or higher installed locally

## Step 1: Project Preparation

### 1.1 Clone the Repository

```bash
git clone https://github.com/your-username/thyknow.git
cd thyknow
```

### 1.2 Log in to Railway CLI

```bash
railway login
```

## Step 2: Project Setup on Railway

### 2.1 Initialize a New Railway Project

```bash
railway init
```

Follow the prompts to create a new project or select an existing one.

### 2.2 Add PostgreSQL to Your Project

```bash
railway add postgresql
```

This will provision a PostgreSQL database for your project.

### 2.3 Set Environment Variables

```bash
railway vars set TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
railway vars set NODE_ENV=production
railway vars set TIMEZONE=Asia/Singapore
railway vars set PROMPT_DAY=1
railway vars set PROMPT_HOUR=9
railway vars set MAX_HISTORY=5
```

Railway automatically provides the `DATABASE_URL` environment variable.

## Step 3: Deployment

### 3.1 Deploy to Railway

```bash
railway up
```

This command builds and deploys your application to Railway.

### 3.2 Set Up the Webhook

After deployment, set up the Telegram webhook using the provided script:

```bash
npm run railway:webhook
```

This script uses your Railway domain to configure the Telegram webhook.

## Step 4: Monitoring and Management

### 4.1 View Logs

```bash
railway logs
```

### 4.2 Open the Railway Dashboard

```bash
railway open
```

This opens the Railway dashboard for your project, where you can monitor your application and database.

## Database Information

Railway provides a managed PostgreSQL database with the following benefits:

- Automatic backups
- SSL connection
- Web-based database administration
- Scaling options as your user base grows

## Common Issues and Troubleshooting

### 1. Webhook Setup Failure

**Solution**:
1. Check that your application is running successfully on Railway
2. Verify that the `RAILWAY_PRIVATE_DOMAIN` environment variable is set correctly
3. Try setting the webhook manually using the Telegram API

### 2. Database Connection Issues

**Solution**:
1. Check Railway dashboard for database status
2. Verify that the application is using the `DATABASE_URL` environment variable

## Performance Optimization

To optimize your application for Railway, consider:

1. Setting up autoscaling for handling traffic spikes
2. Enabling the "Always On" feature for mission-critical applications
3. Using Railway's built-in metrics to monitor performance

## Additional Railway Features You Can Use

1. **Cron Jobs**: For scheduling tasks without implementing your own scheduler
2. **Custom Domains**: For a professional URL for your webhook
3. **Metrics and Alerts**: For monitoring application health
4. **Deploy from GitHub**: For automatic deployments on code changes

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Telegraf.js Documentation](https://telegraf.js.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Happy deploying! Your ThyKnow Telegram bot should now be running smoothly on Railway. If you encounter any issues, please refer to the Railway documentation or open an issue in this repository.