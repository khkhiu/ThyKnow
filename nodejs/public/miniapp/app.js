// ThyKnow Telegram Mini App

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Global variable to store all history entries
let allHistoryEntries = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Expand the WebApp to full height
  tg.expand();
  
  // Set the theme
  updateTheme();
  
  // Initialize app
  initApp();
  
  // Handle theme toggle
  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
  
  // Handle submit response
  document.getElementById('submit-response').addEventListener('click', submitResponse);
  
  // Handle new prompt button
  document.getElementById('new-prompt-button').addEventListener('click', fetchNewPrompt);
  
  // Handle retry button
  document.getElementById('retry-button').addEventListener('click', initApp);
  
  // Log initialization data for debugging
  console.debug('Telegram Init Data:', tg.initData);
  
  // Create a global fetch wrapper that includes Telegram init data
  window.originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Create new options object to avoid modifying the original
    const newOptions = { ...options };
    
    // Initialize headers if not present
    newOptions.headers = newOptions.headers || {};
    
    // Add Telegram init data to headers
    if (tg.initData) {
      newOptions.headers = {
        ...newOptions.headers,
        'X-Telegram-Init-Data': tg.initData
      };
    }
    
    // Call original fetch with updated options
    return window.originalFetch(url, newOptions);
  };
});

// Initialize the app
async function initApp() {
  try {
    // Set loading state
    showElement('loading');
    hideElement('content');
    hideElement('error');
    
    // Get app config
    const config = await fetchConfig();
    
    // Get user data (if available)
    const userData = await fetchUserData();
    
    // Check for timestamp parameter in URL - this indicates we should fetch a new prompt
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('t');
    
    let promptData;
    if (timestamp) {
      // If timestamp parameter exists, force a new prompt instead of getting the current one
      console.log('Timestamp found in URL, fetching new prompt');
      promptData = await fetchNewPromptDirectly();
    } else {
      // Otherwise get today's prompt as usual
      promptData = await fetchTodaysPrompt();
    }
    
    // Get history entries
    const historyData = await fetchHistory();
    
    // Update UI with data
    updatePrompt(promptData);
    updateHistory(historyData);
    
    // Show content
    hideElement('loading');
    showElement('content');
    
    // Setup back button handler
    tg.BackButton.onClick(handleBackButton);
    
    // Setup main button (if needed)
    setupMainButton();
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
  } catch (error) {
    console.error('App initialization error:', error);
    showError('Failed to load the app. Please try again.');
  }
}

// Fetch app configuration
async function fetchConfig() {
  try {
    const response = await fetch('/miniapp/config');
    return await response.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    throw new Error('Failed to load app configuration');
  }
}

