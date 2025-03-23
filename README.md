# ThyKnow - Personal Journaling Bot

ThyKnow is a Telegram bot designed to foster self-awareness and build meaningful connections through guided journaling prompts. The bot sends users thoughtful reflection questions on a regular schedule and saves their responses, creating a personal journal over time.


## 📋 Features

- 🤔 **Self-awareness prompts**: Questions to help users reflect on their emotions, values, and personal growth.
- 🤝 **Connection-building prompts**: Questions focusing on relationships and meaningful interactions.
- 📅 **Weekly schedule**: Designed to send prompts every Monday at 9 AM (Singapore timezone). *Note: Automatic scheduling is still in development.*
- 📝 **Personal journal**: Saves all responses for users to review later.
- 🌐 **Cloud-based**: Built on Firebase for reliable and scalable performance.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- A [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot) from BotFather

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/thyknow.git
cd thyknow
```

2. **Set up Firebase**

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase use your-project-id
```

3. **Install dependencies**

```bash
# Install dependencies for Firebase Functions
cd firebase/functions
npm install
```

4. **Configure environment variables**

```bash
# Set your Telegram bot token in Firebase config
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"

# Get the config for local development
firebase functions:config:get > .runtimeconfig.json
```

5. **Build the project**

```bash
npm run build
```

## 🧪 Testing Locally

```bash
# Start the Firebase emulator
npm run dev

# In a separate terminal, use ngrok to create a public URL
ngrok http 5001

# Set up webhook with your ngrok URL
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://<NGROK_URL>/your-project-id/us-central1/botWebhook"

# Test the webhook
npm run test-webhook
```

## 📦 Deployment

```bash
# Deploy to Firebase
npm run deploy

# Set up the webhook
npm run setup-webhook
```

## 🔧 Bot Commands

| Command    | Description                             |
|------------|-----------------------------------------|
| /start     | Initialize the bot and get started      |
| /prompt    | Get a new reflection prompt             |
| /history   | View your recent journal entries        |
| /timezone  | Check prompt timings(WIP)               |
| /help      | Show available commands and usage       |

## 🏗️ Project Structure

```
firebase/
├── functions/               # Firebase Cloud Functions
│   ├── src/                 # Source code
│   │   ├── constants/       # App constants
│   │   ├── handlers/        # Telegram bot handlers
│   │   ├── services/        # Business logic services
│   │   ├── types/           # TypeScript type definitions
│   │   └── index.ts         # Main entry point
│   ├── scripts/             # Utility scripts
│   ├── package.json         # Dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration
├── firestore.rules          # Firestore security rules
└── firebase.json            # Firebase configuration
```

## 📝 Data Model

### User
```typescript
interface User {
  id: string;                // Telegram user ID
  createdAt: Timestamp;      // Account creation time
  promptCount: number;       // Number of prompts received
  lastPrompt?: LastPrompt;   // The last prompt sent to the user
}
```

### Journal Entry
```typescript
interface JournalEntry {
  prompt: string;            // The question asked
  promptType: PromptType;    // 'self_awareness' or 'connections'
  response: string;          // User's response
  timestamp: Timestamp;      // When the response was saved
}
```

## 🛠️ Useful Commands

```bash
# Delete webhook (if you need to switch to polling mode)
npm run delete-webhook

# Check webhook status
npm run test-webhook

# View Firebase logs
npm run logs

# Lint and format code
npm run lint:fix
```

## 🧠 Prompt Categories

ThyKnow alternates between two categories of prompts:

### Self-Awareness
Questions that encourage reflection on personal emotions, values, and growth.

### Connections
Questions focused on relationships and meaningful social interactions.

## 🔄 Weekly Schedule

The bot is designed to automatically send prompts every Monday at 9 AM Singapore time (UTC+8).

> **Note:** The automatic weekly sending of prompts is currently under development and not yet fully implemented. Currently, users need to manually request prompts using the `/prompt` command.

## ⚙️ Configuration Options

You can customize the bot's behavior through Firebase Functions config:

```bash
# Set the day for weekly prompts (0 = Sunday, 1 = Monday, etc.)
firebase functions:config:set scheduler.day=1

# Set the hour for weekly prompts (24-hour format)
firebase functions:config:set scheduler.hour=9
```

## 📚 Inspiration

ThyKnow was created to help combat feelings of isolation and disconnection that contribute to depression and anxiety. By encouraging regular self-reflection and consideration of relationships, the bot aims to foster greater self-awareness and deeper connections.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Telegraf](https://github.com/telegraf/telegraf) for the elegant Telegram Bot API
- [Firebase](https://firebase.google.com/) for hosting and database services