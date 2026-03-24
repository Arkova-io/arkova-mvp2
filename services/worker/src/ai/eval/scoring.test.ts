/**
 * Tests for AI Eval Scoring Engine (AI-EVAL-01)
 *
 * TDD: Tests written first, then implementation.
 */

import { describe, it, expect } from 'vitest';
import {
  compareField,
  compareFields,
  computeFieldMetrics,
  computeAggregateMetrics,
  normalizeString,
  normalizeDate,
  pearsonCorrelation,
} from './scoring.js';
import type { FieldResult, EntryEvalResult, GroundTruthFields } from './types.js';

describe('normalizeString', () => {
  it('lowercases and trims', () => {
    expect(normalizeString('  University of Michigan  ')).toBe('university of michigan');
  });

  it('collapses whitespace', () => {
    expect(normalizeString('New   York,  USA')).toBe('new york, usa');
  });

  it('handles undefined', () => {
    expect(normalizeString(undefined)).toBeUndefined();
  });
});

describe('normalizeDate', () => {
  it('normalizes ISO date', () => {
    expect(normalizeDate('2025-05-03')).toBe('2025-05-03');
  });

  it('normalizes date with leading zeros', () => {
    expect(normalizeDate('2025-5-3')).toBe('2025-05-03');
  });

  it('handles undefined', () => {
    expect(normalizeDate(undefined)).toBeUndefined();
  });
});

describe('compareField', () => {
  it('exact match on string field', () => {
    const result = compareField('issuerName', 'University of Michigan', 'University of Michigan');
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('exact');
  });

  it('normalized match (case-insensitive)', () => {
    const result = compareField('issuerName', 'University of Michigan', 'university of michigan');
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('normalized');
  });

  it('both missing = missing_both (counted as correct)', () => {
    const result = compareField('expiryDate', undefined, undefined);
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('missing_both');
  });

  it('expected present, actual missing = false_negative', () => {
    const result = compareField('issuerName', 'University of Michigan', undefined);
    expect(result.correct).toBe(false);
    expect(result.matchType).toBe('false_negative');
  });

  it('expected missing, actual present = false_positive', () => {
    const result = compareField('fieldOfStudy', undefined, 'Computer Science');
    expect(result.correct).toBe(false);
    expect(result.matchType).toBe('false_positive');
  });

  it('both present but different = mismatch', () => {
    const result = compareField('issuerName', 'MIT', 'Stanford University');
    expect(result.correct).toBe(false);
    expect(result.matchType).toBe('mismatch');
  });

  it('date normalization allows partial match', () => {
    const result = compareField('issuedDate', '2025-05-03', '2025-5-3');
    expect(result.correct).toBe(true);
  });

  it('expiryDate same-month tolerance: 1st vs 31st of same month', () => {
    const result = compareField('expiryDate', '2026-06-30', '2026-06-01');
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('normalized');
  });

  it('expiryDate different months are NOT equivalent', () => {
    const result = compareField('expiryDate', '2026-06-30', '2026-07-01');
    expect(result.correct).toBe(false);
  });

  it('issuedDate does NOT get same-month tolerance', () => {
    const result = compareField('issuedDate', '2026-06-30', '2026-06-01');
    expect(result.correct).toBe(false);
  });

  it('handles fraudSignals comparison (arrays)', () => {
    const result = compareField('fraudSignals', ['SUSPICIOUS_DATES'], ['SUSPICIOUS_DATES']);
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('exact');
  });

  it('fraudSignals empty vs empty = correct', () => {
    const result = compareField('fraudSignals', [], []);
    expect(result.correct).toBe(true);
  });

  it('fraudSignals order-independent', () => {
    const result = compareField(
      'fraudSignals',
      ['SUSPICIOUS_DATES', 'FORMAT_ANOMALY'],
      ['FORMAT_ANOMALY', 'SUSPICIOUS_DATES'],
    );
    expect(result.correct).toBe(true);
  });

  it('creditHours numeric comparison', () => {
    const result = compareField('creditHours', 3.0, 3);
    expect(result.correct).toBe(true);
  });

  it('fieldOfStudy fuzzy: containment match ("Python" ~ "Python Programming")', () => {
    const result = compareField('fieldOfStudy', 'Python Programming', 'Python');
    expect(result.correct).toBe(true);
    expect(result.matchType).toBe('normalized');
  });

  it('fieldOfStudy fuzzy: token overlap ("First Aid / CPR / AED" ~ "CPR/AED")', () => {
    const result = compareField('fieldOfStudy', 'First Aid / CPR / AED', 'CPR/AED');
    expect(result.correct).toBe(true);
  });

  it('fieldOfStudy fuzzy: completely different = mismatch', () => {
    const result = compareField('fieldOfStudy', 'Physics', 'Art History');
    expect(result.correct).toBe(false);
    expect(result.matchType).toBe('mismatch');
  });

  it('issuerName fuzzy: containment ("Columbia University" ~ "Columbia University Teachers College")', () => {
    const result = compareField('issuerName', 'Columbia University', 'Columbia University Teachers College');
    expect(result.correct).toBe(true);
  });

  it('issuerName fuzzy: abbreviation vs full ("PMI" vs "Project Management Institute") = mismatch', () => {
    // Pure abbreviation with no token overlap should NOT match
    const result = compareField('issuerName', 'Project Management Institute', 'PMI');
    expect(result.correct).toBe(false);
  });

  it('non-fuzzy fields still require exact match ("jurisdiction")', () => {
    const result = compareField('jurisdiction', 'California, USA', 'California');
    expect(result.correct).toBe(false);
  });
});

