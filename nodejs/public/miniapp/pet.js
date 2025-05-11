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
    document.getElementById('dino-image').src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
    eyesOpen = true;
}

// Toggle dino eyes (open/closed)
function toggleDinoEyes() {
    const dinoImage = document.getElementById('dino-image');
    
    if (eyesOpen) {
        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-close.png";
        eyesOpen = false;
    } else {
        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
        eyesOpen = true;
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
    
    setTimeout(() => {
        speechBubble.classList.remove('show');
    }, 3000);
    
    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Make the dino draggable
function makeDinoDraggable() {
    const dinoImage = document.getElementById('dino-image');
    const dinoContainer = document.querySelector('.dino-container');
    const speechBubble = document.getElementById('speech-bubble');
    
    // Variables to track drag state
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let dragStartTime = 0;
    let dragDistance = 0;
    let isTap = false; // Track if the interaction was a tap
    
    // Set the container to relative positioning if not already
    if (getComputedStyle(dinoContainer).position !== 'relative') {
        dinoContainer.style.position = 'relative';
    }
    
    // Initialize draggable state
    dinoImage.style.position = 'absolute';
    dinoImage.style.cursor = 'grab';
    
    // Center the dino initially
    xOffset = 0;
    yOffset = 0;
    setTranslate(0, 0, dinoImage);
    
    // Function to calculate new position
    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
    
    // Add dedicated tap handler
    dinoImage.addEventListener('click', function(e) {
        // Only trigger if it wasn't a drag
        if (dragDistance < 5 && (Date.now() - dragStartTime < 200)) {
            // Toggle dino eyes
            toggleDinoEyes();
            
            // Show speech bubble
            showSpeechBubble();
            
            // Blink eyes back open after a short delay (unless dragging starts)
            if (!eyesOpen) {
                setTimeout(() => {
                    if (!isDragging) {
                        const dinoImage = document.getElementById('dino-image');
                        dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
                        eyesOpen = true;
                    }
                }, 300);
            }
            
            // Prevent default but don't stop propagation
            // This allows the tap to be processed without interfering with position
            e.preventDefault();
        }
    });
    
    // Touch events for mobile devices
    dinoImage.addEventListener('touchstart', dragStart, false);
    document.addEventListener('touchend', dragEnd, false);
    document.addEventListener('touchmove', drag, false);
    
    // Mouse events for desktop
    dinoImage.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('mousemove', drag, false);
    
    // Start dragging
    function dragStart(e) {
        // Reset drag metrics
        dragStartTime = Date.now();
        dragDistance = 0;
        isTap = true; // Assume it's a tap until proven otherwise
        
        // Get current position
        if (e.type === 'touchstart') {
            if (e.touches.length > 1) {
                return; // Ignore if more than one touch (pinch)
            }
            
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        // Check if we're actually touching/clicking the element
        if (e.target === dinoImage) {
            isDragging = true;
            dinoImage.style.cursor = 'grabbing';
            
            // Provide haptic feedback if available
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('medium');
            }
        }
    }
    
    // End dragging
    function dragEnd(e) {
        if (!isDragging) return;
        
        // Store final position
        initialX = currentX;
        initialY = currentY;
        
        // Calculate drag distance
        let dragDistance = 0;
        if (e.type === 'touchend') {
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            dragDistance = Math.sqrt(
                Math.pow(endX - (initialX + xOffset), 2) + 
                Math.pow(endY - (initialY + yOffset), 2)
            );
        } else {
            dragDistance = Math.sqrt(
                Math.pow(e.clientX - (initialX + xOffset), 2) + 
                Math.pow(e.clientY - (initialY + yOffset), 2)
            );
        }
        
        isDragging = false;
        dinoImage.style.cursor = 'grab';
        
        // Only provide haptic feedback, but don't change position or trigger blink on small drags
        // This prevents position resetting with small movements
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    }
    
    // Handle dragging
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        let currentClientX, currentClientY;
        
        if (e.type === 'touchmove') {
            currentClientX = e.touches[0].clientX;
            currentClientY = e.touches[0].clientY;
        } else {
            currentClientX = e.clientX;
            currentClientY = e.clientY;
        }
        
        // Calculate drag distance for distinguishing between tap and drag
        const dx = currentClientX - (initialX + xOffset);
        const dy = currentClientY - (initialY + yOffset);
        dragDistance = Math.sqrt(dx*dx + dy*dy);
        
        // If the movement is more than the threshold, it's not a tap
        if (dragDistance > 10) {
            isTap = false;
        }
        
        currentX = currentClientX - initialX;
        currentY = currentClientY - initialY;
        
        // Limit to container bounds
        const containerRect = dinoContainer.getBoundingClientRect();
        const dinoRect = dinoImage.getBoundingClientRect();
        
        // Calculate boundaries
        const maxX = containerRect.width - dinoRect.width;
        const maxY = containerRect.height - dinoRect.height;
        
        // Apply constraints - THIS CONTROLS HOW CLOSE DINO CAN GET TO EDGES
        currentX = Math.max(-maxX* 0.9, Math.min(currentX, maxX* 0.9));
        currentY = Math.max(-maxY* 0.9, Math.min(currentY, maxY* 0.9));
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, dinoImage);
        
        // Move speech bubble along with the dino
        if (speechBubble) {
            speechBubble.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
        
        // If dragging starts, ensure eyes are open for better user experience
        if (dragDistance > 20 && !eyesOpen) {
            dinoImage.src = "/miniapp/images/ThyKnow_dino-eyes-open.png";
            eyesOpen = true;
        }
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
    setInitialDinoImage();
    
    // Wait for images to load before making draggable
    const dinoImage = document.getElementById('dino-image');
    
    if (dinoImage.complete) {
        makeDinoDraggable();
    } else {
        dinoImage.onload = () => {
            makeDinoDraggable();
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