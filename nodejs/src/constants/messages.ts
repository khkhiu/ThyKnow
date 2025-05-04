// src/constants/messages.ts

// User-facing messages
export const MESSAGES = {
  WELCOME: 
    "🦕 Welcome to ThyKnow! 🦖\n\n" +
    "Just like dinos ruled the Earth, you're about to rule self-discovery & building relationships! 🌍💡\n\n" +
    "ThyKnow sends you weekly prompts to help you reflect on:\n" +
    "• Self-awareness 🤔 (Because knowing yourself is a Jurassic-level skill!)\n" +
    "• Meaningful connections 🤝 (Because even T-Rex needed a buddy!)\n\n" +
    "Commands:\n" +
    "/prompt - Get a new reflection prompt\n" +
    "/choose - Select a specific type of prompt\n" +
    "/history - View your recent journal entries\n" +
    "/schedule - Manage your prompt schedule\n" +
    "/timezone - Check prompt timings\n" +
    "/miniapp - Open our interactive mini app\n" +
    "/help - Shows all available commands\n\n" +
    "So buckle up, friend! It's time to RAWR into personal development! 🚀🦕",
  
    HELP:
    "🦕 Available Commands 🦖\n\n" +
    "• /start - Initialize the bot and get started\n" +
    "• /prompt - Get a new reflection prompt\n" +
    "• /choose - Select a specific type of prompt\n" +
    "• /history - View your recent journal entries\n" +
    "• /webapp - Open our interactive mini app\n" +
    "• /timezone - Check prompt timings\n" +
    "• /help - Show this help message\n\n" +
    "📅 Schedule Management:\n" +
    "• /schedule - View your current prompt schedule\n" +
    "• /schedule_day - Set the day to receive prompts\n" +
    "• /schedule_time - Set the time to receive prompts\n" +
    "• /schedule_toggle - Turn weekly prompts on/off\n\n" +
    "📝 How to use:\n" +
    "1. Use /start to begin your prehistoric journey\n" +
    "2. Get prompts with /prompt or choose a specific type with /choose\n" +
    "3. View your entries with /history\n" +
    "4. Try our mini app experience with /webapp\n" +
    "5. Set your preferred schedule with /schedule\n\n" +
    "✨ You will receive weekly prompts according to your schedule preferences.",
    
  NO_HISTORY:
    "You haven't made any journal entries yet. Use /prompt to start your dino-discovery journey!",
  
  NO_PROMPT:
    "Sorry, I couldn't find your prompt. Please use /prompt to get a new one or /choose to select a specific type.",
  
  ERROR:
    "RAWR! Something went wrong. Please try again.",
  
  SAVE_ERROR:
    "Sorry, there was an error saving your response. " +
    "Please try using /prompt to start again or /choose to select a specific type.",

  SCHEDULE: {
    CURRENT: 
      "📅 Your current prompt schedule:\n\n" +
      "Day: {day}\n" +
      "Time: {hour}:00\n" +
      "Status: {status}\n\n" +
      "To change your schedule, use one of these commands:\n\n" +
      "/schedule_day - Set the day of the week\n" +
      "/schedule_time - Set the hour of the day\n" +
      "/schedule_toggle - Turn weekly prompts on/off",
      
    SELECT_DAY:
      "Select a day to receive your weekly prompts:",
      
    SELECT_TIME:
      "Select the hour to receive your weekly prompts (in 24-hour format):",
      
    UPDATED:
      "✅ Your schedule has been updated! You will receive prompts on {day} at {hour}:00.",
      
    ENABLED:
      "✅ Weekly prompts are now enabled. RAWR!",
      
    DISABLED:
      "✅ Weekly prompts are now disabled. Your dino is taking a nap."
  },
  
  CHOOSE: {
    INTRO:
      "Which type of prompt would you like to receive?\n\n" +
      "🧠 *Self-Awareness*: Reflect on your thoughts, feelings, and personal growth.\n\n" +
      "🤝 *Connections*: Focus on building and strengthening relationships with others."
  }
};