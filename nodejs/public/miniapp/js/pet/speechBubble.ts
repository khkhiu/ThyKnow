// public/miniapp/js/pet/speechBubble.ts
import { TelegramWebApp } from '../../../../src/types/miniapp';
import { DINO_SPEECH, TIMING, ELEMENTS } from './config';
import { provideHapticFeedback } from './telegramApp';

/**
 * Get a random item from an array
 * @param array - The array to select from
 * @returns A random item from the array
 */
function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Show a speech bubble with a random encouraging message
 * @param tg - Telegram WebApp instance
 */
export function showSpeechBubble(tg: TelegramWebApp): void {
    const speechBubble = document.getElementById(ELEMENTS.SPEECH_BUBBLE);
    if (!speechBubble) {
        console.error("Speech bubble element not found");
        return;
    }
    
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