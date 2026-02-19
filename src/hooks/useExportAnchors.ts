/**
 * useExportAnchors Hook
 *
 * Hook for exporting organization anchors to CSV.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  generateCsv,
  downloadCsv,
  formatDateForCsv,
  generateExportFilename,
} from '@/lib/csvExport';
import type { Database } from '@/types/database.types';

type Anchor = Database['public']['Tables']['anchors']['Row'];

interface UseExportAnchorsReturn {
  exportAnchors: (orgId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const anchorColumns = [
  { header: 'ID', accessor: 'id' as const },
  { header: 'Filename', accessor: 'filename' as const },
  { header: 'Fingerprint', accessor: 'fingerprint' as const },
  { header: 'Status', accessor: 'status' as const },
  { header: 'File Size (bytes)', accessor: 'file_size' as const },
  { header: 'MIME Type', accessor: 'file_mime' as const },
  {
    header: 'Created At',
    accessor: (row: Anchor) => formatDateForCsv(row.created_at),
  },
  {
    header: 'Updated At',
    accessor: (row: Anchor) => formatDateForCsv(row.updated_at),
  },
  {
    header: 'Chain Timestamp',
    accessor: (row: Anchor) => formatDateForCsv(row.chain_timestamp),
  },
  { header: 'Legal Hold', accessor: (row: Anchor) => row.legal_hold ? 'Yes' : 'No' },
];

export function useExportAnchors(): UseExportAnchorsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportAnchors = useCallback(async (orgId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all anchors for the org (not paginated)
      const { data, error: fetchError } = await supabase
        .from('anchors')
        .select('*')
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message || 'Failed to fetch records for export.');
        return false;
      }

      if (!data || data.length === 0) {
        setError('No records to export.');
        return false;
      }

      // Generate and download CSV
      const csvContent = generateCsv(data, anchorColumns);
      const filename = generateExportFilename('org-records');
      downloadCsv(csvContent, filename);

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
    exportAnchors,
    loading,
    error,
    clearError,
  };
}
