// src/services/commandResponseService.ts
// Service for generating frontend-first bot responses

import config from '../config';
import { 
  BotCommandResponse, 
  UserAppUsage, 
  CommandContext, 
  PromotionLevel,
  DeepLinkParams 
} from '../types/botCommand';

export class CommandResponseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.baseUrl;
  }

  /**
   * Determine promotion level based on user app usage
   */
  private getPromotionLevel(userAppUsage: UserAppUsage): PromotionLevel {
    const daysSinceLastUse = userAppUsage.lastMiniappUse 
      ? Math.floor((Date.now() - userAppUsage.lastMiniappUse.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (userAppUsage.hasUsedMiniapp && daysSinceLastUse < 7 && userAppUsage.miniappUsageCount >= 3) {
      return PromotionLevel.APP_FIRST;
    } else if (userAppUsage.isNewUser || userAppUsage.miniappUsageCount < 3) {
      return PromotionLevel.SOFT;
    } else {
      return PromotionLevel.APP_FIRST;
    }
  }

  /**
   * Generate deep link URL with parameters
   */
  private generateDeepLink(params: DeepLinkParams): string {
    const urlParams = new URLSearchParams();
    
    if (params.page) urlParams.set('page', params.page);
    if (params.action) urlParams.set('action', params.action);
    if (params.type) urlParams.set('type', params.type);
    if (params.ref) urlParams.set('ref', params.ref);
    
    // Add timestamp to force refresh
    urlParams.set('t', Date.now().toString());
    
    return `${this.baseUrl}/miniapp?${urlParams.toString()}`;
  }

  /**
   * Generate response for /prompt command
   */
  generatePromptResponse(context: CommandContext): BotCommandResponse {
    const promotionLevel = this.getPromotionLevel(context.userAppUsage);
    const deepLink = this.generateDeepLink({ 
      page: 'prompt', 
      action: 'new', 
      ref: 'bot_prompt_command' 
    });

    switch (promotionLevel) {
      case PromotionLevel.SOFT:
        return {
          messageText: `🧠 Hi ${context.userName}! Ready for your next reflection?`,
          miniappButton: {
            text: "✨ Get My Prompt",
            url: deepLink
          },
          fallbackContent: "Your personalized prompt is ready in the app, plus you can see your reflection history and interact with your dino friend!",
          promotionMessage: "💡 *Tip:* The app has better prompts, your dino companion, and tracks your progress!",
          parseMode: 'Markdown'
        };

      case PromotionLevel.APP_FIRST:
        return {
          messageText: `🚀 Time for reflection, ${context.userName}! Your personalized prompt awaits...`,
          miniappButton: {
            text: "🎯 Open Reflection Space",
            url: deepLink
          },
          promotionMessage: "📱 Get the full ThyKnow experience with visual prompts, progress tracking, and your dino friend!",
          parseMode: 'Markdown'
        };

      case PromotionLevel.APP_ONLY:
        return {
          messageText: `🦕 ${context.userName}, your reflection space is ready!`,
          miniappButton: {
            text: "🌟 Continue in App",
            url: deepLink
          },
          promotionMessage: "All your prompts, insights, and dino interactions happen in the app!",
          parseMode: 'Markdown'
        };
    }
  }

  /**
   * Generate response for /history command
   */
  generateHistoryResponse(context: CommandContext): BotCommandResponse {
    const promotionLevel = this.getPromotionLevel(context.userAppUsage);
    const deepLink = this.generateDeepLink({ 
      page: 'history', 
      ref: 'bot_history_command' 
    });

    switch (promotionLevel) {
      case PromotionLevel.SOFT:
        return {
          messageText: `📚 Your reflection journey, ${context.userName}!`,
          miniappButton: {
            text: "📖 View My History",
            url: deepLink
          },
          fallbackContent: "See all your past reflections with dates, search functionality, and beautiful visualizations in the app!",
          promotionMessage: "✨ *Pro tip:* The app shows charts, streaks, and insights from your reflections!",
          parseMode: 'Markdown'
        };

      case PromotionLevel.APP_FIRST:
      case PromotionLevel.APP_ONLY:
        return {
          messageText: `📊 Ready to explore your reflection journey, ${context.userName}?`,
          miniappButton: {
            text: "🔍 Open Journal History",
            url: deepLink
          },
          promotionMessage: "See detailed charts, search through entries, and discover patterns in your growth!",
          parseMode: 'Markdown'
        };
    }
  }

  /**
   * Generate response for /choose command
   */
  generateChooseResponse(context: CommandContext): BotCommandResponse {
    const promotionLevel = this.getPromotionLevel(context.userAppUsage);
    const deepLink = this.generateDeepLink({ 
      page: 'choose', 
      action: 'choose',
      ref: 'bot_choose_command' 
    });

    switch (promotionLevel) {
      case PromotionLevel.SOFT:
        return {
          messageText: `🎯 Choose your reflection style, ${context.userName}!`,
          miniappButton: {
            text: "🔍 Browse Prompt Types",
            url: deepLink
          },
          fallbackContent: "Discover different types of prompts: Self-Awareness, Connections, Growth, and more!",
          promotionMessage: "🌟 *App exclusive:* Preview prompts and see which types work best for you!",
          parseMode: 'Markdown'
        };

      case PromotionLevel.APP_FIRST:
      case PromotionLevel.APP_ONLY:
        return {
          messageText: `🎨 Time to personalize your reflection, ${context.userName}!`,
          miniappButton: {
            text: "🎭 Choose Prompt Style",
            url: deepLink
          },
          promotionMessage: "Explore self-awareness, connections, growth prompts and more with rich previews!",
          parseMode: 'Markdown'
        };
    }
  }

  /**
   * Generate response for /streak command
   */
  generateStreakResponse(context: CommandContext): BotCommandResponse {
    const promotionLevel = this.getPromotionLevel(context.userAppUsage);
    const deepLink = this.generateDeepLink({ 
      page: 'streak', 
      ref: 'bot_streak_command' 
    });

    switch (promotionLevel) {
      case PromotionLevel.SOFT:
        return {
          messageText: `🔥 Check your reflection streak, ${context.userName}!`,
          miniappButton: {
            text: "🏆 View My Progress",
            url: deepLink
          },
          fallbackContent: "See your weekly streaks, total reflections, and how your dino friend is growing!",
          promotionMessage: "📈 *App features:* Visual charts, streak celebrations, and dino mood tracking!",
          parseMode: 'Markdown'
        };

      case PromotionLevel.APP_FIRST:
      case PromotionLevel.APP_ONLY:
        return {
          messageText: `🚀 Your reflection progress awaits, ${context.userName}!`,
          miniappButton: {
            text: "📊 Open Streak Dashboard",
            url: deepLink
          },
          promotionMessage: "Discover detailed analytics, celebrate milestones, and watch your dino friend evolve!",
          parseMode: 'Markdown'
        };
    }
  }

  /**
   * Generate enhanced /start response - UPDATED with /schedule command
   */
  generateStartResponse(context: CommandContext): BotCommandResponse {
    const isReturningUser = !context.userAppUsage.isNewUser;
    const deepLink = this.generateDeepLink({ 
      page: 'home', 
      ref: 'bot_start_command' 
    });

    if (isReturningUser) {
      return {
        messageText: `🦕 Welcome back, ${context.userName}! 🦖\n\nYour ThyKnow journey continues...`,
        miniappButton: {
          text: "🚀 Continue Journey",
          url: deepLink
        },
        fallbackContent: `Quick Commands:\n• /prompt - New reflection\n• /history - Past entries\n• /streak - Progress stats\n• /schedule - Manage reminders\n• /help - All commands`,
        promotionMessage: "🌟 *Your dino friend missed you!* Check your progress and get a new prompt in the app!",
        parseMode: 'Markdown'
      };
    }

    return {
      messageText: `🦕 Welcome to ThyKnow, ${context.userName}! 🦖\n\nYour AI-powered reflection companion awaits! Here's what you can discover:\n\n• 🧠 Personalized reflection prompts\n• 🦕 Your own dino companion\n• 📈 Progress tracking & streaks\n• 📚 Beautiful journal history`,
      miniappButton: {
        text: "🌟 Start Your Journey",
        url: deepLink
      },
      fallbackContent: `Quick Commands (but the app is much better!):\n• /prompt - Get reflection prompt\n• /history - View past entries\n• /streak - Check progress\n• /schedule - Set up reminders\n• /help - All commands`,
      promotionMessage: "✨ *Pro tip:* The full experience with your dino friend is in the app!",
      parseMode: 'Markdown'
    };
  }

  /**
   * Generate help response with app promotion - UPDATED with /schedule command
   */
  generateHelpResponse(_context: CommandContext): BotCommandResponse {
    const deepLink = this.generateDeepLink({ 
      page: 'home', 
      ref: 'bot_help_command' 
    });

    const commandList = `
🤖 *ThyKnow Bot Commands:*

/start - Get started or return home
/prompt - Get a new reflection prompt  
/history - View your reflection history
/streak - Check your progress
/schedule - Manage prompt reminders
/feedback - Share your thoughts
/help - Show this message

📱 *For the best experience, use the app!*`;

    return {
      messageText: commandList,
      miniappButton: {
        text: "🚀 Open Full App",
        url: deepLink
      },
      promotionMessage: "💡 The app has everything: your dino friend, visual charts, achievements, and much more!",
      parseMode: 'Markdown'
    };
  }
}

export const commandResponseService = new CommandResponseService();