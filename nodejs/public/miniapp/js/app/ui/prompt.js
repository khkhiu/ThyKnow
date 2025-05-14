// js/app/ui/prompt.js - Prompt UI operations

import { ELEMENTS } from '../config.js';
import { setElementText, scrollIntoView, addElementClass, removeElementClass } from '../utils/elements.js';

/**
 * Update prompt UI with new prompt data
 * @param {Object} promptData - Prompt data
 */
export function updatePrompt(promptData) {
  if (!promptData) return;
  
  // Set prompt type, text, and hint
  setElementText(ELEMENTS.PROMPT_TYPE, promptData.typeLabel || 'Today\'s Prompt');
  setElementText(ELEMENTS.PROMPT_TEXT, promptData.text || 'No prompt available for today.');
  setElementText(ELEMENTS.PROMPT_HINT, promptData.hint || '');
}

/**
 * Show completed state after user submits a response
 * @param {string} newPromptButtonId - ID of the new prompt button
 */
export function showCompletedState(newPromptButtonId = ELEMENTS.NEW_PROMPT_BUTTON) {
  // Get prompt card and add a "completed" class
  const promptCard = document.querySelector('.prompt-card');
  promptCard.classList.add('completed');
  
  // Focus attention on the "New Prompt" button
  const newPromptButton = document.getElementById(newPromptButtonId);
  newPromptButton.classList.add('pulse-attention');
  
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
  promptHint.insertAdjacentElement('afterend', completedMessage);
  
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
export function resetPromptUI() {
  // Remove completed class if it exists
  const promptCard = document.querySelector('.prompt-card');
  promptCard.classList.remove('completed');
  
  // Remove the completed message if it exists
  const completedMessage = document.querySelector('.completed-message');
  if (completedMessage) {
    completedMessage.remove();
  }
}