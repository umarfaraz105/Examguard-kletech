/**
 * useLoadingStatus Hook - Manages loading states with accessibility support
 * 
 * This hook provides enhanced loading state management with built-in
 * screen reader announcements and accessibility attributes.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useStatusAnnouncement } from './useStatusAnnouncement';

export interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  progress?: number;
  error?: string | null;
}

export interface LoadingStatusOptions {
  initialLoadingText?: string;
  announceStart?: boolean;
  announceComplete?: boolean;
  announceError?: boolean;
  progressAnnouncements?: boolean;
  progressInterval?: number; // Announce progress every N percent
}

export function useLoadingStatus(options: LoadingStatusOptions = {}) {
  const {
    initialLoadingText = 'Loading',
    announceStart = true,
    announceComplete = true,
    announceError = true,
    progressAnnouncements = false,
    progressInterval = 25
  } = options;

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingText: initialLoadingText,
    progress: undefined,
    error: null
  });

  const { announce, announceLoading, announceError } = useStatusAnnouncement();
  const lastAnnouncedProgress = useRef<number>(0);
  const loadingId = useRef<string>(`loading-${Date.now()}-${Math.random()}`);

  /**
   * Start loading with optional custom text
   */
  const startLoading = useCallback((customText?: string) => {
    const loadingText = customText || initialLoadingText;
    
    setLoadingState({
      isLoading: true,
      loadingText,
      progress: undefined,
      error: null
    });

    if (announceStart) {
      announceLoading(true, loadingText.toLowerCase());
    }

    lastAnnouncedProgress.current = 0;
  }, [initialLoadingText, announceStart, announceLoading]);

  /**
   * Update loading progress (0-100)
   */
  const setProgress = useCallback((progress: number, customText?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      loadingText: customText || prev.loadingText
    }));

    // Announce progress at intervals
    if (progressAnnouncements && progressInterval > 0) {
      const roundedProgress = Math.floor(progress / progressInterval) * progressInterval;
      
      if (roundedProgress > lastAnnouncedProgress.current && roundedProgress < 100) {
        announce(`${roundedProgress}% complete`, { priority: 'polite' });
        lastAnnouncedProgress.current = roundedProgress;
      }
    }
  }, [progressAnnouncements, progressInterval, announce]);

  /**
   * Update loading text without changing loading state
   */
  const setLoadingText = useCallback((text: string, announceChange: boolean = false) => {
    setLoadingState(prev => ({
      ...prev,
      loadingText: text
    }));

    if (announceChange) {
      announce(text, { priority: 'polite' });
    }
  }, [announce]);

  /**
   * Stop loading successfully
   */
  const stopLoading = useCallback((successMessage?: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      error: null
    }));

    if (announceComplete) {
      const message = successMessage || `${loadingState.loadingText} complete`;
      announceLoading(false, message);
    }
  }, [announceComplete, announceLoading, loadingState.loadingText]);

  /**
   * Stop loading with error
   */
  const setError = useCallback((errorMessage: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));

    if (announceError) {
      announceError(`Loading failed: ${errorMessage}`);
    }
  }, [announceError, announceError]);

  /**
   * Reset loading state
   */
  const resetLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingText: initialLoadingText,
      progress: undefined,
      error: null
    });
    lastAnnouncedProgress.current = 0;
  }, [initialLoadingText]);

  /**
   * Get aria attributes for loading elements
   */
  const getLoadingAriaAttributes = useCallback(() => {
    if (!loadingState.isLoading) return {};

    return {
      'aria-busy': 'true',
      'aria-live': 'polite',
      'aria-label': loadingState.loadingText,
      'aria-describedby': loadingState.progress !== undefined 
        ? `${loadingId.current}-progress`
        : undefined
    };
  }, [loadingState]);

  /**
   * Get progress aria attributes
   */
  const getProgressAriaAttributes = useCallback(() => {
    if (loadingState.progress === undefined) return {};

    return {
      'role': 'progressbar',
      'aria-valuenow': loadingState.progress,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuetext': `${Math.round(loadingState.progress)}% complete`,
      'id': `${loadingId.current}-progress`
    };
  }, [loadingState.progress]);

  /**
   * Async wrapper that handles loading state automatically
   */
  const withLoadingState = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingText?: string,
    successMessage?: string
  ): Promise<T> => {
    try {
      startLoading(loadingText);
      const result = await asyncFn();
      stopLoading(successMessage);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [startLoading, stopLoading, setError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetLoading();
    };
  }, [resetLoading]);

  return {
    // State
    ...loadingState,
    
    // Actions
    startLoading,
    stopLoading,
    setProgress,
    setLoadingText,
    setError,
    resetLoading,
    withLoadingState,
    
    // Accessibility helpers
    getLoadingAriaAttributes,
    getProgressAriaAttributes,
    loadingId: loadingId.current
  };
}

export default useLoadingStatus;