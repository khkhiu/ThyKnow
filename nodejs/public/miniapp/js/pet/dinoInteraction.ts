// public/miniapp/js/pet/dinoInteraction.ts
import { TelegramWebApp } from '../../types/miniapp';
import { DinoState } from '../../types/dinoFriend';
import { IMAGES, TIMING, ELEMENTS } from './config';
import { provideHapticFeedback } from './telegramApp';
import { showSpeechBubble } from './speechBubble';

// State variables
const state: DinoState = {
    eyesOpen: true,
    isAnimating: false
};

/**
 * Set background image from server
 */
export function setBackgroundImage(): void {
    const backgroundElement = document.getElementById(ELEMENTS.BACKGROUND);
    if (backgroundElement) {
        (backgroundElement as HTMLElement).style.backgroundImage = `url('${IMAGES.BACKGROUND}')`;
        console.log("Background image set");
    }
}

/**
 * Set initial dino image (eyes open)
 */
export function setInitialDinoImage(): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (dinoImage) {
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        state.eyesOpen = true;
        state.isAnimating = false;
        
        console.log("Initial dino image set to eyes open");
    }
}

/**
 * Toggle dino eyes between open and closed states
 * @param tg - Telegram WebApp instance
 */
function toggleDinoEyes(tg: TelegramWebApp): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (!dinoImage) return;
    
    if (state.eyesOpen) {
        dinoImage.src = IMAGES.DINO_EYES_CLOSED;
        state.eyesOpen = false;
        console.log("Eyes closed");
    } else {
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        state.eyesOpen = true;
        console.log("Eyes opened");
    }
    
    // Provide haptic feedback
    provideHapticFeedback(tg);
}

/**
 * Handle dino tap/click event
 * @param e - Event object
 * @param tg - Telegram WebApp instance
 */
export function handleDinoTap(e: Event, tg: TelegramWebApp): void {
    console.log("Dino tapped!");
    e.preventDefault();
    
    // Prevent multiple taps during animation
    if (state.isAnimating) {
        console.log("Animation in progress, ignoring tap");
        return;
    }
    
    // Set animation flag
    state.isAnimating = true;
    
    // Toggle dino eyes
    toggleDinoEyes(tg);
    
    // Show speech bubble
    showSpeechBubble(tg);
    
    // Apply blink animation
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    if (!dinoImage) {
        state.isAnimating = false;
        return;
    }
    
    dinoImage.classList.add('blink');
    
    // Remove blink animation class after animation completes
    setTimeout(() => {
        dinoImage.classList.remove('blink');
    }, TIMING.BLINK_DURATION);
    
    // Blink eyes back open after a delay if they're currently closed
    if (!state.eyesOpen) {
        setTimeout(() => {
            const updatedDinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
            if (updatedDinoImage) {
                updatedDinoImage.src = IMAGES.DINO_EYES_OPEN;
                state.eyesOpen = true;
            }
            // Reset animation flag after everything is done
            state.isAnimating = false;
            console.log("Auto-opened eyes after delay");
        }, TIMING.BLINK_DURATION);
    } else {
        // Reset animation flag if we started with eyes closed
        setTimeout(() => {
            state.isAnimating = false;
        }, TIMING.BLINK_DURATION);
    }
}

/**
 * Set up dino interaction (tap/click and touch events)
 * @param tg - Telegram WebApp instance
 */
export function setupDinoInteraction(tg: TelegramWebApp): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    if (!dinoImage) {
        console.error("Dino image element not found");
        return;
    }
    
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
function centerDinoImage(): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    const dinoContainer = document.querySelector('.dino-container');
    
    if (!dinoImage || !dinoContainer) {
        console.error("Dino image or container element not found");
        return;
    }
    
    // Ensure the container is properly set up for centering
    (dinoContainer as HTMLElement).style.display = 'flex';
    (dinoContainer as HTMLElement).style.justifyContent = 'center';
    (dinoContainer as HTMLElement).style.alignItems = 'center';
    
    // Style the dino image for interaction
    (dinoImage as HTMLElement).style.position = 'static';
    (dinoImage as HTMLElement).style.cursor = 'pointer';
    
    console.log("Dino image centered");
}