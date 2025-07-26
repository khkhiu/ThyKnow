// frontend/src/hooks/useDeepLink.ts
// Hook for handling deep link parameters from bot commands

import { useState, useEffect } from 'react';

export interface DeepLinkParams {
  page?: 'prompt' | 'history' | 'streak' | 'choose' | 'pet' | 'home';
  action?: 'new' | 'choose' | 'view';
  type?: string;
  ref?: string;
  t?: string; // timestamp
}

export interface DeepLinkState {
  params: DeepLinkParams;
  isFromBot: boolean;
  referenceSource: string | null;
  hasDeepLink: boolean;
}

export function useDeepLink(): DeepLinkState {
  const [deepLinkState, setDeepLinkState] = useState<DeepLinkState>({
    params: {},
    isFromBot: false,
    referenceSource: null,
    hasDeepLink: false
  });

  useEffect(() => {
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    
    const params: DeepLinkParams = {
      page: urlParams.get('page') as DeepLinkParams['page'] || undefined,
      action: urlParams.get('action') as DeepLinkParams['action'] || undefined,
      type: urlParams.get('type') || undefined,
      ref: urlParams.get('ref') || undefined,
      t: urlParams.get('t') || undefined
    };

    // Check if this is from a bot command
    const isFromBot = !!(params.ref && params.ref.startsWith('bot_'));
    const hasDeepLink = !!(params.page || params.action || params.type);

    setDeepLinkState({
      params,
      isFromBot,
      referenceSource: params.ref || null,
      hasDeepLink
    });

    // Clean up URL after processing (optional)
    if (hasDeepLink && window.history.replaceState) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Track deep link usage
    if (hasDeepLink) {
      console.log('Deep link processed:', params);
      
      // Send analytics if available
      if (window.gtag) {
        window.gtag('event', 'deep_link_used', {
          page: params.page,
          action: params.action,
          ref: params.ref
        });
      }
    }
  }, []);

  return deepLinkState;
}

/**
 * Hook for executing deep link actions
 */
export function useDeepLinkHandler() {
  const deepLink = useDeepLink();

  const executeDeepLinkAction = (
    onNavigate: (page: string) => void,
    onAction?: (action: string, params: DeepLinkParams) => void
  ) => {
    if (!deepLink.hasDeepLink) return;

    const { page, action, type } = deepLink.params;

    // Handle page navigation
    if (page) {
      switch (page) {
        case 'prompt':
          onNavigate('/miniapp');
          if (action === 'new' && onAction) {
            onAction('new_prompt', deepLink.params);
          }
          break;
        case 'history':
          onNavigate('/miniapp/history');
          break;
        case 'streak':
          onNavigate('/miniapp/streak');
          break;
        case 'choose':
          onNavigate('/miniapp');
          if (onAction) {
            onAction('show_prompt_chooser', deepLink.params);
          }
          break;
        case 'pet':
          onNavigate('/miniapp/pet');
          break;
        case 'home':
        default:
          onNavigate('/miniapp');
          break;
      }
    }

    // Handle specific actions
    if (action && onAction) {
      onAction(action, deepLink.params);
    }
  };

  return {
    ...deepLink,
    executeDeepLinkAction
  };
}

/**
 * Generate deep link URLs for sharing or navigation
 */
export function generateDeepLink(params: DeepLinkParams): string {
  const baseUrl = window.location.origin;
  const urlParams = new URLSearchParams();
  
  if (params.page) urlParams.set('page', params.page);
  if (params.action) urlParams.set('action', params.action);
  if (params.type) urlParams.set('type', params.type);
  if (params.ref) urlParams.set('ref', params.ref);
  
  // Add timestamp to force refresh
  urlParams.set('t', Date.now().toString());
  
  return `${baseUrl}/miniapp?${urlParams.toString()}`;
}

// Type declarations for analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      parameters?: Record<string, any>
    ) => void;
  }
}