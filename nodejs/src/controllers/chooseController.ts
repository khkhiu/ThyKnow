// src/controllers/chooseController.ts
import { Context, NarrowedContext } from 'telegraf';
import { Update, CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { logger } from '../utils/logger';
import { handleSendPrompt } from './promptController';
import { PromptType } from '../types';

// Define a type for callback query context
type CallbackContext = NarrowedContext<Context, Update.CallbackQueryUpdate>;

/**
 * Handle the /choose command
 * Allows users to choose between self-awareness and connections prompts
 */
export async function handleChooseCommand(ctx: Context): Promise<void> {
  try {
    const userId = ctx.from?.id.toString();
    
    if (!userId) {
      logger.error('No user ID found in context');
      return;
    }
    
    // Create keyboard with prompt type options
    const keyboard = [
      [
        {
          text: "🧠 Self-Awareness",
          callback_data: "choose:self_awareness"
        }
      ],
      [
        {
          text: "🤝 Connections",
          callback_data: "choose:connections" 
        }
      ]
    ];
    
    await ctx.reply(
      "Which type of prompt would you like to receive?\n\n" +
      "🧠 Self-Awareness: Reflect on your thoughts, feelings, and personal growth.\n\n" +
      "🤝 Connections: Focus on building and strengthening relationships with others.",
      {
        reply_markup: {
          inline_keyboard: keyboard
        }
      }
    );
    
  } catch (error) {
    logger.error('Error in choose command:', error);
    await ctx.reply('Sorry, there was an error. Please try again later.');
  }
}

/**
 * Handle callback queries for choose command
 */
export async function handleChooseCallback(ctx: CallbackContext): Promise<void> {
  try {
    // Safety check for ctx.from
    if (!ctx.from) {
      logger.error('User data missing from callback query');
      await ctx.answerCbQuery('Error: User data missing');
      return;
    }
    
    // Cast to DataQuery type to access the data property
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    
    if (!callbackQuery.data || !callbackQuery.data.includes(':')) {
      await ctx.answerCbQuery('Invalid callback data');
      return;
    }
    
    const [action, value] = callbackQuery.data.split(':');
    
    if (action === 'choose') {
      // Verify it's a valid prompt type
      const promptType = value as PromptType;
      if (promptType !== 'self_awareness' && promptType !== 'connections') {
        await ctx.answerCbQuery('Invalid prompt type');
        return;
      }
      
      // Answer the callback query
      await ctx.answerCbQuery(`Getting a ${promptType.replace('_', '-')} prompt...`);
      
      // Delete the choose message
      await ctx.deleteMessage();
      
      // Store the chosen prompt type in context for the prompt controller to use
      (ctx as any).chosenPromptType = promptType;
      
      // Send the prompt
      await handleSendPrompt(ctx);
    }
    
  } catch (error) {
    logger.error('Error handling choose callback:', error);
    await ctx.answerCbQuery('Sorry, an error occurred');
  }
}