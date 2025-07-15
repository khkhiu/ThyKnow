// src/services/schedulerService.ts
import cron from 'node-cron';
import { bot } from '../app';
import { userService } from './userService';
import { promptService } from './promptService';
import config from '../config';
import { logger } from '../utils/logger';
import moment from 'moment-timezone';

/**
 * Send a weekly prompt to a specific user
 * Now triggers the app like other commands instead of just sending text
 */
export async function sendWeeklyPromptToUser(userId: string): Promise<void> {
  try {
    // Ensure userId is a string
    userId = String(userId);
    
    // Debug log to confirm userId is received correctly
    logger.info(`sendWeeklyPromptToUser called with userId: ${userId}`);

    // Get next prompt for user - this will automatically alternate
    // based on the user's prompt count if no type is specified
    const prompt = await promptService.getNextPromptForUser(userId);
    
    // Update user's last prompt
    await userService.saveLastPrompt(userId, prompt.text, prompt.type);
    
    // Get user info to verify they exist
    const user = await userService.getUser(userId);
    if (!user) {
      logger.error(`User ${userId} not found when sending scheduled prompt`);
      return;
    }
    
    // Indicate the category to the user
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    // Create deep link to app with the specific prompt
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const deepLink = `${baseUrl}/miniapp?page=prompt&action=scheduled&type=${prompt.type}&ref=weekly_scheduled_prompt&t=${Date.now()}`;
    
    // Create the message that promotes the app experience
    const message = 
      `🌟 *Weekly Reflection Time!* ${categoryEmoji} ${categoryName}\n\n` +
      `Your personalized ${categoryName.toLowerCase()} prompt is ready.\n\n` +
      `📱 *Experience it in the app for:*\n` +
      `• Rich, interactive prompts\n` +
      `• Progress tracking & streaks\n` +
      `• Your dino companion\n` +
      `• Beautiful reflection space\n\n` +
      `💡 *Tip:* All your reflections are saved and you can explore your growth over time!`;
    
    // Send message with web app button (like other commands)
    await bot.telegram.sendMessage(userId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "🎯 Open My Reflection Space", 
            web_app: { url: deepLink } 
          }],
          [{ 
            text: "⚙️ Manage Schedule", 
            callback_data: "manage_schedule"
          }]
        ]
      }
    });
    
    logger.info(`Sent ${prompt.type} prompt to user ${userId} - redirected to app`);
  } catch (error) {
    logger.error(`Error sending prompt to user ${userId}:`, error);
    
    // Fallback: send a simple message if the rich version fails
    try {
      await bot.telegram.sendMessage(userId, 
        `🌟 Your weekly reflection prompt is ready! Use /prompt to get started.`
      );
    } catch (fallbackError) {
      logger.error(`Fallback message also failed for user ${userId}:`, fallbackError);
    }
  }
}

/**
 * Set up the scheduler to check hourly and send personalized prompts
 */
export function setupScheduler(): void {
  // Schedule to run every hour to check for users who should receive prompts
  const cronExpression = `0 * * * *`; // Every hour
  
  logger.info(`Setting up hourly prompt scheduler with cron expression: ${cronExpression} (${config.timezone} timezone)`);
  
  cron.schedule(cronExpression, async () => {
    try {
      // Use moment-timezone to get Singapore time
      const sgTime = moment().tz(config.timezone);
      const currentDay = sgTime.day(); // 0-6 (Sunday to Saturday)
      const currentHour = sgTime.hour(); // 0-23
      
      logger.info(`Checking scheduled prompts for day ${currentDay}, hour ${currentHour} (${config.timezone})`);
      
      // Get all users
      const users = await userService.getAllUsers();
      
      // Debugging log
      users.forEach(user => {
        logger.debug(`User ${user.id}: day=${user.schedulePreference.day}, hour=${user.schedulePreference.hour}, enabled=${user.schedulePreference.enabled}`);
      });

      // Debug what the system is finding
      const matchingUsers = users.filter(user => 
        user.schedulePreference.day === currentDay &&
        user.schedulePreference.hour === currentHour
      );
      logger.debug(`Users matching day and hour: ${matchingUsers.length}`);

      const enabledUsers = users.filter(user => user.schedulePreference.enabled);
      logger.debug(`Users with enabled schedule: ${enabledUsers.length}`);

      // For specific debugging
      const testUser = users.find(user => user.id === '987496168');
      if (testUser) {
        logger.debug(`Test user match day: ${testUser.schedulePreference.day === currentDay}`);
        logger.debug(`Test user match hour: ${testUser.schedulePreference.hour === currentHour}`);
        logger.debug(`Test user enabled: ${testUser.schedulePreference.enabled}`);
        
        // Check data types
        logger.debug(`Types - currentDay: ${typeof currentDay}, user day: ${typeof testUser.schedulePreference.day}`);
        logger.debug(`Types - currentHour: ${typeof currentHour}, user hour: ${typeof testUser.schedulePreference.hour}`);
      }

      // Filter users who should receive prompts now based on their preferences
      const usersToSendPrompts = users.filter(user => 
        user.schedulePreference.enabled &&
        user.schedulePreference.day === currentDay && 
        user.schedulePreference.hour === currentHour
      );
      
      logger.info(`Sending prompts to ${usersToSendPrompts.length} users`);
      
      // For each user, send a prompt
      for (const user of usersToSendPrompts) {
        try {
          // Debug logging to confirm the ID
          logger.info(`Preparing to send prompt to user: ${user.id}`);
          
          // Make sure you're passing the ID as a string
          await sendWeeklyPromptToUser(String(user.id));
        } catch (error) {
          logger.error(`Error sending prompt to user ${user.id}:`, error);
        }
      }
      logger.info('Completed scheduled prompt job');

    } catch (error) {
      logger.error('Error in scheduled prompt job:', error);
    }
  }, {
    timezone: config.timezone // This sets the timezone for the cron job
  });
}

/**
 * Handle the "Manage Schedule" callback from scheduled prompts
 */
export async function handleManageScheduleCallback(ctx: any): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      await ctx.answerCbQuery('Sorry, I could not identify you.');
      return;
    }

    // Acknowledge the callback
    await ctx.answerCbQuery('Opening schedule settings...');
    
    // Get current schedule
    const user = await userService.getUser(userId);
    if (!user) {
      await ctx.editMessageText('Please use /start to set up your account first.');
      return;
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[user.schedulePreference.day];
    const currentHour = user.schedulePreference.hour;
    const isEnabled = user.schedulePreference.enabled;
    
    const scheduleMessage = 
      `⚙️ *Schedule Settings*\n\n` +
      `📅 Current: ${currentDay} at ${currentHour}:00\n` +
      `🔔 Status: ${isEnabled ? 'Enabled' : 'Disabled'}\n\n` +
      `Use these commands to adjust:\n` +
      `• /schedule_day - Change day\n` +
      `• /schedule_time - Change time\n` +
      `• /schedule_toggle - Enable/disable\n` +
      `• /schedule - View full schedule info`;
    
    await ctx.editMessageText(scheduleMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "🚀 Back to App", 
            web_app: { url: process.env.BASE_URL || 'http://localhost:3000' }
          }]
        ]
      }
    });
    
    logger.info(`Schedule management callback handled for user ${userId}`);
  } catch (error) {
    logger.error('Error in handleManageScheduleCallback:', error);
    await ctx.answerCbQuery('Sorry, something went wrong. Please try /schedule for settings.');
  }
}