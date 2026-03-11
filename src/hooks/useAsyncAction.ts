/**
 * useAsyncAction Hook
 *
 * Generic hook that provides loading/error state management for async operations.
 * Eliminates boilerplate across hooks like useRevokeAnchor, useInviteMember, useExportAnchors.
 */

import { useState, useCallback } from 'react';

interface UseAsyncActionReturn<TArgs extends unknown[], TResult> {
  execute: (...args: TArgs) => Promise<TResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Wraps an async function with loading/error state management.
 *
 * @param fn - The async function to wrap. Should throw on error (message will be captured).
 * @param fallbackError - Default error message when a non-Error is thrown.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  fallbackError = 'An unexpected error occurred',
): UseAsyncActionReturn<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setLoading(true);
      setError(null);

      try {
        return await fn(...args);
      } catch (err) {
        const message = err instanceof Error ? err.message : fallbackError;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn, fallbackError],
  );

  return { execute, loading, error, clearError };
}
