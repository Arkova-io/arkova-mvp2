/**
 * Cloudflare Crawler — University Directory Ingestion (P8-S7)
 *
 * Crawls university websites to build the institution_ground_truth table.
 * Uses Cloudflare's fetch API to retrieve public web content, parses institution
 * data, generates embeddings via Workers AI, and inserts into Supabase.
 *
 * Constitution 1.6: No document bytes. Only public web content.
 * Constitution 1.4: No PII extracted or stored.
 */

import type { Env } from './env';
import { parseInstitutionPage, buildGroundTruthRecord } from './crawler-logic';

export interface CrawlRequest {
  domains: string[];
}

export interface CrawlResponse {
  crawled: number;
  inserted: number;
  failed: number;
  results: DomainResult[];
}

interface DomainResult {
  domain: string;
  status: 'success' | 'failed' | 'skipped';
  institutionName?: string;
  error?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json() as CrawlRequest;

      if (!body.domains || !Array.isArray(body.domains) || body.domains.length === 0) {
        return jsonResponse({ error: 'domains array is required' }, 400);
      }

      // Limit batch size to prevent abuse
      const domains = body.domains.slice(0, 20);

      const response = await crawlDomains(domains, env);

      return jsonResponse(response);
    } catch (error) {
      console.error('[crawler] Error:', error);
      return jsonResponse({ error: 'Crawl failed' }, 500);
    }
  },
};

async function crawlDomains(domains: string[], env: Env): Promise<CrawlResponse> {
  const results: DomainResult[] = [];
  let inserted = 0;

  for (const domain of domains) {
    try {
      // Validate domain format (prevent SSRF)
      if (!isValidDomain(domain)) {
        results.push({ domain, status: 'skipped', error: 'Invalid domain format' });
        continue;
      }

      // Fetch the main page
      const url = `https://${domain}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ArkovaCrawler/1.0 (credential-verification; +https://arkova.io)',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        results.push({ domain, status: 'failed', error: `HTTP ${response.status}` });
        continue;
      }

      const html = await response.text();

      // Parse institution data
      const parsed = parseInstitutionPage(html, domain);
      if (!parsed) {
        results.push({ domain, status: 'skipped', error: 'Not an institution page' });
        continue;
      }

      // Generate embedding via Workers AI
      const embeddingText = `${parsed.institutionName} ${parsed.domain} ${Object.values(parsed.metadata).join(' ')}`;
      const aiResult = await env.ARKOVA_AI.run('@cf/baai/bge-base-en-v1.5', {
        text: embeddingText,
      }) as { data: number[][] };

      const embedding = aiResult.data[0];
      if (!embedding || embedding.length !== 768) {
        results.push({ domain, status: 'failed', error: 'Embedding generation failed' });
        continue;
      }

      // Build record and insert into Supabase
      const record = buildGroundTruthRecord(parsed, embedding);

      const insertResult = await fetch(
        `${env.SUPABASE_URL}/rest/v1/institution_ground_truth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify(record),
        },
      );

      if (!insertResult.ok) {
        const error = await insertResult.text();
        results.push({ domain, status: 'failed', error: `Insert failed: ${error}` });
        continue;
      }

      inserted++;
      results.push({
        domain,
        status: 'success',
        institutionName: parsed.institutionName,
      });
    } catch (error) {
      results.push({
        domain,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    crawled: domains.length,
    inserted,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  };
}

/** Validate domain format to prevent SSRF attacks */
function isValidDomain(domain: string): boolean {
  // Must be a simple domain (no protocol, no path, no port)
  if (domain.includes('/') || domain.includes(':') || domain.includes('@')) {
    return false;
  }
  // Must have at least one dot
  if (!domain.includes('.')) return false;
  // Block internal/reserved domains
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '169.254', '10.', '172.16', '192.168'];
  if (blocked.some((b) => domain.includes(b))) return false;
  // Basic TLD check
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
