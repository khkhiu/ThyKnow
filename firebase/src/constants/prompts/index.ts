// src/constants/prompts/index.ts
import path from 'path';
import { loadPromptsFromMarkdown } from './promptLoader';
import { PromptsCollection } from '../../types';

// Define paths to markdown files
const SELF_AWARENESS_PATH = path.join(__dirname, 'self_awareness.md');
const CONNECTIONS_PATH = path.join(__dirname, 'connections.md');

// Fallback prompts in case markdown files fail to load
const FALLBACK_PROMPTS: PromptsCollection = {
  self_awareness: [
    "What emotions have you experienced most frequently this week? What triggered them?",
    "What recent experience has taught you something new about yourself?"
  ],
  connections: [
    "Which relationship in your life has grown the most recently? How?",
    "What qualities do you admire most in your closest friends?"
  ]
};

// Load prompts from markdown files
const selfAwarenessPrompts = loadPromptsFromMarkdown(SELF_AWARENESS_PATH);
const connectionsPrompts = loadPromptsFromMarkdown(CONNECTIONS_PATH);

// Create the prompts collection, falling back to hardcoded prompts if necessary
export const PROMPTS: PromptsCollection = {
  self_awareness: selfAwarenessPrompts.length > 0 ? selfAwarenessPrompts : FALLBACK_PROMPTS.self_awareness,
  connections: connectionsPrompts.length > 0 ? connectionsPrompts : FALLBACK_PROMPTS.connections
};

// Export individual prompt arrays for direct access
export const SELF_AWARENESS_PROMPTS = PROMPTS.self_awareness;
export const CONNECTIONS_PROMPTS = PROMPTS.connections;