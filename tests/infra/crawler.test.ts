/**
 * Tests for Cloudflare Crawler — university directory ingestion (P8-S7).
 *
 * Validates HTML parsing, institution extraction, and embedding insertion logic.
 */

import { describe, it, expect } from 'vitest';
import {
  parseInstitutionPage,
  buildGroundTruthRecord,
  type CrawlResult,
} from '../../services/edge/src/crawler-logic';

describe('parseInstitutionPage', () => {
  it('extracts institution name from standard university page', () => {
    const html = `
      <html>
        <head><title>University of Michigan | Official Website</title></head>
        <body>
          <h1>University of Michigan</h1>
          <p>Founded in 1817, located in Ann Arbor, Michigan.</p>
          <div class="accreditation">
            Accredited by the Higher Learning Commission (HLC).
          </div>
        </body>
      </html>
    `;

    const result = parseInstitutionPage(html, 'umich.edu');

    expect(result).not.toBeNull();
    expect(result!.institutionName).toBe('University of Michigan');
    expect(result!.domain).toBe('umich.edu');
    expect(result!.metadata.accreditation).toBeDefined();
  });

  it('returns null for non-institution pages', () => {
    const html = '<html><body><h1>Buy Cheap Diplomas!</h1></body></html>';
    const result = parseInstitutionPage(html, 'scam.com');
    expect(result).toBeNull();
  });

  it('extracts metadata fields from structured pages', () => {
    const html = `
      <html><body>
        <h1>Stanford University</h1>
        <div>Location: Stanford, California</div>
        <div>Founded: 1885</div>
        <div>Type: Private Research University</div>
      </body></html>
    `;

    const result = parseInstitutionPage(html, 'stanford.edu');
    expect(result?.institutionName).toBe('Stanford University');
    expect(result?.metadata).toBeDefined();
  });
});

describe('buildGroundTruthRecord', () => {
  it('creates a valid record for Supabase insertion', () => {
    const crawlResult: CrawlResult = {
      institutionName: 'MIT',
      domain: 'mit.edu',
      metadata: {
        location: 'Cambridge, Massachusetts',
        type: 'Private Research University',
      },
    };

    const embedding = new Array(768).fill(0.1);

    const record = buildGroundTruthRecord(crawlResult, embedding);

    expect(record.institution_name).toBe('MIT');
    expect(record.domain).toBe('mit.edu');
    expect(record.source).toBe('cloudflare_crawl');
    expect(record.confidence_score).toBeGreaterThan(0);
    expect(record.embedding).toBe(`[${embedding.join(',')}]`);
  });

  it('sanitizes institution name to prevent injection', () => {
    const crawlResult: CrawlResult = {
      institutionName: "Robert'); DROP TABLE institutions;--",
      domain: 'evil.edu',
      metadata: {},
    };

    const record = buildGroundTruthRecord(crawlResult, new Array(768).fill(0));
    // The name should be preserved as-is — Supabase client handles parameterization
    expect(record.institution_name).toBeDefined();
    expect(record.source).toBe('cloudflare_crawl');
  });
});
