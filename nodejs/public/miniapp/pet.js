// ThyKnow pet Page JavaScript

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

// pet database
const pet = [
    {
        text: "You don't have to be perfect to be amazing. Even T-Rex had tiny arms and still ruled the Earth!",
        author: "ThyKnow Dino"
    },
    {
        text: "Your potential is as vast as the prehistoric skies. Embrace every opportunity to grow today.",
        author: "ThyKnow Dino"
    },
    {
        text: "You are stronger than you think, braver than you believe, and smarter than you imagine.",
        author: "ThyKnow Dino"
    },
    {
        text: "Small steps lead to big changes. Dinosaurs didn't evolve in a day!",
        author: "ThyKnow Dino"
    },
    {
        text: "Be kind to yourself today. Self-compassion is the foundation of all growth.",
        author: "ThyKnow Dino"
    },
    {
        text: "Your challenges don't define you—how you respond to them does. Face today with a RAWR!",
        author: "ThyKnow Dino"
    },
    {
        text: "Like fossils buried in rock, your greatest qualities are sometimes hidden from view. They're still there!",
        author: "ThyKnow Dino"
    },
    {
        text: "You have survived 100% of your worst days so far. You've got prehistoric-level resilience!",
        author: "ThyKnow Dino"
    },
    {
        text: "It's okay to take a break. Even the mightiest dinosaurs needed rest!",
        author: "ThyKnow Dino"
    },
    {
        text: "Your journey is uniquely yours. Embrace your path—after all, no two dinosaur tracks are exactly alike!",
        author: "ThyKnow Dino"
    }
];

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

// Display a random affirmation
function displayRandomAffirmation() {
    const affirmation = getRandomItem(pet);
    document.getElementById('affirmation-text').textContent = affirmation.text;
    document.getElementById('affirmation-author').textContent = affirmation.author;
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

// Share affirmation
function shareAffirmation() {
    const affirmationText = document.getElementById('affirmation-text').textContent;
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    // Share to Telegram chat
    tg.sendData(JSON.stringify({
        action: 'share_affirmation',
        affirmation: affirmationText
    }));
    
    // Show confirmation
    alert('Affirmation shared to your Telegram chat!');
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
    
    // Display initial random affirmation
    displayRandomAffirmation();
    
    // Show a speech bubble when the page loads
    setTimeout(showSpeechBubble, 1500);
    
    // Handle dino image click
    document.getElementById('dino-image').addEventListener('click', showSpeechBubble);
    
    // Handle new affirmation button
    document.getElementById('new-affirmation-button').addEventListener('click', () => {
        displayRandomAffirmation();
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
    });
    
    // Handle share button
    document.getElementById('share-button').addEventListener('click', shareAffirmation);
    
    // Hide loading spinner
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
});

// Handle theme changes
tg.onEvent('themeChanged', updateTheme);