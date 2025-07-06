// File: public/miniapp/src/components/care/CareDisplay.ts
// Care activities for the reflection companion

export interface CareCallbacks {
  onMeditate: () => void;
  onReflect: () => void;
  onJournal: () => void;
  onRest: () => void;
}

export function createCareActivities(petState: any, callbacks: CareCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'care-activities-grid';
  
  const activities = [
    {
      id: 'meditate',
      name: 'Mindful Meditation',
      description: 'Boost clarity through meditation',
      icon: '🧘‍♀️',
      effect: '+10 Clarity',
      callback: callbacks.onMeditate,
      available: true
    },
    {
      id: 'reflect',
      name: 'Deep Reflection',
      description: 'Enhance mindfulness',
      icon: '💭',
      effect: '+8 Mindfulness',
      callback: callbacks.onReflect,
      available: true
    },
    {
      id: 'journal',
      name: 'Free Writing',
      description: 'Express thoughts freely',
      icon: '✍️',
      effect: '+12 Clarity',
      callback: callbacks.onJournal,
      available: true
    },
    {
      id: 'rest',
      name: 'Mindful Rest',
      description: 'Restore mental energy',
      icon: '😌',
      effect: '+15 Mindfulness',
      callback: callbacks.onRest,
      available: true
    }
  ];
  
  activities.forEach(activity => {
    const activityCard = createCareActivityCard(activity);
    container.appendChild(activityCard);
  });
  
  return container;
}

function createCareActivityCard(activity: any): HTMLElement {
  const card = document.createElement('div');
  card.className = `care-activity ${activity.available ? 'available' : 'disabled'}`;
  
  card.innerHTML = `
    <div class="care-icon">${activity.icon}</div>
    <div class="care-content">
      <h3 class="care-name">${activity.name}</h3>
      <p class="care-description">${activity.description}</p>
      <div class="care-effect">${activity.effect}</div>
    </div>
  `;
  
  if (activity.available) {
    card.addEventListener('click', () => {
      activity.callback();
      addCareAnimation(card);
    });
  }
  
  return card;
}

function addCareAnimation(card: HTMLElement): void {
  card.classList.add('care-used');
  
  // Create floating effect text
  const effect = document.createElement('div');
  effect.className = 'care-effect-float';
  effect.textContent = card.querySelector('.care-effect')?.textContent || '';
  
  card.appendChild(effect);
  
  setTimeout(() => {
    card.classList.remove('care-used');
    effect.remove();
  }, 2000);
}