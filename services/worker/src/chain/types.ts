/**
 * Chain API Types
 *
 * Types for interacting with the blockchain anchoring service.
 */

export interface SubmitFingerprintRequest {
  fingerprint: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface ChainReceipt {
  /** Network receipt ID (formerly transaction ID) */
  receiptId: string;
  /** Block reference number */
  blockHeight: number;
  /** Block timestamp in ISO format */
  blockTimestamp: string;
  /** Number of confirmations */
  confirmations: number;
}

export interface VerificationResult {
  verified: boolean;
  receipt?: ChainReceipt;
  error?: string;
}

export interface ChainClient {
  /**
   * Submit a fingerprint to be anchored on-chain
   */
  submitFingerprint(data: SubmitFingerprintRequest): Promise<ChainReceipt>;

  /**
   * Verify a fingerprint exists on-chain
   */
  verifyFingerprint(fingerprint: string): Promise<VerificationResult>;

  /**
   * Get receipt details by ID
   */
  getReceipt(receiptId: string): Promise<ChainReceipt | null>;

  /**
   * Check service health
   */
  healthCheck(): Promise<boolean>;
}
