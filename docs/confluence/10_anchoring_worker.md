# Anchoring Worker

## Overview

The anchoring worker is a dedicated Node.js service that handles all backend processing for Ralph. Per the Constitution, this is the **only** backend runtime - Next.js API routes are forbidden.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Supabase Edge  │────▶│  Worker Service │
│   (Frontend)    │     │   (Auth/DB)     │     │  (Node.js)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Chain APIs     │
                                               │  (Bitcoin)      │
                                               └─────────────────┘
```

## Location

```
services/
└── worker/
    ├── src/
    │   ├── index.ts           # Entry point
    │   ├── config.ts          # Environment config
    │   ├── jobs/
    │   │   ├── anchor.ts      # Anchor processing
    │   │   ├── webhook.ts     # Webhook delivery
    │   │   └── cleanup.ts     # Maintenance jobs
    │   ├── chain/
    │   │   ├── client.ts      # Chain API client
    │   │   ├── mock.ts        # Mock for testing
    │   │   └── types.ts       # Chain types
    │   ├── stripe/
    │   │   ├── client.ts      # Stripe client
    │   │   ├── handlers.ts    # Webhook handlers
    │   │   └── mock.ts        # Mock for testing
    │   └── utils/
    │       ├── db.ts          # Database helpers
    │       └── logger.ts      # Structured logging
    ├── package.json
    ├── tsconfig.json
    └── Dockerfile
```

## Responsibilities

### 1. Anchor Processing

Process PENDING anchors and submit to chain:

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

  // Update anchor with chain data
  await db.from('anchors')
    .update({
      status: 'SECURED',
      chain_tx_id: receipt.txId,
      chain_block_height: receipt.blockHeight,
      chain_timestamp: receipt.timestamp,
    })
    .eq('id', anchorId);

  // Log audit event
  await db.from('audit_events').insert({
    event_type: 'anchor.secured',
    event_category: 'ANCHOR',
    target_type: 'anchor',
    target_id: anchorId,
    details: `Secured on chain: ${receipt.txId}`,
  });
}
```

### 2. Webhook Processing

Handle inbound Stripe webhooks and deliver outbound notifications.

See [09_webhooks.md](./09_webhooks.md) for details.

### 3. Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `processAnchors` | Every minute | Process PENDING anchors |
| `deliverWebhooks` | Every minute | Retry failed webhooks |
| `resetMonthlyCounts` | 1st of month | Reset anchor quotas |
| `cleanupExpired` | Daily | Remove expired data |

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=...

# Chain API
CHAIN_API_URL=https://api.chain.example
CHAIN_API_KEY=...
CHAIN_NETWORK=testnet  # or 'mainnet'

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Worker
WORKER_PORT=3001
NODE_ENV=production
LOG_LEVEL=info
```

### Network Configuration

Per Constitution, use approved terminology:

| Internal | UI Display |
|----------|------------|
| `testnet` | Test Environment |
| `mainnet` | Production Network |

## Chain Integration

### Non-Custodial Model

**Critical**: The worker only submits fingerprints. It does NOT:
- Hold private keys for user wallets
- Process user cryptocurrency
- Accept deposits or withdrawals

All network fees are paid from a **corporate fee account**.

### API Client

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

### Mock Client

For testing, use the mock client:

```typescript
// config.ts
export const chainClient = process.env.NODE_ENV === 'test'
  ? new MockChainClient()
  : new RealChainClient();
```

Mock implementation:

```typescript
class MockChainClient implements ChainClient {
  async submitFingerprint(data: SubmitData): Promise<ChainReceipt> {
    return {
      txId: `mock_tx_${Date.now()}`,
      blockHeight: 800000 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      confirmations: 6,
    };
  }
}
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist

USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Health Check

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version,
    uptime: process.uptime(),
  });
});
```

### Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await jobQueue.close();
  await db.end();
  process.exit(0);
});
```

## Monitoring

### Metrics

- `anchors_processed_total`
- `anchors_processing_duration_seconds`
- `webhooks_delivered_total`
- `webhooks_failed_total`
- `chain_api_latency_seconds`

### Alerts

| Condition | Severity | Action |
|-----------|----------|--------|
| Processing queue > 100 | Warning | Scale workers |
| Chain API errors > 5/min | Critical | Page on-call |
| Webhook failures > 10/min | Warning | Investigate |

## Testing

### Unit Tests

```bash
cd services/worker
npm test
```

### Integration Tests

```bash
# Start local Supabase
supabase start

# Run integration tests
npm run test:integration
```

### Mock Mode

Set `USE_MOCKS=true` to use mock clients for all external services.

## Related Documentation

- [08_payments_entitlements.md](./08_payments_entitlements.md) - Payment system
- [09_webhooks.md](./09_webhooks.md) - Webhook implementation
- [06_on_chain_policy.md](./06_on_chain_policy.md) - Content policy
