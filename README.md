# ThyKnow Telegram Bot

This repository contains a Telegram bot for personal journaling, helping users enhance self-awareness and build connections through weekly reflection prompts.

## Project Structure

This project contains two implementations of the same bot:

1. **Python Version** - Located in the `telegram_bot` directory
2. **TypeScript/Firebase Version** - Located in the `firebase` directory

## Running with Docker

You can run both implementations using Docker Compose:

### 1. Set up environment variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env

# Edit with your Telegram Bot Token
# Note: BOT_TOKEN is for Python version, TELEGRAM_BOT_TOKEN is for Firebase version
```

### 2. Run with Docker Compose

```bash
# Start both services
docker-compose up -d

# Start only the Python version
docker-compose up -d telegram-bot

# Start only the Firebase version
docker-compose up -d firebase
```

### 3. Check the logs

```bash
# View logs from both services
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f telegram-bot
docker-compose logs -f firebase
```

### 4. Stop the services

```bash
docker-compose down
```

## Running Individually Without Docker

### Python Version

1. Create a virtual environment:

```bash
cd telegram_bot
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment:

```bash
# Create .env file
cp .env.example .env
# Edit .env with your Telegram bot token
```

4. Run the bot:

```bash
python main.py
```

### Firebase Version

1. Install dependencies:

```bash
cd firebase/functions
npm install
```

2. Configure Firebase:

```bash
# Login to Firebase
firebase login

# Set up Firebase configuration
firebase functions:config:set telegram.token="your_telegram_bot_token"

# Get local config
firebase functions:config:get > .runtimeconfig.json
```

3. Run the Firebase emulator:

```bash
npm run serve
```

## Cloud Deployment

### Python Version - Cloud Run

To deploy the Python version to Cloud Run:

```bash
cd telegram_bot
export PROJECT_ID=your-google-cloud-project-id
export BOT_TOKEN=your-telegram-bot-token
chmod +x cloud-run-deploy.sh
./cloud-run-deploy.sh
```

### Firebase Version

To deploy the Firebase version to Cloud Run:

```bash
cd firebase/functions
export PROJECT_ID=your-google-cloud-project-id
export TELEGRAM_BOT_TOKEN=your-telegram-bot-token
chmod +x cloud-run-deploy.sh
./cloud-run-deploy.sh
```

Or to deploy as Firebase Functions:

```bash
cd firebase/functions
npm run build
firebase deploy --only functions

# Set up webhook
npm run setup-webhook
```

## Troubleshooting

### Cloud Run Deployment Issues

If you encounter "Container Healthcheck failed" errors on Cloud Run:

1. Make sure the container listens on the port specified by the `PORT` environment variable
2. Both Dockerfiles are configured to handle health checks automatically
3. Try increasing the health check timeout in the Cloud Run configuration

### Firebase Functions Issues

For Firebase functions deployment issues:

1. Check that you've correctly set up the Telegram bot token in Firebase config
2. Ensure your Firebase project has billing enabled for outbound networking
3. Review the functions logs for specific error messages