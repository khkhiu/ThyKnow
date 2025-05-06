// ThyKnow Telegram Mini App

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

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
    
    // Get today's prompt
    const promptData = await fetchTodaysPrompt();
    
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
    const response = await fetch(`/api/miniapp/history/${telegramUser.id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    
    // Return fallback data if the API call fails
    return [
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
      
      // Parse response data which includes the new prompt
      const responseData = await response.json();
      
      // Clear the response field
      document.getElementById('response').value = '';
      
      // Show success notification
      showNotification('Response saved successfully! A new prompt has been generated.');
      
      // Notify Telegram app (vibrate and show notification)
      tg.HapticFeedback.notificationOccurred('success');
      
      // Update the prompt with the new one
      if (responseData.newPrompt) {
        updatePrompt(responseData.newPrompt);
        
        // Scroll to the top to show the new prompt
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
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