// public/miniapp/pet.ts
// Main entry point for the ThyKnow dino friend page

// Import necessary modules and types
import { TelegramWebApp } from './types/miniapp';
import { DinoState } from './types/dinoFriend';

// Image paths for dino states
const IMAGES = {
    DINO_EYES_OPEN: "/miniapp/images/ThyKnow_dino-eyes-open.png",
    DINO_EYES_CLOSED: "/miniapp/images/ThyKnow_dino-eyes-close.png",
    BACKGROUND: "/miniapp/images/ThyKnow_background.png"
};

// Animation timing constants (in milliseconds)
const TIMING = {
    BLINK_DURATION: 800,      // How long the blink animation lasts
    SPEECH_DURATION: 3000,    // How long speech bubbles remain visible
    INITIAL_SPEECH_DELAY: 1500, // Delay before showing the first speech bubble
    LOADING_HIDE_DELAY: 1000  // Delay before hiding the loading spinner
};

// DOM element IDs for easy reference
const ELEMENTS = {
    LOADING: 'loading',
    BACKGROUND: 'background',
    DINO_IMAGE: 'dino-image',
    SPEECH_BUBBLE: 'speech-bubble'
};

// Dino speech bubbles content - positive messages
const DINO_SPEECH = [
    "You're doing great!",
    "Rawr! That means 'awesome' in dinosaur!",
    "I believe in you!",
    "You've got this!",
    "Keep going, you're amazing!",
    "You make this dinosaur proud!",
    "Sending prehistoric good vibes!",
    "Your growth mindset is dino-mite!",
    "Remember to be kind to yourself!",
    "Even T-Rex had small arms but a big impact!"
];

// State variables
const state: DinoState = {
    eyesOpen: true,
    isAnimating: false
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("ThyKnow Dino Friend initializing...");
    
    // Initialize the application
    initApp();
    
    // Set up theme toggle button if it exists
    const themeToggleButton = document.querySelector('.theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
});

/**
 * Initialize and start the application
 */
function initApp(): void {
    try {
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
        tg.ready();
        
        console.log("ThyKnow Dino Friend app fully initialized");
    } catch (error) {
        console.error("Error initializing Dino Friend app:", error);
        showError("Failed to initialize the app. Please try again later.");
    }
}

/**
 * Initialize the Telegram Web App integration
 * @returns The Telegram WebApp instance
 */
function initTelegramApp(): TelegramWebApp {
    // Get the Telegram WebApp instance from the global window object
    const tg = window.Telegram.WebApp;
    
    // Expand the WebApp to full height
    tg.expand();
    
    // Log initialization
    console.log("Telegram WebApp initialized");
    
    return tg;
}

/**
 * Update theme based on Telegram color scheme
 * @param tg - Telegram WebApp instance
 */
function updateTheme(tg: TelegramWebApp): void {
    const isDarkMode = tg.colorScheme === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    console.log(`Theme set to ${isDarkMode ? 'dark' : 'light'} mode`);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // Update toggle button if it exists
    const toggleIcon = document.querySelector('.theme-toggle i');
    const toggleLabel = document.querySelector('.toggle-label');
    
    if (toggleIcon instanceof HTMLElement && toggleLabel instanceof HTMLElement) {
        if (isDark) {
            toggleIcon.className = 'fas fa-sun';
            toggleLabel.textContent = 'Light Mode';
        } else {
            toggleIcon.className = 'fas fa-moon';
            toggleLabel.textContent = 'Dark Mode';
        }
    }
    
    console.log(`Theme manually toggled to ${isDark ? 'dark' : 'light'} mode`);
}

/**
 * Set background image from server
 */
function setBackgroundImage(): void {
    const backgroundElement = document.getElementById(ELEMENTS.BACKGROUND);
    if (backgroundElement) {
        (backgroundElement as HTMLElement).style.backgroundImage = `url('${IMAGES.BACKGROUND}')`;
        console.log("Background image set");
    }
}

/**
 * Set initial dino image (eyes open)
 */
function setInitialDinoImage(): void {
    const dinoImage = document.getElementById(ELEMENTS.DINO_IMAGE) as HTMLImageElement;
    if (dinoImage) {
        dinoImage.src = IMAGES.DINO_EYES_OPEN;
        state.eyesOpen = true;
        state.isAnimating = false;
        
        console.log("Initial dino image set to eyes open");
    }
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

/**
 * Set up dino interaction (tap/click and touch events)
 * @param tg - Telegram WebApp instance
 */
function setupDinoInteraction(tg: TelegramWebApp): void {
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

/**
 * Handle dino tap/click event
 * @param e - Event object
 * @param tg - Telegram WebApp instance
 */
function handleDinoTap(e: Event, tg: TelegramWebApp): void {
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
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

/**
 * Show a speech bubble with a random encouraging message
 * @param tg - Telegram WebApp instance
 */
function showSpeechBubble(tg: TelegramWebApp): void {
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
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

/**
 * Get a random item from an array
 * @param array - The array to select from
 * @returns A random item from the array
 */
function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Display error message
 * @param message - Error message to display
 */
function showError(message: string): void {
    const loadingElement = document.getElementById(ELEMENTS.LOADING);
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p class="error-message">${message}</p>
        <button onclick="location.reload()" class="btn secondary">Try Again</button>
    `;
    
    document.body.appendChild(errorDiv);
}