/**
 * Organization Page
 *
 * Shows org members and org-wide records for ORG_ADMIN users.
 * For INDIVIDUAL users, shows a prompt to join an organization.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useOrgMembers } from '@/hooks/useOrgMembers';
import { AppShell } from '@/components/layout';
import { OrgRegistryTable, MembersTable } from '@/components/organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ROUTES, recordDetailPath } from '@/lib/routes';
import type { Database } from '@/types/database.types';

type Anchor = Database['public']['Tables']['anchors']['Row'];

export function OrganizationPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { members, loading: membersLoading } = useOrgMembers(profile?.org_id);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const handleViewAnchor = useCallback((anchor: Anchor) => {
    navigate(recordDetailPath(anchor.id));
  }, [navigate]);

  // Individual users without an org see a placeholder
  if (!profileLoading && profile && !profile.org_id) {
    return (
      <AppShell user={user} profile={profile} profileLoading={profileLoading} onSignOut={handleSignOut}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Organization</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You are not currently part of an organization. Join an organization to share verification capabilities with your team.
          </p>
          <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} profile={profile} profileLoading={profileLoading} onSignOut={handleSignOut}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
        <p className="text-muted-foreground mt-1">
          Manage team members and organization records
        </p>
      </div>

      {/* Members section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            {!membersLoading && members.length > 0 && (
              <Badge variant="secondary">{members.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <MembersTable
            members={members}
            loading={membersLoading}
            currentUserId={user?.id}
          />
        </CardContent>
      </Card>

      {/* Org records section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Records</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {profile?.org_id ? (
            <OrgRegistryTable
              orgId={profile.org_id}
              onViewAnchor={handleViewAnchor}
            />
          ) : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
