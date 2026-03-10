/**
 * Webhook Settings Page
 *
 * Wraps WebhookSettings component in the AppShell layout.
 * Manages webhook endpoint CRUD via Supabase.
 *
 * @see P7-TS-09
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppShell } from '@/components/layout';
import { WebhookSettings } from '@/components/webhooks';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/lib/routes';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export function WebhookSettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const fetchEndpoints = useCallback(async () => {
    if (!profile?.org_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('webhook_endpoints')
      .select('id, url, events, is_active, created_at')
      .eq('org_id', profile.org_id)
      .order('created_at', { ascending: false });
    setEndpoints((data as WebhookEndpoint[]) ?? []);
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const handleAdd = async (url: string, secret: string, events: string[]) => {
    if (!profile?.org_id) return;
    // NOTE: secret should be HMAC-SHA256 hashed before persisting.
    // This is a placeholder until P7-TS-09 secret hashing is implemented.
    await supabase.from('webhook_endpoints').insert({
      org_id: profile.org_id,
      url,
      secret_hash: secret,
      events,
      is_active: true,
    });
    await fetchEndpoints();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('webhook_endpoints').delete().eq('id', id);
    await fetchEndpoints();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase
      .from('webhook_endpoints')
      .update({ is_active: active })
      .eq('id', id);
    await fetchEndpoints();
  };

  return (
    <AppShell
      user={user}
      profile={profile}
      profileLoading={profileLoading}
      onSignOut={handleSignOut}
    >
      <WebhookSettings
        endpoints={endpoints}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onToggle={handleToggle}
        loading={loading}
      />
    </AppShell>
  );
}
