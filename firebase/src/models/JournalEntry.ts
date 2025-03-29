import mongoose, { Document, Schema, Types } from 'mongoose';
import { PromptType } from '../types';

// Journal entry interface
export interface IJournalEntry extends Document {
  _id: Types.ObjectId;
  userId: string;
  prompt: string;
  promptType: PromptType;
  response: string;
  timestamp: Date;
}

// Journal entry schema
const journalEntrySchema = new Schema<IJournalEntry>({
  userId: { type: String, required: true, index: true },
  prompt: { type: String, required: true },
  promptType: { type: String, enum: ['self_awareness', 'connections'], required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient querying by userId and timestamp
journalEntrySchema.index({ userId: 1, timestamp: -1 });

// Create and export the JournalEntry model
export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);