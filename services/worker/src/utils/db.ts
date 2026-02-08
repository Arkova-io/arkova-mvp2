/**
 * Database Client
 *
 * Supabase client with service role for worker operations.
 * Service role bypasses RLS for administrative tasks.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import type { Database } from '../types/database.types.js';

let client: SupabaseClient<Database> | null = null;

export function getDb(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return client;
}

export const db = getDb();
