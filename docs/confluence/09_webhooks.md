# Webhooks

## Overview

Ralph uses webhooks for two purposes:
1. **Inbound**: Receiving events from Stripe
2. **Outbound**: Sending anchor status updates to customers

## Inbound Webhooks (Stripe)

### Endpoint

```
POST /webhooks/stripe
```

This endpoint is handled by the worker service, NOT Next.js API routes (per Constitution).

### Signature Verification

All Stripe webhooks must be verified:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  // Process event...
}
```

### Event Handlers

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handleCheckoutComplete` | Create subscription record |
| `customer.subscription.created` | `handleSubscriptionCreated` | Update profile tier |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Update profile tier/status |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Downgrade to free |
| `invoice.paid` | `handleInvoicePaid` | Log payment success |
| `invoice.payment_failed` | `handlePaymentFailed` | Log failure, notify user |

### Idempotency

Webhooks may be delivered multiple times. Use Stripe event ID for idempotency:

```typescript
// Check if event already processed
const existing = await db
  .from('webhook_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single();

if (existing.data) {
  return { status: 200, body: 'Already processed' };
}

// Process and record
await processEvent(event);
await db.from('webhook_events').insert({
  stripe_event_id: event.id,
  event_type: event.type,
  processed_at: new Date().toISOString(),
});
```

### Error Handling

Return appropriate status codes:

| Status | Meaning | Stripe Action |
|--------|---------|---------------|
| 200 | Success | Mark delivered |
| 400 | Bad request | Don't retry |
| 5xx | Server error | Retry with backoff |

## Outbound Webhooks (Customer Notifications)

### Purpose

Organization customers can configure webhooks to receive anchor status updates.

### Events

| Event | Payload |
|-------|---------|
| `anchor.created` | Anchor ID, fingerprint, filename |
| `anchor.secured` | Anchor ID, chain receipt, timestamp |
| `anchor.revoked` | Anchor ID, revocation reason |
| `anchor.verified` | Anchor ID, verification result |

### Configuration

Organizations configure webhooks in settings:

```typescript
interface WebhookConfig {
  url: string;           // HTTPS endpoint
  secret: string;        // For HMAC signature
  events: string[];      // Events to receive
  enabled: boolean;
  created_at: string;
  last_triggered_at: string | null;
  failure_count: number;
}
```

### Delivery

```typescript
async function deliverWebhook(
  config: WebhookConfig,
  event: WebhookEvent
): Promise<void> {
  const payload = JSON.stringify(event);
  const signature = createHmac('sha256', config.secret)
    .update(payload)
    .digest('hex');

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ralph-Signature': signature,
      'X-Ralph-Event': event.type,
      'X-Ralph-Timestamp': new Date().toISOString(),
    },
    body: payload,
  });

  if (!response.ok) {
    throw new WebhookDeliveryError(response.status);
  }
}
```

### Retry Policy

Failed deliveries are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After 5 failures, webhook is disabled and organization is notified.

### Signature Verification (Customer Side)

Customers should verify webhook signatures:

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expected;
}
```

## Database Schema

```sql
-- Webhook configurations (per organization)
CREATE TABLE webhook_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  url text NOT NULL,
  secret text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  failure_count integer NOT NULL DEFAULT 0,
  last_triggered_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Webhook delivery log
CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES webhook_configs(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Stripe webhook events (for idempotency)
CREATE TABLE stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
```

## Security

1. **HTTPS Only**: Outbound webhooks only to HTTPS URLs
2. **Signature Verification**: All webhooks signed
3. **Timeout**: 30 second timeout for delivery
4. **Rate Limiting**: Max 100 deliveries per minute per organization
5. **IP Allowlist**: Optional customer-side IP filtering

## Testing

### Stripe CLI

Test inbound webhooks locally:

```bash
stripe listen --forward-to localhost:3001/webhooks/stripe
stripe trigger checkout.session.completed
```

### Mock Webhook Receiver

For testing outbound webhooks:

```bash
npx webhook-relay --port 8080
```

## Audit Events

All webhook activity is logged:

- `webhook.configured`
- `webhook.delivery_success`
- `webhook.delivery_failed`
- `webhook.disabled`

## Related Documentation

- [08_payments_entitlements.md](./08_payments_entitlements.md) - Payment system
- [10_anchoring_worker.md](./10_anchoring_worker.md) - Worker service
- [04_audit_events.md](./04_audit_events.md) - Audit logging
