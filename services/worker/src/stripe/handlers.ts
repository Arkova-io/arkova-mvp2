/**
 * Stripe Webhook Handlers
 *
 * Handlers for Stripe webhook events.
 */

import { db } from '../utils/db.js';
import { logger } from '../utils/logger.js';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Check if event was already processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  // In a full implementation, we'd check a stripe_webhook_events table
  // For now, just return false
  return false;
}

/**
 * Record event as processed
 */
async function recordEventProcessed(eventId: string, eventType: string): Promise<void> {
  logger.info({ eventId, eventType }, 'Recording event as processed');
  // In a full implementation, we'd insert into stripe_webhook_events table
}

/**
 * Handle checkout.session.completed
 */
export async function handleCheckoutComplete(event: StripeEvent): Promise<void> {
  const session = event.data.object as {
    id: string;
    customer: string;
    subscription: string;
    metadata?: { user_id?: string };
  };

  logger.info({ sessionId: session.id }, 'Processing checkout completion');

  const userId = session.metadata?.user_id;
  if (!userId) {
    logger.error('No user_id in session metadata');
    return;
  }

  // Update user profile with subscription info
  const { error } = await db
    .from('profiles')
    .update({
      // These fields would need to be added to the schema
      // stripe_customer_id: session.customer,
      // stripe_subscription_id: session.subscription,
      // subscription_status: 'active',
    })
    .eq('id', userId);

  if (error) {
    logger.error({ error }, 'Failed to update profile');
    throw error;
  }

  // Log audit event
  await db.from('audit_events').insert({
    event_type: 'payment.subscription_created',
    event_category: 'ADMIN',
    actor_id: userId,
    details: `Subscription created: ${session.subscription}`,
  });

  logger.info({ userId, subscriptionId: session.subscription }, 'Subscription activated');
}

/**
 * Handle customer.subscription.updated
 */
export async function handleSubscriptionUpdated(event: StripeEvent): Promise<void> {
  const subscription = event.data.object as {
    id: string;
    customer: string;
    status: string;
  };

  logger.info({ subscriptionId: subscription.id, status: subscription.status }, 'Subscription updated');

  // Update subscription status in database
  // Implementation would update profiles table
}

/**
 * Handle customer.subscription.deleted
 */
export async function handleSubscriptionDeleted(event: StripeEvent): Promise<void> {
  const subscription = event.data.object as {
    id: string;
    customer: string;
  };

  logger.info({ subscriptionId: subscription.id }, 'Subscription deleted');

  // Downgrade user to free tier
  // Implementation would update profiles table
}

/**
 * Handle invoice.payment_failed
 */
export async function handlePaymentFailed(event: StripeEvent): Promise<void> {
  const invoice = event.data.object as {
    id: string;
    customer: string;
    subscription: string;
  };

  logger.warn({ invoiceId: invoice.id }, 'Payment failed');

  // Log and notify user
  // Implementation would send notification
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(event: StripeEvent): Promise<void> {
  // Check idempotency
  if (await isEventProcessed(event.id)) {
    logger.info({ eventId: event.id }, 'Event already processed');
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event);
      break;
    default:
      logger.info({ eventType: event.type }, 'Unhandled event type');
  }

  // Record as processed
  await recordEventProcessed(event.id, event.type);
}
