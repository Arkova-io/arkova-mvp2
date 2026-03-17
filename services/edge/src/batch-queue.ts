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

/** Max retries before sending to dead letter (Cloudflare retries up to 3 days, but we cap sooner) */
const MAX_RETRIES = 5;

export default {
  async queue(
    batch: MessageBatch<BatchQueueMessage>,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    for (const message of batch.messages) {
      const retryCount = message.attempts ?? 0;

      try {
        const result = await processBatchMessage(message.body);

        // Update job status in Supabase
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/update_batch_job_status`, {
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

          if (!updateResponse.ok) {
            console.error(
              `[batch-queue] Failed to update job status for ${result.jobId}: HTTP ${updateResponse.status}`,
            );
          }
        }

        // Acknowledge message on success or partial failure
        message.ack();
      } catch (error) {
        console.error(
          `[batch-queue] Failed to process job ${message.body.jobId} (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
          error,
        );

        if (retryCount >= MAX_RETRIES) {
          // Dead letter: log permanently failed message and ack to stop retries
          console.error(
            `[batch-queue] DEAD LETTER: job ${message.body.jobId} failed after ${MAX_RETRIES} attempts. Dropping message.`,
          );
          message.ack();
        } else {
          // Retry the message (Cloudflare handles exponential backoff)
          message.retry();
        }
      }
    }
  },
};
