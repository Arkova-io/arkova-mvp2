-- =============================================================================
-- Migration 0045: log_verification_event RPC function
-- Story: P6-TS-06
-- Date: 2026-03-10
--
-- PURPOSE
-- -------
-- Creates a SECURITY DEFINER function that allows unauthenticated clients
-- (public verification pages) to log verification events.
-- The verification_events table has no INSERT policy for anon/authenticated
-- users — this function provides controlled insert access.
--
-- CHANGES
-- -------
-- 1. Create log_verification_event() SECURITY DEFINER function
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. log_verification_event RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_verification_event(
  p_public_id text,
  p_method text DEFAULT 'web',
  p_result text DEFAULT 'verified',
  p_fingerprint_provided boolean DEFAULT false,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anchor_id uuid;
  v_org_id uuid;
BEGIN
  -- Look up anchor_id and org_id from the anchors table
  SELECT a.id, a.org_id
    INTO v_anchor_id, v_org_id
    FROM anchors a
   WHERE a.public_id = p_public_id
   LIMIT 1;

  -- Insert the verification event (anchor_id/org_id may be null if not found)
  INSERT INTO verification_events (
    anchor_id,
    public_id,
    method,
    result,
    fingerprint_provided,
    user_agent,
    referrer,
    org_id
  ) VALUES (
    v_anchor_id,
    p_public_id,
    p_method,
    p_result,
    p_fingerprint_provided,
    p_user_agent,
    p_referrer,
    v_org_id
  );

  -- Fire-and-forget: errors are silently ignored by the caller
END;
$$;

COMMENT ON FUNCTION log_verification_event IS 'Logs a public verification event. SECURITY DEFINER allows unauthenticated callers.';


-- ---------------------------------------------------------------------------
-- ROLLBACK
-- ---------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS log_verification_event;
