/**
 * Custom hook for error handling in components
 */

import { useState, useCallback } from 'react';
import ErrorHandler from '@/lib/error-handler';
import { AppError } from '@/lib/error-types';
import { toast } from '@/lib/toast';

interface UseErrorHandlerReturn {
  handleError: (error: unknown, context?: Record<string, unknown>) => void;
  clearError: () => void;
  error: AppError | null;
  isError: boolean;
}

export default function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown, context?: Record<string, unknown>) => {
    // Process error through centralized handler
    const appError = ErrorHandler.getInstance().handleError(err, context);
    
    // Store error in state
    setError(appError);
    
    // Show toast notification to user
    toast.error(appError.userMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleError,
    clearError,
    error,
    isError: error !== null,
  };
}
