// config.js - Configuration and constants for the ThyKnow dino friend page

/**
 * Speech bubbles content - positive messages from the dino
 */
export const DINO_SPEECH = [
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

/**
 * Image paths for dino states
 */
export const IMAGES = {
    DINO_EYES_OPEN: "/miniapp/images/ThyKnow_dino-eyes-open.png",
    DINO_EYES_CLOSED: "/miniapp/images/ThyKnow_dino-eyes-close.png",
    BACKGROUND: "/miniapp/images/ThyKnow_background.png"
};

/**
 * Animation timing constants (in milliseconds)
 */
export const TIMING = {
    BLINK_DURATION: 800,      // How long the blink animation lasts
    SPEECH_DURATION: 3000,    // How long speech bubbles remain visible
    INITIAL_SPEECH_DELAY: 1500, // Delay before showing the first speech bubble
    LOADING_HIDE_DELAY: 1000  // Delay before hiding the loading spinner
};

/**
 * DOM element IDs for easy reference
 */
export const ELEMENTS = {
    LOADING: 'loading',
    BACKGROUND: 'background',
    DINO_IMAGE: 'dino-image',
    SPEECH_BUBBLE: 'speech-bubble'
};