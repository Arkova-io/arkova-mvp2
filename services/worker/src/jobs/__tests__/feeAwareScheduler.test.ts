/**
 * BTC-002: Fee-Aware Transaction Scheduler Tests
 */

import { describe, it, expect } from 'vitest';
import { checkFeeConditions, FEE_HARD_DEADLINE_MS, FEE_RETRY_INTERVAL_MS } from '../feeAwareScheduler.js';
import type { FeeEstimator } from '../feeAwareScheduler.js';

/** Create a mock fee estimator that returns a fixed rate */
function mockEstimator(rate: number): FeeEstimator {
  return { estimateFee: async () => rate, name: 'Mock' };
}

/** Create a mock fee estimator that throws */
function failingEstimator(): FeeEstimator {
  return {
    estimateFee: async () => { throw new Error('Network error'); },
    name: 'FailingMock',
  };
}

describe('BTC-002: checkFeeConditions', () => {
  it('submits when fee is below threshold', async () => {
    const result = await checkFeeConditions(50, null, mockEstimator(10));
    expect(result.shouldSubmit).toBe(true);
    expect(result.reason).toBe('below_threshold');
    expect(result.currentFee).toBe(10);
  });

  it('queues when fee is above threshold', async () => {
    const result = await checkFeeConditions(50, null, mockEstimator(80));
    expect(result.shouldSubmit).toBe(false);
    expect(result.reason).toBe('above_threshold');
    expect(result.currentFee).toBe(80);
  });

  it('submits when fee equals threshold', async () => {
    const result = await checkFeeConditions(50, null, mockEstimator(50));
    expect(result.shouldSubmit).toBe(true);
    expect(result.reason).toBe('below_threshold');
  });

  it('force submits when deadline exceeded despite high fees', async () => {
    const queuedSince = Date.now() - FEE_HARD_DEADLINE_MS - 1000;
    const result = await checkFeeConditions(50, queuedSince, mockEstimator(100));
    expect(result.shouldSubmit).toBe(true);
    expect(result.reason).toBe('deadline_exceeded');
  });

  it('does not force submit when under deadline', async () => {
    const queuedSince = Date.now() - (FEE_HARD_DEADLINE_MS / 2);
    const result = await checkFeeConditions(50, queuedSince, mockEstimator(100));
    expect(result.shouldSubmit).toBe(false);
    expect(result.reason).toBe('above_threshold');
  });

  it('submits on fee estimation failure (graceful degradation)', async () => {
    const result = await checkFeeConditions(50, null, failingEstimator());
    expect(result.shouldSubmit).toBe(true);
    expect(result.reason).toBe('fee_check_failed');
  });

  it('uses default threshold of 50 when not specified', async () => {
    const result = await checkFeeConditions(undefined, null, mockEstimator(40));
    expect(result.threshold).toBe(50);
    expect(result.shouldSubmit).toBe(true);
  });

  it('exports correct interval constants', () => {
    expect(FEE_RETRY_INTERVAL_MS).toBe(30 * 60 * 1000);
    expect(FEE_HARD_DEADLINE_MS).toBe(24 * 60 * 60 * 1000);
  });
});