// Fetch user data
async function fetchUserData() {
  try {
    // Get user from Telegram WebApp
    const telegramUser = tg.initDataUnsafe?.user;
    
    if (!telegramUser || !telegramUser.id) {
      console.warn('No user data available from Telegram');
      return null;
    }
    
    // Fetch user data from our backend
    const response = await fetch(`/miniapp/user/${telegramUser.id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Fetch today's prompt
async function fetchTodaysPrompt() {
    try {
      // Get user from Telegram WebApp
      const telegramUser = tg.initDataUnsafe?.user;
      
      if (!telegramUser || !telegramUser.id) {
        console.warn('No user data available from Telegram');
        throw new Error('User data not available');
      }
      
      // Fetch prompt from our API
      const response = await fetch(`/api/miniapp/prompts/today/${telegramUser.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching today\'s prompt:', error);
      
      // Return a fallback prompt if the API call fails
      return {
        type: 'self_awareness',
        typeLabel: '🧠 Self-Awareness',
        text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
        hint: '🌿 Think about how your experience compared to your normal routine.'
      };
    }
}

// Fetch a new prompt 
async function fetchNewPrompt() {
  try {
    // Get user from Telegram WebApp
    const telegramUser = tg.initDataUnsafe?.user;
    
    if (!telegramUser || !telegramUser.id) {
      console.warn('No user data available from Telegram');
      throw new Error('User data not available');
    }
    
    // Show loading state on the button
    const newPromptButton = document.getElementById('new-prompt-button');
    newPromptButton.disabled = true;
    newPromptButton.classList.add('loading');
    
    // Fetch new prompt from our API
    const response = await fetch(`/api/miniapp/prompts/new/${telegramUser.id}`, {
      method: 'POST'
    });
    
    // Reset button state
    newPromptButton.disabled = false;
    newPromptButton.classList.remove('loading');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new prompt: ${response.statusText}`);
    }
    
    const promptData = await response.json();
    
    // Clear completed state if it exists
    const promptCard = document.querySelector('.prompt-card');
    promptCard.classList.remove('completed');
    
    // Remove the completed message if it exists
    const completedMessage = document.querySelector('.completed-message');
    if (completedMessage) {
      completedMessage.remove();
    }
    
    // Update the UI with the new prompt
    updatePrompt(promptData);
    
    // Show notification
    showNotification('New prompt generated!');
    
    // Provide haptic feedback
    tg.HapticFeedback.notificationOccurred('success');
    
    // Scroll to the top to focus on the new prompt
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Clear any existing response
    document.getElementById('response').value = '';
  } catch (error) {
    console.error('Error fetching new prompt:', error);
    showNotification('Failed to get a new prompt. Please try again.', 'error');
    tg.HapticFeedback.notificationOccurred('error');
  }
}
  
// Fetch history entries
async function fetchHistory() {
  try {
    // Get user from Telegram WebApp
    const telegramUser = tg.initDataUnsafe?.user;
    
    if (!telegramUser || !telegramUser.id) {
      console.warn('No user data available from Telegram');
      throw new Error('User data not available');
    }
    
    // Fetch history from our API
    const response = await fetch(`/api/miniapp/history/${telegramUser.id}?limit=50`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    
    // Store all entries in the global variable
    allHistoryEntries = await response.json();
    
    return allHistoryEntries;
  } catch (error) {
    console.error('Error fetching history:', error);
    
    // Return fallback data if the API call fails
    allHistoryEntries = [
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
    ];
    
    return allHistoryEntries;
  }
}

// Utility function to safely process text with line breaks
function processTextWithLineBreaks(text) {
  if (!text) return '';
  
  // First, escape any HTML to prevent XSS
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // Return the escaped text - line breaks will be handled by CSS
  return escapeHtml(text);
}


// Update prompt UI
function updatePrompt(promptData) {
  if (!promptData) return;
  
  const promptTypeElement = document.querySelector('.prompt-type');
  const promptTextElement = document.querySelector('.prompt-text');
  const promptHintElement = document.querySelector('.prompt-hint');
  
  promptTypeElement.textContent = promptData.typeLabel || 'Today\'s Prompt';
  // Use the utility function to process the text
  promptTextElement.textContent = promptData.text || 'No prompt available for today.';
  promptHintElement.textContent = promptData.hint || '';
}

// Update history UI
function updateHistory(historyData) {
  // Store all entries in the global variable
  allHistoryEntries = historyData || [];
  
  // Initial display with all entries
  updateHistoryDisplay(allHistoryEntries);
    
  // Initialize the date filtering controls
  initDateFiltering();

  const historyContainer = document.getElementById('history-entries');
  historyContainer.innerHTML = '';
  
  if (!historyData || historyData.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-history">
        <p>No journal entries yet. Start your journey by responding to today's prompt!</p>
      </div>
    `;
    return;
  }
  
  historyData.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'history-entry';
    
    entryElement.innerHTML = `
      <div class="history-date">${formatDate(entry.date)}</div>
      <div class="history-prompt">${entry.prompt}</div>
      <div class="history-response">${entry.response}</div>
    `;
    
    historyContainer.appendChild(entryElement);
  });
}

