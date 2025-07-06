// File: public/miniapp/src/components/stats/StatsDisplay.ts
// Statistics display component

export interface StatsData {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  petLevel: number;
  averageResponseLength: number;
}

export function createStatsGrid(stats: StatsData): HTMLElement {
  const container = document.createElement('div');
  container.className = 'stats-display-grid';
  
  const statItems = [
    {
      label: 'Total Reflections',
      value: stats.totalReflections,
      icon: '📝',
      color: 'blue'
    },
    {
      label: 'Current Streak',
      value: stats.currentStreak,
      icon: '🔥',
      color: 'orange'
    },
    {
      label: 'Longest Streak',
      value: stats.longestStreak,
      icon: '🏆',
      color: 'gold'
    },
    {
      label: 'Total Points',
      value: stats.totalPoints,
      icon: '⭐',
      color: 'purple'
    },
    {
      label: 'Companion Level',
      value: stats.petLevel,
      icon: '🧠',
      color: 'green'
    },
    {
      label: 'Avg. Response Length',
      value: stats.averageResponseLength,
      icon: '📊',
      color: 'teal'
    }
  ];
  
  statItems.forEach(item => {
    const statCard = createStatCard(item);
    container.appendChild(statCard);
  });
  
  return container;
}

function createStatCard(stat: any): HTMLElement {
  const card = document.createElement('div');
  card.className = `stat-card stat-${stat.color}`;
  
  card.innerHTML = `
    <div class="stat-icon">${stat.icon}</div>
    <div class="stat-value">${stat.value}</div>
    <div class="stat-label">${stat.label}</div>
  `;
  
  return card;
}