describe('compareFields', () => {
  it('compares all standard fields', () => {
    const groundTruth: GroundTruthFields = {
      credentialType: 'DEGREE',
      issuerName: 'University of Michigan',
      issuedDate: '2025-05-03',
      fieldOfStudy: 'Computer Science',
      degreeLevel: 'Bachelor',
      jurisdiction: 'Michigan, USA',
      fraudSignals: [],
    };
    const extracted = {
      credentialType: 'DEGREE',
      issuerName: 'University of Michigan',
      issuedDate: '2025-05-03',
      fieldOfStudy: 'Computer Science',
      degreeLevel: 'Bachelor',
      jurisdiction: 'Michigan, USA',
      fraudSignals: [],
    };
    const results = compareFields(groundTruth, extracted);
    const incorrect = results.filter(r => !r.correct);
    expect(incorrect).toHaveLength(0);
  });

  it('detects missing fields', () => {
    const groundTruth: GroundTruthFields = {
      credentialType: 'LICENSE',
      issuerName: 'New York Department of Education',
      issuedDate: '2025-10-15',
      licenseNumber: '298765',
    };
    const extracted = {
      credentialType: 'LICENSE',
      issuerName: 'NY Dept of Ed', // wrong
      // issuedDate missing
    };
    const results = compareFields(groundTruth, extracted);
    const issuedResult = results.find(r => r.field === 'issuedDate');
    expect(issuedResult?.correct).toBe(false);
    expect(issuedResult?.matchType).toBe('false_negative');
  });
});