// Show completed state to encourage user to get a new prompt
function showCompletedState() {
  // Get prompt card and add a "completed" class
  const promptCard = document.querySelector('.prompt-card');
  promptCard.classList.add('completed');
  
  // Focus attention on the "New Prompt" button
  const newPromptButton = document.getElementById('new-prompt-button');
  newPromptButton.classList.add('pulse-attention');
  
  // Add a hint message inside the prompt card
  const completedMessage = document.createElement('div');
  completedMessage.className = 'completed-message';
  completedMessage.innerHTML = `
    <div class="completed-icon">✓</div>
    <p>Great job! You've completed this prompt.</p>
    <p class="completed-hint">Click "New Prompt" when you're ready for the next one.</p>
  `;
  
  // Insert after the prompt hint
  const promptHint = document.querySelector('.prompt-hint');
  promptHint.insertAdjacentElement('afterend', completedMessage);
  
  // Scroll to make "New Prompt" button visible
  newPromptButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Add a gentle pulse animation to the button
  setTimeout(() => {
    // Remove the pulse class after a few seconds
    newPromptButton.classList.remove('pulse-attention');
  }, 5000);
}

// Submit response
async function submitResponse() {
  const responseText = document.getElementById('response').value.trim();
  
  if (!responseText) {
    showNotification('Please enter your response first');
    return;
  }
  
  try {
    // Get user from Telegram WebApp
    const telegramUser = tg.initDataUnsafe?.user;
    
    if (!telegramUser || !telegramUser.id) {
      throw new Error('User data not available');
    }
    
    // Show loading state
    const submitButton = document.getElementById('submit-response');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    // Submit response to API
    const response = await fetch('/api/miniapp/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: telegramUser.id,
        response: responseText
      })
    });
    
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save response');
    }
    
    // Parse response data
    const responseData = await response.json();
    
    // Clear the response field
    document.getElementById('response').value = '';
    
    // Show success notification
    showNotification('Response saved successfully! Use the "New Prompt" button when you\'re ready for a new prompt.');
    
    // Notify Telegram app (vibrate and show notification)
    tg.HapticFeedback.notificationOccurred('success');
    
    // Show the "completed" state to encourage using the New Prompt button
    showCompletedState();
    
    // Refresh history
    const historyData = await fetchHistory();
    updateHistory(historyData);
  } catch (error) {
    console.error('Error submitting response:', error);
    showNotification('Failed to save your response. Please try again.');
    tg.HapticFeedback.notificationOccurred('error');
  }
}

// Setup main button
function setupMainButton() {
  // For now, we're not using the main button
  // If needed, uncomment and customize:
  /*
  tg.MainButton.setText('Submit Response');
  tg.MainButton.onClick(() => {
    submitResponse();
  });
  tg.MainButton.show();
  */
}

// Handle back button
function handleBackButton() {
  // If we have internal navigation, handle it here
  // For now, just close the app
  tg.close();
}

