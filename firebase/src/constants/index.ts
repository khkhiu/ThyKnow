import { PromptsCollection } from '../types';

// Default timezone
export const TIMEZONE = 'Asia/Singapore';

// Prompt collection
export const PROMPTS: PromptsCollection = {
  self_awareness: [
    "What emotions have you experienced most frequently this week? What triggered them?",
    "Describe a situation where you felt truly authentic. What made it special?",
    "What personal values were challenged or reinforced this week?",
    "What patterns have you noticed in your reactions to stress lately?",
    "What's one thing you'd like to change about how you handle difficult conversations?",
    "How have your priorities shifted in the past few months?",
    "What recent experience has taught you something new about yourself?"
  ],
  connections: [
    "Which relationship in your life has grown the most recently? How?",
    "What conversation this week made you feel most understood?",
    "How have you shown appreciation to others this week?",
    "What boundaries have you set or need to set in your relationships?",
    "Who would you like to reconnect with, and what's holding you back?",
    "How has someone surprised you positively this week?",
    "What qualities do you admire most in your closest friends?"
  ]
};

// Command descriptions for Telegram bot
export const COMMAND_DESCRIPTIONS = {
  START: "Initialize the bot and get started",
  PROMPT: "Get a new reflection prompt",
  HISTORY: "View your recent journal entries",
  HELP: "Show available commands and usage",
  TIMEZONE: "Check prompt timings"
};

// User-facing messages
export const MESSAGES = {
  WELCOME: 
    "Welcome to your personal journaling companion! 🌟\n\n" +
    "I'll send you weekly prompts to help you reflect on:\n" +
    "• Self-awareness 🤔\n" +
    "• Building meaningful connections 🤝\n\n" +
    "Commands:\n" +
    "/prompt - Get a new reflection prompt\n" +
    "/history - View your recent journal entries\n" +
    "/timezone - Check prompt timings\n" +
    "/help - shows all available commands\n\n" +
    "Let's start your journaling journey! Use /prompt to get your first question.",
  
  HELP:
    "🤖 Available Commands:\n\n" +
    "• /start - Initialize the bot and get started\n" +
    "• /prompt - Get a new reflection prompt\n" +
    "• /history - View your recent journal entries\n" +
    "• /help - Show this help message\n\n" +
    "📝 How to use:\n" +
    "1. Use /start to begin\n" +
    "2. Get prompts with /prompt\n" +
    "3. View your entries with /history\n\n" +
    "✨ The bot will also send you weekly prompts " +
    "every Monday at 9 AM in Singapore timezone.",
  
  TIMEZONE:
    "This bot operates on Singapore timezone (Asia/Singapore) for all users.\n" +
    "Weekly prompts will be sent according to Singapore time.",
  
  NO_HISTORY:
    "You haven't made any journal entries yet. Use /prompt to start!",
  
  NO_PROMPT:
    "Sorry, I couldn't find your prompt. Please use /prompt to get a new one.",
  
  ERROR:
    "Sorry, something went wrong. Please try again.",
  
  SAVE_ERROR:
    "Sorry, there was an error saving your response. " +
    "Please try using /prompt to start again."
};

// Feedback messages based on prompt type
export const FEEDBACK = {
  SELF_AWARENESS:
    "✨ Thank you for your thoughtful reflection! Your response has been saved.\n\n" +
    "Self-awareness is a journey that takes time and patience.\n" +
    "Use /prompt when you're ready for another question.",
  
  CONNECTIONS:
    "✨ Thank you for sharing! Your response has been saved.\n\n" +
    "Building meaningful connections with others often starts with understanding ourselves.\n" +
    "Use /prompt when you're ready for another question."
};

// Weekly prompt schedule
export const WEEKLY_PROMPT = {
  DAY: 1, // Monday
  HOUR: 9 // 9 AM
};