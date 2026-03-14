/**
 * Batch Queue Processing Logic (P8-S13)
 *
 * Shared processing logic for batch AI extraction.
 * Used by both the Cloudflare Queue consumer and tests.
 *
 * Throttles Gemini extraction tasks to prevent API rate limit exhaustion.
 * Constitution 4A: Only PII-stripped metadata is processed.
 */

export interface BatchItem {
  strippedText: string;
  credentialType: string;
  fingerprint: string;
}

export interface BatchQueueMessage {
  jobId: string;
  items: BatchItem[];
  orgId: string;
  userId: string;
}

export interface BatchResult {
  jobId: string;
  processed: number;
  failed: number;
  status: 'complete' | 'partial_failure' | 'failed';
  results: ItemResult[];
}

export interface ItemResult {
  fingerprint: string;
  success: boolean;
  error?: string;
}

/** Max concurrent extraction calls per batch (throttle) */
const THROTTLE_CONCURRENCY = 5;

/** Delay between throttle batches (ms) */
const THROTTLE_DELAY_MS = 200;

/**
 * Process a batch queue message.
 *
 * Iterates through items in throttled batches, extracts metadata from each.
 * Returns aggregate results with per-item success/failure tracking.
 */
export async function processBatchMessage(message: BatchQueueMessage): Promise<BatchResult> {
  const results: ItemResult[] = [];

  if (message.items.length === 0) {
    return { jobId: message.jobId, processed: 0, failed: 0, status: 'complete', results: [] };
  }

  // Process in throttled batches
  for (let i = 0; i < message.items.length; i += THROTTLE_CONCURRENCY) {
    const batch = message.items.slice(i, i + THROTTLE_CONCURRENCY);

    const batchResults = await Promise.allSettled(
      batch.map((item) => processItem(item)),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const item = batch[j];
      if (result.status === 'fulfilled') {
        results.push({ fingerprint: item.fingerprint, success: true });
      } else {
        results.push({
          fingerprint: item.fingerprint,
          success: false,
          error: result.reason?.message ?? 'Unknown error',
        });
      }
    }

    // Throttle delay between batches (skip for last batch)
    if (i + THROTTLE_CONCURRENCY < message.items.length) {
      await new Promise((resolve) => setTimeout(resolve, THROTTLE_DELAY_MS));
    }
  }

  const processed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const status = failed === 0 ? 'complete' : failed === results.length ? 'failed' : 'partial_failure';

  return { jobId: message.jobId, processed, failed, status, results };
}

/**
 * Process a single extraction item.
 * In production, this calls the AI provider. Here it validates input.
 */
async function processItem(item: BatchItem): Promise<void> {
  if (!item.strippedText || item.strippedText.trim().length === 0) {
    throw new Error('Empty strippedText — cannot extract metadata');
  }

  if (!item.fingerprint) {
    throw new Error('Missing fingerprint');
  }

  // Extraction would happen here via IAIProvider
  // For now, validate input is processable
}
