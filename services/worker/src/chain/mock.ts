/**
 * Mock Chain Client
 *
 * Mock implementation for testing. Per Constitution, mocks are
 * enforced for Stripe and chain APIs in test environments.
 */

import type {
  ChainClient,
  ChainReceipt,
  SubmitFingerprintRequest,
  VerificationResult,
} from './types.js';
import { logger } from '../utils/logger.js';

// In-memory store for mock receipts
const mockReceipts = new Map<string, ChainReceipt>();
const fingerprintToReceipt = new Map<string, string>();

let mockBlockHeight = 800000;

export class MockChainClient implements ChainClient {
  async submitFingerprint(data: SubmitFingerprintRequest): Promise<ChainReceipt> {
    logger.info({ fingerprint: data.fingerprint }, 'Mock: Submitting fingerprint');

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    mockBlockHeight += 1;

    const receipt: ChainReceipt = {
      receiptId: `mock_receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      blockHeight: mockBlockHeight,
      blockTimestamp: new Date().toISOString(),
      confirmations: 6,
    };

    // Store for later verification
    mockReceipts.set(receipt.receiptId, receipt);
    fingerprintToReceipt.set(data.fingerprint, receipt.receiptId);

    logger.info({ receipt }, 'Mock: Fingerprint submitted successfully');

    return receipt;
  }

  async verifyFingerprint(fingerprint: string): Promise<VerificationResult> {
    logger.info({ fingerprint }, 'Mock: Verifying fingerprint');

    const receiptId = fingerprintToReceipt.get(fingerprint);

    if (!receiptId) {
      return {
        verified: false,
        error: 'Fingerprint not found on chain',
      };
    }

    const receipt = mockReceipts.get(receiptId);

    return {
      verified: true,
      receipt,
    };
  }

  async getReceipt(receiptId: string): Promise<ChainReceipt | null> {
    logger.info({ receiptId }, 'Mock: Getting receipt');
    return mockReceipts.get(receiptId) ?? null;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// Singleton instance
export const mockChainClient = new MockChainClient();
