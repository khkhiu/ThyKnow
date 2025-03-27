// src/handlers/export-handler.ts
import { Context } from 'telegraf';
import moment from 'moment-timezone';
import UserService from '../services/user-service';
import { JournalEntry } from '../types';
import { TIMEZONE } from '../constants';

export class ExportHandler {
  private userService: UserService;
  
  constructor(userService: UserService) {
    this.userService = userService;
  }
  
  /**
   * Handle the /export command to generate and send a user's journal entries
   */
  exportJournal = async (ctx: Context): Promise<void> => {
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
      
      // Notify user that export is being prepared
      await ctx.reply("I'm preparing your journal export. This might take a moment...");
      
      // Get all journal entries for this user (not just recent ones)
      const entries = await this.getAllJournalEntries(userId);
      
      if (entries.length === 0) {
        await ctx.reply("You don't have any journal entries yet. Use /prompt to start journaling!");
        return;
      }
      
      // Generate exports in different formats
      const textExport = this.generateTextExport(entries);
      const jsonExport = this.generateJsonExport(entries);
      
      // Send text format first
      if (textExport.length > 4000) {
        // Split into multiple messages if too long
        const chunks = this.splitTextIntoChunks(textExport, 4000);
        await ctx.reply("Your journal is quite extensive! I'll send it in multiple messages:");
        
        for (const chunk of chunks) {
          await ctx.reply(chunk);
        }
      } else {
        await ctx.reply(textExport);
      }
      
      // Send JSON as a file for backup purposes
      const buffer = Buffer.from(jsonExport, 'utf8');
      await ctx.replyWithDocument(
        { source: buffer, filename: `journal_export_${moment().format('YYYY-MM-DD')}.json` },
        { caption: "Here's your journal in JSON format for backup purposes." }
      );
      
      await ctx.reply(
        "Export complete! I've sent your journal entries in text format for easy reading, " +
        "and as a JSON file for backup. You can import the JSON file back into the bot " +
        "or other journaling apps that support this format."
      );
    } catch (error) {
      console.error('Error exporting journal:', error);
      await ctx.reply("Sorry, there was an error exporting your journal. Please try again later.");
    }
  }
  
  /**
   * Get all journal entries for a user
   */
  private async getAllJournalEntries(userId: string): Promise<JournalEntry[]> {
    // This is a placeholder - in a real implementation, you'd need to 
    // paginate through all entries in Firestore, as there could be thousands
    // You might need to implement batching for large journals
    
    // For now, we'll limit to 100 entries as an example
    return this.userService.getRecentEntries(userId, 100);
  }
  
  /**
   * Generate a human-readable text export of journal entries
   */
  private generateTextExport(entries: JournalEntry[]): string {
    let textExport = "📔 YOUR JOURNAL EXPORT 📔\n\n";
    
    // Sort entries by timestamp (oldest first)
    const sortedEntries = [...entries].sort((a, b) => 
      a.timestamp.toMillis() - b.timestamp.toMillis()
    );
    
    // Group entries by month for better organization
    const entriesByMonth: Record<string, JournalEntry[]> = {};
    
    sortedEntries.forEach(entry => {
      const monthYear = moment(entry.timestamp.toDate())
        .tz(TIMEZONE)
        .format('MMMM YYYY');
        
      if (!entriesByMonth[monthYear]) {
        entriesByMonth[monthYear] = [];
      }
      
      entriesByMonth[monthYear].push(entry);
    });
    
    // Generate formatted text for each month
    Object.entries(entriesByMonth).forEach(([monthYear, monthEntries]) => {
      textExport += `\n== ${monthYear} ==\n\n`;
      
      monthEntries.forEach(entry => {
        const date = moment(entry.timestamp.toDate())
          .tz(TIMEZONE)
          .format('YYYY-MM-DD [at] HH:mm');
          
        const category = entry.promptType === 'self_awareness' 
          ? '🧠 Self-Awareness' 
          : '🤝 Connections';
          
        textExport += `📅 ${date} (${category})\n`;
        textExport += `Q: ${entry.prompt}\n`;
        textExport += `A: ${entry.response}\n\n`;
      });
    });
    
    textExport += "End of journal export.\n";
    return textExport;
  }
  
  /**
   * Generate a JSON export of journal entries
   */
  private generateJsonExport(entries: JournalEntry[]): string {
    // Convert Firestore timestamps to ISO strings for JSON serialization
    const serializedEntries = entries.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toDate().toISOString()
    }));
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      entries: serializedEntries
    }, null, 2);
  }
  
  /**
   * Split text into chunks of specified maximum size, preserving whole lines
   */
  private splitTextIntoChunks(text: string, maxSize: number): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    
    let currentChunk = '';
    
    for (const line of lines) {
      // If adding this line would exceed the limit, start a new chunk
      if (currentChunk.length + line.length + 1 > maxSize) {
        chunks.push(currentChunk);
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
}

export default ExportHandler;