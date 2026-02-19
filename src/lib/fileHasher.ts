/**
 * FileHasher Utility
 *
 * Client-side file fingerprinting using Web Crypto API.
 * Files are processed entirely in the browser - never uploaded to servers.
 */

/**
 * Generate SHA-256 fingerprint for a file
 * Uses Web Crypto API (crypto.subtle.digest)
 *
 * @param file - The file to hash
 * @returns Promise<string> - Hex-encoded SHA-256 hash
 */
export async function generateFingerprint(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify a file matches an expected fingerprint
 *
 * @param file - The file to verify
 * @param expectedFingerprint - The expected SHA-256 hash
 * @returns Promise<boolean> - True if fingerprints match
 */
export async function verifyFingerprint(
  file: File,
  expectedFingerprint: string
): Promise<boolean> {
  const actualFingerprint = await generateFingerprint(file);
  return actualFingerprint.toLowerCase() === expectedFingerprint.toLowerCase();
}

/**
 * Format fingerprint for display (truncated with ellipsis)
 *
 * @param fingerprint - Full 64-character hex fingerprint
 * @param prefixLength - Number of characters to show at start (default 16)
 * @param suffixLength - Number of characters to show at end (default 8)
 * @returns Formatted string like "a1b2c3d4e5f6g7h8...12345678"
 */
export function formatFingerprint(
  fingerprint: string,
  prefixLength = 16,
  suffixLength = 8
): string {
  if (fingerprint.length <= prefixLength + suffixLength) {
    return fingerprint;
  }
  return `${fingerprint.slice(0, prefixLength)}...${fingerprint.slice(-suffixLength)}`;
}
