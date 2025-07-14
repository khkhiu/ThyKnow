// pages/Index.tsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ShoppingBag, Trophy, Home, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Replace PetDisplay with DinoFriend
import DinoFriend from '@/components/DinoFriend';

import { StatsTab } from '@/components/tabs/StatsTab';
import EnhancedWeeklyJournal from '@/components/EnhancedWeeklyJournal';
import TelegramProvider, { useTelegram } from '@/components/TelegramProvider';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  week: string;
}

const IndexContent = () => {
  const { user } = useTelegram();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [petHealth, setPetHealth] = useState(85);
  const [petHappiness, setPetHappiness] = useState(92);
  const [petLevel, setPetLevel] = useState(3);
  const [streakPoints, setStreakPoints] = useState(42);
  const [longestStreak, setLongestStreak] = useState(12);
  const [promptDay, setPromptDay] = useState('daily');
  const [promptTime, setPromptTime] = useState('19:00');
  const [ownedAccessories, setOwnedAccessories] = useState<string[]>(['explorer-hat']);
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(['explorer-hat']);

  // Calculate completed entries today
  const completedEntriesToday = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString() && entry.completed;
  }).length;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('habitPetApp');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setEntries(data.entries || []);
        setPetHealth(data.petHealth || 85);
        setPetHappiness(data.petHappiness || 92);
        setPetLevel(data.petLevel || 3);
        setStreakPoints(data.streakPoints || 42);
        setLongestStreak(data.longestStreak || 12);
        setPromptDay(data.promptDay || 'daily');
        setPromptTime(data.promptTime || '19:00');
        setOwnedAccessories(data.ownedAccessories || ['explorer-hat']);
        setEquippedAccessories(data.equippedAccessories || ['explorer-hat']);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      entries,
      petHealth,
      petHappiness,
      petLevel,
      streakPoints,
      longestStreak,
      promptDay,
      promptTime,
      ownedAccessories,
      equippedAccessories
    };
    localStorage.setItem('habitPetApp', JSON.stringify(dataToSave));
  }, [entries, petHealth, petHappiness, petLevel, streakPoints, longestStreak, promptDay, promptTime, ownedAccessories, equippedAccessories]);

  const handleEntryComplete = (id: string) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, completed: !entry.completed }
          : entry
      )
    );
    
    // Update pet stats when entry is completed
    const entry = entries.find(e => e.id === id);
    if (entry && !entry.completed) {
      setPetHealth(prev => Math.min(100, prev + 5));
      setPetHappiness(prev => Math.min(100, prev + 8));
      setStreakPoints(prev => prev + 3);
      
      // Level up logic
      if (completedEntriesToday >= 2 && petLevel < 10) {
        setPetLevel(prev => prev + 1);
      }
    }
  };

  const handleAddEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateEntry = (entryId: string, content: string) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, content }
          : entry
      )
    );
  };

  const handlePromptSettingsChange = (day: string, time: string) => {
    setPromptDay(day);
    setPromptTime(time);
  };

  const handleStreakUpdate = (streakData: any) => {
    // Extract streak data from the object
    const {
      currentStreak,
      totalPoints,
      pointsAwarded = 0,
      milestoneReached,
      streakBroken,
      isNewRecord,
      isMultipleEntry
    } = streakData;

    // Update streak points if provided
    if (totalPoints !== undefined) {
      setStreakPoints(totalPoints);
    } else if (pointsAwarded > 0) {
      setStreakPoints(prev => prev + pointsAwarded);
    }

    // Update pet stats based on streak performance
    if (pointsAwarded > 0) {
      setPetHealth(prev => Math.min(100, prev + 5)); // +5 health per completed entry
      setPetHappiness(prev => Math.min(100, prev + 8)); // +8 happiness per completed entry
    }

    // Bonus stats for milestones
    if (milestoneReached) {
      setPetHealth(prev => Math.min(100, prev + 10)); // Bonus health for milestones
      setPetHappiness(prev => Math.min(100, prev + 15)); // Bonus happiness for milestones
    }

    // Update longest streak if it's a new record
    if (isNewRecord && currentStreak) {
      setLongestStreak(currentStreak);
    }

    // Level up logic based on streak progress
    if (currentStreak && currentStreak >= petLevel * 2) {
      setPetLevel(prev => Math.min(10, prev + 1));
    }
  };

  const handleAccessoryPurchase = (accessoryId: string, cost: number) => {
    if (streakPoints >= cost && !ownedAccessories.includes(accessoryId)) {
      setStreakPoints(prev => prev - cost);
      setOwnedAccessories(prev => [...prev, accessoryId]);
    }
  };

  const handleAccessoryEquip = (accessoryId: string) => {
    if (ownedAccessories.includes(accessoryId)) {
      setEquippedAccessories(prev => 
        prev.includes(accessoryId)
          ? prev.filter(id => id !== accessoryId)
          : [...prev, accessoryId]
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ThyKnow
          </h1>
          <p className="text-lg text-gray-600">
            Your Journey of Self-Discovery 🦕📝
          </p>
        </div>

        {/* Replace PetDisplay with DinoFriend */}
        <div className="mb-6">
          <DinoFriend 
            petHealth={petHealth}
            petHappiness={petHappiness}
            petLevel={petLevel}
            completedHabitsToday={completedEntriesToday}
            equippedAccessories={equippedAccessories}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-lg rounded-2xl p-1 h-16">
            <TabsTrigger value="journal" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
              <BookOpen className="w-4 h-4 sm:mr-1" />
              <span className="text-xs sm:text-sm font-medium">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="care" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
              <Heart className="w-4 h-4 sm:mr-1" />
              <span className="text-xs sm:text-sm font-medium">Care</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
              <ShoppingBag className="w-4 h-4 sm:mr-1" />
              <span className="text-xs sm:text-sm font-medium">Boutique</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
              <Trophy className="w-4 h-4 sm:mr-1" />
              <span className="text-xs sm:text-sm font-medium">Awards</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
              <Home className="w-4 h-4 sm:mr-1" />
              <span className="text-xs sm:text-sm font-medium">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-4">
            <EnhancedWeeklyJournal 
              entries={entries}
              onEntryComplete={handleEntryComplete}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              promptDay={promptDay}
              promptTime={promptTime}
              onPromptSettingsChange={handlePromptSettingsChange}
              onStreakUpdate={handleStreakUpdate}
            />
          </TabsContent>

          <TabsContent value="care" className="space-y-4">
            {/* Enhanced Pet Care Tab */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Care for Your Dino Friend
              </h3>
              <p className="text-gray-600 mb-6">
                Your dino pal grows stronger and happier as you complete your journal entries and maintain healthy habits!
              </p>
              
              <div className="space-y-4">
                {/* Health Section */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-gray-800">Health Status</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{petHealth}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
                      style={{ width: `${petHealth}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Complete journal entries to boost health +5 per entry
                  </p>
                </div>
                
                {/* Happiness Section */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-800">Happiness Level</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{petHappiness}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500 ease-out"
                      style={{ width: `${petHappiness}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Interact with your dino and complete habits +8 per entry
                  </p>
                </div>

                {/* Level and Evolution */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-gray-800">Evolution Level</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">Level {petLevel}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {petLevel >= 10 ? '🦕' : petLevel >= 7 ? '🦖' : petLevel >= 4 ? '🐉' : '🥚'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {petLevel >= 10 ? 'Mighty Brontosaurus - Fully Evolved!' :
                         petLevel >= 7 ? 'Fierce T-Rex - Almost there!' :
                         petLevel >= 4 ? 'Magical Dragon - Getting stronger!' :
                         'Baby Dino Egg - Just starting out!'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Complete 2+ habits daily to level up your dino
                  </p>
                </div>

                {/* Progress Today */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Today's Progress</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Habits Completed</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">{completedEntriesToday}</span>
                      <span className="text-sm text-gray-500">/ unlimited</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[...Array(Math.max(5, completedEntriesToday))].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < completedEntriesToday ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Streak Points */}
                <div className="bg-gradient-to-r from-orange-50 to-red-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500 text-xl">⭐</span>
                      <span className="font-medium text-gray-800">Streak Points</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{streakPoints}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Use points in the Boutique to buy accessories for your dino!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            {/* Pet Boutique */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Pet Boutique 🛍️
              </h3>
              <p className="text-gray-600 mb-6">
                Shop for accessories and items for your dino using streak points.
              </p>
              
              {/* Available Accessories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'safari-hat', name: 'Safari Hat', emoji: '👒', cost: 15, description: 'Perfect for adventures!' },
                  { id: 'flower-crown', name: 'Flower Crown', emoji: '🌸', cost: 20, description: 'Makes any dino feel royal!' },
                  { id: 'prehistoric-glasses', name: 'Cool Glasses', emoji: '🕶️', cost: 25, description: 'Looking cool in the Jurassic!' },
                  { id: 'leaf-necklace', name: 'Leaf Necklace', emoji: '🍃', cost: 18, description: 'All-natural jewelry!' },
                  { id: 'bone-glasses', name: 'Dino Specs', emoji: '👓', cost: 22, description: 'For the intellectual dino!' },
                  { id: 'explorer-hat', name: 'Explorer Hat', emoji: '🎩', cost: 12, description: 'Ready for any expedition!' }
                ].map((accessory) => {
                  const isOwned = ownedAccessories.includes(accessory.id);
                  const isEquipped = equippedAccessories.includes(accessory.id);
                  const canAfford = streakPoints >= accessory.cost;
                  
                  return (
                    <div key={accessory.id} className={`
                      border-2 rounded-xl p-4 transition-all duration-200
                      ${isOwned ? 'border-green-200 bg-green-50' : 'border-gray-200'}
                    `}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{accessory.emoji}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">{accessory.name}</h4>
                            <p className="text-sm text-gray-600">{accessory.description}</p>
                          </div>
                        </div>
                        {!isOwned && (
                          <div className="text-right">
                            <span className="text-lg font-bold text-orange-600">
                              ⭐ {accessory.cost}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {!isOwned ? (
                          <button
                            onClick={() => handleAccessoryPurchase(accessory.id, accessory.cost)}
                            disabled={!canAfford}
                            className={`
                              flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                              ${canAfford 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }
                            `}
                          >
                            {canAfford ? 'Purchase' : 'Not enough points'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAccessoryEquip(accessory.id)}
                            className={`
                              flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                              ${isEquipped 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                              }
                            `}
                          >
                            {isEquipped ? 'Equipped ✓' : 'Equip'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Points Balance */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">Your Points Balance</span>
                  <span className="text-xl font-bold text-orange-600">⭐ {streakPoints}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Complete journal entries to earn more points!
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {/* Achievements System */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Achievements & Milestones 🏆
              </h3>
              
              <div className="space-y-4">
                {/* Current Achievements */}
                {[
                  { 
                    title: 'First Steps', 
                    description: 'Complete your first journal entry', 
                    progress: Math.min(100, (completedEntriesToday > 0 ? 1 : 0) * 100),
                    unlocked: completedEntriesToday > 0,
                    emoji: '👶'
                  },
                  { 
                    title: 'Daily Warrior', 
                    description: 'Complete 3 entries in one day', 
                    progress: Math.min(100, (completedEntriesToday / 3) * 100),
                    unlocked: completedEntriesToday >= 3,
                    emoji: '⚔️'
                  },
                  { 
                    title: 'Dino Whisperer', 
                    description: 'Reach Level 5 with your dino', 
                    progress: Math.min(100, (petLevel / 5) * 100),
                    unlocked: petLevel >= 5,
                    emoji: '🦕'
                  },
                  { 
                    title: 'Point Collector', 
                    description: 'Accumulate 50 streak points', 
                    progress: Math.min(100, (streakPoints / 50) * 100),
                    unlocked: streakPoints >= 50,
                    emoji: '⭐'
                  },
                  { 
                    title: 'Fashion Forward', 
                    description: 'Own 3 accessories', 
                    progress: Math.min(100, (ownedAccessories.length / 3) * 100),
                    unlocked: ownedAccessories.length >= 3,
                    emoji: '👗'
                  }
                ].map((achievement, index) => (
                  <div key={index} className={`
                    border-2 rounded-xl p-4 transition-all duration-200
                    ${achievement.unlocked ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.emoji}
                        </span>
                        <div>
                          <h4 className={`font-medium ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <span className="text-yellow-600 font-bold">✓ UNLOCKED</span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 transition-all duration-500 ${
                          achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-400'
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round(achievement.progress)}% Complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsTab 
              userId={user?.id?.toString() || 'guest'}
              totalEntriesCompleted={entries.filter(e => e.completed).length}
              longestStreak={longestStreak}
              petLevel={petLevel}
              streakPoints={streakPoints}
              petHealth={petHealth}
              petHappiness={petHappiness}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Main Index component wrapped with TelegramProvider
const Index = () => {
  return (
    <TelegramProvider>
      <IndexContent />
    </TelegramProvider>
  );
};

export default Index;