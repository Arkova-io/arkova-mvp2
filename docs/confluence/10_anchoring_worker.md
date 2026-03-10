# Anchoring Worker
_Last updated: 2026-03-10 8:00 PM EST | Story: P7-TS-05, P7-TS-10_

## Overview

The anchoring worker is a dedicated Node.js + Express service that handles all backend processing for Arkova. Per the Constitution, this is the **only** backend runtime — no frontend framework API routes (Arkova uses Vite for the frontend, which has no server-side API layer).

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Supabase Edge  │────▶│  Worker Service │
│   (Vite)        │     │   (Auth/DB)     │     │  (Node+Express) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Chain APIs     │
                                               │  (Bitcoin)      │
                                               └─────────────────┘
```

## Directory Structure (Actual)

```
services/
└── worker/
    ├── src/
    │   ├── index.ts              # Express server + cron + graceful shutdown
    │   ├── config.ts             # Environment config
    │   ├── jobs/
    │   │   ├── anchor.ts         # Process pending anchors + dispatch webhooks
    │   │   ├── report.ts         # Report generation job
    │   │   └── webhook.ts        # Webhook delivery job (legacy stub)
    │   ├── chain/
    │   │   ├── client.ts         # ChainClient factory (returns MockChainClient)
    │   │   ├── mock.ts           # Mock implementation
    │   │   └── types.ts          # ChainClient interface
    │   ├── stripe/
    │   │   ├── client.ts         # Stripe SDK + webhook signature verification
    │   │   ├── handlers.ts       # Webhook event handlers
    │   │   └── mock.ts           # Mock Stripe for tests
    │   ├── webhooks/
    │   │   └── delivery.ts       # Outbound webhook delivery engine
    │   ├── types/                # Shared type definitions
    │   └── utils/
    │       ├── correlationId.ts  # Request correlation tracking
    │       ├── db.ts             # Supabase service_role client
    │       ├── logger.ts         # Structured logging
    │       └── rateLimit.ts      # Rate limiter
    ├── package.json
    └── tsconfig.json
```

## Responsibilities

### 1. Anchor Processing

Process PENDING anchors, submit to chain, log audit events, and dispatch webhooks (`jobs/anchor.ts`):

```typescript
async function processAnchor(anchorId: string): Promise<void> {
  const anchor = await db.from('anchors')
    .select('*')
    .eq('id', anchorId)
    .eq('status', 'PENDING')
    .single();

  if (!anchor.data) return;

  // Submit fingerprint to chain
  const receipt = await chainClient.submitFingerprint({
    fingerprint: anchor.data.fingerprint,
    timestamp: new Date().toISOString(),
  });

  // Update anchor with chain data (service_role only — Constitution 1.4)
  await db.from('anchors')
    .update({
      status: 'SECURED',
      chain_tx_id: receipt.txId,
      chain_block_height: receipt.blockHeight,
      chain_timestamp: receipt.timestamp,
    })
    .eq('id', anchorId);

  // Log audit event (non-fatal)
  await db.from('audit_events').insert({
    event_type: 'anchor.secured',
    event_category: 'ANCHOR',
    target_type: 'anchor',
    target_id: anchorId,
    details: `Secured on chain: ${receipt.receiptId}`,
  });

  // Dispatch webhook (non-fatal, skipped if no org_id)
  if (anchor.data.org_id) {
    await dispatchWebhookEvent(anchor.data.org_id, 'anchor.secured', anchorId, {
      anchor_id: anchorId,
      public_id: anchor.data.public_id,
      fingerprint: anchor.data.fingerprint,
      status: 'SECURED',
      chain_tx_id: receipt.receiptId,
      chain_block_height: receipt.blockHeight,
      secured_at: receipt.blockTimestamp,
    });
  }
}
```

Webhook dispatch is non-fatal — if it fails, the anchor remains SECURED and a warning is logged. Individual users without `org_id` skip webhook dispatch entirely.

### 2. Webhook Processing

- **Inbound:** Stripe webhook handlers (`stripe/handlers.ts`)
- **Outbound:** Delivery engine (`webhooks/delivery.ts`) with exponential backoff and HMAC-SHA256 signing

See [09_webhooks.md](./09_webhooks.md) for details.

### 3. Report Generation

Report processing job (`jobs/report.ts`) generates reports requested via the `reports` table (migration 0019). Output stored as `report_artifacts`.

### 4. Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `processPendingAnchors` | Every minute | Process PENDING anchors → chain → SECURED → audit → webhook |
| `processWebhookRetries` | Every 2 minutes | Retry failed webhook deliveries with exponential backoff |
| `resetMonthlyCounts` | 1st of month | Reset anchor quotas |

## Configuration

### Environment Variables

```bash
# Database
SUPABASE_SERVICE_ROLE_KEY=...     # Worker-only, never in browser

