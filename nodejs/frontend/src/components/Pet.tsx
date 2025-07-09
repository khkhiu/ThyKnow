// src/components/Pet.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingSpinner } from './LoadingSpinner';
import { apiClient } from '../api/client';

interface DinoState {
  isBlinking: boolean;
  isShowingSpeech: boolean;
  currentSpeech: string;
}

interface AffirmationData {
  id: string;
  text: string;
  type: string;
}

// Dino speech bubbles content
const DINO_SPEECH = [
  "You're doing great!",
  "Rawr! That means 'awesome' in dinosaur!",
  "I believe in you!",
  "You've got this!",
  "Keep going, you're amazing!",
  "You make this dinosaur proud!",
  "Sending prehistoric good vibes!",
  "Your growth mindset is dino-mite!",
  "Remember to be kind to yourself!",
  "Even T-Rex had small arms but a big impact!"
];

const IMAGES = {
  DINO_EYES_OPEN: "/miniapp/images/ThyKnow_dino-eyes-open.png",
  DINO_EYES_CLOSED: "/miniapp/images/ThyKnow_dino-eyes-close.png",
  BACKGROUND: "/miniapp/images/ThyKnow_background.png"
};

const TIMING = {
  BLINK_DURATION: 800,
  SPEECH_DURATION: 3000,
  INITIAL_SPEECH_DELAY: 1500,
  AUTO_BLINK_INTERVAL: 4000,
  SPEECH_INTERVAL: 8000
};

export const Pet: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dinoState, setDinoState] = useState<DinoState>({
    isBlinking: false,
    isShowingSpeech: false,
    currentSpeech: ''
  });
  const [affirmations, setAffirmations] = useState<AffirmationData[]>([]);

  const { tg, user, isReady } = useTelegram();
  const { showNotification } = useNotifications();

  // Initialize pet page
  useEffect(() => {
    if (isReady) {
      initializePet();
    }
  }, [isReady]);

  // Auto-blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      triggerBlink();
    }, TIMING.AUTO_BLINK_INTERVAL + Math.random() * 2000); // Random interval

    return () => clearInterval(blinkInterval);
  }, []);

  // Auto-speech effect
  useEffect(() => {
    const speechTimeout = setTimeout(() => {
      showRandomSpeech();
    }, TIMING.INITIAL_SPEECH_DELAY);

    const speechInterval = setInterval(() => {
      showRandomSpeech();
    }, TIMING.SPEECH_INTERVAL + Math.random() * 4000); // Random interval

    return () => {
      clearTimeout(speechTimeout);
      clearInterval(speechInterval);
    };
  }, []);

  const initializePet = async () => {
    try {
      setIsLoading(true);
      
      // Fetch affirmations if available
      if (user?.id) {
        await fetchAffirmations();
      }

      // Expand Telegram WebApp
      if (tg) {
        tg.expand();
      }

      // Show initial speech after delay
      setTimeout(() => {
        showRandomSpeech();
      }, TIMING.INITIAL_SPEECH_DELAY);

    } catch (error) {
      console.error('Error initializing pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAffirmations = async () => {
    try {
      const response = await apiClient.get('/api/miniapp/pet/affirmations');
      if (response.ok) {
        const data = await response.json();
        setAffirmations(data.affirmations || []);
      }
    } catch (error) {
      console.error('Error fetching affirmations:', error);
      // Use default speech if API fails
    }
  };

  const triggerBlink = useCallback(() => {
    setDinoState(prev => ({ ...prev, isBlinking: true }));
    
    setTimeout(() => {
      setDinoState(prev => ({ ...prev, isBlinking: false }));
    }, TIMING.BLINK_DURATION);
  }, []);

  const showRandomSpeech = useCallback(() => {
    // Choose speech source (affirmations or default)
    const speechOptions = affirmations.length > 0 
      ? affirmations.map(a => a.text)
      : DINO_SPEECH;

    const randomSpeech = speechOptions[Math.floor(Math.random() * speechOptions.length)];
    
    setDinoState(prev => ({
      ...prev,
      isShowingSpeech: true,
      currentSpeech: randomSpeech
    }));

    // Hide speech after duration
    setTimeout(() => {
      setDinoState(prev => ({
        ...prev,
        isShowingSpeech: false,
        currentSpeech: ''
      }));
    }, TIMING.SPEECH_DURATION);
  }, [affirmations]);

  const handleDinoClick = () => {
    // Trigger blink and speech on click
    triggerBlink();
    showRandomSpeech();
    showNotification("Dino says hi! 🦕");

    // Haptic feedback
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  const getRandomAffirmation = async () => {
    try {
      const response = await apiClient.get('/api/miniapp/pet/random');
      if (response.ok) {
        const data = await response.json();
        if (data.affirmation) {
          setDinoState(prev => ({
            ...prev,
            isShowingSpeech: true,
            currentSpeech: data.affirmation
          }));

          setTimeout(() => {
            setDinoState(prev => ({
              ...prev,
              isShowingSpeech: false,
              currentSpeech: ''
            }));
          }, TIMING.SPEECH_DURATION);

          // Haptic feedback
          if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        }
      }
    } catch (error) {
      console.error('Error getting random affirmation:', error);
      showRandomSpeech(); // Fallback to local speech
    }
  };

  if (!isReady || isLoading) {
    return <LoadingSpinner message="Loading your dino friend..." />;
  }

  return (
    <div className="pet-container">
      {/* Background */}
      <div 
        className="pet-background"
        style={{ backgroundImage: `url(${IMAGES.BACKGROUND})` }}
      >
        {/* Dino Character */}
        <div className="dino-container" onClick={handleDinoClick}>
          <img
            src={dinoState.isBlinking ? IMAGES.DINO_EYES_CLOSED : IMAGES.DINO_EYES_OPEN}
            alt="ThyKnow Dino Friend"
            className={`dino-image ${dinoState.isBlinking ? 'blinking' : ''}`}
          />
          
          {/* Speech Bubble */}
          {dinoState.isShowingSpeech && (
            <div className="speech-bubble">
              <div className="speech-content">
                {dinoState.currentSpeech}
              </div>
              <div className="speech-tail"></div>
            </div>
          )}
        </div>

        {/* Interaction Controls */}
        <div className="pet-controls">
          <button
            className="pet-button primary"
            onClick={getRandomAffirmation}
          >
            Get Encouragement
          </button>
          
          <button
            className="pet-button secondary"
            onClick={handleDinoClick}
          >
            Say Hi to Dino
          </button>
        </div>

        {/* Pet Stats/Info */}
        <div className="pet-info">
          <div className="pet-stat">
            <span className="stat-label">Dino Mood:</span>
            <span className="stat-value">Happy! 😊</span>
          </div>
          <div className="pet-stat">
            <span className="stat-label">Friendship Level:</span>
            <span className="stat-value">Best Friends 💖</span>
          </div>
        </div>
      </div>
    </div>
  );
};