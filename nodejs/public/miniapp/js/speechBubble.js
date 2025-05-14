// speechBubble.js - Speech bubble functionality

import { DINO_SPEECH, TIMING, ELEMENTS } from './config.js';
import { provideHapticFeedback } from './telegramApp.js';

/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Show a speech bubble with a random encouraging message
 * @param {Object} tg - Telegram WebApp instance
 */
export function showSpeechBubble(tg) {
    const speechBubble = document.getElementById(ELEMENTS.SPEECH_BUBBLE);
    
    // Set random message
    speechBubble.textContent = getRandomItem(DINO_SPEECH);
    
    // Show the bubble
    speechBubble.classList.add('show');
    
    console.log("Showing speech bubble:", speechBubble.textContent);
    
    // Hide after delay
    setTimeout(() => {
        speechBubble.classList.remove('show');
    }, TIMING.SPEECH_DURATION);
    
    // Provide haptic feedback
    provideHapticFeedback(tg, 'light');
}