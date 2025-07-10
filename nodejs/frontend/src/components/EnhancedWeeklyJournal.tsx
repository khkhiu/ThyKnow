// components/EnhancedWeeklyJournal.tsx
// Complete enhanced weekly journal with real streak API integration
import React, { useState, useEffect } from 'react';
import { Plus, Check, Calendar, BookOpen, Edit3, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import JournalPrompt from './JournalPrompt';
import JournalResponse from './JournalResponse';
import JournalSettings from './JournalSettings';
import { useTelegram } from './TelegramProvider';
import { usePrompts } from '../hooks/usePrompts';
import { useJournalData } from '../hooks/useJournalData';

// Interface for real streak data from API
interface RealStreakData {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  week: string;
}

interface EnhancedWeeklyJournalProps {
  entries: JournalEntry[];
  onEntryComplete: (entryId: string) => void;
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateEntry: (entryId: string, content: string) => void;
  promptDay: string;
  promptTime: string;
  onPromptSettingsChange: (day: string, time: string) => void;
  onStreakUpdate?: (streakData: any) => void;
}

const EnhancedWeeklyJournal: React.FC<EnhancedWeeklyJournalProps> = ({
  entries,
  onEntryComplete,
  onAddEntry,
  onUpdateEntry,
  promptDay,
  promptTime,
  onPromptSettingsChange,
  onStreakUpdate
}) => {
  const [activeTab, setActiveTab] = useState('today');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [editContent, setEditContent] = useState('');
  
  // State for real streak data from API
  const [realStreakData, setRealStreakData] = useState<RealStreakData | null>(null);
  const [streakLoading, setStreakLoading] = useState(false);
  const [streakError, setStreakError] = useState<string | null>(null);

  const { user } = useTelegram();
  const userId = user?.id?.toString();

  // Enhanced hooks that match index.html exactly
  const {
    currentPrompt,
    isLoading: promptLoading,
    error: promptError,
    lastRewards,
    fetchTodaysPrompt,
    getNewPrompt,
    submitPromptResponse
  } = usePrompts(userId);

  const {
    historyEntries,
    isLoading: historyLoading,
    getStreakInfo, // Keep as fallback
    fetchHistory
  } = useJournalData(userId);

  // Fetch real streak data from weekly streak API
  const fetchRealStreakData = async () => {
    if (!userId) return;
    
    setStreakLoading(true);
    setStreakError(null);
    
    try {
      const response = await fetch(`/api/miniapp/streak/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch streak data: ${response.status}`);
      }
      
      const data = await response.json();
      
      setRealStreakData({
        currentStreak: data.streak.current,
        longestStreak: data.streak.longest,
        totalPoints: data.points.total,
        hasEntryThisWeek: data.streak.hasEntryThisWeek,
        currentWeekId: data.streak.currentWeekId,
        weeksUntilNextMilestone: data.streak.weeksUntilNextMilestone,
        nextMilestoneReward: data.streak.nextMilestoneReward
      });
      
      console.log('Real streak data fetched:', data);
    } catch (error) {
      console.error('Error fetching real streak data:', error);
      setStreakError(error instanceof Error ? error.message : 'Failed to fetch streak data');
    } finally {
      setStreakLoading(false);
    }
  };

  // Fetch real streak data on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchRealStreakData();
    }
  }, [userId]);

  // Get current week info
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  };

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  };

  // Handle prompt response submission - properly integrated with weekly streak system
  const handlePromptSubmit = async (response: string): Promise<boolean> => {
    if (!response.trim()) return false;

    try {
      const success = await submitPromptResponse(response);
      
      if (success) {
        // Add entry to local state for immediate UI feedback
        onAddEntry({
          title: currentPrompt?.typeLabel || 'Daily Reflection',
          content: response,
          date: new Date().toISOString().split('T')[0],
          completed: true,
          week: getCurrentWeek()
        });
        
        // Refresh history to get the latest entries
        fetchHistory();
        
        // Refresh real streak data after submission to get updated numbers
        await fetchRealStreakData();
        
        // Notify parent component about streak update if we have reward data
        if (lastRewards && onStreakUpdate) {
          onStreakUpdate({
            currentStreak: lastRewards.newStreak,
            totalPoints: lastRewards.totalPoints,
            pointsAwarded: lastRewards.pointsAwarded,
            milestoneReached: lastRewards.milestoneReached,
            streakBroken: lastRewards.streakBroken,
            isNewRecord: lastRewards.isNewRecord,
            isMultipleEntry: lastRewards.isMultipleEntry
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting prompt response:', error);
      return false;
    }
  };

  // Handle new prompt request
  const handleNewPrompt = async () => {
    try {
      await getNewPrompt();
    } catch (error) {
      console.error('Error getting new prompt:', error);
    }
  };

  // Handle manual entry addition (for the "Entries" tab)
  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    onAddEntry({
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toISOString().split('T')[0],
      completed: true,
      week: getCurrentWeek()
    });

    setNewEntry({ title: '', content: '' });
    setShowAddForm(false);
  };

  // Handle entry editing
  const handleEditEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setEditingId(entryId);
      setEditContent(entry.content);
    }
  };

  const handleSaveEdit = (entryId: string) => {
    onUpdateEntry(entryId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Get display streak info - use real API data if available, fallback to local calculations
  const getDisplayStreakInfo = () => {
    if (realStreakData) {
      return {
        currentStreak: realStreakData.currentStreak,
        longestStreak: realStreakData.longestStreak,
        totalEntries: entries.length, // Keep local count for total entries
        totalPoints: realStreakData.totalPoints,
        hasEntryThisWeek: realStreakData.hasEntryThisWeek,
        weeksUntilNextMilestone: realStreakData.weeksUntilNextMilestone,
        nextMilestoneReward: realStreakData.nextMilestoneReward
      };
    }
    
    // Fallback to local calculation if API data unavailable
    const fallbackInfo = getStreakInfo();
    return {
      ...fallbackInfo,
      totalPoints: 0,
      hasEntryThisWeek: false,
      weeksUntilNextMilestone: 4,
      nextMilestoneReward: 200
    };
  };

  const streakInfo = getDisplayStreakInfo();

  // Show streak rewards notification when new rewards are received
  useEffect(() => {
    if (lastRewards) {
      console.log('🎉 Streak rewards received:', lastRewards);
      
      // Refresh real streak data when rewards are received
      fetchRealStreakData();
      
      if (lastRewards.milestoneReached) {
        console.log(`🏆 Milestone achieved: ${lastRewards.milestoneReached} weeks!`);
      }
      
      if (lastRewards.streakBroken) {
        console.log('😔 Streak was broken, but starting fresh!');
      }
      
      if (lastRewards.isNewRecord) {
        console.log(`🎉 New personal record: ${lastRewards.newStreak} weeks!`);
      }
    }
  }, [lastRewards]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header with Weekly Stats - Enhanced with real API data */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Weekly Journal</h2>
            <p className="text-purple-100">
              Week {getWeekNumber()} • {getCurrentWeek()}
            </p>
          </div>
          <div className="text-right">
            {streakLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-purple-100">Loading streak data...</div>
              </div>
            ) : streakError ? (
              <div className="text-center">
                <div className="text-sm text-red-200">⚠️ Error loading streak data</div>
                <button 
                  onClick={fetchRealStreakData}
                  className="text-xs text-purple-100 underline mt-1"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{streakInfo.currentStreak}</div>
                  <div className="text-sm text-purple-100">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{streakInfo.longestStreak}</div>
                  <div className="text-sm text-purple-100">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{streakInfo.totalEntries}</div>
                  <div className="text-sm text-purple-100">Total Entries</div>
                </div>
                {/* Show total points if available from real data */}
                {realStreakData && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{realStreakData.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-purple-100">Total Points</div>
                  </div>
                )}
                {/* Show recently earned points */}
                {lastRewards && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">+{lastRewards.pointsAwarded}</div>
                    <div className="text-sm text-purple-100">Points Earned</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Show streak rewards notification */}
        {lastRewards && (
          <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
            <div className="text-sm">
              {lastRewards.isMultipleEntry ? (
                <span>✨ Bonus reflection this week! +{lastRewards.pointsAwarded} points</span>
              ) : (
                <span>🔥 Weekly reflection complete! +{lastRewards.pointsAwarded} points</span>
              )}
              {lastRewards.milestoneReached && (
                <span className="ml-2">🏆 {lastRewards.milestoneReached}-week milestone!</span>
              )}
              {lastRewards.isNewRecord && (
                <span className="ml-2">🎉 New personal record!</span>
              )}
            </div>
          </div>
        )}

        {/* Show this week's status from real data */}
        {realStreakData && (
          <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <div className="text-sm">
              {realStreakData.hasEntryThisWeek ? (
                <span>✅ This week: Reflection complete! You can add more for bonus points.</span>
              ) : (
                <span>📅 This week: Ready for your weekly reflection</span>
              )}
              {realStreakData.weeksUntilNextMilestone > 0 && (
                <span className="ml-4">
                  🎯 Next milestone: {realStreakData.weeksUntilNextMilestone} week{realStreakData.weeksUntilNextMilestone === 1 ? '' : 's'} 
                  (+{realStreakData.nextMilestoneReward} bonus points)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Today's Prompt
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Today's Prompt Tab */}
        <TabsContent value="today" className="space-y-6">
          {/* Prompt Display */}
          <JournalPrompt
            prompt={currentPrompt}
            isLoading={promptLoading}
            error={promptError}
            onNewPrompt={handleNewPrompt}
          />
          
          {/* Response Input - only show when we have a prompt */}
          {currentPrompt && (
            <JournalResponse
              onSubmit={handlePromptSubmit}
              isLoading={promptLoading}
              placeholder="Take a moment to reflect on this prompt. Share your thoughts, feelings, or insights - there's no right or wrong answer."
            />
          )}
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Journal Entries</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            </div>

            {/* Add new entry form */}
            {showAddForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-4">
                  <Input
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Entry title..."
                    className="w-full"
                  />
                  <Textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your thoughts..."
                    className="w-full min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddEntry}>Save Entry</Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Entry list */}
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No entries yet. Start with today's prompt!</p>
                </div>
              ) : (
                entries.map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{entry.title}</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditEntry(entry.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={entry.completed ? "default" : "outline"}
                          onClick={() => onEntryComplete(entry.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(entry.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">{entry.content}</p>
                    )}
                    
                    <div className="text-sm text-gray-400 mt-2">
                      {entry.date} • Week {entry.week}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Entry History</h3>
            
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading history...</p>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No history entries found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyEntries.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{entry.promptType || 'Journal Entry'}</h4>
                      <span className="text-sm text-gray-500">{entry.date}</span>
                    </div>
                    {entry.prompt && (
                      <div className="bg-gray-50 rounded p-3 mb-2">
                        <p className="text-sm text-gray-700"><strong>Prompt:</strong> {entry.prompt}</p>
                      </div>
                    )}
                    <p className="text-gray-600">{entry.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Journal Settings</h3>
            
            <JournalSettings
              promptDay={promptDay}
              promptTime={promptTime}
              onSettingsChange={onPromptSettingsChange}
            />
            
            {/* Additional streak info section */}
            {realStreakData && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Your Progress Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="font-medium text-purple-600">Current Status</div>
                    <div className="mt-1">
                      {realStreakData.hasEntryThisWeek ? 'Weekly reflection complete ✅' : 'Ready for weekly reflection 📅'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="font-medium text-purple-600">Progress to Next Milestone</div>
                    <div className="mt-1">
                      {realStreakData.weeksUntilNextMilestone > 0 
                        ? `${realStreakData.weeksUntilNextMilestone} weeks remaining`
                        : 'All milestones achieved! 🏆'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWeeklyJournal;