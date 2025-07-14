// src/controllers/responseController.ts
import { Context, NarrowedContext } from 'telegraf';
import { Update, CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { userService } from '../services/userService';
import { FEEDBACK } from '../constants/feedback';  // Fixed import path
import { logger } from '../utils/logger';
import { PromptType } from '../types';
import { handleSendPrompt } from './promptController';

// Define a type for callback query context
type CallbackContext = NarrowedContext<Context, Update.CallbackQueryUpdate>;

/**
 * Handle callback for saving response or getting new prompt
 */
export async function handleResponseCallback(ctx: CallbackContext): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID in callback context');
      await ctx.answerCbQuery('Error: User ID missing');
      return;
    }
    
    // Cast to DataQuery type to access the data property
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    const data = callbackQuery.data;
    
    if (!data) {
      await ctx.answerCbQuery('Invalid callback data');
      return;
    }
    
    if (data === 'new_prompt') {
      // User wants a new prompt instead of saving response
      await ctx.answerCbQuery('Getting a new prompt...');
      await ctx.deleteMessage();
      
      // Reuse the existing prompt command handler
      const promptCtx = ctx as unknown as Context;
      await handleSendPrompt(promptCtx);
      return;
    }
    
    if (data.startsWith('save_response:')) {
      // User confirms they want to save their response
      const user = await userService.getUser(userId);
      
      if (!user) {
        await ctx.answerCbQuery('Error: User not found');
        await ctx.editMessageText('Sorry, I could not find your user data. Please use /start to initialize the bot.');
        return;
      }
      
      // Access lastPrompt which might not exist directly on user
      const userWithPrompt = user as any;
      if (!userWithPrompt.lastPrompt) {
        await ctx.answerCbQuery('Error: Prompt data not found');
        await ctx.editMessageText('Sorry, I could not find your prompt data. Please use /prompt to get a new one.');
        return;
      }
      
      // Get the original message text with proper type checking
      const message = ctx.callbackQuery.message;
      const replyToMessage = message && 'reply_to_message' in message ? 
        message.reply_to_message : undefined;
      const originalMessage = replyToMessage && 'text' in replyToMessage ? 
        replyToMessage.text : undefined;
      
      if (!originalMessage) {
        await ctx.answerCbQuery('Error: Original message not found');
        await ctx.editMessageText('Sorry, I could not find your original message. Please use /prompt to get a new prompt.');
        return;
      }
      
      // Create and save entry
      const entry = {
        prompt: userWithPrompt.lastPrompt.text,
        promptType: userWithPrompt.lastPrompt.type as PromptType,
        response: originalMessage,
        timestamp: new Date()
      };
      
      await userService.saveResponse(userId, entry);
      await ctx.answerCbQuery('Response saved!');
      
      // Determine feedback based on prompt type
      const feedbackMessage = userWithPrompt.lastPrompt.type === 'self_awareness' 
        ? FEEDBACK.SELF_AWARENESS 
        : FEEDBACK.CONNECTIONS;
      
      // Update message with confirmation
      await ctx.editMessageText(feedbackMessage);
    }
    
  } catch (error) {
    logger.error('Error handling response callback:', error);
    await ctx.answerCbQuery('Sorry, an error occurred');
  }
}