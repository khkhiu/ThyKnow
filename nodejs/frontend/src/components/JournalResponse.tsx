// components/JournalResponse.tsx
import React, { useState, useEffect } from 'react';
import { Send, Save, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTelegram } from './TelegramProvider';

interface JournalResponseProps {
  onSubmit: (response: string) => Promise<boolean>;
  onSave?: (response: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

const JournalResponse: React.FC<JournalResponseProps> = ({
  onSubmit,
  onSave,
  isLoading,
  placeholder = "Share your thoughts and reflections...",
  className = ''
}) => {
  const [response, setResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const { hapticFeedback } = useTelegram();

  // Update word and character counts
  useEffect(() => {
    const words = response.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(response.length);
  }, [response]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
    setSubmitted(false);
  };

  // Handle save (local storage or callback)
  const handleSave = async () => {
    if (!response.trim()) return;
    
    setIsSaving(true);
    hapticFeedback?.('light');
    
    try {
      if (onSave) {
        onSave(response);
      } else {
        // Save to localStorage as fallback
        const savedResponses = JSON.parse(localStorage.getItem('journalResponses') || '[]');
        savedResponses.push({
          id: Date.now(),
          response,
          timestamp: new Date().toISOString(),
          saved: true
        });
        localStorage.setItem('journalResponses', JSON.stringify(savedResponses));
      }
      
      // Brief success feedback
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Error saving response:', error);
      setIsSaving(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    hapticFeedback?.('medium');
    
    try {
      const success = await onSubmit(response);
      if (success) {
        setSubmitted(true);
        hapticFeedback?.('success');
        // Clear response after successful submission
        setTimeout(() => {
          setResponse('');
          setSubmitted(false);
        }, 2000);
      } else {
        hapticFeedback?.('error');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      hapticFeedback?.('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get dynamic placeholder based on word count
  const getDynamicPlaceholder = () => {
    if (wordCount === 0) return placeholder;
    if (wordCount < 10) return "Keep going, you're doing great! Share more thoughts...";
    if (wordCount < 25) return "Wonderful reflection! Add more details if you'd like...";
    return "Beautiful insights! Feel free to continue or submit when ready...";
  };

  // Get encouragement message
  const getEncouragementMessage = () => {
    if (wordCount === 0) return null;
    if (wordCount < 5) return "Great start! 🌱";
    if (wordCount < 15) return "You're building something beautiful! ✨";
    if (wordCount < 30) return "Wonderful depth of reflection! 🌟";
    return "Incredible self-awareness! 🚀";
  };

  if (submitted) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 ${className}`}>
        <div className="text-center space-y-3">
          <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-green-800">Reflection Submitted!</h3>
          <p className="text-green-600 text-sm">
            Thank you for sharing your thoughts. Your reflection has been saved and is contributing to your growth journey.
          </p>
          <div className="flex items-center justify-center space-x-1 text-green-600">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Keep reflecting, keep growing</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-800">Your Reflection</h3>
          </div>
          
          {/* Word count and encouragement */}
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {wordCount} words • {charCount} characters
            </div>
            {getEncouragementMessage() && (
              <div className="text-xs text-purple-600 font-medium">
                {getEncouragementMessage()}
              </div>
            )}
          </div>
        </div>

        {/* Text area */}
        <Textarea
          value={response}
          onChange={handleInputChange}
          placeholder={getDynamicPlaceholder()}
          className="min-h-[120px] border-gray-200 focus:border-purple-300 focus:ring-purple-200 resize-none"
          disabled={isLoading || isSubmitting}
        />

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            variant="outline"
            disabled={!response.trim() || isSaving || isSubmitting}
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!response.trim() || isSubmitting || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>

        {/* Writing tips */}
        {wordCount === 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="text-blue-500">💡</div>
              <div className="text-blue-700 text-sm">
                <span className="font-medium">Tip:</span> There's no right or wrong way to reflect. 
                Write freely about whatever comes to mind regarding today's prompt.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalResponse;