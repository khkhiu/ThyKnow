// src/constants/prompts.ts
import { PromptsCollection } from '../types';

// Define prompts directly in the code for maximum reliability
export const PROMPTS: PromptsCollection = {
  self_awareness: [
    "What emotions have you experienced most frequently this week? What triggered them?",
    "Describe a situation where you felt truly authentic. What made it special?",
    "What personal values were challenged or reinforced this week?",
    "What patterns have you noticed in your reactions to stress lately?",
    "What's one thing you'd like to change about how you handle difficult conversations?",
    "How have your priorities shifted in the past few months?",
    "What recent experience has taught you something new about yourself?"
  ],
  connections: [
    "Which relationship in your life has grown the most recently? How?",
    "What conversation this week made you feel most understood?",
    "How have you shown appreciation to others this week?",
    "What boundaries have you set or need to set in your relationships?",
    "Who would you like to reconnect with, and what's holding you back?",
    "How has someone surprised you positively this week?",
    "What qualities do you admire most in your closest friends?"
  ]
};

// Export individual prompt arrays for direct access
export const SELF_AWARENESS_PROMPTS = PROMPTS.self_awareness;
export const CONNECTIONS_PROMPTS = PROMPTS.connections;