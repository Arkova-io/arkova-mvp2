/**
 * useRevokeAnchor Hook
 *
 * Hook for revoking anchors via the revoke_anchor RPC function.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseRevokeAnchorReturn {
  revokeAnchor: (anchorId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useRevokeAnchor(): UseRevokeAnchorReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const revokeAnchor = useCallback(async (anchorId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Type assertion needed until types are regenerated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: rpcError } = await (supabase.rpc as any)('revoke_anchor', {
        anchor_id: anchorId,
      });

      if (rpcError) {
        // Handle specific error codes
        if (rpcError.message.includes('insufficient_privilege')) {
          setError('You do not have permission to revoke this anchor.');
        } else if (rpcError.message.includes('already revoked')) {
          setError('This anchor has already been revoked.');
        } else if (rpcError.message.includes('legal hold')) {
          setError('Cannot revoke an anchor under legal hold.');
        } else {
          setError(rpcError.message || 'Failed to revoke anchor.');
        }
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    revokeAnchor,
    loading,
    error,
    clearError,
  };
}
