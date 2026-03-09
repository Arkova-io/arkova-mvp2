/**
 * useAnchor Hook
 *
 * Fetches a single anchor by ID from Supabase.
 * RLS policies ensure the user can only access their own anchors
 * (or org anchors if they are an ORG_ADMIN).
 *
 * @see P4-TS-03 — Wire AssetDetailView to /records/:id route
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database.types';

type AnchorRow = Database['public']['Tables']['anchors']['Row'];

interface UseAnchorReturn {
  anchor: AnchorRow | null;
  loading: boolean;
  error: string | null;
  refreshAnchor: () => Promise<void>;
}

export function useAnchor(id: string | undefined): UseAnchorReturn {
  const { user, loading: authLoading } = useAuth();
  const [anchor, setAnchor] = useState<AnchorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnchor = useCallback(async () => {
    if (!user || !id) {
      setAnchor(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('anchors')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError) {
      setError(fetchError.code === 'PGRST116' ? 'Record not found' : fetchError.message);
      setAnchor(null);
    } else {
      setAnchor(data);
    }

    setLoading(false);
  }, [user, id]);

  useEffect(() => {
    fetchAnchor();
  }, [fetchAnchor]);

  const refreshAnchor = useCallback(async () => {
    await fetchAnchor();
  }, [fetchAnchor]);

  return {
    anchor,
    loading: authLoading || loading,
    error,
    refreshAnchor,
  };
}
