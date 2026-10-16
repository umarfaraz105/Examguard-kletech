/**
 * Structured error logger for ExamGuard
 */

import { AppError } from './error-types';

class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with structured output
   */
  logError(error: AppError): void {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.group(`🔴 Error: ${error.type}`);
      console.error('Message:', error.message);
      console.error('User Message:', error.userMessage);
      if (error.statusCode) {
        console.error('Status Code:', error.statusCode);
      }
      if (error.context) {
        console.error('Context:', error.context);
      }
      console.error('Timestamp:', error.timestamp.toISOString());
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
      console.groupEnd();
    }
    // In production, do nothing (or send to logging service)
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: unknown): void {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.group('⚠️ Warning');
      console.warn('Message:', message);
      if (context) {
        console.warn('Context:', context);
      }
      console.warn('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }

  /**
   * Log info message
   */
  logInfo(message: string, context?: unknown): void {
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      console.log('ℹ️ Info:', message);
      if (context) {
        console.log('Context:', context);
      }
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();
