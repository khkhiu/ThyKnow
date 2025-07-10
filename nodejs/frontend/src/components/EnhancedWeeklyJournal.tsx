// components/EnhancedWeeklyJournal.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Check, Calendar, BookOpen, Edit3, History, Settings, RefreshCw } from 'lucide-react';
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
}

const EnhancedWeeklyJournal: React.FC<EnhancedWeeklyJournalProps> = ({
  entries,
  onEntryComplete,
  onAddEntry,
  onUpdateEntry,
  promptDay,
  promptTime,
  onPromptSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState('today');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [editContent, setEditContent] = useState('');

  const { user } = useTelegram();
  const userId = user?.id?.toString();

  // Use the new hooks
  const {
    currentPrompt,
    isLoading: promptLoading,
    error: promptError,
    getNewPrompt,
    submitPromptResponse
  } = usePrompts(userId);

  const {
    historyEntries,
    isLoading: historyLoading,
    getStreakInfo,
    fetchHistory
  } = useJournalData(userId);

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

  // Handle prompt response submission
  const handlePromptSubmit = async (response: string) => {
    if (!response.trim()) return false;

    try {
      const success = await submitPromptResponse(response);
      if (success) {
        // Add entry to local state
        onAddEntry({
          title: currentPrompt?.typeLabel || 'Daily Reflection',
          content: response,
          date: new Date().toISOString().split('T')[0],
          completed: true,
          week: getCurrentWeek()
        });
        
        // Refresh history
        fetchHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting prompt response:', error);
      return false;
    }
  };

  // Handle manual entry addition
  const handleAddEntry = () => {
    if (newEntry.title.trim() && newEntry.content.trim()) {
      onAddEntry({
        title: newEntry.title,
        content: newEntry.content,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        week: getCurrentWeek()
      });
      setNewEntry({ title: '', content: '' });
      setShowAddForm(false);
    }
  };

  // Handle entry editing
  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateEntry(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Get streak info
  const streakInfo = getStreakInfo();

  return (
    <div className="space-y-6">
      {/* Header with streak info */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Weekly Journal</h2>
            <p className="text-purple-100">
              Week {getWeekNumber()} • {streakInfo.currentStreak} day streak
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{streakInfo.totalEntries}</div>
            <div className="text-sm text-purple-100">Total Entries</div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="today" className="rounded-lg">
            <BookOpen className="w-4 h-4 mr-2" />
            Today
          </TabsTrigger>
          <TabsTrigger value="entries" className="rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Today's Reflection Tab */}
        <TabsContent value="today" className="space-y-6">
          <JournalPrompt
            prompt={currentPrompt}
            isLoading={promptLoading}
            error={promptError}
            onNewPrompt={getNewPrompt}
          />
          
          <JournalResponse
            onSubmit={handlePromptSubmit}
            isLoading={promptLoading}
            placeholder="Take a moment to reflect on today's prompt. There's no right or wrong answer - just share what feels true for you."
          />
        </TabsContent>

        {/* Weekly Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">This Week's Entries</h3>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>

          {/* Add Entry Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Create New Journal Entry</h3>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Entry title..."
                  className="w-full"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                />
                <Textarea
                  placeholder="Write your thoughts here..."
                  className="w-full min-h-[120px]"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button onClick={handleAddEntry} className="flex-1">Add Entry</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* Entries List */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <div 
                key={entry.id}
                className={`bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-300 ${
                  entry.completed 
                    ? 'border-green-200 bg-gradient-to-r from-green-50 to-purple-50' 
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📝</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleStartEdit(entry)}
                      variant="outline"
                      size="sm"
                      className="w-10 h-10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onEntryComplete(entry.id)}
                      disabled={entry.completed}
                      className={`w-10 h-10 transition-all ${
                        entry.completed
                          ? 'bg-green-500 hover:bg-green-500'
                          : 'bg-gray-200 hover:bg-purple-500 hover:text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[120px]"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Journal History</h3>
            <Button
              onClick={fetchHistory}
              variant="outline"
              disabled={historyLoading}
            >
              {historyLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading your journal history...</p>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 mb-2">No journal entries yet</h3>
                <p className="text-gray-600">Start reflecting to see your entries here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="text-lg">📖</div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {entry.promptType || 'Journal Entry'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Prompt:</div>
                        <p className="text-gray-800 text-sm leading-relaxed">{entry.prompt}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-700 mb-1">Your Response:</div>
                        <p className="text-blue-800 text-sm leading-relaxed">{entry.response}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <JournalSettings
            promptDay={promptDay}
            promptTime={promptTime}
            onSettingsChange={onPromptSettingsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWeeklyJournal;