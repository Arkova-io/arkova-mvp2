/**
 * Stripe Client
 *
 * Initializes the Stripe SDK for webhook signature verification
 * and API calls. Uses the real Stripe client in production and
 * the mock client when USE_MOCKS=true.
 *
 * Per Constitution: Stripe keys are loaded from env vars (never hardcoded).
 *
 * @see P7-TS-03
 */

import Stripe from 'stripe';
import { config } from '../config.js';
import { mockStripeClient } from './mock.js';

/**
 * Real Stripe client — used for webhook signature verification
 * and any future Stripe API calls.
 */
export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

/**
 * Verify a Stripe webhook signature and return the parsed event.
 *
 * - Production: uses stripe.webhooks.constructEvent() (cryptographic verification)
 * - Mock mode: parses JSON without verification (for tests)
 *
 * @throws Stripe.errors.StripeSignatureVerificationError if signature is invalid
 */
export function verifyWebhookSignature(
  payload: Buffer | string,
  signature: string,
): Stripe.Event {
  if (config.useMocks) {
    return mockStripeClient.constructEvent(
      typeof payload === 'string' ? payload : payload.toString(),
      signature,
      config.stripeWebhookSecret,
    ) as unknown as Stripe.Event;
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripeWebhookSecret,
  );
}
