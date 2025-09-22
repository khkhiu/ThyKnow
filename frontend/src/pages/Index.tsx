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
            completedHabitsToday={completedEntriesToday}
            equippedAccessories={equippedAccessories}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-lg rounded-2xl p-1 h-16">
            <TabsTrigger value="journal" className="rounded-xl flex-col sm:flex-row data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:h-full data-[state=active]:scale-105 transition-all duration-200">
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
            {/* Care for Your Dino Friend Tab */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Care for Your Dino Friend
              </h3>
              <p className="text-gray-600 mb-4">
                Take care of your dinosaur companion by feeding, playing with, and nurturing it as you complete your daily journal entries.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
                <span className="text-pink-600 font-semibold">Coming Soon</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            {/* Pet Boutique Tab */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Pet Boutique 🛍️
              </h3>
              <p className="text-gray-600 mb-4">
                Shop for fun accessories and special items to customize your dino friend using the streak points you've earned.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <span className="text-purple-600 font-semibold">Coming Soon</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {/* Achievements and Milestones Tab */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Achievements & Milestones 🏆
              </h3>
              <p className="text-gray-600 mb-4">
                Track your progress and unlock special achievements as you build consistent journaling habits and reach important milestones.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <span className="text-orange-600 font-semibold">Coming Soon</span>
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