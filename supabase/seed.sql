-- =============================================================================
-- SEED DATA FOR RALPH
-- =============================================================================
-- This seed file creates demo data for local development and testing.
-- Run with: supabase db reset (applies migrations + seed)
--
-- IMPORTANT: This seed runs with service_role privileges, bypassing RLS.
-- This is intentional to set up the complete demo environment.
-- =============================================================================

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

INSERT INTO organizations (id, legal_name, display_name, domain, verification_status)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Arkova Technologies Inc.',
    'Arkova',
    'arkova.local',
    'VERIFIED'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Beta Corp LLC',
    'Beta Corp',
    'betacorp.local',
    'UNVERIFIED'
  );

-- =============================================================================
-- AUTH USERS (via Supabase Auth)
-- =============================================================================
-- Note: In Supabase, we need to insert into auth.users directly for seed data.
-- These users have password: 'demo_password_123'
-- Password hash is bcrypt of 'demo_password_123'

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'admin_demo@arkova.local',
    -- bcrypt hash of 'demo_password_123'
    '$2a$10$PznXcXqCJqMcmyN5y9PYxeJ.Rjt2vTGH/BwMZqTn1eKBTqTqTqTqT',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin Demo"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
    'user_demo@arkova.local',
    -- bcrypt hash of 'demo_password_123'
    '$2a$10$PznXcXqCJqMcmyN5y9PYxeJ.Rjt2vTGH/BwMZqTn1eKBTqTqTqTqT',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "User Demo"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '00000000-0000-0000-0000-000000000000',
    'beta_admin@betacorp.local',
    -- bcrypt hash of 'demo_password_123'
    '$2a$10$PznXcXqCJqMcmyN5y9PYxeJ.Rjt2vTGH/BwMZqTn1eKBTqTqTqTqT',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Beta Admin"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

-- =============================================================================
-- PROFILES
-- =============================================================================

INSERT INTO profiles (id, email, full_name, role, role_set_at, org_id)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin_demo@arkova.local',
    'Admin Demo',
    'ORG_ADMIN',
    now(),
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'user_demo@arkova.local',
    'User Demo',
    'INDIVIDUAL',
    now(),
    NULL
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'beta_admin@betacorp.local',
    'Beta Admin',
    'ORG_ADMIN',
    now(),
    '22222222-2222-2222-2222-222222222222'
  );

-- =============================================================================
-- ANCHORS
-- =============================================================================
-- Demonstrating all anchor statuses and various scenarios

-- Admin Demo's anchors (Org A)
INSERT INTO anchors (
  id, user_id, org_id, fingerprint, filename, file_size, file_mime, status,
  chain_tx_id, chain_block_height, chain_timestamp, legal_hold
)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'a1b2c3d4e5f6a890a234567890123456789012345678901234567890abcdabcd',
    'contract_2024.pdf',
    1048576,
    'application/pdf',
    'SECURED',
    'btc_tx_001_demo',
    800000,
    '2024-01-15T10:30:00Z',
    false
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'b2c3d4e5f6a890123456789012345678901234567890123456789012bcdeab12',
    'invoice_jan.pdf',
    524288,
    'application/pdf',
    'PENDING',
    NULL,
    NULL,
    NULL,
    false
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'c3d4e5f6a8901234567890123456789012345678901234567890123456cdef12',
    'old_agreement.pdf',
    262144,
    'application/pdf',
    'REVOKED',
    'btc_tx_002_demo',
    799000,
    '2024-01-10T08:00:00Z',
    false
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'd4e5f6a8901234567890123456789012345678901234567890123456def0ab12',
    'legal_hold_document.pdf',
    131072,
    'application/pdf',
    'SECURED',
    'btc_tx_003_demo',
    800100,
    '2024-01-16T12:00:00Z',
    true -- LEGAL HOLD
  );

-- User Demo's anchors (INDIVIDUAL, no org)
INSERT INTO anchors (
  id, user_id, org_id, fingerprint, filename, file_size, file_mime, status,
  chain_tx_id, chain_block_height, chain_timestamp, legal_hold
)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NULL,
    'e5f6a890123456789012345678901234567890123456789012345678ef012abc',
    'personal_doc.pdf',
    65536,
    'application/pdf',
    'SECURED',
    'btc_tx_004_demo',
    800200,
    '2024-01-17T14:00:00Z',
    false
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NULL,
    'f6a890123456789012345678901234567890123456789012345678901f0ab123',
    'photo_proof.png',
    2097152,
    'image/png',
    'PENDING',
    NULL,
    NULL,
    NULL,
    false
  );

-- Beta Admin's anchors (Org B)
INSERT INTO anchors (
  id, user_id, org_id, fingerprint, filename, file_size, file_mime, status
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'a890123456789012345678901234567890123456789012345678901234ab0cde',
    'beta_contract.pdf',
    512000,
    'application/pdf',
    'PENDING'
  );

-- =============================================================================
-- AUDIT EVENTS
-- =============================================================================
-- Sample audit events for demonstration

INSERT INTO audit_events (
  event_type, event_category, actor_id, actor_email, target_type, target_id, org_id, details
)
VALUES
  (
    'anchor.created',
    'ANCHOR',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin_demo@arkova.local',
    'anchor',
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Created anchor for contract_2024.pdf'
  ),
  (
    'anchor.secured',
    'ANCHOR',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin_demo@arkova.local',
    'anchor',
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Anchor secured on chain: btc_tx_001_demo'
  ),
  (
    'auth.login',
    'AUTH',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'user_demo@arkova.local',
    NULL,
    NULL,
    NULL,
    'User logged in successfully'
  ),
  (
    'anchor.created',
    'ANCHOR',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'user_demo@arkova.local',
    'anchor',
    'b1111111-1111-1111-1111-111111111111',
    NULL,
    'Created anchor for personal_doc.pdf'
  );

-- =============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- =============================================================================
-- Run these queries to verify seed data:
--
-- SELECT * FROM organizations;
-- SELECT id, email, role, org_id FROM profiles;
-- SELECT id, user_id, filename, status, legal_hold FROM anchors;
-- SELECT event_type, actor_email, target_type FROM audit_events;
-- =============================================================================
