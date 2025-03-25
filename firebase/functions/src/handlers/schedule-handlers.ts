// firebase/functions/src/handlers/schedule-handlers.ts

import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import UserService from '../services/user-service';
import { SchedulePreference } from '../types';
import { TIMEZONE } from '../constants';

// Constants for schedule options
const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Hour button labels (convert to 12-hour format for display)
const getHourLabel = (hour: number): string => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour} ${period}`;
};

export class ScheduleHandlers {
  private userService: UserService;
  
  // State for conversation tracking
  private userStates: Map<string, { step: string, preference: Partial<SchedulePreference> }> = new Map();

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Command to start the schedule setup process
  setupSchedule = async (ctx: Context): Promise<void> => {
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
      
      // Reset state
      this.userStates.set(userId, { step: 'day', preference: {} });
      
      // Show day selection keyboard
      const keyboard = Markup.inlineKeyboard(
        DAYS_OF_WEEK.map((day, index) => 
          Markup.button.callback(day, `day_${index}`)
        ).reduce((result, item, index) => {
          // Group buttons 3 per row
          const rowIndex = Math.floor(index / 3);
          if (!result[rowIndex]) {
            result[rowIndex] = [];
          }
          result[rowIndex].push(item);
          return result;
        }, [] as any[])
      );
      
      await ctx.reply(
        "📅 Let's set up your weekly prompt schedule.\n\n" +
        "What day of the week would you like to receive prompts?",
        keyboard
      );
    } catch (error) {
      console.error('Error in schedule setup:', error);
      await ctx.reply('Sorry, there was an error setting up your schedule. Please try again.');
    }
  }

  // Handle day selection
  handleDaySelection = async (ctx: any): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      const callbackData = ctx.callbackQuery?.data;
      
      if (!userId || !callbackData) {
        console.error('Missing userId or callback data');
        return;
      }
      
      // Extract day index from callback data
      const dayIndex = parseInt(callbackData.split('_')[1]);
      
      // Update user state
      const userState = this.userStates.get(userId);
      if (!userState) {
        await ctx.reply("Let's start over. Please use /schedule to begin.");
        return;
      }
      
      userState.preference.day = dayIndex;
      userState.step = 'hour';
      this.userStates.set(userId, userState);
      
      // Show hour selection keyboard
      const hourButtons = HOURS.map(hour => 
        Markup.button.callback(getHourLabel(hour), `hour_${hour}`)
      ).reduce((result, item, index) => {
        // Group buttons 4 per row
        const rowIndex = Math.floor(index / 4);
        if (!result[rowIndex]) {
          result[rowIndex] = [];
        }
        result[rowIndex].push(item);
        return result;
      }, [] as any[]);
      
      const keyboard = Markup.inlineKeyboard(hourButtons);
      
      await ctx.editMessageText(
        `You selected: ${DAYS_OF_WEEK[dayIndex]}.\n\n` +
        "⏰ What time would you like to receive your prompts?",
        keyboard
      );
    } catch (error) {
      console.error('Error handling day selection:', error);
      await ctx.reply('Sorry, there was an error. Please try /schedule again.');
    }
  }

  // Handle hour selection
  handleHourSelection = async (ctx: any): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      const callbackData = ctx.callbackQuery?.data;
      
      if (!userId || !callbackData) {
        console.error('Missing userId or callback data');
        return;
      }
      
      // Extract hour from callback data
      const hour = parseInt(callbackData.split('_')[1]);
      
      // Update user state
      const userState = this.userStates.get(userId);
      if (!userState) {
        await ctx.reply("Let's start over. Please use /schedule to begin.");
        return;
      }
      
      userState.preference.hour = hour;
      userState.step = 'confirm';
      this.userStates.set(userId, userState);
      
      // Show confirmation keyboard
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('✅ Confirm', 'schedule_confirm'),
        Markup.button.callback('❌ Cancel', 'schedule_cancel')
      ]);
      
      await ctx.editMessageText(
        `📝 Your weekly prompt schedule:\n\n` +
        `Day: ${DAYS_OF_WEEK[userState.preference.day!]}\n` +
        `Time: ${getHourLabel(hour)}\n` +
        `Timezone: ${TIMEZONE}\n\n` +
        `Would you like to save these settings?`,
        keyboard
      );
    } catch (error) {
      console.error('Error handling hour selection:', error);
      await ctx.reply('Sorry, there was an error. Please try /schedule again.');
    }
  }

  // Handle confirmation
  handleScheduleConfirmation = async (ctx: any): Promise<void> => {
    try {
      const userId = ctx.from?.id.toString();
      const callbackData = ctx.callbackQuery?.data;
      
      if (!userId || !callbackData) {
        console.error('Missing userId or callback data');
        return;
      }
      
      // Get current user state
      const userState = this.userStates.get(userId);
      if (!userState) {
        await ctx.reply("Let's start over. Please use /schedule to begin.");
        return;
      }
      
      if (callbackData === 'schedule_confirm') {
        // Save schedule preference to database
        await this.userService.updateSchedulePreference(userId, {
          enabled: true,
          day: userState.preference.day!, 
          hour: userState.preference.hour!,
          timezone: TIMEZONE
        });
        
        // Format time for display
        const dayName = DAYS_OF_WEEK[userState.preference.day!];
        const timeStr = getHourLabel(userState.preference.hour!);
        
        await ctx.editMessageText(
          `✅ Your weekly prompt schedule has been saved!\n\n` +
          `You'll receive prompts every ${dayName} at ${timeStr} (${TIMEZONE}).\n\n` +
          `You can change this anytime with the /schedule command.`
        );
      } else {
        // User canceled
        await ctx.editMessageText(
          `❌ Schedule setup canceled. Your previous settings remain unchanged.\n\n` +
          `Use /schedule anytime to set up or change your weekly prompt schedule.`
        );
      }
      
      // Clear user state
      this.userStates.delete(userId);
    } catch (error) {
      console.error('Error handling schedule confirmation:', error);
      await ctx.reply('Sorry, there was an error saving your schedule. Please try /schedule again.');
    }
  }

  // Command to toggle prompts on/off
  togglePrompts = async (ctx: Context): Promise<void> => {
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
      
      // Get current enabled state and toggle it
      const currentEnabled = user.schedulePreference?.enabled ?? true;
      const newEnabled = !currentEnabled;
      
      // Update preference
      await this.userService.updateSchedulePreference(userId, {
        enabled: newEnabled
      });
      
      if (newEnabled) {
        await ctx.reply(
          "✅ Weekly prompts are now enabled! You'll receive prompts according to your schedule.\n\n" +
          "Use /schedule to view or change your prompt day and time."
        );
      } else {
        await ctx.reply(
          "🔕 Weekly prompts are now disabled. You won't receive automatic prompts.\n\n" +
          "You can still request prompts anytime with /prompt.\n" +
          "Use /toggle_prompts to re-enable weekly prompts."
        );
      }
    } catch (error) {
      console.error('Error toggling prompts:', error);
      await ctx.reply('Sorry, there was an error. Please try again.');
    }
  }

  // Command to show current schedule
  showSchedule = async (ctx: Context): Promise<void> => {
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
      
      const prefs = user.schedulePreference;
      
      if (!prefs) {
        await ctx.reply(
          "You don't have a schedule set up yet. Use /schedule to set one up!"
        );
        return;
      }
      
      const statusEmoji = prefs.enabled ? '✅' : '🔕';
      const statusText = prefs.enabled ? 'Enabled' : 'Disabled';
      const dayName = DAYS_OF_WEEK[prefs.day];
      const timeStr = getHourLabel(prefs.hour);
      
      // Create buttons for modifying schedule
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Change Schedule', 'change_schedule'),
        Markup.button.callback(prefs.enabled ? 'Disable Prompts' : 'Enable Prompts', 'toggle_prompts')
      ]);
      
      await ctx.reply(
        `📊 Your Weekly Prompt Schedule\n\n` +
        `Status: ${statusEmoji} ${statusText}\n` +
        `Day: ${dayName}\n` +
        `Time: ${timeStr}\n` +
        `Timezone: ${TIMEZONE}\n\n` +
        `You can modify your settings using the buttons below.`,
        keyboard
      );
    } catch (error) {
      console.error('Error showing schedule:', error);
      await ctx.reply('Sorry, there was an error displaying your schedule. Please try again.');
    }
  }

  // Inline button handlers
  handleScheduleCallback = async (ctx: any): Promise<void> => {
    try {
      const callbackData = ctx.callbackQuery?.data;
      
      if (callbackData === 'change_schedule') {
        // Start schedule setup again
        await this.setupSchedule(ctx);
      } else if (callbackData === 'toggle_prompts') {
        // Toggle prompts on/off
        await this.togglePrompts(ctx);
      } else if (callbackData.startsWith('day_')) {
        // Handle day selection
        await this.handleDaySelection(ctx);
      } else if (callbackData.startsWith('hour_')) {
        // Handle hour selection
        await this.handleHourSelection(ctx);
      } else if (callbackData.startsWith('schedule_')) {
        // Handle confirmation or cancellation
        await this.handleScheduleConfirmation(ctx);
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      await ctx.reply('Sorry, there was an error. Please try again.');
    }
  }
}

export default ScheduleHandlers;