/**
 * Unit tests for Stripe webhook handlers
 *
 * HARDENING-3: handleStripeWebhook routing, handleCheckoutComplete,
 * handleSubscriptionUpdated, handleSubscriptionDeleted, handlePaymentFailed,
 * idempotency, event recording.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

// ---- Hoisted mocks ----

const {
  mockLogger,
  mockDbFrom,
  profilesUpdate,
  auditInsert,
} = vi.hoisted(() => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  // profiles.update({}).eq('id', userId)
  const profilesUpdateEq = vi.fn();
  const profilesUpdate = {
    update: vi.fn(() => ({ eq: profilesUpdateEq })),
    eq: profilesUpdateEq,
  };

  // audit_events.insert({})
  const auditInsert = vi.fn();

  const mockDbFrom = vi.fn((table: string) => {
    switch (table) {
      case 'profiles':
        return { update: profilesUpdate.update };
      case 'audit_events':
        return { insert: auditInsert };
      default:
        return {};
    }
  });

  return { mockLogger, mockDbFrom, profilesUpdate, auditInsert };
});

// ---- Module mocks ----

vi.mock('../utils/logger.js', () => ({ logger: mockLogger }));

vi.mock('../utils/db.js', () => ({
  db: { from: mockDbFrom },
}));

// ---- System under test ----

import {
  handleStripeWebhook,
  handleCheckoutComplete,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentFailed,
} from './handlers.js';

// ---- Test fixtures ----

function makeStripeEvent(
  type: string,
  object: Record<string, unknown>,
  id = 'evt_test_001',
): Stripe.Event {
  return {
    id,
    type,
    data: { object },
    object: 'event',
    api_version: '2023-10-16',
    created: Date.now() / 1000,
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

const CHECKOUT_EVENT = makeStripeEvent('checkout.session.completed', {
  id: 'cs_test_001',
  customer: 'cus_test_001',
  subscription: 'sub_test_001',
  metadata: { user_id: 'user-001' },
});

const SUBSCRIPTION_UPDATED_EVENT = makeStripeEvent('customer.subscription.updated', {
  id: 'sub_test_001',
  customer: 'cus_test_001',
  status: 'active',
});

const SUBSCRIPTION_DELETED_EVENT = makeStripeEvent('customer.subscription.deleted', {
  id: 'sub_test_001',
  customer: 'cus_test_001',
});

const PAYMENT_FAILED_EVENT = makeStripeEvent('invoice.payment_failed', {
  id: 'inv_test_001',
  customer: 'cus_test_001',
  subscription: 'sub_test_001',
});

// ================================================================
// handleStripeWebhook — routing
// ================================================================

describe('handleStripeWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: profile update succeeds
    profilesUpdate.eq.mockResolvedValue({ error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it('routes checkout.session.completed to handleCheckoutComplete', async () => {
    await handleStripeWebhook(CHECKOUT_EVENT);

    // handleCheckoutComplete updates profiles and inserts audit
    expect(mockDbFrom).toHaveBeenCalledWith('profiles');
  });

  it('routes customer.subscription.updated to handleSubscriptionUpdated', async () => {
    await handleStripeWebhook(SUBSCRIPTION_UPDATED_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: 'sub_test_001', status: 'active' }),
      'Subscription updated',
    );
  });

  it('routes customer.subscription.deleted to handleSubscriptionDeleted', async () => {
    await handleStripeWebhook(SUBSCRIPTION_DELETED_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: 'sub_test_001' }),
      'Subscription deleted',
    );
  });

  it('routes invoice.payment_failed to handlePaymentFailed', async () => {
    await handleStripeWebhook(PAYMENT_FAILED_EVENT);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'inv_test_001' }),
      'Payment failed',
    );
  });

  it('logs unhandled event types without error', async () => {
    const unknownEvent = makeStripeEvent('unknown.event.type', {});

    await handleStripeWebhook(unknownEvent);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'unknown.event.type' }),
      'Unhandled event type',
    );
  });

  it('records event as processed after handling', async () => {
    await handleStripeWebhook(CHECKOUT_EVENT);

    // recordEventProcessed logs the event
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'evt_test_001', eventType: 'checkout.session.completed' }),
      'Recording event as processed',
    );
  });

  it('handles duplicate event IDs (idempotency check — currently always returns false)', async () => {
    // isEventProcessed currently always returns false, so we test that behavior
    await handleStripeWebhook(CHECKOUT_EVENT);

    // Should process the event (not skip it)
    expect(mockDbFrom).toHaveBeenCalledWith('profiles');
  });
});

// ================================================================
// handleCheckoutComplete
// ================================================================

describe('handleCheckoutComplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profilesUpdate.eq.mockResolvedValue({ error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it('updates profiles table with user_id from session metadata', async () => {
    await handleCheckoutComplete(CHECKOUT_EVENT);

    expect(mockDbFrom).toHaveBeenCalledWith('profiles');
    expect(profilesUpdate.update).toHaveBeenCalled();
    expect(profilesUpdate.eq).toHaveBeenCalledWith('id', 'user-001');
  });

  it('logs audit event for subscription creation', async () => {
    await handleCheckoutComplete(CHECKOUT_EVENT);

    expect(mockDbFrom).toHaveBeenCalledWith('audit_events');
    expect(auditInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'payment.subscription_created',
        event_category: 'ADMIN',
        actor_id: 'user-001',
        details: expect.stringContaining('sub_test_001'),
      }),
    );
  });

  it('returns early when user_id is missing from metadata', async () => {
    const noUserEvent = makeStripeEvent('checkout.session.completed', {
      id: 'cs_test_002',
      customer: 'cus_test_002',
      subscription: 'sub_test_002',
      metadata: {},
    });

    await handleCheckoutComplete(noUserEvent);

    expect(mockLogger.error).toHaveBeenCalledWith('No user_id in session metadata');
    expect(profilesUpdate.update).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it('returns early when metadata is undefined', async () => {
    const noMetaEvent = makeStripeEvent('checkout.session.completed', {
      id: 'cs_test_003',
      customer: 'cus_test_003',
      subscription: 'sub_test_003',
    });

    await handleCheckoutComplete(noMetaEvent);

    expect(mockLogger.error).toHaveBeenCalledWith('No user_id in session metadata');
    expect(profilesUpdate.update).not.toHaveBeenCalled();
  });

  it('throws when profile update fails', async () => {
    const dbError = { message: 'connection refused', code: '08001' };
    profilesUpdate.eq.mockResolvedValue({ error: dbError });

    await expect(handleCheckoutComplete(CHECKOUT_EVENT)).rejects.toEqual(dbError);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: dbError }),
      'Failed to update profile',
    );
  });

  it('does not insert audit event when profile update fails', async () => {
    const dbError = { message: 'connection refused' };
    profilesUpdate.eq.mockResolvedValue({ error: dbError });

    await expect(handleCheckoutComplete(CHECKOUT_EVENT)).rejects.toBeDefined();

    expect(auditInsert).not.toHaveBeenCalled();
  });

  it('logs session ID on processing', async () => {
    await handleCheckoutComplete(CHECKOUT_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'cs_test_001' }),
      'Processing checkout completion',
    );
  });

  it('logs subscription activation on success', async () => {
    await handleCheckoutComplete(CHECKOUT_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-001', subscriptionId: 'sub_test_001' }),
      'Subscription activated',
    );
  });
});

// ================================================================
// handleSubscriptionUpdated
// ================================================================

describe('handleSubscriptionUpdated', () => {
  it('logs subscription status change', async () => {
    await handleSubscriptionUpdated(SUBSCRIPTION_UPDATED_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: 'sub_test_001',
        status: 'active',
      }),
      'Subscription updated',
    );
  });
});

// ================================================================
// handleSubscriptionDeleted
// ================================================================

describe('handleSubscriptionDeleted', () => {
  it('logs subscription deletion', async () => {
    await handleSubscriptionDeleted(SUBSCRIPTION_DELETED_EVENT);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: 'sub_test_001' }),
      'Subscription deleted',
    );
  });
});

// ================================================================
// handlePaymentFailed
// ================================================================

describe('handlePaymentFailed', () => {
  it('logs payment failure as warning', async () => {
    await handlePaymentFailed(PAYMENT_FAILED_EVENT);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'inv_test_001' }),
      'Payment failed',
    );
  });
});
