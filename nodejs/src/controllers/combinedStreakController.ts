// src/controllers/combinedStreakController.ts (Updated - Frontend-First)
import { Context } from 'telegraf';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { commandResponseService } from '../services/commandResponseService';
import { userAppUsageService } from '../services/userAppUsageService';
import { CommandContext } from '../types/botCommand';

/**
 * Handle /streak command - Now redirects to frontend with optional preview
 */
export async function handleCombinedStreakCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    const userName = ctx.from?.first_name || 'there';
    
    if (!userId) {
      await ctx.reply('Sorry, I could not identify you. Please try again.');
      return;
    }

    // Record command usage for analytics
    await userAppUsageService.recordBotCommandUsage(userId, 'streak');

    // Check if user exists
    const user = await userService.getUser(userId);
    if (!user) {
      await ctx.reply(
        '🦕 Welcome! Start your reflection journey to build streaks!',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🌟 Start Journey", callback_data: "start" }]
            ]
          }
        }
      );
      return;
    }

    // Get user app usage for progressive disclosure
    const userAppUsage = await userAppUsageService.getUserAppUsage(userId);
    
    const commandContext: CommandContext = {
      userId,
      userName,
      userAppUsage,
      commandName: 'streak'
    };

    // Generate frontend-first response
    const response = commandResponseService.generateStreakResponse(commandContext);

    // Create keyboard from response
    const keyboard = {
      inline_keyboard: [
        [{ 
          text: response.miniappButton.text, 
          web_app: { url: response.miniappButton.url } 
        }]
      ]
    };

    // For new/casual users, show a basic streak preview
    if (userAppUsage.miniappUsageCount < 3) {
      try {
        // Get basic streak info using the existing getStreakStats method
        const streakStats = await userService.getStreakStats(userId);
        
        const streakPreview = `

📊 *Quick Streak Overview:*

🔥 Current streak: ${streakStats.currentStreak} week${streakStats.currentStreak !== 1 ? 's' : ''}
📅 This week: ${streakStats.hasEntryThisWeek ? '✅ Complete' : '⏳ In progress'}
🦕 Dino mood: ${getDinoMoodFromStreak(streakStats.currentStreak)}

*See detailed charts, milestones, and dino evolution in the app!*`;

        // Send message with preview + frontend redirect
        await ctx.reply(
          response.messageText + streakPreview,
          {
            parse_mode: response.parseMode || 'Markdown',
            reply_markup: keyboard
          }
        );
      } catch (error) {
        logger.error('Error getting streak stats for preview:', error);
        // Fallback to just the frontend redirect
        await ctx.reply(response.messageText, {
          parse_mode: response.parseMode || 'Markdown',
          reply_markup: keyboard
        });
      }
    } else {
      // Experienced users get direct redirect
      await ctx.reply(response.messageText, {
        parse_mode: response.parseMode || 'Markdown',
        reply_markup: keyboard
      });
    }

    logger.info(`Streak command handled for user ${userId} - frontend-first approach`);
  } catch (error) {
    logger.error('Error in handleCombinedStreakCommand:', error);
    await ctx.reply(
      '🦕 Oops! Something went wrong with your streak info.\n\n' +
      'Try again with /streak or visit the app directly!',
      {
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🚀 Open App", 
              web_app: { url: process.env.BASE_URL || 'http://localhost:3000' }
            }]
          ]
        }
      }
    );
  }
}

/**
 * Get dino mood based on current streak
 */
function getDinoMoodFromStreak(streak: number): string {
  if (streak === 0) return '😴 Sleepy';
  if (streak <= 2) return '🌱 Growing';
  if (streak <= 4) return '😊 Happy';
  if (streak <= 8) return '💪 Strong';
  if (streak <= 12) return '🔥 On Fire';
  if (streak <= 26) return '⭐ Stellar';
  if (streak <= 52) return '🚀 Legendary';
  return '👑 Mythical';
}

/**
 * Handle callback for getting a new prompt from streak view
 */
export async function handleNewPromptCallback(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      await ctx.answerCbQuery('Sorry, I could not identify you.');
      return;
    }

    // Acknowledge the callback
    await ctx.answerCbQuery('🎯 Getting your new prompt...');
    
    // Redirect to app for new prompt
    const deepLink = `${process.env.BASE_URL || 'http://localhost:3000'}/miniapp?page=prompt&action=new&ref=streak_new_prompt`;
    
    await ctx.editMessageText(
      '🎯 *Get your new prompt in the app!*\n\n' +
      'Experience better prompts, track your progress, and interact with your dino friend!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ 
              text: "🚀 Get New Prompt", 
              web_app: { url: deepLink } 
            }]
          ]
        }
      }
    );

    logger.info(`New prompt callback handled for user ${userId} - redirected to frontend`);
  } catch (error) {
    logger.error('Error in handleNewPromptCallback:', error);
    await ctx.answerCbQuery('Sorry, something went wrong. Please try /prompt for a new reflection.');
  }
}