/**
 * Platform Admin Utility
 *
 * Shared helper to check if a user is an Arkova platform admin.
 * Used by treasury, admin-stats, and admin-health endpoints.
 *
 * @see feedback_treasury_access — Treasury is Arkova-internal ONLY
 */

import { db } from './db.js';

/** Platform admin emails — single source of truth for worker-side admin access */
const PLATFORM_ADMIN_EMAILS = [
  'carson@arkova.ai',
  'sarah@arkova.ai',
];

/**
 * Verify the requesting user is a platform admin (Arkova internal).
 * Checks email against the hardcoded whitelist.
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await db
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!profile?.email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(profile.email);
}
