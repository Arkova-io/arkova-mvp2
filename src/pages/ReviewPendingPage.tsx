/**
 * Review Pending Page
 *
 * Wraps ManualReviewGate with sign-out functionality.
 * ManualReviewGate has its own full-page layout.
 *
 * @see CRIT-4 — replaces DashboardPage placeholder
 */

import { useAuth } from '@/hooks/useAuth';
import { ManualReviewGate } from '@/components/onboarding/ManualReviewGate';

export function ReviewPendingPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return <ManualReviewGate onSignOut={handleSignOut} />;
}
