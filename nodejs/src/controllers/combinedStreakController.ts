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

    // For new/casual users, show a basic streak preview
    if (userAppUsage.miniappUsageCount < 3) {
      try {
        // Get basic streak info
        const weeklyProgress = await userService.getUserWeeklyProgress(userId);
        
        const streakPreview = `

📊 *Quick Streak Overview:*

🔥 Current streak: ${weeklyProgress.currentStreak} week${weeklyProgress.currentStreak !== 1 ? 's' : ''}
📅 This week: ${weeklyProgress.currentWeekCompleted ? '✅ Complete' : '⏳ In progress'}
🦕 Dino mood: ${getDinoMoodFromStreak(weeklyProgress.currentStreak)}

*See detailed charts, milestones, and dino evolution in the app!*`;

        await ctx.reply(
          response.messageText + streakPreview + '\n\n' + response.promotionMessage,
          {
            parse_mode: response.parseMode,
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: response.miniappButton.text, 
                  web_app: { url: response.miniappButton.url } 
                }]
              ]
            }
          }
        );
      } catch (streakError) {
        // Fallback if streak data fails
        await ctx.reply(
          response.messageText + '\n\n' + response.promotionMessage,
          {
            parse_mode: response.parseMode,
            reply_markup: {
              inline_keyboard: [
                [{ 
                  text: response.miniappButton.text, 
                  web_app: { url: response.miniappButton.url } 
                }]
              ]
            }
          }
        );
      }
    } else {
      // For experienced users, direct to app
      await ctx.reply(
        response.messageText + '\n\n' + response.promotionMessage,
        {
          parse_mode: response.parseMode,
          reply_markup: {
            inline_keyboard: [
              [{ 
                text: response.miniappButton.text, 
                web_app: { url: response.miniappButton.url } 
              }]
            ]
          }
        }
      );
    }

    logger.info(`Streak command handled for user ${userId} - directed to frontend`);
  } catch (error) {
    logger.error('Error in handleCombinedStreakCommand:', error);
    await ctx.reply('Sorry, something went wrong checking your streak. Please try again or use /help for assistance.');
  }
}

/**
 * Get dino mood based on streak length
 */
function getDinoMoodFromStreak(streak: number): string {
  if (streak === 0) return '😴 Sleepy';
  if (streak === 1) return '😊 Happy';
  if (streak <= 3) return '🤗 Excited';
  if (streak <= 6) return '🎉 Thriving';
  if (streak <= 10) return '🌟 Amazing';
  return '🏆 Legendary';
}

/**
 * Handle new prompt callback from streak page
 */
export async function handleNewPromptCallback(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      await ctx.answerCbQuery('Error processing request');
      return;
    }

    await ctx.answerCbQuery('Opening prompt in app!');
    
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