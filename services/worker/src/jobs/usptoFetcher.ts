/**
 * USPTO Patent Fetcher Job
 *
 * Fetches patent grants from the PatentsView API for Nessie training data pipeline.
 * Gated by ENABLE_PUBLIC_RECORDS_INGESTION switchboard flag.
 *
 * PatentsView API: 45 requests/minute, no API key required.
 * Bulk CSV downloads available for historical backfill (weekly Tuesday updates).
 */

import { createHash } from 'node:crypto';
import { logger } from '../utils/logger.js';
import type { SupabaseClient } from '@supabase/supabase-js';

/** PatentsView rate limit: 45 requests/minute → ~1333ms between requests */
const USPTO_RATE_LIMIT_MS = 1400;

/** PatentsView v1 API (requires API key — register at https://patentsview.org/apis/purpose) */
const PATENTSVIEW_API_URL = 'https://search.patentsview.org/api/v1/patent/';

/** Batch size for API queries */
const QUERY_BATCH_SIZE = 100;

interface PatentResult {
  patent_id: string;
  patent_title: string;
  patent_abstract: string;
  patent_date: string;
  patent_type: string;
}

interface PatentsViewResponse {
  patents: PatentResult[];
  count: number;
  total_hits: number;
}

/**
 * Compute SHA-256 hex digest of a string.
 */
function computeContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Simple delay for rate limiting.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch USPTO patent grants and insert into public_records.
 * Resumable: picks up from the most recent patent date in the database.
 */
export async function fetchUsptoPAtents(supabase: SupabaseClient): Promise<void> {
  // Check switchboard flag
  const { data: enabled } = await supabase.rpc('get_flag', {
    p_flag_key: 'ENABLE_PUBLIC_RECORDS_INGESTION',
  });
  if (!enabled) {
    logger.info('ENABLE_PUBLIC_RECORDS_INGESTION is disabled — skipping USPTO fetch');
    return;
  }

  // Determine resume point: last patent date in DB
  const { data: lastRecord } = await supabase
    .from('public_records')
    .select('metadata')
    .eq('source', 'uspto')
    .order('created_at', { ascending: false })
    .limit(1);

  const now = new Date();
  const startDate = lastRecord?.[0]?.metadata?.patent_date
    ? (lastRecord[0].metadata as Record<string, string>).patent_date
    : new Date(now.getFullYear() - 1, 0, 1).toISOString().slice(0, 10);

  logger.info({ startDate }, 'Fetching USPTO patents');

  let page = 1;
  let hasMore = true;

  let totalInserted = 0;
  let totalSkipped = 0;

  while (hasMore) {
    // PatentsView v1 API uses GET with query params
    const params = new URLSearchParams({
      q: JSON.stringify({ _gte: { patent_date: startDate } }),
      f: JSON.stringify(['patent_id', 'patent_title', 'patent_abstract', 'patent_date', 'patent_type']),
      o: JSON.stringify({ page, per_page: QUERY_BATCH_SIZE }),
      s: JSON.stringify([{ patent_date: 'asc' }]),
    });

    let response: Response;
    try {
      response = await fetch(`${PATENTSVIEW_API_URL}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
    } catch (err) {
      logger.error({ error: err, page }, 'USPTO API request failed');
      break;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      logger.error({ status: response.status, page, body: body.slice(0, 200) }, 'USPTO API returned error');
      break;
    }

    const result = (await response.json()) as PatentsViewResponse;
    const patents = result.patents ?? [];

    if (patents.length === 0) {
      hasMore = false;
      break;
    }

    logger.info({ page, count: patents.length, total: result.total_hits }, 'USPTO batch received');

    for (const patent of patents) {
      const patentId = patent.patent_id;

      // Check for duplicates
      const { data: existing } = await supabase
        .from('public_records')
        .select('id')
        .eq('source', 'uspto')
        .eq('source_id', patentId)
        .limit(1);

      if (existing && existing.length > 0) {
        totalSkipped++;
        continue;
      }

      const contentForHash = JSON.stringify({
        patent_id: patentId,
        title: patent.patent_title,
        abstract: patent.patent_abstract,
        date: patent.patent_date,
      });

      const { error: insertError } = await supabase.from('public_records').insert({
        source: 'uspto',
        source_id: patentId,
        source_url: `https://patents.google.com/patent/US${patentId}`,
        record_type: 'patent_grant',
        title: patent.patent_title,
        content_hash: computeContentHash(contentForHash),
        metadata: {
          patent_id: patentId,
          patent_type: patent.patent_type,
          patent_date: patent.patent_date,
          abstract: patent.patent_abstract,
        },
      });

      if (insertError) {
        logger.error({ patentId, error: insertError }, 'Failed to insert USPTO record');
      } else {
        totalInserted++;
      }
    }

    // Check if there are more pages
    if (patents.length < QUERY_BATCH_SIZE) {
      hasMore = false;
    } else {
      page++;
    }

    // Rate limit compliance
    await delay(USPTO_RATE_LIMIT_MS);
  }

  logger.info({ totalInserted, totalSkipped, pagesProcessed: page }, 'USPTO fetch complete');
}
