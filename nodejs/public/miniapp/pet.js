// ThyKnow Dino Friend Page JavaScript

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Track dino eye state
let eyesOpen = true;

// Set theme based on Telegram color scheme
function updateTheme() {
    const isDarkMode = tg.colorScheme === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Dino speech bubbles
const dinoSpeech = [
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

// Set background image from server
function setBackgroundImage() {
    // In a production environment, this would reference the actual images
    document.getElementById('background').style.backgroundImage = "url('/miniapp/images/ThyKnow_background.png')";
}

// Set initial dino image (eyes open)
function setInitialDinoImage() {
    const dinoImage = document.getElementById('dino-image');
    dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
    eyesOpen = true;
    
    // Debug log
    console.log("Initial dino image set to eyes open");
}

// Toggle dino eyes (open/closed)
function toggleDinoEyes() {
    const dinoImage = document.getElementById('dino-image');
    
    if (eyesOpen) {
        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-close.png";
        eyesOpen = false;
        console.log("Eyes closed");
    } else {
        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
        eyesOpen = true;
        console.log("Eyes opened");
    }
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Show dino speech bubble
function showSpeechBubble() {
    const speechBubble = document.getElementById('speech-bubble');
    speechBubble.textContent = getRandomItem(dinoSpeech);
    speechBubble.classList.add('show');
    
    console.log("Showing speech bubble:", speechBubble.textContent);
    
    setTimeout(() => {
        speechBubble.classList.remove('show');
    }, 3000);
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Handle dino tap
function handleDinoTap(e) {
    console.log("Dino tapped!");
    e.preventDefault();
    
    // Toggle dino eyes
    toggleDinoEyes();
    
    // Show speech bubble
    showSpeechBubble();
    
    // Apply blink animation
    const dinoImage = document.getElementById('dino-image');
    dinoImage.classList.add('blink');
    
    // Remove blink animation class after animation completes
    setTimeout(() => {
        dinoImage.classList.remove('blink');
    }, 300);
    
    // Blink eyes back open after a short delay
    if (!eyesOpen) {
        setTimeout(() => {
            const dinoImage = document.getElementById('dino-image');
            dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
            eyesOpen = true;
            console.log("Auto-opened eyes after delay");
        }, 300);
    }
}

// Set up dino interaction (tap only, no dragging)
function setupDinoInteraction() {
    const dinoImage = document.getElementById('dino-image');
    
    // Center the dino
    centerDinoImage();
    
    console.log("Setting up dino interaction");
    
    // Add tap/click event listener
    dinoImage.addEventListener('click', handleDinoTap);
    
    // For mobile - add touch event listeners to ensure tapping works well
    dinoImage.addEventListener('touchstart', function(e) {
        // Just prevent default to avoid any scrolling issues
        e.preventDefault();
    });
    
    dinoImage.addEventListener('touchend', function(e) {
        // Call the same handler used for clicks
        handleDinoTap(e);
    });
    
    // Debug - log that setup is complete
    console.log("Dino interaction setup complete");
}

// Center the dino image in its container
function centerDinoImage() {
    const dinoImage = document.getElementById('dino-image');
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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Expand the WebApp to full height
    tg.expand();
    
    // Log initialization
    console.log("ThyKnow Dino Friend initializing...");
    
    // Set theme
    updateTheme();
    
    // Set background image
    setBackgroundImage();
    
    // Set initial dino image
    setInitialDinoImage();
    
    // Wait for images to load before setting up interaction
    const dinoImage = document.getElementById('dino-image');
    
    if (dinoImage.complete) {
        console.log("Dino image already loaded");
        setupDinoInteraction();
    } else {
        console.log("Waiting for dino image to load...");
        dinoImage.onload = () => {
            console.log("Dino image loaded");
            setupDinoInteraction();
        };
    }
    
    // Show a speech bubble when the page loads
    setTimeout(showSpeechBubble, 1500);
    
    // Hide loading spinner
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
});

// Handle theme changes
tg.onEvent('themeChanged', updateTheme);