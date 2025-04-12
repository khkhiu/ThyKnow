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
 * If promptType is specified, send that type, otherwise alternate based on user's count
 */
export async function sendWeeklyPromptToUser(userId: string): Promise<void> {
  try {
    // Debug log to confirm userId is received correctly
    logger.info(`sendWeeklyPromptToUser called with userId: ${userId}`);

    // Get next prompt for user - this will automatically alternate
    // based on the user's prompt count if no type is specified
    const prompt = await promptService.getNextPromptForUser(userId);
    
    // Update user's last prompt
    await userService.saveLastPrompt(userId, prompt);
    
    // Indicate the category to the user
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    const message = 
      `🌟 Weekly Reflection Time! ${categoryEmoji} ${categoryName}\n\n${prompt.text}\n\n` +
      "Take a moment to pause and reflect on this question.\n\n" +
      "💡 Tip: Use /choose if you'd prefer a specific type of prompt next time.";
      
    // Send message
    await bot.telegram.sendMessage(userId, message);
    logger.info(`Sent ${prompt.type} prompt to user ${userId}`);
  } catch (error) {
    logger.error(`Error sending prompt to user ${userId}:`, error);
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