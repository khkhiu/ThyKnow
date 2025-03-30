# telegram_bot/src/handlers/command_handlers.py

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler, CallbackQueryHandler
from datetime import datetime
from src.models.user import User, SchedulePreference

# Define conversation states
CHOOSING_DAY = 1
CHOOSING_TIME = 2

async def schedule(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /schedule command.
    
    Shows the user's current schedule preferences and options to change them.
    """
    if not update.effective_user:
        logger.error("No effective user found in update")
        return

    user_id = str(update.effective_user.id)
    user = self.storage.get_user(user_id)
    
    if not user:
        await update.message.reply_text(
            "Please start the bot with /start first!"
        )
        return
    
    # Get day names
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    current_day = day_names[user.schedule_preference.day]
    current_hour = user.schedule_preference.hour
    status = "enabled" if user.schedule_preference.enabled else "disabled"
    
    # Create message showing current schedule
    schedule_text = (
        f"📅 Your current prompt schedule:\n\n"
        f"Day: {current_day}\n"
        f"Time: {current_hour}:00\n"
        f"Status: {status}\n\n"
        f"Use these commands to change your schedule:\n"
        f"/schedule_day - Change the day\n"
        f"/schedule_time - Change the time\n"
        f"/schedule_toggle - Turn weekly prompts on/off"
    )
    
    await update.message.reply_text(schedule_text)

async def schedule_day(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /schedule_day command.
    
    Shows an inline keyboard with days of the week.
    """
    if not update.effective_user:
        logger.error("No effective user found in update")
        return

    user_id = str(update.effective_user.id)
    user = self.storage.get_user(user_id)
    
    if not user:
        await update.message.reply_text(
            "Please start the bot with /start first!"
        )
        return

    # Create keyboard with days of the week
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    keyboard = []
    
    for i, day in enumerate(day_names):
        keyboard.append([InlineKeyboardButton(day, callback_data=f"day:{i}")])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Select a day to receive your weekly prompts:",
        reply_markup=reply_markup
    )
    
    return CHOOSING_DAY

async def schedule_time(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /schedule_time command.
    
    Shows an inline keyboard with hours of the day.
    """
    if not update.effective_user:
        logger.error("No effective user found in update")
        return

    user_id = str(update.effective_user.id)
    user = self.storage.get_user(user_id)
    
    if not user:
        await update.message.reply_text(
            "Please start the bot with /start first!"
        )
        return

    # Create keyboard with hours (0-23)
    keyboard = []
    row = []
    
    for hour in range(24):
        row.append(InlineKeyboardButton(f"{hour}:00", callback_data=f"time:{hour}"))
        
        # Create rows with 4 buttons each
        if len(row) == 4:
            keyboard.append(row)
            row = []
    
    # Add any remaining buttons
    if row:
        keyboard.append(row)
        
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Select the hour to receive your weekly prompts (in 24-hour format):",
        reply_markup=reply_markup
    )
    
    return CHOOSING_TIME

async def schedule_toggle(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /schedule_toggle command.
    
    Toggles whether the user receives weekly prompts.
    """
    if not update.effective_user:
        logger.error("No effective user found in update")
        return

    user_id = str(update.effective_user.id)
    user = self.storage.get_user(user_id)
    
    if not user:
        await update.message.reply_text(
            "Please start the bot with /start first!"
        )
        return
    
    # Toggle the enabled status
    user.schedule_preference.enabled = not user.schedule_preference.enabled
    self.storage.add_user(user)
    
    status = "enabled" if user.schedule_preference.enabled else "disabled"
    
    await update.message.reply_text(
        f"✅ Weekly prompts are now {status}."
    )

async def handle_schedule_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle callbacks from schedule inline keyboards.
    
    Updates user preferences based on their selection.
    """
    query = update.callback_query
    await query.answer()
    
    user_id = str(update.effective_user.id)
    user = self.storage.get_user(user_id)
    
    if not user:
        await query.edit_message_text(
            "Error: User not found. Please use /start first."
        )
        return ConversationHandler.END
    
    # Get the callback data
    data = query.data
    
    if data.startswith("day:"):
        day = int(data.split(":")[1])
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        # Update the user's preference
        user.schedule_preference.day = day
        self.storage.add_user(user)
        
        await query.edit_message_text(
            f"✅ Day set to {day_names[day]}! You will receive prompts on {day_names[day]} at {user.schedule_preference.hour}:00."
        )
        return ConversationHandler.END
    
    elif data.startswith("time:"):
        hour = int(data.split(":")[1])
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        # Update the user's preference
        user.schedule_preference.hour = hour
        self.storage.add_user(user)
        
        await query.edit_message_text(
            f"✅ Time set to {hour}:00! You will receive prompts on {day_names[user.schedule_preference.day]} at {hour}:00."
        )
        return ConversationHandler.END
    
    return ConversationHandler.END

async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /help command.
    
    Shows available commands and their usage.
    """
    help_text = (
        "🤖 Available Commands:\n\n"
        "• /start - Initialize the bot and get started\n"
        "• /prompt - Get a new reflection prompt\n"
        "• /history - View your recent journal entries\n"
        "• /timezone - Check prompt timings\n"
        "• /help - Show this help message\n\n"
        "📅 Schedule Management:\n"
        "• /schedule - View your current prompt schedule\n"
        "• /schedule_day - Set the day to receive prompts\n"
        "• /schedule_time - Set the time to receive prompts\n"
        "• /schedule_toggle - Turn weekly prompts on/off\n\n"
        "📝 How to use:\n"
        "1. Use /start to begin\n"
        "2. Get prompts with /prompt\n"
        "3. View your entries with /history\n"
        "4. Set your preferred schedule with /schedule\n\n"
        "✨ You will receive weekly prompts according to your schedule preferences."
    )
    await update.message.reply_text(help_text)


# Update the start method in telegram_bot/src/handlers/command_handlers.py

async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle the /start command.
    
    Creates a new user if they don't exist and sends welcome message.
    """
    if not update.effective_user:
        logger.error("No effective user found in update")
        return

    user_id = str(update.effective_user.id)
    
    if not self.storage.get_user(user_id):
        user = User(id=user_id)
        self.storage.add_user(user)
        logger.info(f"Created new user with ID: {user_id}")

    welcome_message = (
        "Welcome to your personal journaling companion! 🌟\n\n"
        "I'll send you weekly prompts to help you reflect on:\n"
        "• Self-awareness 🤔\n"
        "• Building meaningful connections 🤝\n\n"
        "Commands:\n"
        "/prompt - Get a new reflection prompt\n"
        "/history - View your recent journal entries\n"
        "/schedule - Manage your prompt schedule\n"
        "/timezone - Check prompt timings\n"
        "/help - Shows all available commands\n\n"
        "Let's start your journaling journey! Use /prompt to get your first question."
    )
    await update.message.reply_text(welcome_message)