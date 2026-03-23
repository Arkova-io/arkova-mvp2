/**
 * Tests for AI Eval Runner (AI-EVAL-01)
 */

import { describe, it, expect, vi } from 'vitest';
import { runEval, getPromptVersionHash, formatEvalReport } from './runner.js';
import { GOLDEN_DATASET, FULL_GOLDEN_DATASET, getEntriesByType, getEntriesByTag } from './golden-dataset.js';
import type { IAIProvider, ExtractionResult } from '../types.js';

/** Create a mock provider that returns deterministic results. */
function createMockProvider(
  extractFn?: (req: { strippedText: string }) => ExtractionResult,
): IAIProvider {
  const defaultExtract = (): ExtractionResult => ({
    fields: {
      credentialType: 'DEGREE',
      issuerName: 'Test University',
    },
    confidence: 0.85,
    provider: 'test-mock',
    tokensUsed: 50,
  });

  return {
    name: 'test-mock',
    extractMetadata: vi.fn().mockImplementation((req) =>
      Promise.resolve((extractFn || defaultExtract)(req)),
    ),
    generateEmbedding: vi.fn().mockResolvedValue({
      embedding: new Array(768).fill(0),
      tokensUsed: 10,
    }),
    healthCheck: vi.fn().mockResolvedValue({
      healthy: true,
      provider: 'test-mock',
      latencyMs: 50,
    }),
  };
}

describe('golden-dataset', () => {
  it('has at least 100 core entries', () => {
    expect(GOLDEN_DATASET.length).toBeGreaterThanOrEqual(100);
  });

  it('has at least 200 total entries (core + extended)', () => {
    expect(FULL_GOLDEN_DATASET.length).toBeGreaterThanOrEqual(200);
  });

  it('all entries have required fields', () => {
    for (const entry of GOLDEN_DATASET) {
      expect(entry.id).toBeTruthy();
      expect(entry.strippedText).toBeTruthy();
      expect(entry.credentialTypeHint).toBeTruthy();
      expect(entry.groundTruth).toBeTruthy();
      expect(entry.source).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(Array.isArray(entry.tags)).toBe(true);
    }
  });

  it('has unique IDs across full dataset', () => {
    const ids = FULL_GOLDEN_DATASET.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers all credential types', () => {
    const types = new Set(FULL_GOLDEN_DATASET.map(e => e.groundTruth.credentialType));
    expect(types.has('DEGREE')).toBe(true);
    expect(types.has('LICENSE')).toBe(true);
    expect(types.has('CERTIFICATE')).toBe(true);
    expect(types.has('TRANSCRIPT')).toBe(true);
    expect(types.has('PROFESSIONAL')).toBe(true);
    expect(types.has('CLE')).toBe(true);
    expect(types.has('OTHER')).toBe(true);
  });

  it('has edge case entries', () => {
    const edgeCases = getEntriesByTag('edge-case');
    expect(edgeCases.length).toBeGreaterThanOrEqual(5);
  });

  it('has fraud signal entries', () => {
    const fraudEntries = GOLDEN_DATASET.filter(
      e => e.groundTruth.fraudSignals && e.groundTruth.fraudSignals.length > 0,
    );
    expect(fraudEntries.length).toBeGreaterThanOrEqual(3);
  });

  it('getEntriesByType filters correctly', () => {
    const degrees = getEntriesByType('DEGREE');
    expect(degrees.length).toBeGreaterThan(0);
    for (const d of degrees) {
      expect(d.groundTruth.credentialType).toBe('DEGREE');
    }
  });
});

describe('getPromptVersionHash', () => {
  it('returns a 12-char hex string', () => {
    const hash = getPromptVersionHash();
    expect(hash).toMatch(/^[a-f0-9]{12}$/);
  });

  it('is deterministic', () => {
    expect(getPromptVersionHash()).toBe(getPromptVersionHash());
  });
});

describe('runEval', () => {
  it('evaluates entries against a mock provider', async () => {
    const provider = createMockProvider(() => ({
      fields: {
        credentialType: 'DEGREE',
        issuerName: 'University of Michigan',
        issuedDate: '2025-05-03',
        fieldOfStudy: 'Computer Science',
        degreeLevel: 'Bachelor',
        jurisdiction: 'Michigan, USA',
      },
      confidence: 0.95,
      provider: 'test-mock',
      tokensUsed: 100,
    }));

    // Only run against first entry (University of Michigan diploma)
    const result = await runEval({
      provider,
      entries: [GOLDEN_DATASET[0]],
      concurrency: 1,
    });

    expect(result.totalEntries).toBe(1);
    expect(result.provider).toBe('test-mock');
    expect(result.promptVersionHash).toMatch(/^[a-f0-9]{12}$/);
    expect(result.entryResults).toHaveLength(1);

    const entry = result.entryResults[0];
    expect(entry.entryId).toBe('GD-001');
    expect(entry.actualAccuracy).toBe(1.0); // All fields match
    expect(entry.reportedConfidence).toBe(0.95);
  });

  it('handles extraction failures gracefully', async () => {
    const provider = createMockProvider(() => {
      throw new Error('API error');
    });

    const result = await runEval({
      provider,
      entries: [GOLDEN_DATASET[0]],
      concurrency: 1,
    });

    // When extraction fails, most fields are false negatives but some
    // missing_both pairs count as correct (e.g. both lack expiryDate)
    expect(result.entryResults[0].actualAccuracy).toBeLessThan(0.5);
    expect(result.entryResults[0].reportedConfidence).toBe(0);
  });

  it('computes per-credential-type breakdowns', async () => {
    const provider = createMockProvider(() => ({
      fields: { credentialType: 'DEGREE' },
      confidence: 0.5,
      provider: 'test-mock',
      tokensUsed: 50,
    }));

    // Run on a small diverse subset
    const subset = [GOLDEN_DATASET[0], GOLDEN_DATASET[1], GOLDEN_DATASET[2]]; // DEGREE, LICENSE, CLE
    const result = await runEval({ provider, entries: subset, concurrency: 3 });

    expect(result.byCredentialType.length).toBeGreaterThanOrEqual(2);
    expect(result.overall.totalEntries).toBe(3);
  });

  it('reports progress', async () => {
    const provider = createMockProvider();
    const progress: [number, number][] = [];

    await runEval({
      provider,
      entries: GOLDEN_DATASET.slice(0, 6),
      concurrency: 2,
      onProgress: (completed, total) => progress.push([completed, total]),
    });

    expect(progress.length).toBe(3); // 6 entries / 2 concurrency = 3 batches
    expect(progress[progress.length - 1]).toEqual([6, 6]);
  });
});

describe('formatEvalReport', () => {
  it('generates a valid markdown report', async () => {
    const provider = createMockProvider(() => ({
      fields: {
        credentialType: 'DEGREE',
        issuerName: 'Test University',
        issuedDate: '2025-01-01',
      },
      confidence: 0.85,
      provider: 'test-mock',
      tokensUsed: 100,
    }));

    const result = await runEval({
      provider,
      entries: GOLDEN_DATASET.slice(0, 5),
      concurrency: 5,
    });

    const report = formatEvalReport(result);
    expect(report).toContain('# AI Extraction Eval Report');
    expect(report).toContain('## Overall Metrics');
    expect(report).toContain('## Per-Field Metrics');
    expect(report).toContain('## Per-Credential-Type Metrics');
    expect(report).toContain('## Worst-Performing Entries');
    expect(report).toContain('## Confidence Calibration');
    expect(report).toContain('Macro F1');
  });
});
