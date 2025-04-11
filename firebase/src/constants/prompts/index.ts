// src/constants/prompts/index.ts

import { PromptsCollection } from '../../types';
import SELF_AWARENESS_PROMPTS from './selfAwarenessPrompts';
import CONNECTIONS_PROMPTS from './connectionsPrompts';

/**
 * Combined collection of all prompts
 */

export const PROMPTS: PromptsCollection = {
  self_awareness: SELF_AWARENESS_PROMPTS,
  connections: CONNECTIONS_PROMPTS
};

// Export individual prompt arrays for direct access
export { SELF_AWARENESS_PROMPTS };
export { CONNECTIONS_PROMPTS };

export default PROMPTS;