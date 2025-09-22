import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PetDisplay from '@/components/PetDisplay';
import WeeklyJournal from '@/components/WeeklyJournal';
import PetCare from '@/components/PetCare';
import AchievementSystem from '@/components/AchievementSystem';
import PetAccessories from '@/components/PetAccessories';
import { Home, BookOpen, Heart, Trophy, ShoppingBag } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  week: string;
}

const Index = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [petHealth, setPetHealth] = useState(75);
  const [petHappiness, setPetHappiness] = useState(60);
  const [petLevel, setPetLevel] = useState(1);
  const [streakPoints, setStreakPoints] = useState(3);
  const [totalEntriesCompleted, setTotalEntriesCompleted] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [promptDay, setPromptDay] = useState('sunday');
  const [promptTime, setPromptTime] = useState('09:00');
  const [ownedAccessories, setOwnedAccessories] = useState<string[]>([]);
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('habitPetApp');
    if (savedData) {
      const data = JSON.parse(savedData);
      setEntries(data.entries || []);
      setPetHealth(data.petHealth || 75);
      setPetHappiness(data.petHappiness || 60);
      setPetLevel(data.petLevel || 1);
      setStreakPoints(data.streakPoints || 3);
      setTotalEntriesCompleted(data.totalEntriesCompleted || 0);
      setLongestStreak(data.longestStreak || 0);
      setPromptDay(data.promptDay || 'sunday');
      setPromptTime(data.promptTime || '09:00');
      setOwnedAccessories(data.ownedAccessories || []);
      setEquippedAccessories(data.equippedAccessories || []);
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
      totalEntriesCompleted,
      longestStreak,
      promptDay,
      promptTime,
      ownedAccessories,
      equippedAccessories
    };
    localStorage.setItem('habitPetApp', JSON.stringify(dataToSave));
  }, [entries, petHealth, petHappiness, petLevel, streakPoints, totalEntriesCompleted, longestStreak, promptDay, promptTime, ownedAccessories, equippedAccessories]);

  const handleEntryComplete = (entryId: string) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => {
        if (entry.id === entryId && !entry.completed) {
          setStreakPoints(prev => prev + 2); // More points for journaling
          setPetHappiness(prev => Math.min(100, prev + 8));
          setPetHealth(prev => Math.min(100, prev + 5));
          setTotalEntriesCompleted(prev => prev + 1);
          
          // Calculate streak and level up pet
          const newLevel = Math.floor((totalEntriesCompleted + 1) / 7) + 1; // Level up every 7 entries
          if (newLevel > petLevel) {
            setPetLevel(newLevel);
          }
          
          return { ...entry, completed: true };
        }
        return entry;
      })
    );
  };

  const handleAddEntry = (newEntry: Omit<JournalEntry, 'id'>) => {
    const entry: JournalEntry = {
      ...newEntry,
      id: Date.now().toString()
    };
    setEntries(prev => [...prev, entry]);
  };

  const handleUpdateEntry = (entryId: string, content: string) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === entryId ? { ...entry, content } : entry
      )
    );
  };

  const handleFeedPet = () => {
    setPetHealth(prev => Math.min(100, prev + 10));
    setStreakPoints(prev => prev - 1);
  };

  const handlePlayWithPet = () => {
    setPetHappiness(prev => Math.min(100, prev + 15));
    setStreakPoints(prev => prev - 1);
  };

  const handleCleanPet = () => {
    setPetHealth(prev => Math.min(100, prev + 5));
    setPetHappiness(prev => Math.min(100, prev + 5));
    setStreakPoints(prev => prev - 1);
  };

  const handlePromptSettingsChange = (day: string, time: string) => {
    setPromptDay(day);
    setPromptTime(time);
  };

  const handleBuyAccessory = (accessoryId: string, cost: number) => {
    if (streakPoints >= cost && !ownedAccessories.includes(accessoryId)) {
      setStreakPoints(prev => prev - cost);
      setOwnedAccessories(prev => [...prev, accessoryId]);
    }
  };

  const handleEquipAccessory = (accessoryId: string, type: string) => {
    if (ownedAccessories.includes(accessoryId)) {
      setEquippedAccessories(prev => {
        const filtered = prev.filter(id => {
          const accessories: Record<string, string> = {
            'explorer-hat': 'hat', 'safari-hat': 'hat',
            'leaf-necklace': 'necklace', 'flower-crown': 'necklace',
            'prehistoric-glasses': 'glasses', 'bone-glasses': 'glasses'
          };
          return accessories[id] !== type;
        });
        return [...filtered, accessoryId];
      });
    }
  };

  const handleUnequipAccessory = (type: string) => {
    setEquippedAccessories(prev => {
      const accessories: Record<string, string> = {
        'explorer-hat': 'hat', 'safari-hat': 'hat',
        'leaf-necklace': 'necklace', 'flower-crown': 'necklace',
        'prehistoric-glasses': 'glasses', 'bone-glasses': 'glasses'
      };
      return prev.filter(id => accessories[id] !== type);
    });
  };

  const completedEntriesToday = entries.filter(e => 
    e.completed && e.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Dino Journal
          </h1>
          <p className="text-gray-600">Write reflections, raise your dino! 🦕📝</p>
        </div>

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
            <WeeklyJournal 
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
            <PetCare 
              petHealth={petHealth}
              petHappiness={petHappiness}
              streakPoints={streakPoints}
              onFeedPet={handleFeedPet}
              onPlayWithPet={handlePlayWithPet}
              onCleanPet={handleCleanPet}
            />
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <PetAccessories 
              streakPoints={streakPoints}
              ownedAccessories={ownedAccessories}
              equippedAccessories={equippedAccessories}
              onBuyAccessory={handleBuyAccessory}
              onEquipAccessory={handleEquipAccessory}
              onUnequipAccessory={handleUnequipAccessory}
            />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <AchievementSystem 
              totalHabitsCompleted={totalEntriesCompleted}
              longestStreak={longestStreak}
              petLevel={petLevel}
              achievements={[]}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Entries Completed</span>
                  <span className="font-bold text-purple-600">{totalEntriesCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="font-bold text-orange-600">{longestStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pet Level</span>
                  <span className="font-bold text-purple-600">Level {petLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Points</span>
                  <span className="font-bold text-green-600">{streakPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Entries</span>
                  <span className="font-bold text-indigo-600">{entries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accessories Owned</span>
                  <span className="font-bold text-pink-600">{ownedAccessories.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
