-- =============================================================================
-- ARKOVA DEMO SEED DATA
-- File: supabase/seed.sql
-- Updated: March 2026
-- Story: Demo Quality / 07_seed_clickthrough.md
--
-- PURPOSE
-- -------
-- Hand-crafted demo records for local development and sales demos.
-- Covers the full credential lifecycle: SECURED, PENDING, REVOKED, EXPIRED.
-- Two orgs, three personas. Click-through verified against current schema.
--
-- USAGE
--   npx supabase db reset          -- applies migrations + this seed
--   npm run dev                    -- app should be fully navigable
--
-- ACCOUNTS (for local demo login)
--   admin@umich-demo.arkova.io     password: Demo1234!
--   registrar@umich-demo.arkova.io password: Demo1234!
--
-- COMPLIANCE NOTES
-- ----------------
-- - No real PII. All names are fictional composites.
-- - Fingerprints are valid SHA-256 hex strings (64 chars).
-- - public_id values use ARK-YYYY-NNNNN format per spec.
-- - No banned UI terminology (Wallet/Hash/Block/etc) in any label field.
-- - anchor.status = 'SECURED' inserted directly here (seed only).
--   In production, only the worker sets SECURED via complete_anchoring_job().
-- - Adapted to current schema column names (fingerprint, filename, etc.).
-- =============================================================================


-- =============================================================================
-- 0. CONSTANTS — all IDs defined once at the top for referential integrity
-- =============================================================================

-- Organizations
-- ORG_A: University of Michigan Office of the Registrar (primary demo org)
-- ORG_B: Midwest Medical Licensing Board (second org, shows multi-tenant isolation)

-- Users (profiles.id = auth.users.id per current schema)
-- USER_ADMIN:      11111111-0000-0000-0000-000000000001  admin@umich-demo.arkova.io        ORG_ADMIN  at ORG_A
-- USER_REGISTRAR:  11111111-0000-0000-0000-000000000002  registrar@umich-demo.arkova.io    ORG_MEMBER at ORG_A
-- USER_ORGB_ADMIN: 22222222-0000-0000-0000-000000000001  admin@midwest-medical.arkova.io   ORG_ADMIN  at ORG_B

-- Anchors (6 records, one per status tier + PENDING)
-- ANCHOR_1: Maya Chen       — BS Computer Science    — SECURED
-- ANCHOR_2: James Okafor    — MBA                    — SECURED
-- ANCHOR_3: Priya Sharma    — RN License             — REVOKED
-- ANCHOR_4: Daniel Torres   — PMP Certification      — EXPIRED
-- ANCHOR_5: Sarah Kim       — MS Data Science        — PENDING
-- ANCHOR_6: (ORG_B record)  — MD License             — SECURED  (RLS isolation demo)


-- =============================================================================
-- 1. TRUNCATE (safe reset — seed is idempotent on db reset)
-- =============================================================================

TRUNCATE TABLE audit_events    RESTART IDENTITY CASCADE;
TRUNCATE TABLE anchoring_jobs  RESTART IDENTITY CASCADE;
TRUNCATE TABLE anchor_proofs   RESTART IDENTITY CASCADE;
TRUNCATE TABLE anchors         RESTART IDENTITY CASCADE;
TRUNCATE TABLE memberships     RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles        RESTART IDENTITY CASCADE;
TRUNCATE TABLE organizations   RESTART IDENTITY CASCADE;

-- Delete seeded auth users so re-inserts work cleanly
DELETE FROM auth.identities WHERE user_id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000001'
);
DELETE FROM auth.users WHERE id IN (
  '11111111-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000001'
);


