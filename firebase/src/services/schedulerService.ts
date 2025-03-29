import cron from 'node-cron';
import { bot } from '../app';
import { userService } from './userService';
import { promptService } from './promptService';
import config from '../config';
import { logger } from '../utils/logger';

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
 * Set up the scheduler to send weekly prompts
 */
export function setupScheduler(): void {
  // Schedule to run every Monday at 9 AM in Singapore timezone
  // Format: second minute hour day-of-month month day-of-week
  const cronExpression = `0 ${config.scheduler.promptHour} * * ${config.scheduler.promptDay}`;
  
  logger.info(`Setting up weekly prompt scheduler with cron expression: ${cronExpression}, timezone: ${config.timezone}`);
  
  cron.schedule(cronExpression, async () => {
    try {
      logger.info('Starting weekly prompt job');
      
      // Get all users
      const users = await userService.getAllUsers();
      logger.info(`Sending prompts to ${users.length} users`);
      
      // For each user, send a prompt
      for (const user of users) {
        try {
          await sendWeeklyPromptToUser(user.id);
        } catch (error) {
          logger.error(`Error sending prompt to user ${user.id}:`, error);
        }
      }
      
      logger.info('Completed weekly prompt job');
    } catch (error) {
      logger.error('Error in weekly prompt job:', error);
    }
  }, {
    timezone: config.timezone
  });
}