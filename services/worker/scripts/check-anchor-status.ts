#!/usr/bin/env tsx
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

dotenvConfig({ path: resolve(import.meta.dirname ?? '.', '../.env') });

async function main() {
  const gcpEnv = 'GOOGLE_APPLICATION_CREDENTIALS=/Users/carson/.config/gcloud/application_default_credentials.json';
  const url = execSync(`${gcpEnv} gcloud secrets versions access latest --secret=supabase-url --project=arkova1`, { encoding: 'utf-8' }).trim();
  const key = execSync(`${gcpEnv} gcloud secrets versions access latest --secret=supabase-service-role-key --project=arkova1`, { encoding: 'utf-8' }).trim();

  const s = createClient(url, key);

  const statuses = ['PENDING', 'BROADCASTING', 'SUBMITTED', 'SECURED', 'REVOKED'];
  const results: Record<string, number> = {};

  for (const status of statuses) {
    const { count } = await s.from('anchors').select('*', { count: 'exact', head: true }).eq('status', status);
    results[status] = count ?? 0;
  }

  const { count: total } = await s.from('anchors').select('*', { count: 'exact', head: true });
  results['TOTAL'] = total ?? 0;

  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
