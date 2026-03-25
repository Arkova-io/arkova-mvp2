/**
 * x402 Payer Address Rate Limiter (X402-IMPL-004)
 *
 * In-memory rate limiter keyed by payer wallet address.
 * Prevents abuse from a single wallet flooding the API.
 *
 * Limit: 1000 requests per minute per address.
 * Returns 429 (not 402) when exceeded — the payment was valid,
 * the rate is the problem.
 */

/** Rate limit entry for a single payer address */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** Rate limiter configuration */
export interface PayerRateLimitConfig {
  /** Max requests per window (default: 1000) */
  maxRequests: number;
  /** Window duration in ms (default: 60000 = 1 minute) */
  windowMs: number;
}

const DEFAULT_CONFIG: PayerRateLimitConfig = {
  maxRequests: 1000,
  windowMs: 60_000,
};

/**
 * Create an in-memory rate limiter for payer addresses.
 *
 * Returns a check function that tracks requests and returns
 * whether the payer is within rate limits.
 */
export function createPayerRateLimiter(config: Partial<PayerRateLimitConfig> = {}) {
  const { maxRequests, windowMs } = { ...DEFAULT_CONFIG, ...config };
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup of expired entries (every 5 minutes)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60_000);

  // Allow cleanup interval to not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return {
    /**
     * Check if a payer address is within rate limits.
     *
     * @param payerAddress - The wallet address to check
     * @returns Result with allowed status, remaining count, and retry-after
     */
    check(payerAddress: string): {
      allowed: boolean;
      remaining: number;
      retryAfterMs: number;
      limit: number;
    } {
      const now = Date.now();
      const normalizedAddress = payerAddress.toLowerCase();

      let entry = store.get(normalizedAddress);

      // If no entry or window expired, start fresh
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs };
        store.set(normalizedAddress, entry);
      }

      entry.count++;

      if (entry.count > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: entry.resetAt - now,
          limit: maxRequests,
        };
      }

      return {
        allowed: true,
        remaining: maxRequests - entry.count,
        retryAfterMs: 0,
        limit: maxRequests,
      };
    },

    /** Reset all rate limit entries (for testing) */
    reset() {
      store.clear();
    },

    /** Get current store size (for monitoring) */
    size(): number {
      return store.size;
    },

    /** Stop the cleanup interval */
    destroy() {
      clearInterval(cleanupInterval);
    },
  };
}

/** Type of the rate limiter instance */
export type PayerRateLimiter = ReturnType<typeof createPayerRateLimiter>;
