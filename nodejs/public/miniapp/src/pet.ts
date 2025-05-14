// public/miniapp/src/pet.ts
/**
 * ThyKnow Dino Friend Page - TypeScript Version
 */
import { initializeTelegram, hapticFeedback } from './utils/telegramUtils';
import { fetchRandomDinoMessage } from './services/apiService';

// Track dino eye state
let eyesOpen = true;
// Flag to prevent multiple taps while animation is in progress
let isAnimating = false;

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

/**
 * Set background image from server
 */
function setBackgroundImage(): void {
  // In a production environment, this would reference the actual images
  const background = document.getElementById('background');
  if (background) {
    background.style.backgroundImage = "url('/miniapp/images/ThyKnow_background.png')";
  }
}

/**
 * Set initial dino image (eyes open)
 */
function setInitialDinoImage(): void {
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  if (dinoImage) {
    dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
    eyesOpen = true;
    isAnimating = false;
    
    // Debug log
    console.log("Initial dino image set to eyes open");
  }
}

/**
 * Toggle dino eyes (open/closed)
 */
function toggleDinoEyes(): void {
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  if (!dinoImage) return;
  
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
  hapticFeedback('success');
}

/**
 * Get random item from array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Show dino speech bubble
 */
async function showSpeechBubble(): Promise<void> {
  const speechBubble = document.getElementById('speech-bubble');
  if (!speechBubble) return;
  
  try {
    // Try to get a message from the API
    const message = await fetchRandomDinoMessage();
    speechBubble.textContent = message;
  } catch (error) {
    // Fallback to local messages if API fails
    speechBubble.textContent = getRandomItem(dinoSpeech);
  }
  
  speechBubble.classList.add('show');
  
  console.log("Showing speech bubble:", speechBubble.textContent);
  
  setTimeout(() => {
    speechBubble.classList.remove('show');
  }, 3000);
  
  // Provide haptic feedback
  hapticFeedback('success');
}

/**
 * Handle dino tap
 */
function handleDinoTap(e: Event): void {
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
  toggleDinoEyes();
  
  // Show speech bubble
  showSpeechBubble();
  
  // Apply blink animation
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  if (dinoImage) {
    dinoImage.classList.add('blink');
    
    // Remove blink animation class after animation completes
    setTimeout(() => {
      dinoImage.classList.remove('blink');
    }, 800);
  }
  
  // Blink eyes back open after a delay
  if (!eyesOpen) {
    setTimeout(() => {
      const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
      if (dinoImage) {
        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
        eyesOpen = true;
      }
      // Reset animation flag after everything is done
      isAnimating = false;
      console.log("Auto-opened eyes after delay");
    }, 800);
  } else {
    // Reset animation flag if we started with eyes closed
    setTimeout(() => {
      isAnimating = false;
    }, 800);
  }
}

/**
 * Set up dino interaction (tap only, no dragging)
 */
function setupDinoInteraction(): void {
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  if (!dinoImage) return;
  
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

/**
 * Center the dino image in its container
 */
function centerDinoImage(): void {
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  const dinoContainer = document.querySelector('.dino-container');
  
  if (!dinoImage || !dinoContainer) return;
  
  // Ensure the container is properly set up for centering
  dinoContainer.style.display = 'flex';
  dinoContainer.style.justifyContent = 'center';
  dinoContainer.style.alignItems = 'center';
  
  // Style the dino image for interaction
  dinoImage.style.position = 'static';
  dinoImage.style.cursor = 'pointer';
  
  console.log("Dino image centered");
}

/**
 * Initialize the dino friend page
 */
function initDinoFriend(): void {
  // Expand the WebApp to full height
  const tg = window.Telegram.WebApp;
  tg.expand();
  
  // Log initialization
  console.log("ThyKnow Dino Friend initializing...");
  
  // Initialize Telegram WebApp
  initializeTelegram();
  
  // Set background image
  setBackgroundImage();
  
  // Set initial dino image
  setInitialDinoImage();
  
  // Wait for images to load before setting up interaction
  const dinoImage = document.getElementById('dino-image') as HTMLImageElement;
  if (!dinoImage) return;
  
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
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }, 1000);
  
  // Notify Telegram that the Mini App is ready
  tg.ready();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initDinoFriend);