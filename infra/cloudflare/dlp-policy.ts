/**
 * Cloudflare Data Loss Prevention (DLP) — SSN/Tax ID Block Profile
 *
 * Applies DLP scanning to all inbound API traffic through Cloudflare Gateway.
 * Blocks requests containing SSN or Tax ID patterns to prevent accidental PII exposure.
 *
 * Constitution 1.4: No PII in transit. Constitution 1.6: Documents never leave device.
 *
 * Prerequisites:
 *   - Cloudflare Zero Trust account with Gateway + DLP add-on
 *   - CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars set
 *   - API token needs: Account > Zero Trust > Edit permissions
 *
 * Usage: npx tsx infra/cloudflare/dlp-policy.ts
 */

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';

interface DlpProfile {
  name: string;
  type: 'custom';
  entries: DlpEntry[];
}

interface DlpEntry {
  name: string;
  enabled: boolean;
  pattern: {
    regex: string;
    validation?: string;
  };
}

interface GatewayRule {
  name: string;
  description: string;
  action: 'block';
  enabled: boolean;
  filters: string[];
  traffic: string;
  rule_settings: {
    block_page_enabled: boolean;
    block_reason: string;
  };
}

async function cfFetch<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variables',
    );
  }

  const url = `${CLOUDFLARE_API}/accounts/${accountId}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as { success: boolean; result: T; errors: unknown[] };
  if (!data.success) {
    throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

// ---------------------------------------------------------------------------
// Step 1: Create the DLP profile with SSN and Tax ID patterns
// ---------------------------------------------------------------------------

async function createDlpProfile(): Promise<string> {
  const profile: DlpProfile = {
    name: 'Arkova PII Block — SSN & Tax ID',
    type: 'custom',
    entries: [
      {
        name: 'US Social Security Number (SSN)',
        enabled: true,
        pattern: {
          // Matches XXX-XX-XXXX and XXXXXXXXX formats
          regex: '\\b(?!000|666|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0000)\\d{4}\\b',
          validation: 'luhn', // Additional checksum validation where applicable
        },
      },
      {
        name: 'US Social Security Number (no dashes)',
        enabled: true,
        pattern: {
          regex: '\\b(?!000|666|9\\d{2})\\d{3}(?!00)\\d{2}(?!0000)\\d{4}\\b',
        },
      },
      {
        name: 'US Employer Identification Number (EIN/Tax ID)',
        enabled: true,
        pattern: {
          // Matches XX-XXXXXXX format
          regex: '\\b\\d{2}-\\d{7}\\b',
        },
      },
      {
        name: 'US Individual Taxpayer Identification Number (ITIN)',
        enabled: true,
        pattern: {
          // Matches 9XX-XX-XXXX where first digit is 9
          regex: '\\b9\\d{2}-[7-9]\\d-\\d{4}\\b',
        },
      },
    ],
  };

  console.log('[DLP] Creating DLP profile...');
  const result = await cfFetch<{ id: string }>(
    '/dlp/profiles/custom',
    'POST',
    { profile },
  );

  console.log(`[DLP] Profile created: ${result.id}`);
  return result.id;
}

// ---------------------------------------------------------------------------
// Step 2: Create a Gateway HTTP rule that uses the DLP profile
// ---------------------------------------------------------------------------

async function createGatewayRule(dlpProfileId: string): Promise<string> {
  const rule: GatewayRule = {
    name: 'Arkova — Block SSN/Tax ID in API Traffic',
    description:
      'Blocks any inbound API request containing SSN or Tax ID patterns. Constitution 1.4 compliance.',
    action: 'block',
    enabled: true,
    filters: ['http'],
    // Apply to all HTTP traffic through the gateway
    traffic: `any(dlp.profiles[*] in {"${dlpProfileId}"})`,
    rule_settings: {
      block_page_enabled: true,
      block_reason:
        'Request blocked: potential PII (SSN/Tax ID) detected. Arkova does not accept personally identifiable information in API requests.',
    },
  };

  console.log('[DLP] Creating Gateway block rule...');
  const result = await cfFetch<{ id: string }>(
    '/gateway/rules',
    'POST',
    rule,
  );

  console.log(`[DLP] Gateway rule created: ${result.id}`);
  return result.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== Cloudflare DLP Configuration ===');
  console.log('Creating SSN/Tax ID block profile for Arkova API traffic...\n');

  const profileId = await createDlpProfile();
  const ruleId = await createGatewayRule(profileId);

  console.log('\n=== Configuration Complete ===');
  console.log(`DLP Profile ID: ${profileId}`);
  console.log(`Gateway Rule ID: ${ruleId}`);
  console.log(
    '\nVerify in Cloudflare Dashboard: Zero Trust > Gateway > Firewall Policies',
  );
}

main().catch((err) => {
  console.error('[DLP] Configuration failed:', err);
  process.exit(1);
});
