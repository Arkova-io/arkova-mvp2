/**
 * Chain Client Factory
 *
 * Returns appropriate chain client based on configuration.
 * Uses mock client for testing, real client for production.
 */

import { config } from '../config.js';
import type { ChainClient } from './types.js';
import { MockChainClient } from './mock.js';

// Real client implementation would go here
// For now, we only have the mock client

export function getChainClient(): ChainClient {
  if (config.useMocks || config.nodeEnv === 'test') {
    return new MockChainClient();
  }

  // TODO: Implement real chain client
  // For now, always use mock in development
  return new MockChainClient();
}

export const chainClient = getChainClient();
