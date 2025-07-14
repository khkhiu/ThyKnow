// src/constants/index.ts (Updated - Frontend-First Messages)

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

📱 *Pro tip:* The app has everything - your dino friend, visual charts, achievements, and much more!

↗️ = Redirects to app for better experience`,

  // Bot command descriptions (updated)
  COMMANDS: {
    START: "🏠 Get started with ThyKnow",
    PROMPT: "🧠 Get a reflection prompt (opens in app)",
    HISTORY: "📚 View your journal history (opens in app)", 
    CHOOSE: "🎯 Choose prompt type (opens in app)",
    STREAK: "🔥 Check your progress (opens in app)",
    MINIAPP: "📱 Open the full ThyKnow experience",
    SCHEDULE: "⏰ Manage notification schedule",
    FEEDBACK: "💬 Share feedback with us",
    HELP: "❓ Show available commands",
    CANCEL: "❌ Cancel current operation"
  },

  // Transition messages for different user types
  USER_SEGMENTS: {
    NEW_USER: {
      CTA: "🌟 Start Your Journey",
      MESSAGE: "Discover the power of reflection with your personal dino companion!"
    },
    CASUAL_USER: {
      CTA: "🎯 Continue Journey", 
      MESSAGE: "Your dino friend is excited to see your progress!"
    },
    ACTIVE_USER: {
      CTA: "🏠 Enter ThyKnow",
      MESSAGE: "Your reflection space is ready with new insights!"
    },
    POWER_USER: {
      CTA: "⚡ Quick Access",
      MESSAGE: "Jump straight into your advanced features!"
    }
  },

  // Success and celebration messages
  SUCCESS: {
    RESPONSE_SAVED: "✅ *Response saved!* 🌟 Great reflection!",
    STREAK_UPDATED: "🔥 *Streak updated!* You're on fire!",
    GOAL_REACHED: "🎉 *Goal reached!* Celebrate in the app!",
    NEW_FEATURE: "✨ *New feature unlocked!* Check it out in the app!"
  },

  // Deep link specific messages
  DEEP_LINK: {
    FROM_BOT_PROMPT: "🎯 *Fresh prompt generated!* Ready to reflect?",
    FROM_BOT_HISTORY: "📖 *Your complete journey awaits!* Explore your growth!",
    FROM_BOT_STREAK: "📊 *Progress dashboard loaded!* See how far you've come!",
    FROM_BOT_CHOOSE: "🎨 *Prompt styles ready!* Find your perfect match!"
  },

  // Analytics and tracking
  ANALYTICS: {
    BOT_COMMAND_USED: "Bot command executed",
    FRONTEND_REDIRECTED: "User redirected to frontend", 
    DEEP_LINK_ACCESSED: "Deep link accessed",
    MINIAPP_OPENED: "Miniapp opened from bot"
  }
};

// App configuration constants
export const APP_CONFIG = {
  FRONTEND_FIRST: true,
  BOT_ROLE: 'gateway', // 'gateway', 'companion', 'notifications'
  
  PROMOTION_LEVELS: {
    SOFT: 'soft',
    MEDIUM: 'medium', 
    STRONG: 'strong',
    APP_ONLY: 'app_only'
  },
  
  USER_SEGMENTS: {
    NEW: 'new',           // 0-3 app uses
    CASUAL: 'casual',     // 4-10 app uses  
    ACTIVE: 'active',     // 11-25 app uses
    POWER: 'power'        // 25+ app uses
  },
  
  DEEP_LINK_PAGES: [
    'home', 'prompt', 'history', 'streak', 'choose', 'pet', 'settings'
  ],
  
  DEEP_LINK_ACTIONS: [
    'new', 'choose', 'view', 'respond', 'edit'
  ]
};

// Button text configurations
export const BUTTONS = {
  WEB_APP: {
    START_JOURNEY: "🌟 Start Your Journey",
    CONTINUE_JOURNEY: "🎯 Continue Journey", 
    ENTER_THYKNOW: "🏠 Enter ThyKnow",
    GET_PROMPT: "✨ Get My Prompt",
    VIEW_HISTORY: "📖 View My History",
    CHECK_PROGRESS: "📊 Check Progress",
    CHOOSE_STYLE: "🎭 Choose Prompt Style",
    VISIT_DINO: "🦕 Visit Dino Friend",
    OPEN_APP: "🚀 Open ThyKnow App"
  },
  
  INLINE: {
    NEW_PROMPT: "🔄 New Prompt",
    SAVE_RESPONSE: "💾 Save Response",
    TRY_APP: "📱 Try in App",
    LEARN_MORE: "ℹ️ Learn More"
  }
};

// URL configurations
export const URLS = {
  MINIAPP_BASE: "/miniapp",
  DEEP_LINKS: {
    HOME: "/miniapp?page=home",
    PROMPT: "/miniapp?page=prompt&action=new",
    HISTORY: "/miniapp?page=history", 
    STREAK: "/miniapp?page=streak",
    CHOOSE: "/miniapp?page=choose&action=choose",
    PET: "/miniapp?page=pet"
  }
};

// Timing configurations
export const TIMING = {
  PROMOTION_DELAY_DAYS: 3,    // Days before promoting app strongly
  APP_ONLY_AFTER_DAYS: 14,    // Days before going app-only
  STREAK_CELEBRATION_DELAY: 2000, // ms
  RESPONSE_TIMEOUT: 30000,    // ms
  DEEP_LINK_CACHE_TIME: 300   // seconds
};

export default {
  MESSAGES,
  APP_CONFIG,
  BUTTONS,
  URLS,
  TIMING
};