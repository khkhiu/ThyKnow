// src/constants/index.ts (Updated - Frontend-First Messages)

// Export messages
export const MESSAGES = {
  // Enhanced welcome messages
  WELCOME_NEW_USER: `🦕 *Welcome to ThyKnow!* 🦖

Your AI-powered reflection companion awaits! Here's what you can discover:

• 🧠 Personalized reflection prompts
• 🦕 Your own dino companion  
• 📈 Progress tracking & streaks
• 📚 Beautiful journal history

Ready to begin your journey of self-discovery?`,

  WELCOME_RETURNING_USER: `🦕 *Welcome back!* 🦖

Your ThyKnow journey continues... Your dino friend missed you! 🤗

Ready to continue growing?`,

  // Frontend promotion messages
  FRONTEND_PROMOTION: {
    SOFT: "💡 *Tip:* The app has better prompts, your dino companion, and tracks your progress!",
    MEDIUM: "📱 Get the full ThyKnow experience with visual prompts, progress tracking, and your dino friend!",
    STRONG: "🌟 *App exclusive:* Visual charts, streak celebrations, and dino mood tracking!",
    URGENT: "✨ This feature moved to the app for a better experience!"
  },

  // Command-specific messages
  PROMPT_MOVED_TO_APP: `🧠 *Your reflection prompt awaits!*

Get the full experience with:
• Visual prompt cards
• Auto-save responses  
• Dino companion reactions
• Progress tracking`,

  HISTORY_MOVED_TO_APP: `📚 *Your reflection journey awaits!*

Discover:
• Beautiful timeline view
• Search through entries
• Progress charts & insights
• Export your reflections`,

  STREAK_MOVED_TO_APP: `🔥 *Your progress dashboard is ready!*

See:
• Visual streak charts
• Milestone celebrations  
• Dino evolution stages
• Weekly insights`,

  CHOOSE_MOVED_TO_APP: `🎯 *Personalize your reflection style!*

Explore:
• Prompt type previews
• Difficulty selection
• Mood-based suggestions
• Favorite prompts`,

  // Error and fallback messages
  ERROR: "RAWR! 🦕 Something went wrong! Try the app for a better experience:",
  
  USER_NOT_FOUND: `🦕 *Welcome to ThyKnow!*

It looks like you're new here. Start your reflection journey to unlock all features!`,

  FEATURE_IN_APP: `🚀 *This feature is now in the app!*

Get a better experience with rich interactions and visual elements.`,

  BOT_TO_APP_TRANSITION: `📱 *Moving to the app for a better experience!*

The bot is great for quick access, but the app has all the advanced features!`,

  // Help message (updated)
  HELP: `🤖 *ThyKnow Bot Commands:*

*Main Commands (Better in App):*
/start - Get started or return home
/prompt - Get a new reflection prompt ↗️
/history - View your reflection history ↗️
/choose - Choose prompt type ↗️
/streak - Check your progress ↗️

*Quick Commands:*
/miniapp - Open the full app
/schedule - Manage reminders
/feedback - Share your thoughts
/help - Show this message

*Legacy Commands:*
/journal → Use /history instead
/dino → Visit your pet in the app

📱 *Pro tip:* The app has everything - your dino friend, visual charts, achievements, and much more!`,

  // Feedback messages from the messages.ts file
  FEEDBACK: {
    INTRO:
      "🦕 We'd love to hear your thoughts on ThyKnow!\n\n" +
      "Please share your feedback, suggestions, bug reports, or anything else that would help us improve ThyKnow and make it more valuable for you.\n\n" +
      "Just type your message below, or use /cancel to exit feedback mode.",
    
    THANK_YOU:
      "🦖 Thank you for your feedback!\n\n" +
      "We really appreciate you taking the time to share your thoughts with us. " +
      "Your input helps us evolve ThyKnow into an even better tool for self-awareness and building connections.",
    
    CANCELED:
      "Feedback submission canceled. You can always use /feedback again when you're ready to share your thoughts with us.",
    
    ERROR:
      "Sorry, there was an error saving your feedback. Please try again later, or contact our support team."
  }
};

// Export feedback messages for response handling
export const FEEDBACK = {
  SELF_AWARENESS:
    "🦖 T-Rex-ceptional reflection! Your response has been safely fossilized in your journal.\n\n" +
    "Self-awareness is a journey that takes time, like how dinosaurs evolved over millions of years.\n\n" +
    "Want more self-reflection? Use /choose to specifically request a self-awareness prompt.\n\n" +
    "Or use /prompt for an alternating experience.\n\nPress /help for other commands.",
  
  CONNECTIONS:
    "🦕 Dino-mite! Your response has been safely tucked away in your journal.\n\n" +
    "Just like a pack of raptors, strong connections start with understanding ourselves!\n\n" +
    "Want more connection prompts? Use /choose to specifically request a connections prompt.\n\n" +
    "Or use /prompt for an alternating experience.\n\nPress /help for other commands."
};