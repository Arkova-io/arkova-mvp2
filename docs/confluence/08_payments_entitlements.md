# Payments & Entitlements

## Overview

Ralph uses Stripe for billing and entitlement management. This document describes the payment architecture, subscription tiers, and how entitlements are enforced.

## Non-Custodial Model

**Critical**: Ralph is non-custodial. We do NOT:
- Store user cryptocurrency
- Accept deposits
- Process withdrawals
- Hold user funds

All on-chain fees are paid from a **corporate fee account** managed by Arkova.

## Terminology

Per the Constitution, UI must use approved terminology:

| Forbidden | Required |
|-----------|----------|
| Wallet | Fee Account / Billing Account |
| Transaction | Network Receipt / Anchor Receipt |
| Testnet | Test Environment |
| Mainnet | Production Network |

## Subscription Tiers

### Individual Plan

| Feature | Limit |
|---------|-------|
| Anchors per month | 10 |
| Storage (metadata) | 100 MB |
| Verification | Unlimited |
| Support | Community |

### Professional Plan

| Feature | Limit |
|---------|-------|
| Anchors per month | 100 |
| Storage (metadata) | 1 GB |
| Verification | Unlimited |
| API Access | Yes |
| Support | Email |

### Organization Plan

| Feature | Limit |
|---------|-------|
| Anchors per month | Unlimited |
| Storage (metadata) | 10 GB |
| Team members | Up to 25 |
| Verification | Unlimited |
| API Access | Yes |
| Webhooks | Yes |
| Support | Priority |

## Stripe Integration

### Products & Prices

Products are created in Stripe Dashboard:

```
Product: Ralph Individual
  - Price: $9.99/month (price_individual_monthly)
  - Price: $99/year (price_individual_yearly)

Product: Ralph Professional
  - Price: $29.99/month (price_professional_monthly)
  - Price: $299/year (price_professional_yearly)

Product: Ralph Organization
  - Price: $99.99/month (price_organization_monthly)
  - Price: $999/year (price_organization_yearly)
```

### Checkout Flow

1. User selects plan on pricing page
2. Redirect to Stripe Checkout
3. Stripe processes payment
4. Webhook `checkout.session.completed` fires
5. Worker updates user entitlements in database
6. User redirected to success page

### Subscription Management

Users manage subscriptions via Stripe Customer Portal:

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${APP_URL}/settings/billing`,
});
```

## Entitlement Enforcement

### Database Schema

```sql
-- Added to profiles table
ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN anchor_count_this_month integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN anchor_count_reset_at timestamptz;
```

### Enforcement Points

1. **Anchor Creation**: Check `anchor_count_this_month` against tier limit
2. **API Access**: Check `subscription_tier` includes API access
3. **Webhook Configuration**: Check `subscription_tier` is 'organization'

### Monthly Reset

A scheduled job resets `anchor_count_this_month` on the 1st of each month:

```sql
UPDATE profiles
SET anchor_count_this_month = 0,
    anchor_count_reset_at = now()
WHERE anchor_count_reset_at < date_trunc('month', now());
```

## Webhook Handling

See [09_webhooks.md](./09_webhooks.md) for webhook implementation details.

### Critical Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription |
| `customer.subscription.updated` | Update tier/status |
| `customer.subscription.deleted` | Downgrade to free |
| `invoice.payment_failed` | Mark payment failed |

## Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... # Server-side only
STRIPE_PUBLISHABLE_KEY=pk_live_... # Client-safe
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook verification

# NEVER expose STRIPE_SECRET_KEY to client
```

## Testing

### Test Mode

Use Stripe test mode for development:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 3220 | 3D Secure |

### Mock Mode

For unit tests, use Stripe mocks:

```typescript
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: { create: vi.fn() },
    },
    // ... other mocked methods
  })),
}));
```

## Audit Events

All payment events are logged:

- `payment.subscription_created`
- `payment.subscription_updated`
- `payment.subscription_cancelled`
- `payment.invoice_paid`
- `payment.invoice_failed`

## Related Documentation

- [09_webhooks.md](./09_webhooks.md) - Webhook implementation
- [10_anchoring_worker.md](./10_anchoring_worker.md) - Worker service
- [04_audit_events.md](./04_audit_events.md) - Audit logging
