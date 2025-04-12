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
    
    // Instead of getting the next prompt, we show a menu to choose the type
    await ctx.reply(
      "📝 Which type of prompt would you like?",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🧠 Self-Awareness",
                callback_data: "prompt_type:self_awareness"
              }
            ],
            [
              {
                text: "🤝 Connections",
                callback_data: "prompt_type:connections"
              }
            ],
            [
              {
                text: "🔄 Surprise Me (Alternate)",
                callback_data: "prompt_type:alternate"
              }
            ]
          ]
        }
      }
    );
    
    logger.info(`Showed prompt selection menu to user ${userId}`);
  } catch (error) {
    logger.error('Error in prompt command:', error);
    await ctx.reply('Sorry, there was an error getting your prompt. Please try again.');
  }
}

/**
 * Handle prompt type selection callback
 */
export async function handlePromptTypeCallback(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID in callback context');
      await ctx.answerCbQuery('Error: User ID missing');
      return;
    }
    
    // Get the callback data and extract the type
    const callbackQuery = ctx.callbackQuery;
    
    if (!callbackQuery || !('data' in callbackQuery)) {
      await ctx.answerCbQuery('Invalid callback data');
      return;
    }
    
    const data = callbackQuery.data;
    
    if (!data || !data.startsWith('prompt_type:')) {
      await ctx.answerCbQuery('Invalid prompt type');
      return;
    }
    
    const promptType = data.split(':')[1] as PromptType | 'alternate';
    
    // Get a prompt of the selected type
    let prompt;
    if (promptType === 'alternate') {
      // Use the existing alternating system
      prompt = await promptService.getNextPromptForUser(userId);
    } else {
      // Get a prompt of the specific type
      prompt = await promptService.getPromptBySpecificType(userId, promptType as PromptType);
    }
    
    // Save current prompt to user's data
    await userService.saveLastPrompt(userId, prompt);
    
    // Determine category emoji and name
    const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
    const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
    
    // Answer the callback query
    await ctx.answerCbQuery(`Getting a ${categoryName} prompt...`);
    
    // Edit the original message to show the prompt
    await ctx.editMessageText(
      `${categoryEmoji} ${categoryName} Reflection:\n\n${prompt.text}\n\n` +
      "Take your time to reflect and respond when you're ready. " +
      "Your response will be saved in your journal."
    );
    
    logger.info(`Sent ${prompt.type} prompt to user ${userId}`);
  } catch (error) {
    logger.error('Error handling prompt type callback:', error);
    await ctx.answerCbQuery('Sorry, an error occurred');
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
    if (!user.lastPrompt) {
      logger.info(`User ${userId} has no active prompt`);
      await ctx.reply("I don't have a prompt for you to respond to. Use /prompt to get one.");
      return;
    }
    
    // Create journal entry
    const entry = {
      prompt: user.lastPrompt.text,
      promptType: user.lastPrompt.type as PromptType,
      response: messageText,
      timestamp: new Date()
    };
    
    // Save response
    try {
      await userService.saveResponse(userId, entry);
      logger.info(`Successfully saved journal entry for user ${userId}`);
      
      // Determine feedback based on prompt type
      const feedbackMessage = user.lastPrompt.type === 'self_awareness' 
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