// pages/Index.tsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ShoppingBag, Trophy, Home, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PetDisplay from '@/components/PetDisplay';
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
      setPetHealth(prev => Math.min(100, prev + 2));
      setPetHappiness(prev => Math.min(100, prev + 3));
      setStreakPoints(prev => prev + 1);
    }
  };

  const handleAddEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entry
    };
    setEntries(prev => [...prev, newEntry]);
    
    // Update pet stats for new entries
    if (entry.completed) {
      setPetHealth(prev => Math.min(100, prev + 2));
      setPetHappiness(prev => Math.min(100, prev + 3));
      setStreakPoints(prev => prev + 1);
    }
  };

  const handleUpdateEntry = (id: string, content: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id 
          ? { ...entry, content }
          : entry
      )
    );
  };

  const handlePromptSettingsChange = (day: string, time: string) => {
    setPromptDay(day);
    setPromptTime(time);
  };

  const completedEntriesToday = entries.filter(entry => {
    const today = new Date().toISOString().split('T')[0];
    return entry.date === today && entry.completed;
  }).length;

  const userId = user?.id?.toString() || 'demo-user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">ThyKnow</h1>
        <p className="text-center text-purple-100 mt-2">🦕📝 Discover you, Connect us 🦕📝</p>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Pet Display */}
        <div className="mb-6">
          <PetDisplay 
            petHealth={petHealth}
            petHappiness={petHappiness}
            petLevel={petLevel}
            completedHabitsToday={completedEntriesToday}
            equippedAccessories={equippedAccessories}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-lg rounded-2xl p-1">
            <TabsTrigger value="journal" className="rounded-xl">
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="care" className="rounded-xl">
              <Heart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Care</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="rounded-xl">
              <ShoppingBag className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Boutique</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Awards</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl">
              <Home className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Stats</span>
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
            />
          </TabsContent>

          <TabsContent value="care" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pet Care</h3>
              <p className="text-gray-600">
                Take care of your pet by completing journal entries and maintaining healthy habits.
              </p>
                 <div className="text-center text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2" />
                  <p>Coming soon!</p>
                </div>
              {/**
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${petHealth}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{petHealth}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Happiness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${petHappiness}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{petHappiness}%</span>
                  </div>
                </div>
              </div>
             */}
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pet Boutique</h3>
              <p className="text-gray-600">
                Shop for accessories and items for your pet using streak points.
              </p>
              <div className="mt-4">
                {/**
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Streak Points</span>
                  <span className="text-2xl font-bold text-purple-600">{streakPoints}</span>
                </div>
                 */}
                <div className="text-center text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2" />
                  <p>Coming soon!</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievements</h3>
              <p className="text-gray-600">
                Unlock unique items by completing certain actions.
              </p>
                <div className="text-center text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2" />
                  <p>Coming soon!</p>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/** 
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800">Longest Streak</h4>
                      <p className="text-yellow-600">{longestStreak} days</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <h4 className="font-semibold text-blue-800">Current Streak</h4>
                      <p className="text-blue-600">{streakPoints} days</p>
                    </div>
                  </div>
                </div>
                  */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsTab 
              userId={userId}
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

const Index = () => {
  return (
    <TelegramProvider>
      <IndexContent />
    </TelegramProvider>
  );
};

export default Index;