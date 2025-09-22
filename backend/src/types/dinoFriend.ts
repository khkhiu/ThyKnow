// src/types/dinoFriend.ts
// Type definitions for the ThyKnow Dino Friend feature

export interface DinoSpeech {
  text: string;
}

export interface ImagePaths {
  DINO_EYES_OPEN: string;
  DINO_EYES_CLOSED: string;
  BACKGROUND: string;
}

export interface AnimationTiming {
  BLINK_DURATION: number;
  SPEECH_DURATION: number;
  INITIAL_SPEECH_DELAY: number;
  LOADING_HIDE_DELAY: number;
}

export interface DomElements {
  LOADING: string;
  BACKGROUND: string;
  DINO_IMAGE: string;
  SPEECH_BUBBLE: string;
}

export interface DinoState {
  eyesOpen: boolean;
  isAnimating: boolean;
}