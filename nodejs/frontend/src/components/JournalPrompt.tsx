// components/JournalPrompt.tsx
// Refactored to match index.html's prompt display exactly
import React from 'react';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint?: string;
}

interface JournalPromptProps {
  prompt: PromptData | null;
  isLoading: boolean;
  error: string | null;
  onNewPrompt: () => void;
}

const JournalPrompt: React.FC<JournalPromptProps> = ({
  prompt,
  isLoading,
  error,
  onNewPrompt
}) => {
  // Loading state - matches index.html loading
  if (isLoading && !prompt) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your reflection prompt...</p>
        </div>
      </div>
    );
  }

  // Error state - matches index.html error handling
  if (error && !prompt) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-semibold text-red-800 mb-2">Unable to Load Prompt</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={onNewPrompt}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No prompt state (shouldn't happen with fallbacks, but just in case)
  if (!prompt) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🤔</div>
          <h3 className="font-semibold text-gray-800 mb-2">No Prompt Available</h3>
          <p className="text-gray-600 mb-4">Let's get you a new reflection prompt!</p>
          <Button onClick={onNewPrompt}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Prompt
          </Button>
        </div>
      </div>
    );
  }

  // Main prompt display - matches index.html structure exactly
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
      {/* Prompt Header - like index.html */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {prompt.type === 'self_awareness' ? '🧠' : '🤝'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {prompt.typeLabel || (prompt.type === 'self_awareness' ? '🧠 Self-Awareness' : '🤝 Connections')}
            </h3>
            <p className="text-sm text-gray-500">Today's Reflection</p>
          </div>
        </div>
        <Button
          onClick={onNewPrompt}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          New Prompt
        </Button>
      </div>

      {/* Prompt Text - exactly like index.html */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
        <p className="text-gray-800 leading-relaxed text-lg font-medium">
          {prompt.text}
        </p>
      </div>

      {/* Hint - like index.html */}
      {prompt.hint && (
        <div className="flex items-start space-x-2 bg-blue-50 rounded-lg p-3">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 text-sm leading-relaxed">
            <span className="font-medium">Hint:</span> {prompt.hint}
          </p>
        </div>
      )}

      {/* Error message if there was an error but we still have a prompt */}
      {error && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800 text-sm">
            ⚠️ {error} (showing fallback prompt)
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPrompt;