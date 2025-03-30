// firebase/src/models/User.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import { PromptType } from '../types';

// Last prompt schema
export interface ILastPrompt {
  text: string;
  type: PromptType;
  timestamp: Date;
}

const lastPromptSchema = new Schema<ILastPrompt>({
  text: { type: String, required: true },
  type: { type: String, enum: ['self_awareness', 'connections'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// User schedule preferences
export interface ISchedulePreference {
  day: number; // 0-6 (Sunday to Saturday)
  hour: number; // 0-23
  enabled: boolean;
}

const schedulePreferenceSchema = new Schema<ISchedulePreference>({
  day: { type: Number, min: 0, max: 6, default: 1 }, // Monday by default
  hour: { type: Number, min: 0, max: 23, default: 9 }, // 9 AM by default
  enabled: { type: Boolean, default: true }
});

// User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  id: string; // Telegram user ID
  createdAt: Date;
  promptCount: number;
  lastPrompt?: ILastPrompt;
  schedulePreference: ISchedulePreference;
}

// User schema
const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true }, // Telegram user ID
  createdAt: { type: Date, default: Date.now },
  promptCount: { type: Number, default: 0 },
  lastPrompt: { type: lastPromptSchema, required: false },
  schedulePreference: { 
    type: schedulePreferenceSchema, 
    default: () => ({
      day: 1, // Monday
      hour: 9, // 9 AM
      enabled: true
    })
  }
});

// Create and export the User model
export const User = mongoose.model<IUser>('User', userSchema);