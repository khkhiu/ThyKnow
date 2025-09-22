// components/JournalResponse.tsx
// Refactored to match index.html's response handling exactly
import React, { useState, useRef, useEffect } from 'react';
import { Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface JournalResponseProps {
  onSubmit: (response: string) => Promise<boolean>;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const JournalResponse: React.FC<JournalResponseProps> = ({
  onSubmit,
  isLoading,
  placeholder = "Take a moment to reflect on today's prompt. There's no right or wrong answer - just share what feels true for you.",
  disabled = false
}) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea - like index.html
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to the scrollHeight
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [response]);

  // Handle form submission - exactly like index.html
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedResponse = response.trim();
    if (!trimmedResponse) {
      setSubmitError('Please enter your response first');
      return;
    }

    if (trimmedResponse.length < 10) {
      setSubmitError('Please share a bit more about your thoughts (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const success = await onSubmit(trimmedResponse);
      
      if (success) {
        // Clear the response and show success state
        setResponse('');
        setJustSubmitted(true);
        
        // Reset the just submitted state after 3 seconds
        setTimeout(() => {
          setJustSubmitted(false);
        }, 3000);

        // Focus back on textarea for next entry if desired
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        setSubmitError('Failed to save your response. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitError('Failed to save your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts - like index.html
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Show success state after submission
  if (justSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Response Saved Successfully!</h3>
          <p className="text-green-600 mb-4">
            Your reflection has been saved to your journal. Use the "New Prompt" button when you're ready for another prompt.
          </p>
          <div className="text-sm text-gray-500">
            💡 Tip: Regular reflection helps build self-awareness and meaningful connections.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3">Share Your Reflection</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Response Textarea - matches index.html styling */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading || isSubmitting}
            className="min-h-[120px] max-h-[200px] resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            style={{ height: 'auto' }}
          />
          
          {/* Character count - like index.html */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {response.length} characters
          </div>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit button - matches index.html */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 Press Ctrl+Enter to submit quickly
          </div>
          <Button
            type="submit"
            disabled={!response.trim() || disabled || isLoading || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Save Response
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help text - like index.html */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">
          <strong>Reflection Tips:</strong> Be honest and authentic. There are no wrong answers. 
          The goal is to better understand yourself and your connections with others.
        </p>
      </div>
    </div>
  );
};

export default JournalResponse;