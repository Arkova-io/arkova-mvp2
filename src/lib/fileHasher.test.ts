/**
 * FileHasher Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateFingerprint, verifyFingerprint, formatFingerprint } from './fileHasher';

describe('generateFingerprint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate SHA-256 hash using crypto.subtle.digest', async () => {
    // Create file with arrayBuffer method
    const content = 'test content';
    const file = new File([content], 'test.txt', { type: 'text/plain' });

    const fingerprint = await generateFingerprint(file);

    // Should be 64 hex characters
    expect(fingerprint).toHaveLength(64);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce consistent hashes for same content', async () => {
    const content = 'identical content';
    const file1 = new File([content], 'file1.txt');
    const file2 = new File([content], 'file2.txt');

    const hash1 = await generateFingerprint(file1);
    const hash2 = await generateFingerprint(file2);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different content', async () => {
    const file1 = new File(['content A'], 'file1.txt');
    const file2 = new File(['content B'], 'file2.txt');

    const hash1 = await generateFingerprint(file1);
    const hash2 = await generateFingerprint(file2);

    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyFingerprint', () => {
  it('should return true for matching fingerprints', async () => {
    const content = 'verify me';
    const file = new File([content], 'test.txt');

    const fingerprint = await generateFingerprint(file);
    const result = await verifyFingerprint(file, fingerprint);

    expect(result).toBe(true);
  });

  it('should return false for non-matching fingerprints', async () => {
    const file = new File(['content'], 'test.txt');
    const wrongHash = '0'.repeat(64);

    const result = await verifyFingerprint(file, wrongHash);

    expect(result).toBe(false);
  });

  it('should be case-insensitive', async () => {
    const file = new File(['case test'], 'test.txt');
    const fingerprint = await generateFingerprint(file);

    const result = await verifyFingerprint(file, fingerprint.toUpperCase());

    expect(result).toBe(true);
  });
});

describe('formatFingerprint', () => {
  it('should format long fingerprints with ellipsis', () => {
    const fullHash = 'a'.repeat(64);
    const formatted = formatFingerprint(fullHash);
    expect(formatted).toBe('aaaaaaaaaaaaaaaa...aaaaaaaa');
  });

  it('should use custom prefix and suffix lengths', () => {
    const fullHash = 'abcdefghij1234567890';
    const formatted = formatFingerprint(fullHash, 4, 4);
    expect(formatted).toBe('abcd...7890');
  });

  it('should return full string if shorter than combined lengths', () => {
    const shortHash = 'abc123';
    const formatted = formatFingerprint(shortHash, 10, 10);
    expect(formatted).toBe('abc123');
  });
});
