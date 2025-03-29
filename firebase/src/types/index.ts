// Define prompt types
export type PromptType = 'self_awareness' | 'connections';

// Prompt structure
export interface Prompt {
  text: string;
  type: PromptType;
  count: number;
}

// Prompts collection
export interface PromptsCollection {
  self_awareness: string[];
  connections: string[];
}