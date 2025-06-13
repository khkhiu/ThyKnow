// nodejs/public/miniapp/src/config/pet.ts
// Configuration for the ThyKnow dino friend page
// CORRECTED VERSION: Uses browser-compatible paths and correct filenames

import { ImagePaths, AnimationTiming, DomElements } from '../types/dinoFriend';

/**
 * Speech bubbles content - positive messages from the dino
 * These encouraging messages help create a supportive, friendly experience
 */
export const DINO_SPEECH: string[] = [
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
 * CORRECTED: These paths are now browser-compatible and use correct filenames
 * 
 * Understanding the path structure:
 * - The browser serves files from the 'public' directory
 * - From the miniapp's perspective, images are at 'src/assets/images/filename.png'
 * - These paths are relative to the miniapp HTML page location
 */
export const IMAGES: ImagePaths = {
    // FIXED: Correct filename and browser-compatible path
    DINO_EYES_OPEN: "src/assets/images/ThyKnow_dino-eyes-open.png",
    
    // This was already correct, but now uses consistent path format
    DINO_EYES_CLOSED: "src/assets/images/ThyKnow_dino-eyes-close.png",
    
    // Background image with consistent path format
    BACKGROUND: "src/assets/images/ThyKnow_background.png"
};

/**
 * Animation timing constants (in milliseconds)
 * These values control the feel and responsiveness of interactions
 */
export const TIMING: AnimationTiming = {
    BLINK_DURATION: 800,          // How long the blink animation lasts
    SPEECH_DURATION: 3000,        // How long speech bubbles remain visible
    INITIAL_SPEECH_DELAY: 1500,   // Delay before showing the first speech bubble
    LOADING_HIDE_DELAY: 1000      // Delay before hiding the loading spinner
};

/**
 * DOM element IDs for easy reference
 * These constants prevent typos in element ID strings throughout the code
 */
export const ELEMENTS: DomElements = {
    LOADING: 'loading',
    BACKGROUND: 'background',
    DINO_IMAGE: 'dino-image',
    SPEECH_BUBBLE: 'speech-bubble'
};