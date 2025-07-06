// File: public/miniapp/src/components/achievements/AchievementsDisplay.ts
// Achievements system inspired by habit-pet-telegram-pal

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: string;
}

export function createAchievementsGrid(achievements: AchievementData[], petState: any): HTMLElement {
  const container = document.createElement('div');
  container.className = 'achievements-grid';
  
  // Generate default achievements if none provided
  const defaultAchievements = generateDefaultAchievements(petState);
  const allAchievements = achievements.length > 0 ? achievements : defaultAchievements;
  
  allAchievements.forEach(achievement => {
    const achievementCard = createAchievementCard(achievement);
    container.appendChild(achievementCard);
  });
  
  return container;
}

function createAchievementCard(achievement: AchievementData): HTMLElement {
  const card = document.createElement('div');
  card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
  
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
  
  card.innerHTML = `
    <div class="achievement-icon">
      ${achievement.icon}
    </div>
    <div class="achievement-content">
      <h3 class="achievement-name">${achievement.name}</h3>
      <p class="achievement-description">${achievement.description}</p>
      <div class="achievement-category">${achievement.category}</div>
      <div class="achievement-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-text">${achievement.progress}/${achievement.maxProgress}</div>
      </div>
    </div>
    ${achievement.unlocked ? '<div class="achievement-badge">✅</div>' : ''}
  `;
  
  return card;
}

function generateDefaultAchievements(petState: any): AchievementData[] {
  return [
    {
      id: 'first-reflection',
      name: 'First Insight',
      description: 'Complete your first reflection',
      icon: '💭',
      unlocked: petState.streak >= 1,
      progress: Math.min(petState.streak, 1),
      maxProgress: 1,
      category: 'Beginner'
    },
    {
      id: 'week-streak',
      name: 'Mindful Week',
      description: 'Maintain a 7-day reflection streak',
      icon: '🔥',
      unlocked: petState.streak >= 7,
      progress: Math.min(petState.streak, 7),
      maxProgress: 7,
      category: 'Consistency'
    },
    {
      id: 'wisdom-seeker',
      name: 'Wisdom Seeker',
      description: 'Reach level 5 with your companion',
      icon: '🧙‍♀️',
      unlocked: petState.level >= 5,
      progress: Math.min(petState.level, 5),
      maxProgress: 5,
      category: 'Growth'
    },
    {
      id: 'point-collector',
      name: 'Point Collector',
      description: 'Earn 500 reflection points',
      icon: '⭐',
      unlocked: petState.points >= 500,
      progress: Math.min(petState.points, 500),
      maxProgress: 500,
      category: 'Dedication'
    },
    {
      id: 'monthly-master',
      name: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🏆',
      unlocked: petState.streak >= 30,
      progress: Math.min(petState.streak, 30),
      maxProgress: 30,
      category: 'Master'
    },
    {
      id: 'enlightened',
      name: 'Enlightened',
      description: 'Reach maximum companion happiness',
      icon: '✨',
      unlocked: petState.happiness >= 100,
      progress: Math.min(petState.happiness, 100),
      maxProgress: 100,
      category: 'Mastery'
    }
  ];
}