// Show notification
function showNotification(message, type = 'success') {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    
    // Create it if it doesn't exist
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.bottom = '20px';
      notificationContainer.style.left = '50%';
      notificationContainer.style.transform = 'translateX(-50%)';
      notificationContainer.style.zIndex = '1000';
      document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = 'var(--box-shadow)';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // Add message
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      
      // Remove from DOM after fade out
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

// Show error
function showError(message) {
  hideElement('loading');
  hideElement('content');
  
  const errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  
  showElement('error');
}

// Update theme based on Telegram color scheme
function updateTheme() {
  const isDarkMode = tg.colorScheme === 'dark';
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// Toggle theme (for manual testing)
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  
  const toggleIcon = document.querySelector('.theme-toggle i');
  const toggleLabel = document.querySelector('.toggle-label');
  
  if (isDark) {
    toggleIcon.className = 'fas fa-sun';
    toggleLabel.textContent = 'Light Mode';
  } else {
    toggleIcon.className = 'fas fa-moon';
    toggleLabel.textContent = 'Dark Mode';
  }
}

// Helper functions
function showElement(id) {
  document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

// Fetch a new prompt directly without button interaction when opening Telegram mini-app
async function fetchNewPromptDirectly() {
  try {
    // Get user from Telegram WebApp
    const telegramUser = tg.initDataUnsafe?.user;
    
    if (!telegramUser || !telegramUser.id) {
      console.warn('No user data available from Telegram');
      throw new Error('User data not available');
    }
    
    // Fetch new prompt from our API
    const response = await fetch(`/api/miniapp/prompts/new/${telegramUser.id}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new prompt: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching new prompt directly:', error);
    
    // Return a fallback prompt if the API call fails
    return {
      type: 'self_awareness',
      typeLabel: '🧠 Self-Awareness',
      text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
      hint: '🌿 Think about how your experience compared to your normal routine.'
    };
  }
}

function initDateFiltering() {
  const dateFilter = document.getElementById('date-filter');
  const customDateContainer = document.getElementById('custom-date-container');
  const customDateInput = document.getElementById('custom-date');
  const applyDateButton = document.getElementById('apply-date');
  
  // Set today's date as the default for custom date
  const today = new Date();
  const formattedDate = formatDateForInput(today);
  customDateInput.value = formattedDate;
  
  // Handle filter change
  dateFilter.addEventListener('change', () => {
    if (dateFilter.value === 'custom') {
      customDateContainer.style.display = 'flex';
    } else {
      customDateContainer.style.display = 'none';
      // Apply filter immediately for non-custom options
      filterHistoryByDate(dateFilter.value);
    }
  });
  
  // Handle apply button click
  applyDateButton.addEventListener('click', () => {
    filterHistoryByDate('custom', customDateInput.value);
  });
  
  // Also filter when pressing enter in date input
  customDateInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      filterHistoryByDate('custom', customDateInput.value);
    }
  });
}

// Format date as YYYY-MM-DD for date input
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse ISO date string to local date object
function parseISODate(dateString) {
  return new Date(dateString);
}

// Check if a date is today
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Check if a date is within this week
function isThisWeek(date) {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // End of week (Saturday)
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

// Check if a date is within this month
function isThisMonth(date) {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Filter history entries by date
function filterHistoryByDate(filterType, customDate = null) {
  if (!allHistoryEntries || allHistoryEntries.length === 0) {
    return;
  }
  
  let filteredEntries = [];
  
  switch (filterType) {
    case 'all':
      filteredEntries = [...allHistoryEntries];
      break;
      
    case 'today':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isToday(entryDate);
      });
      break;
      
    case 'week':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisWeek(entryDate);
      });
      break;
      
    case 'month':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisMonth(entryDate);
      });
      break;
      
    case 'custom':
      if (customDate) {
        const selectedDate = new Date(customDate);
        filteredEntries = allHistoryEntries.filter(entry => {
          const entryDate = parseISODate(entry.date);
          return entryDate.getDate() === selectedDate.getDate() &&
                 entryDate.getMonth() === selectedDate.getMonth() &&
                 entryDate.getFullYear() === selectedDate.getFullYear();
        });
      }
      break;
  }
  
  // Update the UI with filtered entries
  updateHistoryDisplay(filteredEntries);
}

// Update the history display with filtered entries
function updateHistoryDisplay(entries) {
  const historyContainer = document.getElementById('history-entries');
  const emptyHistory = document.getElementById('empty-history');
  
  if (entries.length === 0) {
    historyContainer.style.display = 'none';
    emptyHistory.style.display = 'block';
    return;
  }
  
  historyContainer.style.display = 'block';
  emptyHistory.style.display = 'none';
  historyContainer.innerHTML = '';
  
  entries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'history-entry';
    
    entryElement.innerHTML = `
      <div class="history-date">${formatDate(entry.date)}</div>
      <div class="history-prompt">${entry.prompt}</div>
      <div class="history-response">${entry.response}</div>
    `;
    
    historyContainer.appendChild(entryElement);
  });
}