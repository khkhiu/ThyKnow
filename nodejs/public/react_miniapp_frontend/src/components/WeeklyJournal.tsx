
import React, { useState } from 'react';
import { Plus, Check, Calendar, BookOpen, Edit3, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import WeeklyPrompt from './WeeklyPrompt';
import JournalSettings from './JournalSettings';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  week: string;
}

interface WeeklyJournalProps {
  entries: JournalEntry[];
  onEntryComplete: (entryId: string) => void;
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateEntry: (entryId: string, content: string) => void;
  promptDay: string;
  promptTime: string;
  onPromptSettingsChange: (day: string, time: string) => void;
}

const WeeklyJournal = ({ 
  entries, 
  onEntryComplete, 
  onAddEntry, 
  onUpdateEntry,
  promptDay,
  promptTime,
  onPromptSettingsChange
}: WeeklyJournalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [editContent, setEditContent] = useState('');

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

  const weeklyPrompts = [
    "What were three highlights of your week, and what made them special?",
    "Describe a challenge you faced this week and how you overcame it.",
    "What are you most grateful for this week? Reflect on the small and big things.",
    "What did you learn about yourself this week? Any new insights or realizations?",
    "How did you grow or improve this week? What progress did you make?",
    "What moments brought you the most joy this week? Why were they meaningful?",
    "What would you like to do differently next week? What are your intentions?",
    "Who or what inspired you this week? How did it impact your perspective?",
    "What patterns do you notice in your thoughts or behaviors this week?",
    "If you could give your past self advice for this week, what would it be?",
    "What accomplishment, no matter how small, are you most proud of this week?",
    "How did you practice self-care or kindness to yourself this week?"
  ];

  const getCurrentPrompt = () => {
    const weekNum = getWeekNumber();
    return weeklyPrompts[weekNum % weeklyPrompts.length];
  };

  const handleAddEntry = () => {
    if (newEntry.title.trim()) {
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

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = (entryId: string) => {
    onUpdateEntry(entryId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleUsePrompt = () => {
    const currentPrompt = getCurrentPrompt();
    setNewEntry({ 
      title: 'Weekly Reflection', 
      content: `Prompt: ${currentPrompt}\n\nYour thoughts:\n` 
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Journal</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Entry
        </Button>
      </div>

      <JournalSettings 
        promptDay={promptDay}
        promptTime={promptTime}
        onSettingsChange={onPromptSettingsChange}
      />

      <WeeklyPrompt 
        currentPrompt={getCurrentPrompt()}
        weekNumber={getWeekNumber()}
      />

      {!showAddForm && (
        <div className="text-center">
          <Button 
            onClick={handleUsePrompt}
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200 hover:from-blue-100 hover:to-purple-100"
          >
            <Lightbulb className="w-4 h-4 mr-2 text-purple-500" />
            Use This Week's Prompt
          </Button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-purple-100">
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
                  className="w-full min-h-[100px]"
                />
                <div className="flex space-x-2">
                  <Button onClick={() => handleSaveEdit(entry.id)} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)} size="sm">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">
                {entry.content || "No content yet..."}
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No journal entries yet! Start writing to keep your pet happy.</p>
          <Button 
            onClick={handleUsePrompt}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start with Weekly Prompt
          </Button>
        </div>
      )}
    </div>
  );
};

export default WeeklyJournal;
