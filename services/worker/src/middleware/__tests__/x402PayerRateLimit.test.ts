/**
 * X402-IMPL-004: Payer Address Rate Limiter Tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import { createPayerRateLimiter } from '../x402PayerRateLimit.js';

describe('X402-IMPL-004: createPayerRateLimiter', () => {
  let limiter: ReturnType<typeof createPayerRateLimiter>;

  afterEach(() => {
    limiter?.destroy();
  });

  it('allows requests within limit', () => {
    limiter = createPayerRateLimiter({ maxRequests: 10, windowMs: 60_000 });

    const result = limiter.check('0xabc123');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.limit).toBe(10);
  });

  it('tracks request count correctly', () => {
    limiter = createPayerRateLimiter({ maxRequests: 5, windowMs: 60_000 });

    for (let i = 0; i < 4; i++) {
      limiter.check('0xabc');
    }
    const result = limiter.check('0xabc');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0); // 5th request, at the limit
  });

  it('blocks requests exceeding limit', () => {
    limiter = createPayerRateLimiter({ maxRequests: 3, windowMs: 60_000 });

    limiter.check('0xabc');
    limiter.check('0xabc');
    limiter.check('0xabc');
    const blocked = limiter.check('0xabc'); // 4th request

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('returns Retry-After in milliseconds', () => {
    limiter = createPayerRateLimiter({ maxRequests: 1, windowMs: 30_000 });

    limiter.check('0xabc');
    const blocked = limiter.check('0xabc');

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(30_000);
  });

  it('isolates different payer addresses', () => {
    limiter = createPayerRateLimiter({ maxRequests: 2, windowMs: 60_000 });

    limiter.check('0xalice');
    limiter.check('0xalice');
    const aliceBlocked = limiter.check('0xalice');

    const bobAllowed = limiter.check('0xbob');

    expect(aliceBlocked.allowed).toBe(false);
    expect(bobAllowed.allowed).toBe(true);
  });

  it('normalizes addresses to lowercase', () => {
    limiter = createPayerRateLimiter({ maxRequests: 2, windowMs: 60_000 });

    limiter.check('0xABC123');
    limiter.check('0xabc123');
    const result = limiter.check('0xAbC123');

    expect(result.allowed).toBe(false); // All three count as same address
  });

  it('resets count after window expires', () => {
    limiter = createPayerRateLimiter({ maxRequests: 1, windowMs: 1 }); // 1ms window

    limiter.check('0xabc');

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = limiter.check('0xabc');
        expect(result.allowed).toBe(true);
        resolve();
      }, 10);
    });
  });

  it('handles 1000 requests from same address', () => {
    limiter = createPayerRateLimiter({ maxRequests: 1000, windowMs: 60_000 });

    for (let i = 0; i < 1000; i++) {
      const r = limiter.check('0xspammer');
      expect(r.allowed).toBe(true);
    }

    // 1001st request should be blocked
    const blocked = limiter.check('0xspammer');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('reset() clears all entries', () => {
    limiter = createPayerRateLimiter({ maxRequests: 1, windowMs: 60_000 });

    limiter.check('0xabc');
    expect(limiter.size()).toBe(1);

    limiter.reset();
    expect(limiter.size()).toBe(0);

    // Should be allowed again after reset
    const result = limiter.check('0xabc');
    expect(result.allowed).toBe(true);
  });

  it('uses default config of 1000/min', () => {
    limiter = createPayerRateLimiter();

    const result = limiter.check('0xabc');
    expect(result.limit).toBe(1000);
  });
});
