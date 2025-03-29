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

// User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  id: string; // Telegram user ID
  createdAt: Date;
  promptCount: number;
  lastPrompt?: ILastPrompt;
}

// User schema
const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true }, // Telegram user ID
  createdAt: { type: Date, default: Date.now },
  promptCount: { type: Number, default: 0 },
  lastPrompt: { type: lastPromptSchema, required: false }
});

// Create and export the User model
export const User = mongoose.model<IUser>('User', userSchema);