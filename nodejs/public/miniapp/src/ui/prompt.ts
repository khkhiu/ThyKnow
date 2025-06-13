// public/miniapp/js/app/ui/prompt.ts
import { PromptData } from '../../../src/types/miniapp';
import { ELEMENTS } from '../../../src/config/app';
import { setElementText, scrollIntoView, addElementClass, removeElementClass } from '../utils/elements';

/**
 * Update prompt UI with new prompt data
 * @param promptData - Prompt data
 */
export function updatePrompt(promptData: PromptData | null): void {
  if (!promptData) return;
  
  // Set prompt type, text, and hint
  setElementText(ELEMENTS.PROMPT_TYPE, promptData.typeLabel || 'Today\'s Prompt');
  setElementText(ELEMENTS.PROMPT_TEXT, promptData.text || 'No prompt available for today.');
  setElementText(ELEMENTS.PROMPT_HINT, promptData.hint || '');
}

/**
 * Show completed state after user submits a response
 * @param newPromptButtonId - ID of the new prompt button
 */
export function showCompletedState(newPromptButtonId: string = ELEMENTS.NEW_PROMPT_BUTTON): void {
  // Get prompt card and add a "completed" class
  const promptCard = document.querySelector('.prompt-card');
  if (!promptCard) {
    console.error('Prompt card element not found');
    return;
  }
  
  promptCard.classList.add('completed');
  
  // Focus attention on the "New Prompt" button
  const newPromptButton = document.getElementById(newPromptButtonId);
  if (newPromptButton) {
    newPromptButton.classList.add('pulse-attention');
  }
  
  // Add a hint message inside the prompt card
  const completedMessage = document.createElement('div');
  completedMessage.className = 'completed-message';
  completedMessage.innerHTML = `
    <div class="completed-icon">✓</div>
    <p>Great job! You've completed this prompt.</p>
    <p class="completed-hint">Click "New Prompt" when you're ready for the next one.</p>
  `;
  
  // Insert after the prompt hint
  const promptHint = document.querySelector('.prompt-hint');
  if (promptHint) {
    promptHint.insertAdjacentElement('afterend', completedMessage);
  }
  
  // Scroll to make "New Prompt" button visible
  scrollIntoView(newPromptButtonId, { behavior: 'smooth', block: 'center' });
  
  // Remove the pulse class after a few seconds
  setTimeout(() => {
    removeElementClass(newPromptButtonId, 'pulse-attention');
  }, 5000);
}

/**
 * Reset prompt UI for a new prompt
 */
export function resetPromptUI(): void {
  // Remove completed class if it exists
  const promptCard = document.querySelector('.prompt-card');
  if (promptCard) {
    promptCard.classList.remove('completed');
  }
  
  // Remove the completed message if it exists
  const completedMessage = document.querySelector('.completed-message');
  if (completedMessage) {
    completedMessage.remove();
  }
}