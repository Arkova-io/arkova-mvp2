/**
 * DLP Verification Test — Mock SSN/Tax ID Block
 *
 * Simulates the DLP policy by testing the regex patterns used in the
 * Cloudflare DLP profile against mock API request payloads.
 *
 * This is the "attempt a mock request with a fake SSN to verify DLP block"
 * acceptance test. Run with: npx vitest run infra/cloudflare/dlp-verification.test.ts
 */

import { describe, it, expect } from 'vitest';

// DLP regex patterns (same as in dlp-policy.ts)
const SSN_DASHED = /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/;
const SSN_NODASH = /\b(?!000|666|9\d{2})\d{3}(?!00)\d{2}(?!0000)\d{4}\b/;
const EIN = /\b\d{2}-\d{7}\b/;
const ITIN = /\b9\d{2}-[7-9]\d-\d{4}\b/;

function containsPii(payload: string): { blocked: boolean; reason?: string } {
  if (SSN_DASHED.test(payload)) return { blocked: true, reason: 'SSN (dashed)' };
  if (SSN_NODASH.test(payload)) return { blocked: true, reason: 'SSN (no dashes)' };
  if (EIN.test(payload)) return { blocked: true, reason: 'EIN/Tax ID' };
  if (ITIN.test(payload)) return { blocked: true, reason: 'ITIN' };
  return { blocked: false };
}

describe('DLP Policy — SSN/Tax ID Block Verification', () => {
  describe('SSN detection (dashed format)', () => {
    it('blocks request with SSN 123-45-6789', () => {
      const payload = JSON.stringify({
        metadata: { note: 'Student SSN: 123-45-6789' },
      });
      const result = containsPii(payload);
      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('SSN (dashed)');
    });

    it('blocks SSN embedded in a larger string', () => {
      const payload = 'The credential belongs to SSN 456-78-9012 and was issued today';
      const result = containsPii(payload);
      expect(result.blocked).toBe(true);
    });

    it('does NOT block invalid SSN starting with 000', () => {
      const payload = 'ID: 000-12-3456';
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });

    it('does NOT block invalid SSN starting with 666', () => {
      const payload = 'ID: 666-12-3456';
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });

    it('does NOT block SSN-like pattern with 00 in middle', () => {
      const payload = 'ID: 123-00-4567';
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });

    it('does NOT block SSN-like pattern with 0000 at end', () => {
      const payload = 'ID: 123-45-0000';
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });
  });

  describe('SSN detection (no dashes)', () => {
    it('blocks request with SSN 123456789', () => {
      const payload = 'SSN: 123456789';
      const result = containsPii(payload);
      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('SSN (no dashes)');
    });
  });

  describe('EIN/Tax ID detection', () => {
    it('blocks request with EIN 12-3456789', () => {
      const payload = JSON.stringify({
        organization: { tax_id: '12-3456789' },
      });
      const result = containsPii(payload);
      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('EIN/Tax ID');
    });
  });

  describe('ITIN detection', () => {
    it('blocks request with ITIN 900-70-1234', () => {
      const payload = 'ITIN: 900-70-1234';
      const result = containsPii(payload);
      expect(result.blocked).toBe(true);
      expect(result.reason).toBe('ITIN');
    });
  });

  describe('Clean payloads pass through', () => {
    it('allows a normal anchor creation request', () => {
      const payload = JSON.stringify({
        title: 'Bachelor of Science in Computer Science',
        credential_type: 'DEGREE',
        recipient_name_hash: 'a1b2c3d4',
      });
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });

    it('allows a verification request', () => {
      const payload = JSON.stringify({
        public_id: 'ARK-2026-001',
      });
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });

    it('allows a normal date format (not confused with SSN)', () => {
      const payload = 'Issued on 2026-03-14';
      const result = containsPii(payload);
      expect(result.blocked).toBe(false);
    });
  });
});
