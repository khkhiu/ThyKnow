# ThyKnow - Express.js Implementation with PostgreSQL

ThyKnow is a Telegram bot designed to foster self-awareness and build meaningful connections through guided journaling prompts. This implementation uses Express.js, TypeScript, and PostgreSQL to provide a robust and scalable solution.

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
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
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

# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thyknow
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DB_POOL_SIZE=10
DB_IDLE_TIMEOUT=30000

# Scheduler settings
PROMPT_DAY=1  # Monday
PROMPT_HOUR=9  # 9 AM
TIMEZONE=Asia/Singapore

# Maximum history entries to show
MAX_HISTORY=5
```

4. **Set up PostgreSQL database**

Create a PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE thyknow;"
```

5. **Initialize the database schema**

```bash
npm run init-db
```

Or if you prefer to use the migration system:

```bash
npm run migrate
```

6. **Build and run the application**

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
# Start the application with PostgreSQL
docker-compose up -d
```

### Google Cloud Run & Cloud SQL Deployment

```bash
# Set required environment variables
export PROJECT_ID=your-gcp-project-id
export TELEGRAM_BOT_TOKEN=your-telegram-bot-token
export DB_PASSWORD=your-secure-password

# Run the deployment script
bash cloud-run-deploy.sh
```

## 📋 Database Information

This implementation uses PostgreSQL to store:

1. **Users**: Basic user information and scheduling preferences
2. **Last Prompts**: The most recent prompt sent to each user
3. **Journal Entries**: All user responses to prompts

### Database Schema

Here's a simplified version of the database schema:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,         -- Telegram user ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  prompt_count INTEGER NOT NULL DEFAULT 0,
  schedule_day INTEGER NOT NULL DEFAULT 1,      -- Default: Monday
  schedule_hour INTEGER NOT NULL DEFAULT 9,     -- Default: 9 AM
  schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- Last Prompt table
CREATE TABLE last_prompts (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('self_awareness', 'connections')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Journal Entry table
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  prompt_type VARCHAR(20) NOT NULL CHECK (prompt_type IN ('self_awareness', 'connections')),
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## 🏗️ Project Structure

```
thyknow-express/
├── src/
│   ├── config/           # Configuration files
│   ├── constants/        # App constants
│   ├── controllers/      # Express route controllers
│   ├── database/         # Database connection and utilities
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
│   ├── init-database.ts  # Database initialization
│   ├── migrate-db.ts     # Database migration tool
│   └── migrations/       # SQL migration files
├── terraform/            # Terraform IaC for GCP
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
- [PostgreSQL](https://www.postgresql.org/) for the database
- [node-pg](https://node-postgres.com/) for PostgreSQL client
- [node-cron](https://github.com/node-cron/node-cron) for scheduling