// src/controllers/promptController.ts
import { Context } from 'telegraf';
import { userService } from '../services/userService';
import { promptService } from '../services/promptService';
import { FEEDBACK, MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import { PromptType } from '../types';

/**
 * Send prompt command handler
 */
export async function handleSendPrompt(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Check if a specific prompt type was chosen via the /choose command
    const chosenPromptType = (ctx as any).chosenPromptType as PromptType | undefined;
    
    // Get next prompt for this user, passing the chosen type if available
    const prompt = await promptService.getNextPromptForUser(userId, chosenPromptType);
    
    // Save current prompt to user's data
    await userService.saveLastPrompt(userId, prompt);
    
    // Determine category emoji and name
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    await ctx.reply(
      `${categoryEmoji} ${categoryName} Reflection:\n\n${prompt.text}\n\n` +
      "Take your time to reflect and respond when you're ready. " +
      "Your response will be saved in your journal.\n\n" +
      "💡 Tip: Use /choose to select a specific type of prompt next time."
    );
    
    // Clear the chosen prompt type to ensure it's not reused
    delete (ctx as any).chosenPromptType;
    
    logger.info(`Sent prompt to user ${userId}`);
  } catch (error) {
    logger.error('Error in prompt command:', error);
    await ctx.reply('Sorry, there was an error getting your prompt. Please try again.');
  }
}

/**
 * Handle text messages (responses to prompts)
 */
export async function handleTextMessage(ctx: Context): Promise<void> {
  try {
    // Get message and check if it's a text message
    const message = ctx.message;
    if (!message || !('text' in message)) {
      return;
    }
    
    // Ignore command messages
    if (message.text.startsWith('/')) {
      return;
    }
    
    const userId = ctx.from?.id.toString();
    const messageText = message.text;
    
    if (!userId || !messageText) {
      logger.error('Missing user ID or message text');
      return;
    }
    
    // Get user data
    const user = await userService.getUser(userId);
    
    if (!user) {
      logger.info(`User ${userId} not found, suggesting to start the bot`);
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Check if user has an active prompt to respond to
    // Note: lastPrompt might not exist since we're using findOneWithLastPrompt
    const userWithPrompt = user as any;
    if (!userWithPrompt.lastPrompt) {
      logger.info(`User ${userId} has no active prompt`);
      await ctx.reply("I don't have a prompt for you to respond to. Use /prompt to get one or /choose to select a specific type.");
      return;
    }
    
    // Create journal entry
    const entry = {
      prompt: userWithPrompt.lastPrompt.text,
      promptType: userWithPrompt.lastPrompt.type as PromptType,
      response: messageText,
      timestamp: new Date()
    };
    
    // Save response
    try {
      await userService.saveResponse(userId, entry);
      logger.info(`Successfully saved journal entry for user ${userId}`);
      
      // Determine feedback based on prompt type
      const feedbackMessage = userWithPrompt.lastPrompt.type === 'self_awareness' 
        ? FEEDBACK.SELF_AWARENESS 
        : FEEDBACK.CONNECTIONS;
      
      // Send feedback to user
      await ctx.reply(feedbackMessage);
      
    } catch (error) {
      logger.error(`Failed to save response for user ${userId}:`, error);
      await ctx.reply(MESSAGES.SAVE_ERROR);
    }
    
  } catch (error) {
    logger.error('Error handling text message:', error);
    await ctx.reply(MESSAGES.ERROR);
  }
}