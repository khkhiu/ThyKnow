# ThyKnow - Express.js Implementation

ThyKnow is a Telegram bot designed to foster self-awareness and build meaningful connections through guided journaling prompts. This implementation uses Express.js, TypeScript, and MongoDB to provide a robust and scalable solution.

## 📋 Features

- 🤔 **Self-awareness prompts**: Questions to help users reflect on their emotions, values, and personal growth.
- 🤝 **Connection-building prompts**: Questions focusing on relationships and meaningful interactions.
- 📅 **Weekly schedule**: Sends prompts every Monday at 9 AM (Singapore timezone).
- 📝 **Personal journal**: Saves all responses for users to review later.
- 📊 **Analytics ready**: Architecture designed to support advanced analytics features.
- 💰 **Payment integration ready**: Structure supports adding donation features.
- 🧠 **AI integration ready**: Prepared for Vertex AI integration.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- A [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot) from BotFather

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/thyknow-express.git
cd thyknow-express
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following content:

```
# Server configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Telegram Bot configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/thyknow

# Scheduler settings
PROMPT_DAY=1  # Monday
PROMPT_HOUR=9  # 9 AM
TIMEZONE=Asia/Singapore

# Maximum history entries to show
MAX_HISTORY=5
```

4. **Start MongoDB**

If using a local MongoDB instance:

```bash
# Start MongoDB
mongod
```

5. **Build and run the application**

```bash
# Build TypeScript
npm run build

# Start the server
npm start
```

For development with hot reload:

```bash
npm run dev
```

## 🔧 Bot Commands

| Command    | Description                             |
|------------|-----------------------------------------|
| /start     | Initialize the bot and get started      |
| /prompt    | Get a new reflection prompt             |
| /history   | View your recent journal entries        |
| /timezone  | Check prompt timings                    |
| /help      | Show available commands and usage       |

## 🚢 Deployment

### Docker Deployment

You can use Docker Compose for an easy deployment:

```bash
# Start the application with MongoDB
docker-compose up -d
```

### Google Cloud Run Deployment

```bash
# Set required environment variables
export PROJECT_ID=your-gcp-project-id
export TELEGRAM_BOT_TOKEN=your-telegram-bot-token
export MONGODB_URI=your-mongodb-connection-string

# Run the deployment script
bash cloud-run-deploy.sh
```

## 📋 Migration from Firebase Functions

This Express.js implementation is a migration from the previous Firebase Functions implementation. Key differences:

1. **Database**: MongoDB instead of Firestore
2. **Scheduling**: node-cron instead of Firebase scheduled functions
3. **Server**: Full Express.js server instead of serverless functions

### Data Migration

To migrate data from Firestore to MongoDB:

1. Export your Firestore data
2. Use the provided migration script:

```bash
# Export Firestore data
firebase firestore:export firestore-export.json

# Run migration script (creates a mongoimport-ready file)
npm run migrate-data

# Import to MongoDB
mongoimport --db thyknow --collection users --file mongo-users.json
mongoimport --db thyknow --collection journalentries --file mongo-entries.json
```

## 🏗️ Project Structure

```
thyknow-express/
├── src/
│   ├── config/           # Configuration files
│   ├── constants/        # App constants
│   ├── controllers/      # Express route controllers
│   ├── handlers/         # Bot command handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- [Telegraf](https://github.com/telegraf/telegraf) for the elegant Telegram Bot API
- [Express.js](https://expressjs.com/) for the web framework
- [MongoDB](https://www.mongodb.com/) for the database
- [node-cron](https://github.com/node-cron/node-cron) for scheduling