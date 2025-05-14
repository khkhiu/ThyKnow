// config.js - Configuration settings for the mini app

/**
 * DOM element IDs for easy reference
 */
export const ELEMENTS = {
  LOADING: 'loading',
  CONTENT: 'content',
  ERROR: 'error',
  PROMPT_TYPE: '.prompt-type',
  PROMPT_TEXT: '.prompt-text',
  PROMPT_HINT: '.prompt-hint',
  RESPONSE_FIELD: 'response',
  SUBMIT_BUTTON: 'submit-response',
  NEW_PROMPT_BUTTON: 'new-prompt-button',
  HISTORY_ENTRIES: 'history-entries',
  EMPTY_HISTORY: 'empty-history',
  NOTIFICATION_CONTAINER: 'notification-container',
  RETRY_BUTTON: 'retry-button',
  DATE_FILTER: 'date-filter',
  CUSTOM_DATE_CONTAINER: 'custom-date-container',
  CUSTOM_DATE: 'custom-date',
  APPLY_DATE: 'apply-date'
};

/**
 * Animation timing constants (in milliseconds)
 */
export const TIMING = {
  NOTIFICATION_DURATION: 3000,
  PULSE_DURATION: 5000,
  SCROLL_DURATION: 500
};

/**
 * API endpoints
 */
export const API = {
  CONFIG: '/miniapp/config',
  USER: '/miniapp/user/',
  TODAYS_PROMPT: '/api/miniapp/prompts/today/',
  NEW_PROMPT: '/api/miniapp/prompts/new/',
  HISTORY: '/api/miniapp/history/',
  RESPONSES: '/api/miniapp/responses',
  RANDOM_AFFIRMATION: '/api/miniapp/pet/random',
  RANDOM_MESSAGE: '/api/miniapp/dinoMessages/random'
};

/**
 * Fallback data for offline or error scenarios
 */
export const FALLBACKS = {
  PROMPT: {
    type: 'self_awareness',
    typeLabel: '🧠 Self-Awareness',
    text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
    hint: '🌿 Think about how your experience compared to your normal routine.'
  },
  HISTORY: [
    {
      date: '2025-04-30',
      promptType: 'connections',
      prompt: '🦖 Fossilized Friendships Await! Reconnect with someone you have not spoken to in a while—send them a message and see what happens!',
      response: 'Just reconnected with an old friend, and it felt really nice! Some bonds never really fade—just need a little nudge. If someone is on your mind, this is your sign to reach out!'
    },
    {
      date: '2025-04-23',
      promptType: 'self_awareness',
      prompt: '🌋 Meteor Strike! Turn Chaos into Growth. Recall a recent failure or setback that felt like a meteor hit.',
      response: 'Failed a presentation at work last week. Initially felt terrible, but realized I had not prepared enough and was trying to wing it. Lesson: preparation matters, and failures are just feedback.'
    }
  ]
};