-- =============================================================================
-- 2. AUTH USERS
-- Supabase local dev: insert directly into auth.users.
-- Passwords are bcrypt of "Demo1234!" — generated offline, safe to commit.
-- =============================================================================

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
  aud,
  role
) VALUES
  -- ORG ADMIN: admin@umich-demo.arkova.io
  (
    '11111111-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@umich-demo.arkova.io',
    '$2a$10$PH7/oSNFj5dPHHH0q9.nEOP.ygE4qA2X7kRZ5u.yObsvU5Z2p0nGy',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Alex Rivera"}',
    'authenticated',
    'authenticated'
  ),
  -- ORG MEMBER: registrar@umich-demo.arkova.io
  (
    '11111111-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'registrar@umich-demo.arkova.io',
    '$2a$10$PH7/oSNFj5dPHHH0q9.nEOP.ygE4qA2X7kRZ5u.yObsvU5Z2p0nGy',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Jordan Lee"}',
    'authenticated',
    'authenticated'
  ),
  -- ORG_B ADMIN: admin@midwest-medical.arkova.io (RLS isolation persona)
  (
    '22222222-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@midwest-medical.arkova.io',
    '$2a$10$PH7/oSNFj5dPHHH0q9.nEOP.ygE4qA2X7kRZ5u.yObsvU5Z2p0nGy',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Renata Kowalski"}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required for email/password login to work in Supabase)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'email',
    '{"sub": "11111111-0000-0000-0000-000000000001", "email": "admin@umich-demo.arkova.io"}',
    NOW(), NOW(), NOW()
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    'email',
    '{"sub": "11111111-0000-0000-0000-000000000002", "email": "registrar@umich-demo.arkova.io"}',
    NOW(), NOW(), NOW()
  ),
  (
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001',
    'email',
    '{"sub": "22222222-0000-0000-0000-000000000001", "email": "admin@midwest-medical.arkova.io"}',
    NOW(), NOW(), NOW()
  )
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 3. ORGANIZATIONS
-- Schema: id, legal_name, display_name, domain, verification_status
-- =============================================================================

