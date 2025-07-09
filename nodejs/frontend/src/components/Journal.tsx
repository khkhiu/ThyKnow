// src/components/Journal.tsx
import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { usePrompts } from '../hooks/usePrompts';
import { useHistory } from '../hooks/useHistory';
import { useNotifications } from '../hooks/useNotifications';
import { PromptDisplay } from './PromptDisplay';
import { HistoryList } from './HistoryList';
import { ThemeToggle } from './ThemeToggle';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { PromptData } from '../types/miniapp';

export const Journal: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptData | null>(null);
  const [response, setResponse] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'history'>('prompt');

  const { tg, user, isReady } = useTelegram();
  const { getTodaysPrompt, getNewPrompt, submitResponse, isSubmitting } = usePrompts();
  const { entries, fetchHistory, isLoadingHistory } = useHistory();
  const { showNotification } = useNotifications();

  // Initialize the journal when Telegram is ready
  useEffect(() => {
    if (isReady && user?.id) {
      initializeJournal();
    }
  }, [isReady, user?.id]);

  const initializeJournal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get today's prompt
      const promptData = await getTodaysPrompt(user!.id);
      setCurrentPrompt(promptData);

      // Fetch recent history
      await fetchHistory(user!.id, 10);

      // Expand Telegram WebApp
      if (tg) {
        tg.expand();
      }
    } catch (err) {
      console.error('Error initializing journal:', err);
      setError('Failed to load journal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPrompt = async () => {
    if (!user?.id) return;

    try {
      const newPrompt = await getNewPrompt(user.id);
      setCurrentPrompt(newPrompt);
      setResponse('');
      showNotification('New prompt generated!');
      
      // Haptic feedback
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error('Error getting new prompt:', err);
      showNotification('Failed to get new prompt. Please try again.');
    }
  };

  const handleSubmitResponse = async () => {
    if (!user?.id || !currentPrompt || !response.trim()) return;

    try {
      await submitResponse(user.id, currentPrompt.id, response);
      showNotification('Response saved successfully!');
      
      // Clear response and refresh history
      setResponse('');
      await fetchHistory(user.id, 10);
      
      // Haptic feedback
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      showNotification('Failed to save response. Please try again.');
    }
  };

  const handleRetry = () => {
    initializeJournal();
  };

  if (!isReady) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p className="loading-message">Connecting to Telegram...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p className="loading-message">Loading your journal...</p>
      </div>
    );
  }

  return (
    <div className="journal-container">
      {/* Header */}
      <div className="journal-header">
        <h1 className="journal-title">ThyKnow Journal</h1>
        <ThemeToggle />
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'prompt' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompt')}
        >
          Today's Prompt
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'prompt' && (
          <div className="prompt-tab">
            {currentPrompt && (
              <PromptDisplay
                prompt={currentPrompt}
                response={response}
                onResponseChange={setResponse}
                onSubmit={handleSubmitResponse}
                onNewPrompt={handleNewPrompt}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <HistoryList
              entries={entries}
              isLoading={isLoadingHistory}
              onRefresh={() => fetchHistory(user!.id, 10)}
            />
          </div>
        )}
      </div>
    </div>
  );
};