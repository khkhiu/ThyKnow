// src/components/PromptDisplay.tsx
import React from 'react';
import { PromptData } from '../types/miniapp';

interface PromptDisplayProps {
  prompt: PromptData;
  response: string;
  onResponseChange: (response: string) => void;
  onSubmit: () => void;
  onNewPrompt: () => void;
  isSubmitting: boolean;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  prompt,
  response,
  onResponseChange,
  onSubmit,
  onNewPrompt,
  isSubmitting
}) => {
  const isResponseValid = response.trim().length > 0;

  return (
    <div className="prompt-display">
      {/* Prompt Content */}
      <div className="prompt-content">
        <div className="prompt-header">
          <h2 className="prompt-title">Today's Reflection</h2>
          <span className="prompt-type">{prompt.type}</span>
        </div>
        
        <div className="prompt-question">
          <p>{prompt.prompt}</p>
        </div>
        
        {prompt.category && (
          <div className="prompt-category">
            <span className="category-label">Category:</span>
            <span className="category-value">{prompt.category}</span>
          </div>
        )}
      </div>

      {/* Response Input */}
      <div className="response-section">
        <label htmlFor="response-input" className="response-label">
          Your Response
        </label>
        <textarea
          id="response-input"
          className="response-input"
          placeholder="Share your thoughts..."
          value={response}
          onChange={(e) => onResponseChange(e.target.value)}
          rows={6}
          disabled={isSubmitting}
        />
        <div className="response-counter">
          {response.length} characters
        </div>
      </div>

      {/* Action Buttons */}
      <div className="prompt-actions">
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!isResponseValid || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Response'}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={onNewPrompt}
          disabled={isSubmitting}
        >
          Get New Prompt
        </button>
      </div>
    </div>
  );
};