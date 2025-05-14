// public/miniapp/pet.ts
// Main entry point for the ThyKnow dino friend page
// This file imports from the modular files and initializes the app

import { initApp } from './js/pet/app';
import { toggleTheme } from './js/pet/theme';

// Initialize when the DOM is fully loaded
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