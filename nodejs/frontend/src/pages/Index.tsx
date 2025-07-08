import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ShoppingBag, Trophy, Home, Gift } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyJournal from '@/components/WeeklyJournal';
import PetDisplay from '@/components/PetDisplay';

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
  const [petHealth, setPetHealth] = useState(85);
  const [petHappiness, setPetHappiness] = useState(92);
  const [petLevel, setPetLevel] = useState(3);
  const [streakPoints, setStreakPoints] = useState(42);
  const [longestStreak, setLongestStreak] = useState(12);
  const [promptDay, setPromptDay] = useState('daily');
  const [promptTime, setPromptTime] = useState('19:00');
  const [ownedAccessories, setOwnedAccessories] = useState<string[]>(['explorer-hat']);
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(['explorer-hat']);

  const handleEntryComplete = (id: string) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, completed: !entry.completed }
          : entry
      )
    );
    
    if (!entries.find(e => e.id === id)?.completed) {
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
  };

  const handleUpdateEntry = (id: string, content: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id 
          ? { ...entry, content } : entry
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

  const totalEntriesCompleted = entries.filter(e => e.completed).length;

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
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-4">
                <Heart className="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Pet Care</h3>
              <p className="text-gray-600 text-lg">Coming Soon</p>
              <p className="text-gray-500 text-sm mt-2">
                Feed, play with, and care for your dino companion!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="shop" className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Dino Boutique</h3>
              <p className="text-gray-600 text-lg">Coming Soon</p>
              <p className="text-gray-500 text-sm mt-2">
                Dress up your dino with awesome accessories!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-4">
                <Trophy className="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Achievements</h3>
              <p className="text-gray-600 text-lg">Coming Soon</p>
              <p className="text-gray-500 text-sm mt-2">
                Unlock badges and rewards for your progress!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{totalEntriesCompleted}</div>
                  <div className="text-sm text-green-600">Habits Completed</div>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{longestStreak}</div>
                  <div className="text-sm text-blue-600">Longest Streak</div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{petLevel}</div>
                  <div className="text-sm text-purple-600">Pet Level</div>
                </div>
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">{streakPoints}</div>
                  <div className="text-sm text-amber-600">Fossil Coins</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Pet Health</span>
                    <span className="text-sm text-gray-600">{petHealth}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${petHealth}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Pet Happiness</span>
                    <span className="text-sm text-gray-600">{petHappiness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${petHappiness}%` }}
                    ></div>
                  </div>
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