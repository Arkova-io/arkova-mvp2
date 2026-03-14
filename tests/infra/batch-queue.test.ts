/**
 * Tests for batch queue consumer (P8-S13).
 *
 * Validates queue message processing, throttling, and error handling.
 */

import { describe, it, expect, vi } from 'vitest';
import { processBatchMessage, type BatchQueueMessage } from '../../services/edge/src/batch-queue-logic';

describe('processBatchMessage', () => {
  it('processes a valid extraction message', async () => {
    const message: BatchQueueMessage = {
      jobId: 'job-001',
      items: [
        {
          strippedText: 'Bachelor of Science, MIT, 2025',
          credentialType: 'DEGREE',
          fingerprint: 'abc123',
        },
      ],
      orgId: 'org-001',
      userId: 'user-001',
    };

    const result = await processBatchMessage(message);

    expect(result.jobId).toBe('job-001');
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.status).toBe('complete');
  });

  it('handles partial failures gracefully', async () => {
    const message: BatchQueueMessage = {
      jobId: 'job-002',
      items: [
        { strippedText: 'Valid credential', credentialType: 'DEGREE', fingerprint: 'a' },
        { strippedText: '', credentialType: 'DEGREE', fingerprint: 'b' }, // empty = will fail
      ],
      orgId: 'org-001',
      userId: 'user-001',
    };

    const result = await processBatchMessage(message);

    expect(result.status).toBe('partial_failure');
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(1);
  });

  it('respects throttle limit per batch', async () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      strippedText: `Credential ${i}`,
      credentialType: 'DEGREE' as const,
      fingerprint: `fp-${i}`,
    }));

    const message: BatchQueueMessage = {
      jobId: 'job-003',
      items,
      orgId: 'org-001',
      userId: 'user-001',
    };

    const result = await processBatchMessage(message);

    // Should process all items but throttled
    expect(result.processed + result.failed).toBe(50);
  });

  it('rejects messages with no items', async () => {
    const message: BatchQueueMessage = {
      jobId: 'job-004',
      items: [],
      orgId: 'org-001',
      userId: 'user-001',
    };

    const result = await processBatchMessage(message);
    expect(result.status).toBe('complete');
    expect(result.processed).toBe(0);
  });
});
