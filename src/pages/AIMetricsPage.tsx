/**
 * AI Metrics Dashboard (AI-OBS-01)
 *
 * Aggregates extraction_feedback, ai_usage_events, and provider metrics.
 * Admin-only page at /admin/ai-metrics.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, BarChart3, Clock, AlertTriangle, CheckCircle,
  TrendingUp, ArrowLeft, RefreshCw, Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/lib/routes';

interface UsageStats {
  totalExtractions: number;
  totalEmbeddings: number;
  totalFraudChecks: number;
  successRate: number;
  avgLatencyMs: number;
  avgConfidence: number;
  totalTokens: number;
  providers: Record<string, number>;
}

interface FeedbackStats {
  totalFeedback: number;
  accepted: number;
  rejected: number;
  edited: number;
  acceptanceRate: number;
  byField: Record<string, { total: number; accepted: number; rate: number }>;
  byType: Record<string, { total: number; accepted: number; rate: number }>;
}

export function AIMetricsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleSignOut = async () => { await signOut(); navigate(ROUTES.LOGIN); };

  async function fetchMetrics() {
    setLoading(true);

    // Fetch AI usage events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: usageData } = await (supabase as any)
      .from('ai_usage_events')
      .select('event_type, provider, tokens_used, confidence, duration_ms, success')
      .order('created_at', { ascending: false })
      .limit(10000);

    const events = (usageData ?? []) as Array<{
      event_type: string;
      provider: string;
      tokens_used: number;
      confidence: number | null;
      duration_ms: number | null;
      success: boolean;
    }>;

    const totalExtractions = events.filter(e => e.event_type === 'extraction').length;
    const totalEmbeddings = events.filter(e => e.event_type === 'embedding').length;
    const totalFraudChecks = events.filter(e => e.event_type === 'fraud_check').length;
    const successCount = events.filter(e => e.success).length;
    const successRate = events.length > 0 ? successCount / events.length : 0;

    const withLatency = events.filter(e => e.duration_ms != null && e.duration_ms > 0);
    const avgLatencyMs = withLatency.length > 0
      ? withLatency.reduce((s, e) => s + (e.duration_ms ?? 0), 0) / withLatency.length
      : 0;

    const withConfidence = events.filter(e => e.confidence != null);
    const avgConfidence = withConfidence.length > 0
      ? withConfidence.reduce((s, e) => s + (e.confidence ?? 0), 0) / withConfidence.length
      : 0;

    const totalTokens = events.reduce((s, e) => s + (e.tokens_used ?? 0), 0);

    const providers: Record<string, number> = {};
    for (const e of events) {
      providers[e.provider] = (providers[e.provider] || 0) + 1;
    }

    setUsageStats({
      totalExtractions,
      totalEmbeddings,
      totalFraudChecks,
      successRate,
      avgLatencyMs,
      avgConfidence,
      totalTokens,
      providers,
    });

    // Fetch extraction feedback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: feedbackData } = await (supabase as any)
      .from('extraction_feedback')
      .select('action, field_key, credential_type')
      .limit(10000);

    const feedback = (feedbackData ?? []) as Array<{
      action: string;
      field_key: string;
      credential_type: string;
    }>;

    const accepted = feedback.filter(f => f.action === 'accepted').length;
    const rejected = feedback.filter(f => f.action === 'rejected').length;
    const edited = feedback.filter(f => f.action === 'edited').length;
    const acceptanceRate = feedback.length > 0 ? accepted / feedback.length : 0;

    // Group by field
    const byField: Record<string, { total: number; accepted: number; rate: number }> = {};
    for (const f of feedback) {
      if (!byField[f.field_key]) byField[f.field_key] = { total: 0, accepted: 0, rate: 0 };
      byField[f.field_key].total++;
      if (f.action === 'accepted') byField[f.field_key].accepted++;
    }
    for (const k of Object.keys(byField)) {
      byField[k].rate = byField[k].total > 0 ? byField[k].accepted / byField[k].total : 0;
    }

    // Group by credential type
    const byType: Record<string, { total: number; accepted: number; rate: number }> = {};
    for (const f of feedback) {
      if (!byType[f.credential_type]) byType[f.credential_type] = { total: 0, accepted: 0, rate: 0 };
      byType[f.credential_type].total++;
      if (f.action === 'accepted') byType[f.credential_type].accepted++;
    }
    for (const k of Object.keys(byType)) {
      byType[k].rate = byType[k].total > 0 ? byType[k].accepted / byType[k].total : 0;
    }

    setFeedbackStats({
      totalFeedback: feedback.length,
      accepted,
      rejected,
      edited,
      acceptanceRate,
      byField,
      byType,
    });

    setLoading(false);
    setLastRefresh(new Date());
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (!user) return null;

  return (
    <AppShell user={user} profile={profile} profileLoading={profileLoading} onSignOut={handleSignOut}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.ADMIN_OVERVIEW)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Metrics</h1>
            <p className="text-sm text-muted-foreground">
              Extraction accuracy, provider performance, and quality monitoring
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Badge variant="outline" className="text-[10px]">
          Last: {lastRefresh.toLocaleTimeString()}
        </Badge>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-muted-foreground">Extractions</span>
            </div>
            <p className="text-2xl font-semibold">{usageStats?.totalExtractions.toLocaleString() ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
            <p className="text-2xl font-semibold">
              {usageStats ? `${(usageStats.successRate * 100).toFixed(1)}%` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Avg Latency</span>
            </div>
            <p className="text-2xl font-semibold">
              {usageStats ? `${usageStats.avgLatencyMs.toFixed(0)}ms` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Avg Confidence</span>
            </div>
            <p className="text-2xl font-semibold">
              {usageStats ? `${(usageStats.avgConfidence * 100).toFixed(1)}%` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider & Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Provider Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageStats && Object.keys(usageStats.providers).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(usageStats.providers)
                  .sort(([, a], [, b]) => b - a)
                  .map(([provider, count]) => (
                    <div key={provider} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{provider}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{
                              width: `${(count / (usageStats.totalExtractions + usageStats.totalEmbeddings + usageStats.totalFraudChecks || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No usage data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Extractions</span>
                <span className="font-mono">{usageStats?.totalExtractions.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Embeddings</span>
                <span className="font-mono">{usageStats?.totalEmbeddings.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fraud Checks</span>
                <span className="font-mono">{usageStats?.totalFraudChecks.toLocaleString() ?? 0}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm font-medium">
                <span>Total Tokens</span>
                <span className="font-mono">{usageStats?.totalTokens.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Stats */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Extraction Feedback (User Corrections)</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackStats && feedbackStats.totalFeedback > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{feedbackStats.totalFeedback}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Accepted</p>
                  <p className="text-lg font-semibold text-emerald-400">{feedbackStats.accepted}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Edited</p>
                  <p className="text-lg font-semibold text-amber-400">{feedbackStats.edited}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                  <p className="text-lg font-semibold text-red-400">{feedbackStats.rejected}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Acceptance Rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className="bg-emerald-500 rounded-full h-3"
                      style={{ width: `${feedbackStats.acceptanceRate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono">{(feedbackStats.acceptanceRate * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* By field breakdown */}
              {Object.keys(feedbackStats.byField).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">By Field</p>
                  <div className="space-y-1">
                    {Object.entries(feedbackStats.byField)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([field, stats]) => (
                        <div key={field} className="flex items-center justify-between text-xs">
                          <span className="font-mono">{field}</span>
                          <span className="text-muted-foreground">
                            {stats.accepted}/{stats.total} ({(stats.rate * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No feedback data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Feedback is collected when users accept, edit, or reject AI extraction suggestions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eval Baseline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Eval Baseline (AI-EVAL-02)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Macro F1</p>
              <p className="text-lg font-semibold">82.1%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confidence Corr.</p>
              <p className="text-lg font-semibold text-amber-400">r=0.426</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Golden Dataset</p>
              <p className="text-lg font-semibold">210 entries</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prompt Version</p>
              <p className="text-lg font-mono">v25 (25 examples)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Baseline from live Gemini eval on 2026-03-23. Best: CLE 94.3%, Worst: LICENSE 59.4%.
            Confidence calibration needs recalibration (overconfident at 90-100% bucket).
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
