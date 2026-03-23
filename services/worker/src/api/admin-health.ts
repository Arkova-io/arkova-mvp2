/**
 * System Health API — Arkova Internal Only
 *
 * GET /api/admin/system-health
 *
 * Returns detailed system health: Supabase latency, service configs,
 * Bitcoin network status, memory usage.
 * Gated behind platform admin email whitelist.
 */

import type { Request, Response } from 'express';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';
import { isPlatformAdmin } from '../utils/platformAdmin.js';

interface ServiceCheck {
  status: 'ok' | 'error';
  latencyMs?: number;
  message?: string;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  checks: {
    supabase: ServiceCheck;
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

export async function handleSystemHealth(
  userId: string,
  _req: Request,
  res: Response,
): Promise<void> {
  const isAdmin = await isPlatformAdmin(userId);
  if (!isAdmin) {
    res.status(403).json({ error: 'Forbidden — platform admin access required' });
    return;
  }

  try {
    // Check Supabase connectivity + latency
    const dbStart = Date.now();
    let supabaseCheck: ServiceCheck;
    try {
      const { error } = await db.from('plans').select('id').limit(1);
      supabaseCheck = {
        status: error ? 'error' : 'ok',
        latencyMs: Date.now() - dbStart,
        ...(error ? { message: error.message } : {}),
      };
    } catch (err) {
      supabaseCheck = {
        status: 'error',
        latencyMs: Date.now() - dbStart,
        message: err instanceof Error ? err.message : 'Connection failed',
      };
    }

    // Check Bitcoin network — just report configuration status
    const bitcoinConnected = Boolean(config.bitcoinTreasuryWif) && config.enableProdNetworkAnchoring;

    // Memory usage
    const mem = process.memoryUsage();

    const allHealthy = supabaseCheck.status === 'ok';

    const result: SystemHealthResponse = {
      status: allHealthy ? 'healthy' : 'degraded',
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? '0.1.0',
      checks: {
        supabase: supabaseCheck,
        bitcoin: {
          connected: bitcoinConnected,
          network: config.bitcoinNetwork,
        },
      },
      config: {
        stripe: Boolean(config.stripeSecretKey),
        sentry: Boolean(config.sentryDsn),
        ai: {
          configured: Boolean(config.geminiApiKey) || config.aiProvider === 'mock',
          provider: config.aiProvider ?? 'none',
        },
        email: Boolean(config.resendApiKey),
      },
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024),
      },
    };

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'System health request failed');
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
}
