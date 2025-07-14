// components/hooks/useSpeechBubble.ts
import { useState, useCallback } from 'react';

// Encouraging messages from the dino
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
  "Even T-Rex had small arms but a big impact!",
  "You're roar-some!",
  "Fossil-icious work today!",
  "You're ex-stink-t... wait, that's extinct!",
  "Don't go extinct on your dreams!",
  "You're making dino-saur progress!",
  "Rawr means 'I love you' in dinosaur!",
  "You're pre-historic-ally awesome!",
  "Keep calm and dino on!",
  "You're one in 65 million!",
  "Stomp towards your goals!"
];

const SPEECH_DURATION = 3000; // 3 seconds

export const useSpeechBubble = () => {
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  const getRandomMessage = useCallback(() => {
    return DINO_SPEECH[Math.floor(Math.random() * DINO_SPEECH.length)];
  }, []);

  const triggerSpeechBubble = useCallback(() => {
    // Get a random encouraging message
    const message = getRandomMessage();
    setSpeechBubbleText(message);
    
    // Show the speech bubble
    setShowSpeechBubble(true);
    
    console.log(`Dino says: "${message}"`);
    
    // Hide the speech bubble after the duration
    setTimeout(() => {
      setShowSpeechBubble(false);
    }, SPEECH_DURATION);
  }, [getRandomMessage]);

  return {
    speechBubbleText,
    showSpeechBubble,
    triggerSpeechBubble
  };
};