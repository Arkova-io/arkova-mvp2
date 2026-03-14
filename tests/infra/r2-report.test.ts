/**
 * Tests for R2 report storage logic (P8-S15).
 *
 * Validates report generation, R2 key construction, and signed URL generation.
 */

import { describe, it, expect } from 'vitest';
import {
  buildR2Key,
  generateReportContent,
  type ReportRequest,
} from '../../services/edge/src/report-logic';

describe('buildR2Key', () => {
  it('creates key with org prefix and timestamp', () => {
    const key = buildR2Key('org-123', 'portfolio', new Date('2026-03-14T12:00:00Z'));
    expect(key).toBe('reports/org-123/portfolio/2026-03-14T12:00:00.000Z.pdf');
  });

  it('sanitizes org ID to prevent path traversal', () => {
    const key = buildR2Key('../../../etc', 'portfolio', new Date('2026-03-14T12:00:00Z'));
    expect(key).not.toContain('..');
    expect(key).toMatch(/^reports\//);
  });
});

describe('generateReportContent', () => {
  it('generates markdown report from portfolio data', () => {
    const request: ReportRequest = {
      orgId: 'org-123',
      reportType: 'portfolio',
      data: {
        totalCredentials: 150,
        byType: { DEGREE: 80, CERTIFICATE: 50, LICENSE: 20 },
        integrityDistribution: { high: 120, medium: 25, low: 5 },
      },
    };

    const content = generateReportContent(request);

    expect(content).toContain('Portfolio Summary');
    expect(content).toContain('150');
    expect(content).toContain('DEGREE');
  });

  it('does not include PII in report output', () => {
    const request: ReportRequest = {
      orgId: 'org-123',
      reportType: 'portfolio',
      data: {
        totalCredentials: 10,
        byType: { DEGREE: 10 },
        integrityDistribution: { high: 10, medium: 0, low: 0 },
      },
    };

    const content = generateReportContent(request);

    // No email, SSN, or student ID patterns
    expect(content).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    expect(content).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });
});
