/**
 * Settings Page
 *
 * User account settings: profile info and privacy toggle.
 *
 * @see P3-TS-03
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Shield, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/lib/routes';
import { NAV_LABELS, USER_ROLE_LABELS } from '@/lib/copy';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updating, updateProfile } = useProfile();

  const [fullName, setFullName] = useState('');
  const [nameInitialized, setNameInitialized] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize name field once profile loads
  if (profile && !nameInitialized) {
    setFullName(profile.full_name ?? '');
    setNameInitialized(true);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const handleSaveName = useCallback(async () => {
    const trimmed = fullName.trim();
    if (!trimmed) return;
    setError(null);

    try {
      await updateProfile({ full_name: trimmed });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, [fullName, updateProfile]);

  const handleTogglePublicProfile = useCallback(async (checked: boolean) => {
    await updateProfile({ is_public_profile: checked });
  }, [updateProfile]);

  return (
    <AppShell
      user={user}
      profile={profile}
      profileLoading={profileLoading}
      onSignOut={handleSignOut}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          {NAV_LABELS.SETTINGS}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and privacy preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your authentication provider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="flex gap-2">
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="Enter your full name"
                  disabled={updating}
                />
                <Button
                  onClick={handleSaveName}
                  disabled={updating || !fullName.trim() || fullName.trim() === (profile?.full_name ?? '')}
                  size="sm"
                  className="shrink-0"
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={
                  profile?.role
                    ? USER_ROLE_LABELS[profile.role as keyof typeof USER_ROLE_LABELS] ?? profile.role
                    : 'Not set'
                }
                disabled
                className="bg-muted"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control who can see your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile?.is_public_profile ? (
                  <Eye className="h-5 w-5 text-primary" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Public Profile</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.is_public_profile
                      ? 'Your profile is visible on verified records'
                      : 'Your profile is hidden on verified records'}
                  </p>
                </div>
              </div>
              <Switch
                checked={profile?.is_public_profile ?? false}
                onCheckedChange={handleTogglePublicProfile}
                disabled={profileLoading || updating}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Sign Out */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
