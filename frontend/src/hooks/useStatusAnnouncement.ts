/**
 * useStatusAnnouncement Hook - Provides status announcements for screen readers
 * 
 * This hook manages aria-live regions for announcing dynamic content changes
 * to assistive technologies without disrupting the user's workflow.
 */

import { useRef, useCallback } from 'react';

type AnnouncementPriority = 'polite' | 'assertive';

export interface StatusAnnouncementOptions {
  priority?: AnnouncementPriority;
  delay?: number;
  clearAfter?: number;
}

export function useStatusAnnouncement() {
  const politeRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);

  /**
   * Announce a status message to screen readers
   * @param message - The message to announce
   * @param options - Announcement options (priority, delay, clearAfter)
   */
  const announce = useCallback((
    message: string, 
    options: StatusAnnouncementOptions = {}
  ) => {
    const {
      priority = 'polite',
      delay = 0,
      clearAfter = 3000
    } = options;

    const regionRef = priority === 'assertive' ? assertiveRegionRef : politeRegionRef;

    const performAnnouncement = () => {
      if (regionRef.current) {
        // Clear any existing content first
        regionRef.current.textContent = '';
        
        // Use a small timeout to ensure the clearing is processed
        setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = message;
            
            // Clear the announcement after the specified time
            if (clearAfter > 0) {
              setTimeout(() => {
                if (regionRef.current) {
                  regionRef.current.textContent = '';
                }
              }, clearAfter);
            }
          }
        }, 50);
      }
    };

    if (delay > 0) {
      setTimeout(performAnnouncement, delay);
    } else {
      performAnnouncement();
    }
  }, []);

  /**
   * Announce loading state changes
   * @param isLoading - Whether content is loading
   * @param contentType - Type of content being loaded
   * @param customMessage - Custom loading message
   */
  const announceLoading = useCallback((
    isLoading: boolean,
    contentType: string = 'content',
    customMessage?: string
  ) => {
    if (isLoading) {
      const message = customMessage || `Loading ${contentType}. Please wait.`;
      announce(message, { priority: 'polite' });
    } else {
      const message = customMessage || `${contentType} loaded successfully.`;
      announce(message, { priority: 'polite', delay: 500 });
    }
  }, [announce]);

  /**
   * Announce form submission status
   * @param status - Submission status
   * @param message - Custom message
   */
  const announceFormStatus = useCallback((
    status: 'submitting' | 'success' | 'error',
    message?: string
  ) => {
    const defaultMessages = {
      submitting: 'Submitting form. Please wait.',
      success: 'Form submitted successfully.',
      error: 'Form submission failed. Please check your input and try again.'
    };

    const finalMessage = message || defaultMessages[status];
    const priority: AnnouncementPriority = status === 'error' ? 'assertive' : 'polite';

    announce(finalMessage, { priority });
  }, [announce]);

  /**
   * Announce data refresh status
   * @param isRefreshing - Whether data is being refreshed
   * @param dataType - Type of data being refreshed
   */
  const announceDataRefresh = useCallback((
    isRefreshing: boolean,
    dataType: string = 'data'
  ) => {
    if (isRefreshing) {
      announce(`Refreshing ${dataType}. Please wait.`, { priority: 'polite' });
    } else {
      announce(`${dataType} refreshed successfully.`, { 
        priority: 'polite', 
        delay: 300 
      });
    }
  }, [announce]);

  /**
   * Announce search results
   * @param resultCount - Number of search results
   * @param searchTerm - The search term used
   */
  const announceSearchResults = useCallback((
    resultCount: number,
    searchTerm?: string
  ) => {
    let message = '';
    
    if (resultCount === 0) {
      message = searchTerm 
        ? `No results found for "${searchTerm}".`
        : 'No results found.';
    } else if (resultCount === 1) {
      message = searchTerm 
        ? `1 result found for "${searchTerm}".`
        : '1 result found.';
    } else {
      message = searchTerm 
        ? `${resultCount} results found for "${searchTerm}".`
        : `${resultCount} results found.`;
    }

    announce(message, { priority: 'polite', delay: 500 });
  }, [announce]);

  /**
   * Announce navigation changes
   * @param pageName - Name of the page/section navigated to
   */
  const announceNavigation = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}.`, { priority: 'polite', delay: 300 });
  }, [announce]);

  /**
   * Announce error messages with high priority
   * @param errorMessage - The error message to announce
   */
  const announceError = useCallback((errorMessage: string) => {
    announce(`Error: ${errorMessage}`, { priority: 'assertive' });
  }, [announce]);

  /**
   * Announce success messages
   * @param successMessage - The success message to announce
   */
  const announceSuccess = useCallback((successMessage: string) => {
    announce(`Success: ${successMessage}`, { priority: 'polite' });
  }, [announce]);

  /**
   * Clear all announcements
   */
  const clearAnnouncements = useCallback(() => {
    if (politeRegionRef.current) {
      politeRegionRef.current.textContent = '';
    }
    if (assertiveRegionRef.current) {
      assertiveRegionRef.current.textContent = '';
    }
  }, []);

  return {
    announce,
    announceLoading,
    announceFormStatus,
    announceDataRefresh,
    announceSearchResults,
    announceNavigation,
    announceError,
    announceSuccess,
    clearAnnouncements,
    politeRegionRef,
    assertiveRegionRef
  };
}

export default useStatusAnnouncement;