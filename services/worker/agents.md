# agents.md — services/worker
_Last updated: 2026-03-10 4:15 PM EDT_

## What This Folder Contains

Express-based worker service handling privileged server-side operations: anchor processing (PENDING → SECURED), Stripe webhook verification, outbound webhook delivery, and cron job scheduling. Uses Supabase service_role key — never the anon key.

## Recent Changes

| Date | Sprint | Change |
|------|--------|--------|
| 2026-03-10 | HARDENING-1 | 27 unit tests for `processAnchor()` + `processPendingAnchors()` (100% coverage on `anchor.ts`). Fixed silent audit event failure (BUG-H1-01). Deleted dead `anchorWithClaim.ts` (BUG-H1-02, BUG-H1-03). |
| 2026-03-10 | HARDENING-2 | 32 new tests: MockChainClient contract (18), getChainClient factory (5), job claim/completion flow (9). Total: 59 worker tests. 100% coverage on `anchor.ts`, `chain/mock.ts`, `chain/client.ts`. |

## Test Coverage Status

| File | Tests | Coverage | Sprint |
|------|-------|----------|--------|
| `src/jobs/anchor.ts` | 36 | 100% | HARDENING-1 + 2 |
| `src/chain/mock.ts` | 18 | 100% | HARDENING-2 |
| `src/chain/client.ts` | 5 | 100% | HARDENING-2 |
| `src/webhooks/delivery.ts` | 0 | 0% | **HARDENING-3 target** |
| `src/stripe/handlers.ts` | 0 | 0% | **HARDENING-3+ target** |
| `src/stripe/client.ts` | 0 | 0% | **HARDENING-3+ target** |

## Do / Don't Rules

- **DO** use `vi.hoisted()` for mutable mock state shared between `vi.mock()` factories and test code (avoids `ReferenceError: Cannot access before initialization`)
- **DO** mock `../config.js` and `../utils/logger.js` in every test file — they import from env vars that don't exist in test
- **DO** use `vi.fn()` chains (`.mockReturnThis()`, `.mockResolvedValueOnce()`) for Supabase client mocks
- **DON'T** call real Stripe or Bitcoin APIs — use mock interfaces
- **DON'T** set `anchor.status = 'SECURED'` from client code — worker-only via service_role
- **DON'T** import `generateFingerprint` — fingerprinting is client-side only (Constitution 1.6)
- **DON'T** modify existing migration files — write compensating migrations

## Dependencies

- `pino` / `pino-pretty` — structured logging
- `stripe` — payment webhook verification
- `zod` — config validation
- `node-cron` — job scheduling
- `express` — HTTP server
- Supabase JS client (`@supabase/supabase-js`) — database operations

## Key Patterns

**Supabase `{data, error}` pattern:** Supabase never throws on query failures. Always destructure and check `error`:
```typescript
const { data, error } = await db.from('table').select();
if (error) { logger.error({ error }, 'Failed'); return; }
```

**Mock hoisting pattern (Vitest):**
```typescript
const { mutableState } = vi.hoisted(() => {
  const mutableState = { value: 'default' };
  return { mutableState };
});
vi.mock('../config.js', () => ({
  get config() { return mutableState; }  // reads from hoisted ref
}));
```
