/**
 * Unit tests for chain client factory (getChainClient)
 *
 * HARDENING-2: Verify the factory returns the correct client based
 * on configuration. Currently always returns MockChainClient — when
 * the real bitcoinjs-lib client is added, these tests enforce that
 * the factory switches correctly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mutable config so vi.mock factories can reference it
const { mockConfig } = vi.hoisted(() => {
  const mockConfig = {
    nodeEnv: 'test' as string,
    useMocks: true,
    chainNetwork: 'testnet' as const,
    logLevel: 'info',
  };
  return { mockConfig };
});

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../config.js', () => ({
  get config() {
    return mockConfig;
  },
  getNetworkDisplayName: vi.fn(() => 'Test Environment'),
}));

import { getChainClient } from './client.js';
import { MockChainClient } from './mock.js';
import type { ChainClient } from './types.js';

describe('getChainClient', () => {
  beforeEach(() => {
    // Reset to test defaults
    mockConfig.nodeEnv = 'test';
    mockConfig.useMocks = true;
  });

  it('returns a ChainClient interface', () => {
    const client: ChainClient = getChainClient();
    expect(client).toBeDefined();
    expect(typeof client.submitFingerprint).toBe('function');
    expect(typeof client.verifyFingerprint).toBe('function');
    expect(typeof client.getReceipt).toBe('function');
    expect(typeof client.healthCheck).toBe('function');
  });

  it('returns MockChainClient when useMocks is true', () => {
    mockConfig.useMocks = true;
    mockConfig.nodeEnv = 'development';

    const client = getChainClient();
    expect(client).toBeInstanceOf(MockChainClient);
  });

  it('returns MockChainClient when nodeEnv is test', () => {
    mockConfig.useMocks = false;
    mockConfig.nodeEnv = 'test';

    const client = getChainClient();
    expect(client).toBeInstanceOf(MockChainClient);
  });

  it('returns MockChainClient in development (TODO: real client not yet implemented)', () => {
    // Once the real BitcoinChainClient exists, this test should be
    // updated to verify the factory returns it for non-mock, non-test envs.
    mockConfig.useMocks = false;
    mockConfig.nodeEnv = 'development';

    const client = getChainClient();
    // Currently falls through to mock — update when CRIT-2 is resolved
    expect(client).toBeInstanceOf(MockChainClient);
  });

  it('returns a new instance on each call', () => {
    const client1 = getChainClient();
    const client2 = getChainClient();
    expect(client1).not.toBe(client2);
  });
});
