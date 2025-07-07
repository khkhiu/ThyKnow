
import React from 'react';
import { Lightbulb, Star, Calendar } from 'lucide-react';

interface WeeklyPromptProps {
  currentPrompt: string;
  weekNumber: number;
}

const WeeklyPrompt = ({ currentPrompt, weekNumber }: WeeklyPromptProps) => {
  const getCurrentWeekDateRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 shadow-lg border-2 border-purple-100 mb-4">
      <div className="flex items-start space-x-3">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-800">This Week's Prompt</h3>
            <div className="flex items-center space-x-1 text-xs bg-purple-100 px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3 text-purple-600" />
              <span className="text-purple-600">{getCurrentWeekDateRange()}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-start space-x-2">
              <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm leading-relaxed">{currentPrompt}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Week {weekNumber} of your journaling journey</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPrompt;
