// public/miniapp/src/components/prompt.ts
/**
 * Prompt component functionality
 */
import { Prompt } from '../types';
import { showNotification } from '../utils/uiUtils';
import { hapticFeedback } from '../utils/telegramUtils';
import { fetchHistoryEntries } from '../services/apiService';
import { updateHistory } from './history';

/**
 * Update prompt UI with new prompt data
 */
export function updatePrompt(promptData: Prompt): void {
  if (!promptData) return;
  
  const promptTypeElement = document.querySelector('.prompt-type');
  const promptTextElement = document.querySelector('.prompt-text');
  const promptHintElement = document.querySelector('.prompt-hint');
  
  if (promptTypeElement) {
    promptTypeElement.textContent = promptData.typeLabel || 'Today\'s Prompt';
  }
  
  if (promptTextElement) {
    promptTextElement.textContent = promptData.text || 'No prompt available for today.';
  }
  
  if (promptHintElement) {
    promptHintElement.textContent = promptData.hint || '';
  }
}

/**
 * Show completed state to encourage user to get a new prompt
 */
export function showCompletedState(): void {
  // Get prompt card and add a "completed" class
  const promptCard = document.querySelector('.prompt-card');
  if (promptCard) {
    promptCard.classList.add('completed');
  }
  
  // Focus attention on the "New Prompt" button
  const newPromptButton = document.getElementById('new-prompt-button');
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
  if (newPromptButton) {
    newPromptButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add a gentle pulse animation to the button
    setTimeout(() => {
      // Remove the pulse class after a few seconds
      newPromptButton.classList.remove('pulse-attention');
    }, 5000);
  }
}

/**
 * Handle submit response button click
 */
export async function handleSubmitResponse(): Promise<void> {
  const responseTextarea = document.getElementById('response') as HTMLTextAreaElement;
  const responseText = responseTextarea?.value.trim();
  
  if (!responseText) {
    showNotification('Please enter your response first');
    return;
  }
  
  try {
    // Show loading state
    const submitButton = document.getElementById('submit-response') as HTMLButtonElement;
    const originalButtonText = submitButton.textContent || 'Save Response';
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    // Clear the response field
    responseTextarea.value = '';
    
    // Show success notification
    showNotification('Response saved successfully! Use the "New Prompt" button when you\'re ready for a new prompt.');
    
    // Notify Telegram app (vibrate and show notification)
    hapticFeedback('success');
    
    // Show the "completed" state to encourage using the New Prompt button
    showCompletedState();
    
    // Refresh history
    const historyData = await fetchHistoryEntries();
    updateHistory(historyData);
  } catch (error) {
    console.error('Error submitting response:', error);
    showNotification('Failed to save your response. Please try again.', 'error');
    hapticFeedback('error');
  }
}