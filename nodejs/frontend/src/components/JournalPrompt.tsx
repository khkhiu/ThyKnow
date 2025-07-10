// components/JournalPrompt.tsx
import React from 'react';
import { Lightbulb, RefreshCw, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint: string;
}

interface JournalPromptProps {
  prompt: PromptData | null;
  isLoading: boolean;
  error: string | null;
  onNewPrompt: () => void;
  className?: string;
}

const JournalPrompt: React.FC<JournalPromptProps> = ({
  prompt,
  isLoading,
  error,
  onNewPrompt,
  className = ''
}) => {
  const getPromptIcon = (type: string) => {
    switch (type) {
      case 'self_awareness':
        return '🧠';
      case 'connections':
        return '💝';
      case 'growth':
        return '🌱';
      case 'gratitude':
        return '🙏';
      case 'challenges':
        return '💪';
      case 'intentions':
        return '🎯';
      default:
        return '✨';
    }
  };

  const getPromptColor = (type: string) => {
    switch (type) {
      case 'self_awareness':
        return 'from-purple-500 to-blue-500';
      case 'connections':
        return 'from-pink-500 to-rose-500';
      case 'growth':
        return 'from-green-500 to-emerald-500';
      case 'gratitude':
        return 'from-yellow-500 to-orange-500';
      case 'challenges':
        return 'from-red-500 to-pink-500';
      case 'intentions':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-full">
            <Lightbulb className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Unable to load prompt</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button
              onClick={onNewPrompt}
              variant="outline"
              size="sm"
              className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-100 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`bg-gradient-to-r ${prompt ? getPromptColor(prompt.type) : 'from-purple-500 to-pink-500'} p-3 rounded-full`}>
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Today's Reflection</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
              {prompt && (
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {prompt.typeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <Button
          onClick={onNewPrompt}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-purple-200 rounded w-1/2"></div>
        </div>
      ) : prompt ? (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">
                {getPromptIcon(prompt.type)}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {prompt.text}
                </p>
              </div>
            </div>
          </div>
          
          {prompt.hint && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-purple-700 text-sm leading-relaxed">
                  <span className="font-medium">Hint:</span> {prompt.hint}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-600">No prompt available</p>
        </div>
      )}
    </div>
  );
};

export default JournalPrompt;