// app.js - Main application initialization for ThyKnow dino friend page

import { TIMING, ELEMENTS } from './config.js';
import { initTelegramApp, notifyAppReady } from './telegramApp.js';
import { updateTheme } from './theme.js';
import { 
    setBackgroundImage, 
    setInitialDinoImage, 
    setupDinoInteraction 
} from './dinoInteraction.js';
import { showSpeechBubble } from './speechBubble.js';

/**
 * Initialize and start the application
 */
export function initApp() {
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
    setTimeout(() => {
        document.getElementById(ELEMENTS.LOADING).style.display = 'none';
    }, TIMING.LOADING_HIDE_DELAY);
    
    // Set up theme change handler
    tg.onEvent('themeChanged', () => updateTheme(tg));
    
    // Notify Telegram that the Mini App is ready
    notifyAppReady(tg);
    
    console.log("ThyKnow Dino Friend app fully initialized");
}

/**
 * Set up event listeners for the dinosaur image
 * @param {Object} tg - Telegram WebApp instance
 */
function setupDinoEventListeners(tg) {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    
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