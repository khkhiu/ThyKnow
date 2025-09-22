
import React, { useState } from 'react';
import { Plus, Check, Flame, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  category: string;
}

interface HabitTrackerProps {
  habits: Habit[];
  onHabitComplete: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
}

const HabitTracker = ({ habits, onHabitComplete, onAddHabit }: HabitTrackerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Health' });

  const categories = ['Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness'];
  const categoryEmojis = {
    Health: '🏥',
    Fitness: '💪',
    Learning: '📚',
    Productivity: '⚡',
    Mindfulness: '🧘'
  };

  const handleAddHabit = () => {
    if (newHabit.name.trim()) {
      onAddHabit({
        name: newHabit.name,
        category: newHabit.category,
        streak: 0,
        completedToday: false
      });
      setNewHabit({ name: '', category: 'Health' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Today's Habits</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Habit
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">Add New Habit</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter habit name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newHabit.category}
              onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryEmojis[cat as keyof typeof categoryEmojis]} {cat}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <Button onClick={handleAddHabit} className="flex-1">Add</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.map((habit) => (
          <div 
            key={habit.id}
            className={`bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-300 ${
              habit.completedToday 
                ? 'border-green-200 bg-gradient-to-r from-green-50 to-blue-50' 
                : 'border-gray-100 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {categoryEmojis[habit.category as keyof typeof categoryEmojis]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{habit.streak} day streak</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => onHabitComplete(habit.id)}
                disabled={habit.completedToday}
                className={`w-12 h-12 rounded-full transition-all ${
                  habit.completedToday
                    ? 'bg-green-500 hover:bg-green-500'
                    : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <Check className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No habits yet! Start building good habits to keep your pet happy.</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Habit
          </Button>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
