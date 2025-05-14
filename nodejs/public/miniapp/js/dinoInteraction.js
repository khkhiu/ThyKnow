// dinoInteraction.js - Dino animation and interactivity

import { IMAGES, TIMING, ELEMENTS } from './config.js';
import { provideHapticFeedback } from './telegramApp.js';
import { showSpeechBubble } from './speechBubble.js';

// State variables
let eyesOpen = true;
let isAnimating = false;

/**
 * Set background image from server
 */
export function setBackgroundImage() {
    document.getElementById(ELEMENTS.BACKGROUND).style.backgroundImage = `url('${IMAGES.BACKGROUND}')`;
    console.log("Background image set");
}

/**
 * Set initial dino image (eyes open)
 */
export function setInitialDinoImage() {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    dinoImage.src = IMAGES.DINO_EYES_OPEN;
    eyesOpen = true;
    isAnimating = false;
    
    console.log("Initial dino image set to eyes open");
}

/**
 * Toggle dino eyes between open and closed states
 * @param {Object} tg - Telegram WebApp instance
 */
function toggleDinoEyes(tg) {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    
    if (eyesOpen) {
        dinoImage.src = IMAGES.DINO_EYES_CLOSED;
        eyesOpen = false;
        console.log("Eyes closed");
    } else {
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        eyesOpen = true;
        console.log("Eyes opened");
    }
    
    // Provide haptic feedback
    provideHapticFeedback(tg);
}

/**
 * Handle dino tap/click event
 * @param {Event} e - Event object
 * @param {Object} tg - Telegram WebApp instance
 */
export function handleDinoTap(e, tg) {
    console.log("Dino tapped!");
    e.preventDefault();
    
    // Prevent multiple taps during animation
    if (isAnimating) {
        console.log("Animation in progress, ignoring tap");
        return;
    }
    
    // Set animation flag
    isAnimating = true;
    
    // Toggle dino eyes
    toggleDinoEyes(tg);
    
    // Show speech bubble
    showSpeechBubble(tg);
    
    // Apply blink animation
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    dinoImage.classList.add('blink');
    
    // Remove blink animation class after animation completes
    setTimeout(() => {
        dinoImage.classList.remove('blink');
    }, TIMING.BLINK_DURATION);
    
    // Blink eyes back open after a delay if they're currently closed
    if (!eyesOpen) {
        setTimeout(() => {
            dinoImage.src = IMAGES.DINO_EYES_OPEN;
            eyesOpen = true;
            // Reset animation flag after everything is done
            isAnimating = false;
            console.log("Auto-opened eyes after delay");
        }, TIMING.BLINK_DURATION);
    } else {
        // Reset animation flag if we started with eyes closed
        setTimeout(() => {
            isAnimating = false;
        }, TIMING.BLINK_DURATION);
    }
}

/**
 * Set up dino interaction (tap/click and touch events)
 * @param {Object} tg - Telegram WebApp instance
 */
export function setupDinoInteraction(tg) {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    
    // Center the dino
    centerDinoImage();
    
    console.log("Setting up dino interaction");
    
    // Add click event listener
    dinoImage.addEventListener('click', (e) => handleDinoTap(e, tg));
    
    // For mobile - add touch event listeners to ensure tapping works well
    dinoImage.addEventListener('touchstart', function(e) {
        // Just prevent default to avoid any scrolling issues
        e.preventDefault();
    });
    
    dinoImage.addEventListener('touchend', function(e) {
        // Call the same handler used for clicks
        handleDinoTap(e, tg);
    });
    
    console.log("Dino interaction setup complete");
}

/**
 * Center the dino image in its container for proper display
 */
function centerDinoImage() {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    const dinoContainer = document.querySelector('.dino-container');
    
    // Ensure the container is properly set up for centering
    dinoContainer.style.display = 'flex';
    dinoContainer.style.justifyContent = 'center';
    dinoContainer.style.alignItems = 'center';
    
    // Style the dino image for interaction
    dinoImage.style.position = 'static';
    dinoImage.style.cursor = 'pointer';
    
    console.log("Dino image centered");
}