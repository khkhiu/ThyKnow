// src/constants/prompts.ts
import { PromptsCollection } from '../types';

// Import from the separated files
import SELF_AWARENESS_PROMPTS from './prompts/selfAwarenessPrompts';
import CONNECTIONS_PROMPTS from './prompts/connectionsPrompts';

// Define prompts directly in the code for maximum reliability
// This maintains the original export structure exactly as it was
export const PROMPTS: PromptsCollection = {
  self_awareness: SELF_AWARENESS_PROMPTS,
  connections: CONNECTIONS_PROMPTS
};

// Export individual prompt arrays for direct access
// We directly re-export the imported arrays to avoid any reference issues
export { SELF_AWARENESS_PROMPTS };
export { CONNECTIONS_PROMPTS };