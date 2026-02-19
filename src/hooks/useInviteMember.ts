/**
 * useInviteMember Hook
 *
 * Hook for inviting members to an organization via RPC function.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type InviteRole = 'INDIVIDUAL' | 'ORG_ADMIN';

interface UseInviteMemberReturn {
  inviteMember: (email: string, role: InviteRole, orgId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useInviteMember(): UseInviteMemberReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const inviteMember = useCallback(
    async (email: string, role: InviteRole, orgId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Type assertion needed until types are regenerated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: rpcError } = await (supabase.rpc as any)('invite_member', {
          invite_email: email,
          invite_role: role,
          org_id: orgId,
        });

        if (rpcError) {
          // Handle specific error codes
          if (rpcError.message.includes('already a member')) {
            setError('This person is already a member of the organization.');
          } else if (rpcError.message.includes('insufficient_privilege')) {
            setError('You do not have permission to invite members.');
          } else if (rpcError.message.includes('invalid email')) {
            setError('Please enter a valid email address.');
          } else {
            setError(rpcError.message || 'Failed to send invitation.');
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
    },
    []
  );

  return {
    inviteMember,
    loading,
    error,
    clearError,
  };
}
