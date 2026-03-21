/**
 * System Health Hook
 *
 * Fetches system health status from the admin API.
 * Only accessible to platform admins.
 */

import { useState, useCallback } from 'react';
import { workerFetch } from '@/lib/workerClient';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  checks: {
    supabase: { status: 'ok' | 'error'; latencyMs?: number; message?: string };
    bitcoin: { connected: boolean; network: string };
  };
  config: {
    stripe: boolean;
    sentry: boolean;
    ai: { configured: boolean; provider: string };
    email: boolean;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await workerFetch('/api/admin/system-health', { method: 'GET' });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: 'Request failed' }));
        setError(body.error ?? `HTTP ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, []);

  return { health, loading, error, fetchHealth };
}
