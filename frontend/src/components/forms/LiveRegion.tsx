/**
 * Live Region Component for Real-time Accessibility Announcements
 */
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearOnUnmount?: boolean;
  className?: string;
}

export function LiveRegion({ 
  message, 
  politeness = 'polite',
  clearOnUnmount = true,
  className 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = '';
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic="true"
      className={cn(
        'sr-only', // Screen reader only - visually hidden
        className
      )}
    >
      {message}
    </div>
  );
}

/**
 * Form Validation Live Region Hook
 * Manages form-level error announcements for screen readers
 */
interface UseFormLiveRegionOptions {
  politeness?: 'polite' | 'assertive';
  debounceMs?: number;
}

export function useFormLiveRegion(options: UseFormLiveRegionOptions = {}) {
  const { politeness = 'polite', debounceMs = 300 } = options;
  const [message, setMessage] = React.useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announceError = React.useCallback((errorMessage: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setMessage(errorMessage);
    }, debounceMs);
  }, [debounceMs]);

  const announceSuccess = React.useCallback((successMessage: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setMessage(successMessage);
  }, []);

  const clearMessage = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage('');
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const LiveRegionComponent = React.useCallback(() => (
    <LiveRegion message={message} politeness={politeness} />
  ), [message, politeness]);

  return {
    announceError,
    announceSuccess,
    clearMessage,
    LiveRegion: LiveRegionComponent,
  };
}

/**
 * Form Submission Feedback Component
 * Provides accessible feedback for form submission states
 */
interface FormFeedbackProps {
  isSubmitting?: boolean;
  submitSuccess?: boolean;
  submitError?: string;
  successMessage?: string;
  onClearFeedback?: () => void;
}

export function FormSubmissionFeedback({
  isSubmitting = false,
  submitSuccess = false,
  submitError,
  successMessage = 'Form submitted successfully',
  onClearFeedback
}: FormFeedbackProps) {
  const [currentMessage, setCurrentMessage] = React.useState('');

  React.useEffect(() => {
    if (isSubmitting) {
      setCurrentMessage('Submitting form, please wait...');
    } else if (submitSuccess) {
      setCurrentMessage(successMessage);
    } else if (submitError) {
      setCurrentMessage(`Error: ${submitError}`);
    } else {
      setCurrentMessage('');
    }
  }, [isSubmitting, submitSuccess, submitError, successMessage]);

  // Clear feedback after successful submission
  React.useEffect(() => {
    if (submitSuccess && onClearFeedback) {
      const timeout = setTimeout(() => {
        onClearFeedback();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [submitSuccess, onClearFeedback]);

  return (
    <LiveRegion 
      message={currentMessage} 
      politeness={submitError ? 'assertive' : 'polite'} 
    />
  );
}