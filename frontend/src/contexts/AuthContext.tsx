'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { rotateCsrfToken } from '@/lib/security/csrf';
import type { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

/** Session timeout: 1 hour of inactivity */
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

/** How often to check for token expiry (every 60 seconds) */
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

/**
 * UX CONVENIENCE — not a security control.
 *
 * This decodes the JWT payload WITHOUT verifying the signature.
 * A malicious token with a forged exp claim will pass this check.
 *
 * The server MUST validate the token's signature and expiry on every
 * authenticated request. Client-side expiry checking exists only to avoid
 * sending obviously expired tokens and to log out inactive users promptly.
 */

/**
 * Decodes a JWT payload without verifying the signature.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns true if the JWT token has expired (or is missing an exp claim).
 * Adds a 30-second clock-skew buffer.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp < nowSec + 30; // 30-second buffer
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (expiryIntervalRef.current) {
      clearInterval(expiryIntervalRef.current);
      expiryIntervalRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearAllTimers();
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    rotateCsrfToken(); // Rotate CSRF token on logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [clearAllTimers]);

  /** Resets the inactivity session timer */
  const resetSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [logout]);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch {
      // Do not log token details
      console.error('Session validation failed - logging out');
      localStorage.removeItem('access_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start token expiry polling once we have a token
  useEffect(() => {
    if (!token) {
      clearAllTimers();
      return;
    }

    // Immediate check
    if (isTokenExpired(token)) {
      logout();
      return;
    }

    // Reset inactivity timer on every interaction
    resetSessionTimer();

    // Poll for expiry every minute
    expiryIntervalRef.current = setInterval(() => {
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken || isTokenExpired(storedToken)) {
        logout();
      }
    }, EXPIRY_CHECK_INTERVAL_MS);

    // Inactivity events reset the session timer
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetSessionTimer();
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearAllTimers();
    };
  }, [token, logout, resetSessionTimer, clearAllTimers]);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('access_token');
        setLoading(false);
        return;
      }
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authAPI.login(email, password);
    const { access_token } = response.data;

    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    rotateCsrfToken(); // Rotate CSRF token on login

    const userResponse = await authAPI.getCurrentUser();
    const userData = userResponse.data;
    setUser(userData);

    return userData;
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
