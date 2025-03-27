// src/handlers/schedule-handlers.ts
import { Context } from 'telegraf';
import { Timestamp } from 'firebase-admin/firestore';
import UserService from '../services/user-service';
import { User } from '../types';
import { TIMEZONE } from '../constants';

export class ScheduleHandlers {
  private userService: UserService;
  private daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Handle the /schedule command to view or modify prompt schedule
   */
  handleScheduleCommand = async (ctx: Context): Promise<void> => {
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
      
      // Get command arguments if any
      const message = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const args = message.split(' ').slice(1);
      
      // If no arguments, show current schedule
      if (args.length === 0) {
        await this.showCurrentSchedule(ctx, user);
        return;
      }
      
      // Handle subcommands
      const subcommand = args[0].toLowerCase();
      
      switch (subcommand) {
        case 'on':
          await this.enableSchedule(ctx, userId);
          break;
        case 'off':
          await this.disableSchedule(ctx, userId);
          break;
        case 'day':
          if (args.length >= 2) {
            await this.setScheduleDay(ctx, userId, args[1]);
          } else {
            await ctx.reply("Please specify a day (e.g., /schedule day monday)");
          }
          break;
        case 'time':
          if (args.length >= 2) {
            await this.setScheduleTime(ctx, userId, args[1]);
          } else {
            await ctx.reply("Please specify a time in 24-hour format (e.g., /schedule time 09:00)");
          }
          break;
        case 'help':
          await this.showScheduleHelp(ctx);
          break;
        default:
          await ctx.reply(
            "I didn't understand that schedule command.\n" +
            "Try /schedule to view your current schedule or /schedule help for options."
          );
      }
    } catch (error: unknown) {
      console.error('Error handling schedule command:', error);
      await ctx.reply("Sorry, there was an error processing your schedule settings. Please try again.");
    }
  }

  /**
   * Show the user's current schedule settings
   */
  private async showCurrentSchedule(ctx: Context, user: User): Promise<void> {
    const schedulePreference = user.schedulePreference || {
      enabled: true,
      dayOfWeek: 1, // Monday
      hour: 9,      // 9 AM
      minute: 0
    };
    
    const dayName = this.daysOfWeek[schedulePreference.dayOfWeek];
    const timeFormatted = this.formatTime(schedulePreference.hour, schedulePreference.minute);
    const statusIcon = schedulePreference.enabled ? '✅' : '❌';
    
    await ctx.reply(
      "🗓️ Your Current Prompt Schedule:\n\n" +
      `Status: ${statusIcon} ${schedulePreference.enabled ? 'Enabled' : 'Disabled'}\n` +
      `Day: ${dayName}\n` +
      `Time: ${timeFormatted} (${TIMEZONE})\n\n` +
      "To change your schedule, use one of these commands:\n" +
      "• /schedule on - Enable automatic prompts\n" +
      "• /schedule off - Disable automatic prompts\n" +
      "• /schedule day monday - Change day (sunday-saturday)\n" +
      "• /schedule time 09:00 - Change time (24-hour format)\n" +
      "• /schedule help - Show detailed help"
    );
  }

  /**
   * Show help for schedule commands
   */
  private async showScheduleHelp(ctx: Context): Promise<void> {
    await ctx.reply(
      "📅 Schedule Command Help:\n\n" +
      "/schedule - View your current prompt schedule\n\n" +
      "/schedule on - Enable weekly prompts\n" +
      "/schedule off - Disable weekly prompts\n\n" +
      "/schedule day [day] - Set the day to receive prompts\n" +
      "  Example: /schedule day monday\n" +
      "  Options: sunday, monday, tuesday, etc.\n\n" +
      "/schedule time [time] - Set the time to receive prompts\n" +
      "  Example: /schedule time 09:00\n" +
      "  Format: 24-hour time (HH:MM)\n\n" +
      "All prompts are sent in Singapore timezone (Asia/Singapore)."
    );
  }

  /**
   * Enable automatic prompts for a user
   */
  private async enableSchedule(ctx: Context, userId: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // If already enabled, no need to update
    if (user.schedulePreference && user.schedulePreference.enabled) {
      await ctx.reply("✅ Your weekly prompts are already enabled!");
      return;
    }
    
    await this.userService.updateSchedulePreference(userId, {
      enabled: true,
      lastUpdated: Timestamp.now()
    });
    
    await ctx.reply(
      "✅ Weekly prompts enabled!\n\n" +
      "You'll now receive reflection prompts according to your schedule. " +
      "Use /schedule to view or modify your schedule."
    );
  }

  /**
   * Disable automatic prompts for a user
   */
  private async disableSchedule(ctx: Context, userId: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // If already disabled, no need to update
    if (user.schedulePreference && !user.schedulePreference.enabled) {
      await ctx.reply("❌ Your weekly prompts are already disabled!");
      return;
    }
    
    await this.userService.updateSchedulePreference(userId, {
      enabled: false,
      lastUpdated: Timestamp.now()
    });
    
    await ctx.reply(
      "❌ Weekly prompts disabled.\n\n" +
      "You won't receive automatic prompts anymore. " +
      "You can still get prompts anytime with /prompt or " +
      "re-enable automatic prompts with /schedule on."
    );
  }

  /**
   * Set the day of the week for scheduled prompts
   */
  private async setScheduleDay(ctx: Context, userId: string, dayInput: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Convert day name to index (0-6, where 0 is Sunday)
    const dayName = dayInput.toLowerCase();
    const dayIndex = this.daysOfWeek.findIndex(
      day => day.toLowerCase() === dayName
    );
    
    if (dayIndex === -1) {
      await ctx.reply(
        "I couldn't recognize that day. Please use a day name like 'monday' or 'tuesday'."
      );
      return;
    }
    
    // Get current enabled status (default to true if not set)
    const currentEnabled = user.schedulePreference?.enabled ?? true;
    
    // Update schedule preferences
    await this.userService.updateSchedulePreference(userId, {
      dayOfWeek: dayIndex,
      enabled: currentEnabled,
      lastUpdated: Timestamp.now()
    });
    
    await ctx.reply(
      `✅ Your prompt day has been set to ${this.daysOfWeek[dayIndex]}.\n\n` +
      `You'll receive prompts on ${this.daysOfWeek[dayIndex]}s at ` +
      `${this.formatTime(user.schedulePreference?.hour || 9, user.schedulePreference?.minute || 0)} (${TIMEZONE}).`
    );
  }

  /**
   * Set the time for scheduled prompts
   */
  private async setScheduleTime(ctx: Context, userId: string, timeInput: string): Promise<void> {
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      await ctx.reply("Please start the bot with /start first!");
      return;
    }
    
    // Parse time input (expected format: HH:MM in 24-hour time)
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeInput.match(timeRegex);
    
    if (!match) {
      await ctx.reply(
        "I couldn't recognize that time format. Please use 24-hour format like '09:00' or '14:30'."
      );
      return;
    }
    
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    
    // Validate hour and minute
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      await ctx.reply(
        "Invalid time. Hours must be between 0-23 and minutes between 0-59."
      );
      return;
    }
    
    // Get current user preferences
    const prefs = user.schedulePreference;
    const dayOfWeek = prefs?.dayOfWeek ?? 1; // Default to Monday
    const enabled = prefs?.enabled ?? true;  // Default to enabled
    
    // Update schedule preferences
    await this.userService.updateSchedulePreference(userId, {
      hour,
      minute,
      dayOfWeek,
      enabled,
      lastUpdated: Timestamp.now()
    });
    
    await ctx.reply(
      `✅ Your prompt time has been set to ${this.formatTime(hour, minute)}.\n\n` +
      `You'll receive prompts on ${this.daysOfWeek[dayOfWeek]}s at ` +
      `${this.formatTime(hour, minute)} (${TIMEZONE}).`
    );
  }

  /**
   * Format time in 12-hour format for display
   */
  private formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    const displayMinute = minute.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinute} ${period}`;
  }
}

export default ScheduleHandlers;