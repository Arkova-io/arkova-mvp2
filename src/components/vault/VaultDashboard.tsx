/**
 * Vault Dashboard Component
 *
 * Individual user's personal vault with privacy controls and affiliations.
 */

import { useState, useCallback } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Shield,
  Eye,
  EyeOff,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppShell } from '@/components/layout';
import { StatCard, EmptyState } from '@/components/dashboard';
import { SecureDocumentDialog } from '@/components/anchor';
import { RecordsList, type Record } from '@/components/records';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface VaultDashboardProps {
  onSignOut: () => void;
  onViewAssetDetail?: (recordId: string) => void;
}

export function VaultDashboard({ onSignOut, onViewAssetDetail }: VaultDashboardProps) {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [secureDialogOpen, setSecureDialogOpen] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);

  // Privacy toggle state - persisted locally for MVP
  const [isPublicProfile, setIsPublicProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  const handleSecureSuccess = useCallback(() => {
    const newRecord: Record = {
      id: Date.now().toString(),
      filename: 'new-document.pdf',
      fingerprint: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      fileSize: 100000,
    };
    setRecords(prev => [newRecord, ...prev]);
  }, []);

  const handleViewRecord = useCallback((record: Record) => {
    onViewAssetDetail?.(record.id);
  }, [onViewAssetDetail]);

  const handleDownloadProof = useCallback((record: Record) => {
    console.log('Download proof:', record.id);
  }, []);

  const handleRevokeRecord = useCallback((record: Record) => {
    console.log('Revoke record:', record.id);
  }, []);

  // Calculate stats from records
  const stats = {
    total: records.length,
    secured: records.filter(r => r.status === 'SECURED').length,
    pending: records.filter(r => r.status === 'PENDING').length,
  };

  return (
    <AppShell
      user={user}
      profile={profile}
      profileLoading={profileLoading}
      onSignOut={handleSignOut}
    >
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and verify your secured documents
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          label="Total Records"
          value={stats.total}
          icon={FileText}
          variant="primary"
          loading={profileLoading}
        />
        <StatCard
          label="Secured"
          value={stats.secured}
          icon={CheckCircle}
          variant="success"
          loading={profileLoading}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          variant="warning"
          loading={profileLoading}
        />
      </div>

      {/* Two-column layout for settings */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Privacy Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {isPublicProfile ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control who can see your verification records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile" className="text-sm font-medium">
                  Public Verification Profile
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to verify your secured documents
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={isPublicProfile}
                onCheckedChange={setIsPublicProfile}
              />
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>
                  {isPublicProfile
                    ? 'Your records can be verified by anyone with the fingerprint'
                    : 'Only you can access your verification records'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affiliations Placeholder Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Organization Affiliations
            </CardTitle>
            <CardDescription>
              Connect with organizations for shared verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No affiliations yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Join an organization to share verification capabilities
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">My Records</CardTitle>
          <Button onClick={() => setSecureDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Secure Document
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-0">
          {records.length === 0 ? (
            <EmptyState
              title="No records yet"
              description="Secure your first document to create a permanent, tamper-proof record. Your documents never leave your device."
              actionLabel="Secure Document"
              onAction={() => setSecureDialogOpen(true)}
            />
          ) : (
            <RecordsList
              records={records}
              onViewRecord={handleViewRecord}
              onDownloadProof={handleDownloadProof}
              onRevokeRecord={handleRevokeRecord}
            />
          )}
        </CardContent>
      </Card>

      {/* Account info */}
      {profile && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'ORG_ADMIN' ? 'Organization Administrator' : 'Individual'}
                </p>
              </div>
            </div>
            {profile.org_id && (
              <Badge variant="secondary">Organization Member</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Secure Document Dialog */}
      <SecureDocumentDialog
        open={secureDialogOpen}
        onOpenChange={setSecureDialogOpen}
        onSuccess={handleSecureSuccess}
      />
    </AppShell>
  );
}
