// nodejs/public/miniapp/src/pet.ts
// Main entry point for the ThyKnow dino friend page
// IMPROVED VERSION: Uses centralized configuration to eliminate duplication bugs

// Import necessary modules and types
import { TelegramWebApp } from './types/miniapp';
import { DinoState } from './types/dinoFriend';

// IMPROVEMENT: Import centralized configuration instead of duplicating it
// This eliminates the possibility of configuration drift between files
import { IMAGES, TIMING, ELEMENTS, DINO_SPEECH } from './config/pet';

// Global state for the dino's current status
let dinoState: DinoState = {
    eyesOpen: true,
    isAnimating: false
};

/**
 * Initialize the Telegram WebApp
 * This ensures proper integration with the Telegram mini-app environment
 */
function initTelegramApp(): TelegramWebApp {
    const tg = window.Telegram.WebApp;
    
    // Configure the app for optimal user experience
    tg.expand();  // Use full available height
    tg.ready();   // Signal that the app is ready for interaction
    
    console.log('Telegram WebApp initialized for pet page');
    return tg;
}

/**
 * Set the background image for the pet page
 * This creates the scenic environment for your dino friend
 */
function setBackgroundImage(): void {
    const backgroundElement = document.getElementById(ELEMENTS.BACKGROUND);
    if (backgroundElement) {
        // Apply the background image using the centralized configuration
        // This ensures we're always using the correct, up-to-date image path
        (backgroundElement as HTMLElement).style.backgroundImage = `url('${IMAGES.BACKGROUND}')`;
        console.log("Background image set successfully");
    } else {
        console.warn("Background element not found - check HTML structure");
    }
}

/**
 * Set the initial dino image (eyes open state)
 * This is the default state when the page loads
 */
function setInitialDinoImage(): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (dinoImage) {
        // Use the centralized configuration to ensure correct image path
        // This prevents the bug you experienced where wrong images were loaded
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        dinoState.eyesOpen = true;
        dinoState.isAnimating = false;
        
        console.log("Initial dino image set to eyes open using centralized config");
    } else {
        console.error("Dino image element not found - check HTML structure");
    }
}

/**
 * Toggle between dino's open and closed eye states
 * This is the core of the interactive blinking behavior
 */
function toggleDinoEyes(tg: TelegramWebApp): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (!dinoImage) {
        console.error("Cannot toggle eyes: dino image element not found");
        return;
    }
    
    // Use centralized configuration for consistent image paths
    if (dinoState.eyesOpen) {
        // Switch to closed eyes
        dinoImage.src = IMAGES.DINO_EYES_CLOSED;
        dinoState.eyesOpen = false;
        console.log("Dino eyes closed");
    } else {
        // Switch back to open eyes
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        dinoState.eyesOpen = true;
        console.log("Dino eyes opened");
    }
    
    // Provide haptic feedback for enhanced mobile experience
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

/**
 * Show a random encouraging speech bubble from the dino
 * This adds personality and engagement to the interaction
 */
function showSpeechBubble(): void {
    const speechBubble = document.getElementById(ELEMENTS.SPEECH_BUBBLE);
    if (!speechBubble) {
        console.warn("Speech bubble element not found - check HTML structure");
        return;
    }
    
    // Select a random message from the centralized speech configuration
    // This makes it easy to add new messages by just updating the config file
    const randomMessage = DINO_SPEECH[Math.floor(Math.random() * DINO_SPEECH.length)];
    speechBubble.textContent = randomMessage;
    
    // Show the speech bubble with smooth animation
    speechBubble.style.opacity = '1';
    speechBubble.style.transform = 'translateY(0)';
    
    // Hide the speech bubble after the centrally-configured duration
    setTimeout(() => {
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = 'translateY(10px)';
    }, TIMING.SPEECH_DURATION);
    
    console.log(`Dino says: "${randomMessage}"`);
}

/**
 * Handle dino tap/click interaction
 * This orchestrates the complete interaction: blinking, speech, and animations
 */
