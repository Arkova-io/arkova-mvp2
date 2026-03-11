import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for RLS integration tests only.
 * These tests require a running Supabase instance and environment variables:
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RLS_TEST_PASSWORD
 *
 * Separated from main vitest.config.ts because RLS tests are excluded
 * from the default test run (they need a live database).
 */
export default defineConfig({
  test: {
    globals: true,
    include: ['tests/rls/**/*.test.ts'],
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
