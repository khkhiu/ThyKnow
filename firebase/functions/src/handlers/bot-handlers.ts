import { Context } from 'telegraf';
import moment from 'moment-timezone';
import UserService from '../services/user-service';
import PromptService from '../services/prompt-service';
//import { JournalEntry, LastPrompt, PromptType } from '../types';
import { JournalEntry, LastPrompt} from '../types';
import { FEEDBACK, MESSAGES, TIMEZONE } from '../constants';

export class BotHandlers {
  private userService: UserService;
  private promptService: PromptService;

  constructor(userService: UserService, promptService: PromptService) {
    this.userService = userService;
    this.promptService = promptService;
  }

  start = async (ctx: Context): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      
      if (!userId) {
        console.error('No user ID found in context');
        return;
      }
      
      // Create user if not exists
      await this.userService.createOrUpdateUser(userId);
      
      // Send welcome message
      await ctx.reply(MESSAGES.WELCOME);
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  sendPrompt = async (ctx: Context): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      
      if (!userId) {
        console.error('No user ID found in context');
        return;
      }
      
      const user = await this.userService.getUser(userId);
      
      if (!user) {
        await ctx.reply("Please start the bot with /start first!");
        return;
      }
      
      // Get next prompt for this user
      const prompt = await this.promptService.getNextPromptForUser(userId);
      
      // Save current prompt to user's data
      await this.userService.saveLastPrompt(userId, prompt);
      
      // Determine category emoji and name
      const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
      const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
      
      await ctx.reply(
        `${categoryEmoji} ${categoryName} Reflection:\n\n${prompt.text}\n\n` +
        "Take your time to reflect and respond when you're ready. " +
        "Your response will be saved in your journal.\n\n" +
        "You can use other commands like /history while thinking - " +
        "just reply directly to this message when you're ready."
      );
    } catch (error) {
      console.error('Error in prompt command:', error);
      await ctx.reply('Sorry, there was an error getting your prompt. Please try again.');
    }
  }

  showHistory = async (ctx: Context): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      
      if (!userId) {
        console.error('No user ID found in context');
        return;
      }
      
      const user = await this.userService.getUser(userId);
      
      if (!user) {
        await ctx.reply("Please start the bot with /start first!");
        return;
      }
      
      const entries = await this.userService.getRecentEntries(userId);
      
      if (entries.length === 0) {
        await ctx.reply(MESSAGES.NO_HISTORY);
        return;
      }
      
      let historyText = "📖 Your Recent Journal Entries:\n\n";
      
      for (const entry of entries) {
        const date = moment(entry.timestamp.toDate()).tz(TIMEZONE).format('YYYY-MM-DD HH:mm');
        historyText += `📅 ${date}\n`;
        historyText += `Q: ${entry.prompt}\n`;
        historyText += `A: ${entry.response}\n\n`;
      }
      
      // Split message if it's too long
      if (historyText.length > 4000) {
        const chunks = [];
        for (let i = 0; i < historyText.length; i += 4000) {
          chunks.push(historyText.substring(i, i + 4000));
        }
        
        for (const chunk of chunks) {
          await ctx.reply(chunk);
        }
      } else {
        await ctx.reply(historyText);
      }
    } catch (error) {
      console.error('Error in history command:', error);
      await ctx.reply('Sorry, there was an error retrieving your history. Please try again.');
    }
  }

  showTimezone = async (ctx: Context): Promise<void> => {
    await ctx.reply(MESSAGES.TIMEZONE);
  }

  showHelp = async (ctx: Context): Promise<void> => {
    await ctx.reply(MESSAGES.HELP);
  }

  handleResponse = async (ctx: Context): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : null;
      
      if (!userId || !messageText) {
        console.error('No user ID or message text found in context');
        return;
      }
      
      // Ignore commands
      if (messageText.startsWith('/')) return;
      
      const user = await this.userService.getUser(userId);
      
      if (!user || !user.lastPrompt) {
        await ctx.reply(MESSAGES.NO_PROMPT);
        return;
      }
      
      const lastPrompt = user.lastPrompt as LastPrompt;
      
      // Create journal entry
      const entry: JournalEntry = this.promptService.createJournalEntry(
        lastPrompt.text,
        messageText,
        lastPrompt.type
      );
      
      // Save response
      await this.userService.saveResponse(userId, entry);
      
      // Provide feedback based on prompt type
      const feedback = lastPrompt.type === 'self_awareness' 
        ? FEEDBACK.SELF_AWARENESS 
        : FEEDBACK.CONNECTIONS;
      
      await ctx.reply(feedback);
    } catch (error) {
      console.error('Error handling user response:', error);
      await ctx.reply(MESSAGES.SAVE_ERROR);
    }
  }

  sendWeeklyPromptToUser = async (userId: string, bot: any): Promise<void> => {
    try {
      // Get next prompt for user
      const prompt = await this.promptService.getNextPromptForUser(userId);
      
      // Update user's last prompt
      await this.userService.saveLastPrompt(userId, prompt);
      
      // Indicate the category to the user
      const categoryEmoji = prompt.type === 'self_awareness' ? '🧠' : '🤝';
      const categoryName = prompt.type === 'self_awareness' ? 'Self-Awareness' : 'Connections';
      
      const message = 
        `🌟 Weekly Reflection Time! ${categoryEmoji} ${categoryName}\n\n${prompt.text}\n\n` +
        "Take a moment to pause and reflect on this question.";
        
      // Send message
      await bot.telegram.sendMessage(userId, message);
      console.log(`Sent ${prompt.type} prompt to user ${userId}`);
    } catch (error) {
      console.error(`Error sending prompt to user ${userId}:`, error);
    }
  }
}

export default BotHandlers;