describe('computeFieldMetrics', () => {
  it('computes precision, recall, F1 for a field', () => {
    // 3 entries with issuerName in ground truth:
    // Entry 1: extracted correctly (TP)
    // Entry 2: extracted wrongly (FP counted via mismatch)
    // Entry 3: not extracted (FN)
    const fieldResults: FieldResult[] = [
      { field: 'issuerName', expected: 'MIT', actual: 'MIT', correct: true, matchType: 'exact' },
      { field: 'issuerName', expected: 'Stanford', actual: 'Harvard', correct: false, matchType: 'mismatch' },
      { field: 'issuerName', expected: 'Yale', actual: undefined, correct: false, matchType: 'false_negative' },
    ];
    const metrics = computeFieldMetrics('issuerName', fieldResults);
    // TP=1 (exact match), FP=1 (mismatch = extracted wrong), FN=2 (mismatch + false_negative)
    // Precision = TP / (TP + FP) = 1/2 = 0.5
    // Recall = TP / (TP + FN) = 1/3 ≈ 0.333
    expect(metrics.truePositives).toBe(1);
    expect(metrics.falsePositives).toBe(1);
    expect(metrics.falseNegatives).toBe(2);
    expect(metrics.precision).toBeCloseTo(0.5, 2);
    expect(metrics.recall).toBeCloseTo(1 / 3, 2);
    expect(metrics.f1).toBeCloseTo(0.4, 2);
  });

  it('handles all correct', () => {
    const fieldResults: FieldResult[] = [
      { field: 'credentialType', expected: 'DEGREE', actual: 'DEGREE', correct: true, matchType: 'exact' },
      { field: 'credentialType', expected: 'LICENSE', actual: 'LICENSE', correct: true, matchType: 'exact' },
    ];
    const metrics = computeFieldMetrics('credentialType', fieldResults);
    expect(metrics.precision).toBe(1.0);
    expect(metrics.recall).toBe(1.0);
    expect(metrics.f1).toBe(1.0);
  });

  it('handles no data', () => {
    const metrics = computeFieldMetrics('issuerName', []);
    expect(metrics.precision).toBe(0);
    expect(metrics.recall).toBe(0);
    expect(metrics.f1).toBe(0);
  });
});

describe('pearsonCorrelation', () => {
  it('computes perfect positive correlation', () => {
    const r = pearsonCorrelation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    expect(r).toBeCloseTo(1.0, 4);
  });

  it('computes perfect negative correlation', () => {
    const r = pearsonCorrelation([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]);
    expect(r).toBeCloseTo(-1.0, 4);
  });

  it('returns 0 for no correlation', () => {
    const r = pearsonCorrelation([1, 1, 1, 1], [1, 2, 3, 4]);
    expect(r).toBe(0);
  });

  it('returns 0 for insufficient data', () => {
    expect(pearsonCorrelation([], [])).toBe(0);
    expect(pearsonCorrelation([1], [1])).toBe(0);
  });
});

describe('computeAggregateMetrics', () => {
  it('aggregates entry results into macro/weighted F1', () => {
    const entries: EntryEvalResult[] = [
      {
        entryId: 'test-1',
        credentialType: 'DEGREE',
        category: 'degree',
        tags: ['clean'],
        fieldResults: [
          { field: 'credentialType', expected: 'DEGREE', actual: 'DEGREE', correct: true, matchType: 'exact' },
          { field: 'issuerName', expected: 'MIT', actual: 'MIT', correct: true, matchType: 'exact' },
          { field: 'issuedDate', expected: '2025-05-03', actual: '2025-05-03', correct: true, matchType: 'exact' },
        ],
        reportedConfidence: 0.95,
        actualAccuracy: 1.0,
        latencyMs: 500,
        provider: 'mock',
        tokensUsed: 100,
      },
      {
        entryId: 'test-2',
        credentialType: 'DEGREE',
        category: 'degree',
        tags: ['clean'],
        fieldResults: [
          { field: 'credentialType', expected: 'DEGREE', actual: 'DEGREE', correct: true, matchType: 'exact' },
          { field: 'issuerName', expected: 'Stanford', actual: 'Harvard', correct: false, matchType: 'mismatch' },
          { field: 'issuedDate', expected: '2024-06-01', actual: undefined, correct: false, matchType: 'false_negative' },
        ],
        reportedConfidence: 0.80,
        actualAccuracy: 0.333,
        latencyMs: 600,
        provider: 'mock',
        tokensUsed: 120,
      },
    ];
    const metrics = computeAggregateMetrics('DEGREE', entries);
    expect(metrics.scope).toBe('DEGREE');
    expect(metrics.totalEntries).toBe(2);
    expect(metrics.fieldMetrics.length).toBeGreaterThan(0);
    expect(metrics.macroF1).toBeGreaterThan(0);
    expect(metrics.macroF1).toBeLessThanOrEqual(1);
    expect(metrics.meanReportedConfidence).toBeCloseTo(0.875, 2);
    expect(metrics.meanActualAccuracy).toBeCloseTo(0.6665, 2);
    expect(metrics.meanLatencyMs).toBe(550);
  });
});