function handleDinoTap(e: Event, tg: TelegramWebApp): void {
    console.log("Dino tapped!");
    e.preventDefault();
    
    // Prevent multiple interactions during animation to avoid glitches
    if (dinoState.isAnimating) {
        console.log("Animation in progress, ignoring tap");
        return;
    }
    
    // Set animation flag to prevent overlapping interactions
    dinoState.isAnimating = true;
    
    // Perform the eye toggle using centralized logic
    toggleDinoEyes(tg);
    
    // Show encouraging message
    showSpeechBubble();
    
    // Add visual blink animation
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    if (dinoImage) {
        dinoImage.classList.add('blink');
        
        // Remove the animation class after the centrally-configured duration
        setTimeout(() => {
            dinoImage.classList.remove('blink');
        }, TIMING.BLINK_DURATION);
    }
    
    // Auto-return to eyes open state after blinking if eyes were closed
    if (!dinoState.eyesOpen) {
        setTimeout(() => {
            const updatedDinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
            if (updatedDinoImage) {
                // Use centralized configuration for consistency
                updatedDinoImage.src = IMAGES.DINO_EYES_OPEN;
                dinoState.eyesOpen = true;
                console.log("Auto-opened eyes after blink");
            }
            // Reset animation flag
            dinoState.isAnimating = false;
        }, TIMING.BLINK_DURATION);
    } else {
        // Reset animation flag if no auto-open is needed
        setTimeout(() => {
            dinoState.isAnimating = false;
        }, TIMING.BLINK_DURATION);
    }
}

/**
 * Set up all dino interactions and event listeners
 * This configures both mouse and touch events for cross-platform compatibility
 */
function setupDinoInteraction(tg: TelegramWebApp): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE);
    if (!dinoImage) {
        console.error("Cannot setup interaction: dino image element not found");
        return;
    }
    
    console.log("Setting up dino interaction events");
    
    // Add click event listener for desktop interaction
    dinoImage.addEventListener('click', (e) => handleDinoTap(e, tg));
    
    // Add touch event listeners for mobile devices
    dinoImage.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior that might interfere
    });
    
    dinoImage.addEventListener('touchend', function(e) {
        handleDinoTap(e, tg);
    });
    
    // Add keyboard accessibility support (spacebar or enter when focused)
    dinoImage.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            handleDinoTap(e, tg);
        }
    });
}

/**
 * Hide the loading spinner and show the main content
 * This provides smooth visual transition from loading to interactive state
 */
function hideLoadingSpinner(): void {
    const loadingElement = document.getElementById(ELEMENTS.LOADING);
    if (loadingElement) {
        loadingElement.style.display = 'none';
        console.log("Loading spinner hidden");
    }
}

/**
 * Initialize the pet page application
 * This is the main orchestrator that coordinates all setup activities
 */
function initPetApp(): void {
    console.log('🦕 Initializing ThyKnow Dino Friend page...');
    
    try {
        // Initialize Telegram WebApp integration
        const tg = initTelegramApp();
        
        // Set up the visual environment using centralized configuration
        setBackgroundImage();
        setInitialDinoImage();
        
        // Configure user interactions
        setupDinoInteraction(tg);
        
        // Show the initial welcome message after a brief delay (from config)
        setTimeout(() => {
            showSpeechBubble();
        }, TIMING.INITIAL_SPEECH_DELAY);
        
        // Hide loading spinner and show content (timing from config)
        setTimeout(() => {
            hideLoadingSpinner();
        }, TIMING.LOADING_HIDE_DELAY);
        
        console.log('✅ Pet app initialization complete - all configuration centralized');
        
    } catch (error) {
        console.error('❌ Error initializing pet app:', error);
        
        // Fallback: at least hide the loading spinner so user can see something
        setTimeout(() => {
            hideLoadingSpinner();
        }, TIMING.LOADING_HIDE_DELAY);
    }
}

// Start the application when the DOM is fully loaded
// This ensures all HTML elements are available before we try to interact with them
document.addEventListener('DOMContentLoaded', initPetApp);