# Chain (currently mock — CRIT-2)
BITCOIN_TREASURY_WIF=...          # Signing key — never logged
BITCOIN_NETWORK=testnet           # "mainnet" or "testnet"

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Worker
WORKER_PORT=3001
NODE_ENV=development
```

### Network Configuration

Per Constitution, use approved terminology in UI:

| Internal | UI Display |
|----------|------------|
| `testnet` | Test Environment |
| `mainnet` | Production Network |

## Chain Integration

### Current State (CRIT-2)

`getChainClient()` in `chain/client.ts` always returns `MockChainClient`. No real Bitcoin integration exists yet. The production path requires:

1. Install `bitcoinjs-lib`
2. Implement real ChainClient with OP_RETURN
3. Bitcoin Signet testing first
4. AWS KMS for mainnet signing

### Non-Custodial Model

The worker only submits fingerprints. It does NOT hold private keys for user wallets, process user cryptocurrency, or accept deposits.

All network fees are paid from a **corporate fee account**.

### Chain Client Interface

```typescript
interface ChainClient {
  submitFingerprint(data: {
    fingerprint: string;
    timestamp: string;
  }): Promise<ChainReceipt>;

  verifyFingerprint(fingerprint: string): Promise<VerificationResult>;

  getReceipt(txId: string): Promise<ChainReceipt>;
}

interface ChainReceipt {
  txId: string;
  blockHeight: number;
  timestamp: string;
  confirmations: number;
}
```

## Health Check

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version,
    uptime: process.uptime(),
  });
});
```

Available regardless of feature flag state (Constitution 1.9).

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Express server + cron | Complete | `index.ts` with graceful shutdown |
| Anchor processing jobs | Complete | `anchor.ts` — full lifecycle including webhook dispatch |
| Chain client interface | Complete | MockChainClient only (CRIT-2) |
| Stripe webhook handlers | Complete | P7-TS-03 |
| Outbound webhook delivery | Complete | Wired to anchor lifecycle (HARDENING-4). Dispatches on SECURED. |
| Webhook retry scheduling | Complete | `processWebhookRetries()` runs every 2 minutes via cron |
| Report generation | Complete | `report.ts` |
| Rate limiter | Complete | `utils/rateLimit.ts` |
| Worker test coverage | 228 tests across 14 files, 80%+ on all paths | HARDENING-1/2/3/4/5 complete (2026-03-10) |

## Testing

### Unit Tests

```bash
cd services/worker
npm test
```

**Current coverage (2026-03-10 8:00 PM EST):** 228 tests across 14 test files. All worker source files pass 80% per-file thresholds. Critical path files (`anchor.ts`, `chain/client.ts`, `chain/mock.ts`, `webhooks/delivery.ts`, `stripe/client.ts`, `stripe/handlers.ts`) at 98-100%. Lifecycle integration test (`anchor-lifecycle.test.ts`) verifies end-to-end flow. HARDENING-5 added coverage for all remaining files: `config.ts`, `index.ts`, `stripe/mock.ts`, `jobs/report.ts`, `jobs/webhook.ts`, `utils/correlationId.ts`, `utils/rateLimit.ts`.

### Mock Mode

Tests use mock interfaces for all external services (Constitution 1.7):

```typescript
const mockChain: IAnchorPublisher = {
  publishAnchor: jest.fn().mockResolvedValue({ txId: 'mock_tx' })
};
```

## Related Documentation

- [08_payments_entitlements.md](./08_payments_entitlements.md) — Payment system
- [09_webhooks.md](./09_webhooks.md) — Webhook implementation
- [06_on_chain_policy.md](./06_on_chain_policy.md) — Content policy

## Change Log

| Date | Story | Change |
|------|-------|--------|
| 2026-03-10 | Audit | Rewrote: fixed "Next.js" to "Vite" framing, updated directory structure to match actual files (added webhooks/delivery.ts, anchorWithClaim.ts, report.ts, utils/correlationId.ts, utils/rateLimit.ts; removed nonexistent cleanup.ts, Dockerfile), documented implementation status and known gaps |
| 2026-03-10 | HARDENING-1/2/3 | Updated coverage status: 114 tests, 80%+ thresholds on all 6 critical paths. Removed anchorWithClaim.ts reference (deleted as dead code in HARDENING-1). |
| 2026-03-10 5:20 PM EST | HARDENING-4 | Webhook dispatch wired in anchor.ts. processWebhookRetries added to cron. 132 tests. P7-TS-10 COMPLETE. Removed stale anchorWithClaim.ts from directory listing. |
| 2026-03-10 8:00 PM EST | HARDENING-5 | 96 new tests across 7 new test files covering all remaining worker source files (config, index, stripe/mock, jobs/report, jobs/webhook, utils/correlationId, utils/rateLimit). Exported `cleanupExpiredEntries()` from rateLimit.ts for testability. Total: 228 worker tests, 14 test files. 80%+ thresholds on all files. Worker hardening sprint COMPLETE. |