INSERT INTO organizations (id, legal_name, display_name, domain, verification_status, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'University of Michigan — Office of the Registrar',
    'UMich Registrar',
    'umich.edu',
    'VERIFIED',
    '2025-08-15 09:00:00+00',
    '2025-08-15 09:00:00+00'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Midwest Medical Licensing Board',
    'Midwest Medical Board',
    'midwest-medical.org',
    'VERIFIED',
    '2025-10-01 14:00:00+00',
    '2025-10-01 14:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 4. PROFILES
-- Schema: id (= auth.users.id), email, full_name, role, org_id, etc.
-- Current schema: profiles.id references auth.users(id) directly.
-- =============================================================================

INSERT INTO profiles (id, email, org_id, full_name, role, created_at, updated_at)
VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    'admin@umich-demo.arkova.io',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Alex Rivera',
    'ORG_ADMIN',
    '2025-08-15 09:05:00+00',
    '2025-08-15 09:05:00+00'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'registrar@umich-demo.arkova.io',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Jordan Lee',
    'ORG_MEMBER',
    '2025-08-15 09:10:00+00',
    '2025-08-15 09:10:00+00'
  ),
  (
    '22222222-0000-0000-0000-000000000001',
    'admin@midwest-medical.arkova.io',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Dr. Renata Kowalski',
    'ORG_ADMIN',
    '2025-10-01 14:05:00+00',
    '2025-10-01 14:05:00+00'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 5. MEMBERSHIPS
-- =============================================================================

INSERT INTO memberships (id, user_id, org_id, role, created_at)
VALUES
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'ORG_ADMIN',
    '2025-08-15 09:05:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    'ORG_MEMBER',
    '2025-08-15 09:10:00+00'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000003',
    '22222222-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'ORG_ADMIN',
    '2025-10-01 14:05:00+00'
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 6. ANCHORS — the 6 demo credential records
--
-- Uses current schema column names:
--   fingerprint (not file_fingerprint), filename (not file_name),
--   chain_tx_id (not network_tx_id), chain_timestamp (not network_observed_at)
--
-- New columns from migration 0022: label, issued_at, expires_at,
--   revoked_at, revocation_reason
--
-- Fingerprints: valid SHA-256 hex strings (exactly 64 chars).
-- public_id: ARK-YYYY-NNNNN format.
-- =============================================================================

INSERT INTO anchors (
  id,
  org_id,
  user_id,
  public_id,
  label,
  filename,
  fingerprint,
  status,
  chain_tx_id,
  chain_timestamp,
  issued_at,
  expires_at,
  revoked_at,
  revocation_reason,
  created_at,
  updated_at
) VALUES

  -- -----------------------------------------------------------------------
  -- ANCHOR 1: Maya Chen — BS Computer Science — SECURED
  -- The flagship demo record. Everything resolved cleanly. Green badge.
  -- -----------------------------------------------------------------------
  (
    'a1a1a1a1-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'ARK-2024-00091',
    'Bachelor of Science in Computer Science — Maya Chen',
    'UMich_Diploma_Chen_Maya_BSc_CS_2024.pdf',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'SECURED',
    'b7f3a9d2e1c84f6a0b8d5e2c9f1a3b7e4d6c8a0f2b4d6e8a1c3f5b7d9e2c4f6',
    '2024-05-22 18:43:11+00',
    '2024-05-10 00:00:00+00',
    NULL,
    NULL,
    NULL,
    '2024-05-20 14:32:07+00',
    '2024-05-22 18:43:12+00'
  ),

  -- -----------------------------------------------------------------------
  -- ANCHOR 2: James Okafor — MBA, Ross School of Business — SECURED
  -- -----------------------------------------------------------------------
  (
    'a2a2a2a2-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'ARK-2023-00447',
    'Master of Business Administration — James Okafor',
    'UMich_Ross_MBA_Okafor_James_Dec2023.pdf',
    '6dcd4ce23d88e2ee9568ba546c007c63d9131f268ef61c73ba6f5d3b28f2fcf5',
    'SECURED',
    'c9e1b3f5a7d2e4c6b8a0f2d4e6c8b0a2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2',
    '2023-12-18 02:11:44+00',
    '2023-12-15 00:00:00+00',
    NULL,
    NULL,
    NULL,
    '2023-12-16 09:15:22+00',
    '2023-12-18 02:11:45+00'
  ),

  -- -----------------------------------------------------------------------
  -- ANCHOR 3: Priya Sharma — RN License — REVOKED
  -- Shows revocation flow. Gray badge + revocation reason in detail view.
  -- -----------------------------------------------------------------------
  (
    'a3a3a3a3-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    'ARK-2022-00183',
    'Registered Nurse — State License — Priya Sharma',
    'RN_License_Sharma_Priya_MI_2022.pdf',
    'a87ff679a2f3e71d9181a67b7542122c3f6d2c0d6f4b8e1a3c5d7f9b2e4c6a80',
    'REVOKED',
    'f1d2e3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1',
    '2022-03-04 11:22:33+00',
    '2022-03-01 00:00:00+00',
    NULL,
    '2024-09-12 00:00:00+00',
    'License surrendered — administrative review concluded September 2024.',
    '2022-03-02 16:41:09+00',
    '2024-09-12 10:05:33+00'
  ),

  -- -----------------------------------------------------------------------
  -- ANCHOR 4: Daniel Torres — PMP Certification — EXPIRED
  -- PMPs renew every 3 years. This one lapsed. Shows expiry state.
  -- -----------------------------------------------------------------------
  (
    'a4a4a4a4-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'ARK-2023-00029',
    'Project Management Professional (PMP) — Daniel Torres',
    'PMP_Cert_Torres_Daniel_PMI_2023.pdf',
    '1679091c5a880faf6fb5e6087eb1b2dc6767e74c8f5b5e7f5d5e5b5f5e5a5f50',
    'EXPIRED',
    'd3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3',
    '2023-02-09 08:57:01+00',
    '2023-02-01 00:00:00+00',
    '2026-01-31 23:59:59+00',
    NULL,
    NULL,
    '2023-02-07 11:30:44+00',
    '2026-02-01 00:01:00+00'
  ),

  -- -----------------------------------------------------------------------
  -- ANCHOR 5: Sarah Kim — MS Data Science — PENDING
  -- In-flight record. No chain_tx_id yet. Amber badge.
  -- -----------------------------------------------------------------------
  (
    'a5a5a5a5-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    'ARK-2024-00312',
    'Master of Science in Data Science — Sarah Kim',
    'UMich_MSc_DataScience_Kim_Sarah_Aug2024.pdf',
    '9bf31c7ff062936a96d3c8bd1f8f2ff3a5f4c0e3b1d2a4c6e8f0b2d4f6a8c000',
    'PENDING',
    NULL,
    NULL,
    '2024-08-30 00:00:00+00',
    NULL,
    NULL,
    NULL,
    '2024-09-03 13:22:55+00',
    '2024-09-03 13:22:55+00'
  ),

  -- -----------------------------------------------------------------------
  -- ANCHOR 6: Dr. Marcus Webb — MD License — SECURED (ORG_B)
  -- Belongs to Midwest Medical Board. Proves RLS: when logged in
  -- as UMich admin, this record must NOT appear.
  -- -----------------------------------------------------------------------
  (
    'a6a6a6a6-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000001',
    '22222222-0000-0000-0000-000000000001',
    'ARK-2025-00007',
    'Medical Doctor License — State of Michigan — Dr. Marcus Webb',
    'MD_License_Webb_Marcus_MI_Board_2025.pdf',
    '3c59dc048e8850243be8079a5c74d079f735e7b6a4b4a8e63a4b8f6e7c9a0b20',
    'SECURED',
    'a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0',
    '2025-01-14 20:05:18+00',
    '2025-01-10 00:00:00+00',
    '2027-01-09 23:59:59+00',
    NULL,
    NULL,
    '2025-01-12 10:44:31+00',
    '2025-01-14 20:05:19+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 7. AUDIT EVENTS
-- Append-only. One meaningful event per anchor.
-- Uses current schema columns: actor_ip (inet), details (text), event_category.
-- actor_ip omitted (NULL) for demo data — not relevant to click-through.
-- =============================================================================

INSERT INTO audit_events (
  id,
  event_type,
  event_category,
  actor_id,
  target_type,
  target_id,
  org_id,
  details,
  created_at
) VALUES

  -- Anchor 1: ANCHOR_CREATED + ANCHOR_SECURED
  (
    'ffffffff-0001-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a1a1a1a1-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"file_name": "UMich_Diploma_Chen_Maya_BSc_CS_2024.pdf", "label": "Bachelor of Science in Computer Science — Maya Chen"}',
    '2024-05-20 14:32:07+00'
  ),
  (
    'ffffffff-0001-0000-0000-000000000002',
    'ANCHOR_SECURED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a1a1a1a1-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"chain_tx_id": "b7f3a9d2e1c84f6a0b8d5e2c9f1a3b7e4d6c8a0f2b4d6e8a1c3f5b7d9e2c4f6", "chain_timestamp": "2024-05-22T18:43:11Z"}',
    '2024-05-22 18:43:12+00'
  ),

  -- Anchor 2: ANCHOR_CREATED + ANCHOR_SECURED
  (
    'ffffffff-0002-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a2a2a2a2-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"file_name": "UMich_Ross_MBA_Okafor_James_Dec2023.pdf", "label": "Master of Business Administration — James Okafor"}',
    '2023-12-16 09:15:22+00'
  ),
  (
    'ffffffff-0002-0000-0000-000000000002',
    'ANCHOR_SECURED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a2a2a2a2-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"chain_tx_id": "c9e1b3f5a7d2e4c6b8a0f2d4e6c8b0a2f4b6d8e0a2c4f6b8d0e2a4c6f8b0d2", "chain_timestamp": "2023-12-18T02:11:44Z"}',
    '2023-12-18 02:11:45+00'
  ),

  -- Anchor 3: ANCHOR_CREATED + ANCHOR_SECURED + ANCHOR_REVOKED
  (
    'ffffffff-0003-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000002',
    'anchor',
    'a3a3a3a3-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"file_name": "RN_License_Sharma_Priya_MI_2022.pdf", "label": "Registered Nurse — State License — Priya Sharma"}',
    '2022-03-02 16:41:09+00'
  ),
  (
    'ffffffff-0003-0000-0000-000000000002',
    'ANCHOR_SECURED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000002',
    'anchor',
    'a3a3a3a3-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"chain_tx_id": "f1d2e3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1", "chain_timestamp": "2022-03-04T11:22:33Z"}',
    '2022-03-04 11:22:34+00'
  ),
  (
    'ffffffff-0003-0000-0000-000000000003',
    'ANCHOR_REVOKED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a3a3a3a3-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"reason": "License surrendered — administrative review concluded September 2024.", "revoked_by": "Alex Rivera"}',
    '2024-09-12 10:05:33+00'
  ),

  -- Anchor 4: ANCHOR_CREATED + ANCHOR_SECURED (expired state is system-managed)
  (
    'ffffffff-0004-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a4a4a4a4-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"file_name": "PMP_Cert_Torres_Daniel_PMI_2023.pdf", "label": "Project Management Professional (PMP) — Daniel Torres"}',
    '2023-02-07 11:30:44+00'
  ),
  (
    'ffffffff-0004-0000-0000-000000000002',
    'ANCHOR_SECURED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000001',
    'anchor',
    'a4a4a4a4-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"chain_tx_id": "d3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e5f7a9b1c3", "chain_timestamp": "2023-02-09T08:57:01Z"}',
    '2023-02-09 08:57:02+00'
  ),

  -- Anchor 5: ANCHOR_CREATED only (PENDING — worker hasn't confirmed yet)
  (
    'ffffffff-0005-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '11111111-0000-0000-0000-000000000002',
    'anchor',
    'a5a5a5a5-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000001',
    '{"file_name": "UMich_MSc_DataScience_Kim_Sarah_Aug2024.pdf", "label": "Master of Science in Data Science — Sarah Kim"}',
    '2024-09-03 13:22:55+00'
  ),

  -- Anchor 6: ORG_B — ANCHOR_CREATED + ANCHOR_SECURED
  (
    'ffffffff-0006-0000-0000-000000000001',
    'ANCHOR_CREATED',
    'ANCHOR',
    '22222222-0000-0000-0000-000000000001',
    'anchor',
    'a6a6a6a6-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000001',
    '{"file_name": "MD_License_Webb_Marcus_MI_Board_2025.pdf", "label": "Medical Doctor License — State of Michigan — Dr. Marcus Webb"}',
    '2025-01-12 10:44:31+00'
  ),
  (
    'ffffffff-0006-0000-0000-000000000002',
    'ANCHOR_SECURED',
    'ANCHOR',
    '22222222-0000-0000-0000-000000000001',
    'anchor',
    'a6a6a6a6-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000001',
    '{"chain_tx_id": "a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0", "chain_timestamp": "2025-01-14T20:05:18Z"}',
    '2025-01-14 20:05:19+00'
  )

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 8. CLEAN UP spurious anchoring_jobs created by the INSERT trigger
-- The trigger auto_create_anchoring_job fires on every anchor insert, but
-- seed records already have their final status. Remove the stale jobs.
-- =============================================================================

DELETE FROM anchoring_jobs WHERE anchor_id IN (
  'a1a1a1a1-0000-0000-0000-000000000001',
  'a2a2a2a2-0000-0000-0000-000000000002',
  'a3a3a3a3-0000-0000-0000-000000000003',
  'a4a4a4a4-0000-0000-0000-000000000004',
  'a6a6a6a6-0000-0000-0000-000000000006'
);
-- Keep the job for ANCHOR 5 (PENDING) — it's the one that should be in-flight.


-- =============================================================================
-- 9. VERIFY (run after db reset to confirm seed is working)
-- =============================================================================
-- SELECT status, COUNT(*) FROM anchors GROUP BY status;
-- Expected:
--   SECURED  | 3
--   PENDING  | 1
--   REVOKED  | 1
--   EXPIRED  | 1
--
-- SELECT COUNT(*) FROM audit_events;
-- Expected: 11
--
-- SELECT COUNT(*) FROM anchors WHERE org_id = 'aaaaaaaa-0000-0000-0000-000000000001';
-- Expected: 5  (ORG_A)
--
-- SELECT COUNT(*) FROM anchors WHERE org_id = 'bbbbbbbb-0000-0000-0000-000000000001';
-- Expected: 1  (ORG_B — must NOT appear when logged in as UMich admin)
-- =============================================================================
