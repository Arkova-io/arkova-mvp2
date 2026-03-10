/**
 * Onboarding Role Selection Page
 *
 * Uses useOnboarding hook for atomic role setting via RPC.
 * After role is set, refreshProfile recomputes destination and RouteGuard redirects.
 *
 * @see CRIT-4 — replaces DashboardPage placeholder
 */

import { AuthLayout } from '@/components/layout/AuthLayout';
import { RoleSelector } from '@/components/onboarding/RoleSelector';
import { useProfile } from '@/hooks/useProfile';
import { useOnboarding } from '@/hooks/useOnboarding';

export function OnboardingRolePage() {
  const { refreshProfile } = useProfile();
  const { loading, setRole } = useOnboarding();

  const handleRoleSelect = async (role: 'INDIVIDUAL' | 'ORG_ADMIN') => {
    const result = await setRole(role);
    if (result) {
      await refreshProfile();
      // RouteGuard will redirect based on new destination
    }
  };

  return (
    <AuthLayout title="Welcome to Arkova" description="Choose how you'll use the platform">
      <RoleSelector onSelect={handleRoleSelect} loading={loading} />
    </AuthLayout>
  );
}
