// File: public/miniapp/src/components/pet/PetDisplay.ts
// Modern Pet Display Component inspired by habit-pet-telegram-pal

export interface PetState {
  character: string;
  mood: string;
  health: number;
  happiness: number;
  level: number;
  streak: number;
  points: number;
}

/**
 * Create the main pet display component
 * Adapts the pet concept from habit-pet-telegram-pal to reflection/mindfulness theme
 */
export function createPetDisplay(petState: PetState): HTMLElement {
  const container = document.createElement('div');
  container.className = 'pet-display-card';
  
  // Determine pet mood and appearance based on state
  const { character, animations } = getPetAppearance(petState);
  const moodColor = getMoodColor(petState.happiness);
  
  container.innerHTML = `
    <div class="pet-background" style="background: ${moodColor}">
      <div class="pet-character ${animations}" data-level="${petState.level}">
        ${character}
      </div>
      
      <div class="pet-info">
        <h2>Your Reflection Companion</h2>
        <p class="pet-mood">${petState.mood}</p>
        
        <div class="pet-level-badge">
          <i class="fas fa-star"></i>
          Level ${petState.level}
        </div>
      </div>
      
      <div class="pet-stats">
        <div class="stat-bar-container">
          <div class="stat-bar-header">
            <div class="stat-icon-label">
              <i class="fas fa-heart"></i>
              <span>Mindfulness</span>
            </div>
            <span class="stat-value">${petState.health}%</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill health" style="width: ${petState.health}%"></div>
          </div>
        </div>
        
        <div class="stat-bar-container">
          <div class="stat-bar-header">
            <div class="stat-icon-label">
              <i class="fas fa-sun"></i>
              <span>Clarity</span>
            </div>
            <span class="stat-value">${petState.happiness}%</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill happiness" style="width: ${petState.happiness}%"></div>
          </div>
        </div>
      </div>
      
      ${createPetAccessories(petState)}
      ${createFloatingElements(petState)}
    </div>
  `;
  
  // Add level-up animation if needed
  if (shouldShowLevelUpAnimation(petState)) {
    setTimeout(() => addLevelUpAnimation(container), 500);
  }
  
  return container;
}

/**
 * Get pet appearance based on state
 */
function getPetAppearance(petState: PetState): { character: string; animations: string } {
  const baseCharacter = '🧠'; // Brain as the reflection companion
  let character = baseCharacter;
  let animations = 'gentle-float';
  
  // Modify appearance based on level
  if (petState.level >= 10) {
    character = '🧠✨'; // Sparkling brain for high levels
    animations += ' sparkle-effect';
  } else if (petState.level >= 5) {
    character = '🧠💭'; // Brain with thought bubble
    animations += ' thought-pulse';
  }
  
  // Modify based on happiness
  if (petState.happiness > 80) {
    animations += ' happy-bounce';
  } else if (petState.happiness < 30) {
    animations += ' tired-sway';
  }
  
  // Modify based on health (mindfulness)
  if (petState.health > 90) {
    animations += ' zen-glow';
  }
  
  return { character, animations };
}

/**
 * Get mood-based background color
 */
function getMoodColor(happiness: number): string {
  if (happiness > 80) {
    return 'linear-gradient(135deg, #10B981 0%, #059669 100%)'; // Green for happy
  } else if (happiness > 60) {
    return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'; // Blue for content
  } else if (happiness > 40) {
    return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'; // Orange for neutral
  } else {
    return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'; // Gray for low
  }
}

/**
 * Create pet accessories based on achievements/level
 */
function createPetAccessories(petState: PetState): string {
  const accessories: string[] = [];
  
  // Level-based accessories
  if (petState.level >= 3) {
    accessories.push('<div class="pet-accessory wisdom-aura">🌟</div>');
  }
  
  if (petState.level >= 7) {
    accessories.push('<div class="pet-accessory meditation-beads">📿</div>');
  }
  
  if (petState.level >= 15) {
    accessories.push('<div class="pet-accessory enlightenment-crown">👑</div>');
  }
  
  // Streak-based accessories
  if (petState.streak >= 7) {
    accessories.push('<div class="pet-accessory streak-flame">🔥</div>');
  }
  
  if (petState.streak >= 30) {
    accessories.push('<div class="pet-accessory master-badge">🎯</div>');
  }
  
  return accessories.length > 0 
    ? `<div class="pet-accessories">${accessories.join('')}</div>`
    : '';
}

/**
 * Create floating elements around the pet
 */
function createFloatingElements(petState: PetState): string {
  const elements: string[] = [];
  
  // Add floating elements based on state
  if (petState.happiness > 70) {
    elements.push(
      '<div class="floating-element" style="--delay: 0s; --x: 20px; --y: -30px;">💭</div>',
      '<div class="floating-element" style="--delay: 1s; --x: -25px; --y: -20px;">✨</div>',
      '<div class="floating-element" style="--delay: 2s; --x: 30px; --y: -40px;">🌱</div>'
    );
  }
  
  if (petState.health > 80) {
    elements.push(
      '<div class="floating-element zen" style="--delay: 0.5s; --x: -20px; --y: -35px;">🧘‍♀️</div>',
      '<div class="floating-element zen" style="--delay: 1.5s; --x: 25px; --y: -25px;">☮️</div>'
    );
  }
  
  return elements.length > 0 
    ? `<div class="floating-elements">${elements.join('')}</div>`
    : '';
}

/**
 * Check if level-up animation should be shown
 */
function shouldShowLevelUpAnimation(petState: PetState): boolean {
  // This would typically check against previous state
  // For now, just return false - implement based on your state management
  return false;
}

/**
 * Add level-up animation
 */
function addLevelUpAnimation(container: HTMLElement): void {
  const levelUpOverlay = document.createElement('div');
  levelUpOverlay.className = 'level-up-animation';
  levelUpOverlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-icon">🎉</div>
      <div class="level-up-text">Level Up!</div>
      <div class="level-up-particles">
        <span>✨</span><span>🌟</span><span>💫</span><span>⭐</span>
      </div>
    </div>
  `;
  
  container.appendChild(levelUpOverlay);
  
  // Remove animation after completion
  setTimeout(() => {
    if (levelUpOverlay.parentNode) {
      levelUpOverlay.parentNode.removeChild(levelUpOverlay);
    }
  }, 3000);
}

/**
 * Update pet display with new state
 */
export function updatePetDisplay(container: HTMLElement, newState: PetState): void {
  const newDisplay = createPetDisplay(newState);
  container.innerHTML = '';
  container.appendChild(newDisplay);
}

/**
 * Get pet interaction responses
 */
export function getPetInteractionResponse(interactionType: string, petState: PetState): string {
  const responses = {
    feed: [
      "Nourishing thoughts! 🌿",
      "Mind feels refreshed! 💧",
      "Wisdom is growing! 🌱"
    ],
    play: [
      "Let's explore ideas together! 🎯",
      "Playful thinking sparks creativity! 🎨",
      "Joy enhances learning! 😊"
    ],
    meditate: [
      "Inner peace is expanding... 🧘‍♀️",
      "Clarity is emerging... ☮️",
      "Mindfulness deepens... 🕯️"
    ],
    clean: [
      "Clearing mental clutter! 🧹",
      "Fresh perspective incoming! 🌊",
      "Mental space feels organized! 📚"
    ]
  };
  
  const typeResponses = responses[interactionType] || ["Feeling grateful for your attention! 💝"];
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}