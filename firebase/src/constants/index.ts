// src/constants/index.ts

// Re-export all constants from their respective files
import { PROMPTS, SELF_AWARENESS_PROMPTS, CONNECTIONS_PROMPTS } from './prompts';
import { COMMAND_DESCRIPTIONS } from './commands';
import { MESSAGES } from './messages';
import { FEEDBACK } from './feedback';

// Default timezone
export const TIMEZONE = 'Asia/Singapore';

// Export all the constants
export {
  PROMPTS,
  SELF_AWARENESS_PROMPTS,
  CONNECTIONS_PROMPTS,
  COMMAND_DESCRIPTIONS,
  MESSAGES,
  FEEDBACK
};