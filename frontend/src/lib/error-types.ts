/**
 * Centralized error type definitions for ExamGuard
 */

// Error categories
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Base application error interface
export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: unknown;
  context?: Record<string, unknown>;
  timestamp: Date;
}

// API-specific error interface
export interface ApiError extends AppError {
  endpoint?: string;
  method?: string;
}

// Type guard functions
export function isNetworkError(error: AppError): boolean {
  return error.type === ErrorType.NETWORK;
}

export function isAuthError(error: AppError): boolean {
  return (
    error.type === ErrorType.AUTHENTICATION ||
    error.type === ErrorType.AUTHORIZATION
  );
}

export function isValidationError(error: AppError): boolean {
  return error.type === ErrorType.VALIDATION;
}

// Helper to check if an error is an AppError
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'userMessage' in error &&
    'timestamp' in error
  );
}
