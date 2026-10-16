/**
 * Centralized error handler for ExamGuard
 * Categorizes and processes errors consistently across the application
 */

import { ErrorType, AppError, ApiError } from './error-types';
import { AxiosError } from 'axios';

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Categorize an error based on its properties
   */
  categorizeError(error: unknown, context?: Record<string, unknown>): AppError {
    const timestamp = new Date();

    // Handle Axios errors
    if (this.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const endpoint = error.config?.url;
      const method = error.config?.method?.toUpperCase();

      let type: ErrorType;
      let userMessage: string;

      if (!error.response) {
        // Network error - no response received
        type = ErrorType.NETWORK;
        userMessage = 'Network error. Check your internet connection.';
      } else if (statusCode === 401) {
        type = ErrorType.AUTHENTICATION;
        userMessage = 'Session expired. Please log in again.';
      } else if (statusCode === 403) {
        type = ErrorType.AUTHORIZATION;
        userMessage = 'You do not have permission to perform this action.';
      } else if (statusCode === 404) {
        type = ErrorType.CLIENT;
        userMessage = 'The requested resource was not found.';
      } else if (statusCode === 422 || statusCode === 400) {
        type = ErrorType.VALIDATION;
        userMessage = 'Invalid data. Please check your input.';
      } else if (statusCode && statusCode >= 500) {
        type = ErrorType.SERVER;
        userMessage = 'Server error. Please try again later.';
      } else {
        type = ErrorType.UNKNOWN;
        userMessage = 'An unexpected error occurred.';
      }

      const apiError: ApiError = {
        type,
        message: error.message || 'API request failed',
        userMessage,
        statusCode,
        endpoint,
        method,
        originalError: error,
        context,
        timestamp,
      };

      return apiError;
    }

    // Handle TypeError (often network-related)
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return {
          type: ErrorType.NETWORK,
          message: error.message,
          userMessage: 'Network error. Check your internet connection.',
          originalError: error,
          context,
          timestamp,
        };
      }
    }

    // Handle Error objects
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        userMessage: 'An unexpected error occurred.',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        userMessage: 'An error occurred.',
        originalError: error,
        context,
        timestamp,
      };
    }

    // Handle unknown error types
    return {
      type: ErrorType.UNKNOWN,
      message: 'Unknown error',
      userMessage: 'An unexpected error occurred.',
      originalError: error,
      context,
      timestamp,
    };
  }

  /**
   * Handle an error: categorize and log it
   */
  handleError(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = this.categorizeError(error, context);
    this.logError(appError);
    return appError;
  }

  /**
   * Log error to console (dev) or error tracking service (prod)
   */
  private logError(error: AppError): void {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.error('[ErrorHandler]', {
        type: error.type,
        message: error.message,
        userMessage: error.userMessage,
        statusCode: error.statusCode,
        context: error.context,
        timestamp: error.timestamp,
        originalError: error.originalError,
      });
    } else {
      // In production, log minimal info to console
      console.error('[Error]', error.type, error.message);
      
      // Here you could integrate with error tracking services like:
      // - Sentry: Sentry.captureException(error.originalError, { extra: error.context });
      // - LogRocket: LogRocket.captureException(error.originalError);
      // - Custom logging endpoint
    }
  }

  /**
   * Type guard for Axios errors
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as any).isAxiosError === true
    );
  }
}

export default ErrorHandler;
