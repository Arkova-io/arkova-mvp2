/**
 * Batch Anchor Queue Consumer (P8-S13 / INFRA-04)
 *
 * Consumes messages from ARKOVA_BATCH_QUEUE (Cloudflare Queue).
 * Throttles Gemini extraction tasks to prevent API rate limit exhaustion.
 * Tracks progress and handles partial failures.
 *
 * Constitution 4A: Only PII-stripped metadata is processed.
 * ADR: docs/confluence/15_zero_trust_edge_architecture.md Section 2
 */

import type { Env, BatchQueueMessage } from './env';
import { processBatchMessage } from './batch-queue-logic';

export default {
  async queue(
    batch: MessageBatch<BatchQueueMessage>,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        const result = await processBatchMessage(message.body);

        // Update job status in Supabase
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
          await fetch(`${supabaseUrl}/rest/v1/rpc/update_batch_job_status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              p_job_id: result.jobId,
              p_status: result.status,
              p_processed: result.processed,
              p_failed: result.failed,
            }),
          });
        }

        // Acknowledge message on success or partial failure
        message.ack();
      } catch (error) {
        console.error(`[batch-queue] Failed to process job ${message.body.jobId}:`, error);
        // Retry the message (Cloudflare handles exponential backoff)
        message.retry();
      }
    }
  },
};
