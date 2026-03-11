/**
 * useExportAnchors Hook
 *
 * Hook for exporting organization anchors to CSV.
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  generateCsv,
  downloadCsv,
  formatDateForCsv,
  generateExportFilename,
} from '@/lib/csvExport';
import type { Database } from '@/types/database.types';
import { useAsyncAction } from './useAsyncAction';

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
  const exportImpl = useCallback(async (orgId: string): Promise<boolean> => {
    const { data, error: fetchError } = await supabase
      .from('anchors')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(fetchError.message || 'Failed to fetch records for export.');
    }

    if (!data || data.length === 0) {
      throw new Error('No records to export.');
    }

    const csvContent = generateCsv(data, anchorColumns);
    const filename = generateExportFilename('org-records');
    downloadCsv(csvContent, filename);

    return true;
  }, []);

  const { execute, loading, error, clearError } = useAsyncAction(exportImpl);

  const exportAnchors = useCallback(
    async (orgId: string): Promise<boolean> => {
      try {
        return await execute(orgId);
      } catch {
        return false;
      }
    },
    [execute],
  );

  return { exportAnchors, loading, error, clearError };
}
