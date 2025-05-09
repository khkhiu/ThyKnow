// ThyKnow Dino Friend Page JavaScript

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

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

// Set dino image from server
function setDinoImage() {
    document.getElementById('dino-image').src = "/miniapp/images/ThyKnow_dino.png";
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
    
    setTimeout(() => {
        speechBubble.classList.remove('show');
    }, 3000);
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Expand the WebApp to full height
    tg.expand();
    
    // Set theme
    updateTheme();
    
    // Set background and dino images
    setBackgroundImage();
    setDinoImage();
    
    // Show a speech bubble when the page loads
    setTimeout(showSpeechBubble, 1500);
    
    // Handle dino image click
    document.getElementById('dino-image').addEventListener('click', showSpeechBubble);
    
    // Hide loading spinner
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
});

// Handle theme changes
tg.onEvent('themeChanged', updateTheme);