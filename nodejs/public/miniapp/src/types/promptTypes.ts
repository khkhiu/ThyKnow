// public/miniapp/src/types/promptTypes.ts
export interface Prompt {
  type: 'self_awareness' | 'connections';
  typeLabel: string;
  text: string;
  hint: string;
}

// Response submission data
export interface PromptResponse {
  userId: string;
  response: string;
}

// Types for response results
export interface ResponseResult {
  success: boolean;
  message: string;
  entryId: string;
  needsNewPrompt: boolean;
}