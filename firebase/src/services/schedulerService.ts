// firebase/src/services/schedulerService.ts
import cron from 'node-cron';
import { bot } from '../app';
import { userService } from './userService';
import { promptService } from './promptService';
import config from '../config';
import { logger } from '../utils/logger';
import moment from 'moment-timezone';

// Configuring timezones
function jsToMondayBasedDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function mondayBasedToJsDay(mondayBasedDay: number): number {
  return (mondayBasedDay + 1) % 7;
}

/**
 * Send a weekly prompt to a specific user
 */
export async function sendWeeklyPromptToUser(userId: string): Promise<void> {
  try {
    // Get next prompt for user
    const prompt = await promptService.getNextPromptForUser(userId);
    
    // Update user's last prompt
    await userService.saveLastPrompt(userId, prompt);
    
    // Indicate the category to the user
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    const message = 
      `🌟 Weekly Reflection Time! ${categoryEmoji} ${categoryName}\n\n${prompt.text}\n\n` +
      "Take a moment to pause and reflect on this question.";
      
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

      // Set Monday as first day of the week
      const jsDayOfWeek = sgTime.day(); // Sunday=0 in JavaScript
      const mondayBasedDay = jsToMondayBasedDay(jsDayOfWeek);

      const currentDay = sgTime.day(); // 0-6 (Sunday to Saturday)
      const currentHour = sgTime.hour(); // 0-23
      
      logger.info(`Checking scheduled prompts for day ${currentDay}, hour ${currentHour} (${config.timezone})`);
      
      // Get all users
      const users = await userService.getAllUsers();
      
      // Filter users who should receive prompts now based on their preferences
      const usersToSendPrompts = users.filter(user => 
        user.schedulePreference.enabled &&
        user.schedulePreference.day === mondayBasedDay && // Use the converted day if needed
        user.schedulePreference.hour === sgTime.hour()
      );
      
      logger.info(`Sending prompts to ${usersToSendPrompts.length} users`);
      
      // For each user, send a prompt
      for (const user of usersToSendPrompts) {
        try {
          await sendWeeklyPromptToUser(user.id);
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