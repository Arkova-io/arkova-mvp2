/**
 * Outbound Webhook Delivery Job
 *
 * Delivers webhook notifications to customer endpoints.
 */

import { createHmac } from 'crypto';
import { db } from '../utils/db.js';
import { logger } from '../utils/logger.js';

interface WebhookConfig {
  id: string;
  org_id: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  failure_count: number;
}

interface WebhookPayload {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

const MAX_RETRIES = 5;
const TIMEOUT_MS = 30000;

/**
 * Sign a webhook payload
 */
function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Deliver a webhook to a customer endpoint
 */
export async function deliverWebhook(
  config: WebhookConfig,
  payload: WebhookPayload
): Promise<boolean> {
  const body = JSON.stringify(payload);
  const signature = signPayload(body, config.secret);

  logger.info({ configId: config.id, eventType: payload.type }, 'Delivering webhook');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ralph-Signature': signature,
        'X-Ralph-Event': payload.type,
        'X-Ralph-Timestamp': payload.timestamp,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Reset failure count on success
    await db
      .from('webhook_configs')
      .update({
        failure_count: 0,
        last_success_at: new Date().toISOString(),
        last_triggered_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    logger.info({ configId: config.id }, 'Webhook delivered successfully');
    return true;
  } catch (error) {
    logger.error({ configId: config.id, error }, 'Webhook delivery failed');

    // Increment failure count
    const newFailureCount = config.failure_count + 1;
    const shouldDisable = newFailureCount >= MAX_RETRIES;

    await db
      .from('webhook_configs')
      .update({
        failure_count: newFailureCount,
        enabled: !shouldDisable,
        last_failure_at: new Date().toISOString(),
        last_triggered_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    if (shouldDisable) {
      logger.warn({ configId: config.id }, 'Webhook disabled after max retries');

      // Log audit event
      await db.from('audit_events').insert({
        event_type: 'webhook.disabled',
        event_category: 'SYSTEM',
        org_id: config.org_id,
        target_type: 'webhook_config',
        target_id: config.id,
        details: `Webhook disabled after ${MAX_RETRIES} failed attempts`,
      });
    }

    return false;
  }
}

/**
 * Queue a webhook for delivery
 */
export async function queueWebhook(
  orgId: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  // Fetch active webhook configs for this org that subscribe to this event
  const { data: configs, error } = await db
    .from('webhook_configs')
    .select('*')
    .eq('org_id', orgId)
    .eq('enabled', true)
    .contains('events', [eventType]);

  if (error) {
    logger.error({ error }, 'Failed to fetch webhook configs');
    return;
  }

  if (!configs || configs.length === 0) {
    return;
  }

  const payload: WebhookPayload = {
    type: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  for (const config of configs) {
    await deliverWebhook(config as WebhookConfig, payload);
  }
}
