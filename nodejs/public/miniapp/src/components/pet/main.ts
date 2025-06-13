// nodejs/public/miniapp/src/components/pet/app.ts
import { TelegramWebApp } from '../../types/miniapp';
import { TIMING, ELEMENTS } from '../../config/pet';
import { initTelegramApp, notifyAppReady } from './telegramApp';
import { updateTheme } from '../../ui/petTheme';
import { 
    setBackgroundImage, 
    setInitialDinoImage, 
    setupDinoInteraction 
} from './dinoInteraction';
import { showSpeechBubble } from './speechBubble';

/**
 * Initialize and start the application
 */
export function initApp(): void {
    // Get Telegram WebApp instance
    const tg = initTelegramApp();
    
    // Set theme based on Telegram settings
    updateTheme(tg);
    
    // Set background image
    setBackgroundImage();
    
    // Set initial dino image
    setInitialDinoImage();
    
    // Set up event listeners for the dino
    setupDinoEventListeners(tg);
    
    // Show a welcome speech bubble after a short delay
    setTimeout(() => showSpeechBubble(tg), TIMING.INITIAL_SPEECH_DELAY);
    
    // Hide loading spinner
    const loadingElement = document.getElementById(ELEMENTS.LOADING);
    if (loadingElement) {
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, TIMING.LOADING_HIDE_DELAY);
    }
    
    // Set up theme change handler
    tg.onEvent('themeChanged', () => updateTheme(tg));
    
    // Notify Telegram that the Mini App is ready
    notifyAppReady(tg);
    
    console.log("ThyKnow Dino Friend app fully initialized");
}

/**
 * Set up event listeners for the dinosaur image
 * @param tg - Telegram WebApp instance
 */
function setupDinoEventListeners(tg: TelegramWebApp): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (!dinoImage) {
        console.error("Dino image element not found");
        return;
    }
    
    if (dinoImage.complete) {
        console.log("Dino image already loaded");
        setupDinoInteraction(tg);
    } else {
        console.log("Waiting for dino image to load...");
        dinoImage.onload = () => {
            console.log("Dino image loaded");
            setupDinoInteraction(tg);
        };
    }
}