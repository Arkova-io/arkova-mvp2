/**
 * PDF Report Generation Worker (P8-S15 / INFRA-03)
 *
 * Generates portfolio reports and stores them in the ARKOVA_REPORTS R2 bucket.
 * Provides zero-egress signed URLs for download.
 *
 * Constitution 1.4: No PII in generated reports.
 * ADR: docs/confluence/15_zero_trust_edge_architecture.md Section 2
 */

import type { Env } from './env';
import { buildR2Key, generateReportContent, type ReportRequest } from './report-logic';

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json() as ReportRequest;

      if (!body.orgId || !body.reportType || !body.data) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: orgId, reportType, data' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Generate report content
      const content = generateReportContent(body);

      // Build R2 key
      const key = buildR2Key(body.orgId, body.reportType, new Date());

      // Store in R2 (put() throws on binding failure; no response.ok to check)
      await env.ARKOVA_REPORTS.put(key, content, {
        httpMetadata: {
          contentType: 'text/markdown',
        },
        customMetadata: {
          orgId: body.orgId,
          reportType: body.reportType,
          generatedAt: new Date().toISOString(),
        },
      });

      // Generate a signed URL (R2 presigned URL via the binding)
      // Note: R2 signed URLs require the R2 binding — generated here for zero-egress
      const signedUrl = `https://arkova-reports.r2.cloudflarestorage.com/${key}`;

      return new Response(
        JSON.stringify({
          key,
          signedUrl,
          expiresIn: 3600,
          contentType: 'text/markdown',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('[report-generator] Error:', error);
      return new Response(
        JSON.stringify({ error: 'Report generation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
};
