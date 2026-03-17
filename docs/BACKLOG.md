# Arkova Unified Backlog — Single Source of Truth
_Last updated: 2026-03-17 (AUDIT-01/02/03/04 resolved) | Re-prioritized each session per CLAUDE.md rules_

> **Rule:** All backlog items — stories, bugs, security findings, operational tasks, GEO items — exist in this single document. Prioritized and re-prioritized each session.

---

## Summary

| Category | Total | Done | Open | Blocking Launch? |
|----------|-------|------|------|:----------------:|
| CRITICAL SQL Bugs (migration) | 6 | **6** | 0 | ~~YES~~ **RESOLVED** |
| CRITICAL Code Bugs | 4 | **4** | 0 | ~~YES~~ **RESOLVED** |
| Security Findings (new audit) | 16 | **5** | 11 | **YES** (6 HIGH+) |
| Security Findings (CISO — prior) | 12 | 12 | 0 | No |
| Operational Tasks | 7 | 0 | 7 | **YES** |
| Worker Bugs (HIGH/MEDIUM) | 8 | 0 | 8 | Partially |
| Edge/Infra Bugs | 7 | 0 | 7 | Partially |
| CI/CD Gaps | 6 | 0 | 6 | **YES** (CI-01, CI-04) |
| Frontend Bugs (MEDIUM) | 14 | 0 | 14 | No |
| Documentation Gaps | 17 | 0 | 17 | No (but blocks SOC 2) |
| Test Coverage Gaps | 11 | 0 | 11 | No |
| Stories (NOT STARTED) | 9 | — | 9 | No (post-launch) |
| Stories (PARTIAL) | 3 | — | 3 | 1 blocking (INFRA-07) |
| UAT Bugs (prior) | 29 | 29 | 0 | No |
| Hardening/Polish | 20+ | 0 | 20+ | No |
| **Total Open Items** | | | **~113** | |

---

## TIER 0: CRITICAL SQL BUGS — FIX BEFORE ANY DEPLOY

> These are bugs in applied or pending migrations that cause **runtime errors or data corruption**. A compensating migration (0066) is required.

| # | ID | Migration | Severity | Finding | Fix |
|---|-----|-----------|----------|---------|-----|
| 1 | SQL-01 | 0006 | **CRITICAL** | `audit_events.event_category` CHECK constraint missing 'ORGANIZATION', 'WEBHOOK' — blocks inserts from migrations 0013, 0025, 0046 | ALTER constraint to add missing values |
| 2 | SQL-02 | 0059 | **CRITICAL** | `check_ai_credits()` operator precedence bug — `AND` binds tighter than `OR`, so period checks don't apply to org_id branch. Expired credits count as valid for orgs. | Add parentheses around OR clause |
| 3 | SQL-03 | 0060 | **CRITICAL** | `search_public_credential_embeddings()` references `o.name` — column doesn't exist (should be `o.display_name`). Runtime error on call. | Replace `o.name` with `o.display_name` |
| 4 | SQL-04 | 0062 | **CRITICAL** | `search_public_credentials()` references `a.title` — column doesn't exist (should be `a.label`). Runtime error on call. | Replace `a.title` with `a.label` |
| 5 | SQL-05 | 0064 | **CRITICAL** | switchboard_flags INSERT uses wrong column names (`flag_key`/`enabled` instead of `id`/`value`). INSERT fails silently. | Use correct column names |
| 6 | SQL-06 | 0055 | **HIGH** | `search_public_issuers()` and `get_public_issuer_registry()` missing GRANT to anon/authenticated. Public search RPCs unreachable from client. | Add GRANT EXECUTE statements |

**~~Story: AUDIT-01 — Write migration 0066 to fix all 6 SQL bugs~~** ✅ RESOLVED 2026-03-17. Migration `0066_audit_compensating_fixes.sql` fixes all 6 SQL bugs.

---

## TIER 1: LAUNCH BLOCKERS

### Critical Code Bugs

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 7 | CODE-01 | `src/components/dashboard/BatchAIDashboard.tsx:188` | **CRITICAL** | Infinite re-render loop — `useEffect` deps include `[fetchJobs, jobs]`, every fetch updates jobs which re-triggers fetch |
| 8 | CODE-02 | `services/worker/src/index.ts:599-604` | **HIGH** | Graceful shutdown race — `process.exit(0)` runs before `server.close()` callback fires. In-flight requests killed without draining. |
| 9 | CODE-03 | `services/worker/src/webhooks/delivery.ts:186` | **HIGH** | Webhook HMAC signing uses `endpoint.secret_hash` (the hash) as HMAC key instead of the raw secret. Consumers cannot verify signatures. |
| 10 | CODE-04 | `services/worker/src/jobs/batch-anchor.ts:93-97` | **MEDIUM** | Batch anchor job overwrites entire `metadata` field with merkle proof data, destroying existing credential metadata |

**~~Story: AUDIT-02 — Fix critical code bugs (infinite loop, shutdown, HMAC, metadata)~~** ✅ RESOLVED 2026-03-17. BatchAIDashboard split useEffect, graceful shutdown race fixed, batch-anchor metadata merge, HMAC clarified (not a bug — column name misleading).

### Security — New Findings

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 11 | SEC-NEW-01 | `services/edge/src/index.ts:15-30` | **CRITICAL** | Edge worker routes (`/report`, `/ai-fallback`, `/crawl`) have ZERO authentication. Any public request triggers report gen, AI extraction, or crawling. |
| 12 | SEC-NEW-02 | `.github/workflows/deploy-worker.yml:99-100` | **CRITICAL** | `CRON_SECRET` and `CRON_OIDC_AUDIENCE` missing from `--set-secrets` list. Cron endpoints lack auth in production. |
| 13 | SEC-NEW-03 | `services/edge/src/cloudflare-crawler.ts:153-165` | **HIGH** | SSRF validation gaps: IPv6 loopback, DNS rebinding, `172.17-31.*`, `169.254.*` (AWS metadata), `0.0.0.0` not blocked |
| 14 | SEC-NEW-04 | `services/edge/src/ai-fallback.ts:88-96` | **HIGH** | AI prompt injection — user metadata interpolated directly into prompt string via template literal |
| 15 | SEC-NEW-05 | `services/edge/src/mcp-server.ts:191` | **HIGH** | MCP server CORS uses wildcard `Access-Control-Allow-Origin: *` |
| 16 | SEC-NEW-06 | `.github/workflows/deploy-worker.yml:92` | **HIGH** | Cloud Run deployed with `--allow-unauthenticated` — publicly accessible |
| 17 | SEC-NEW-07 | `services/worker/src/api/treasury.ts:24-27` | **MEDIUM** | Platform admin emails hardcoded in source code (also duplicated in Sidebar.tsx) |
| 18 | SEC-NEW-08 | `src/components/organization/OrgRegistryTable.tsx:156` | **MEDIUM** | PostgREST filter injection — search query passed directly into `.or()` without sanitization |
| 19 | SEC-NEW-09 | `services/worker/src/middleware/usageTracking.ts:72-99` | **MEDIUM** | TOCTOU race in usage tracking — SELECT then UPDATE without transaction |
| 20 | SEC-NEW-10 | `services/worker/src/api/v1/ai-extract.ts:83-87` | **MEDIUM** | AI credits deducted AFTER extraction (check-then-deduct TOCTOU gap) |
| 21 | SEC-NEW-11 | `services/worker/src/stripe/handlers.ts:396` | **MEDIUM** | Stripe event recorded AFTER handler — crash between handler and recording causes reprocessing |
| 22 | SEC-NEW-12 | `services/worker/src/index.ts (verify-anchor)` | **MEDIUM** | `/api/verify-anchor` public endpoint has no rate limiting — brute-force fingerprint discovery |
| 23 | SEC-NEW-13 | `services/worker/src/ai/gemini.ts:71-72` | **MEDIUM** | AbortController signal not passed to Gemini API — timeout doesn't actually abort request |
| 24 | SEC-NEW-14 | `services/worker/src/api/account-delete.ts` | **LOW** | Account deletion endpoint has no rate limiting |
| 25 | SEC-NEW-15 | `services/worker/src/api/treasury.ts:106` | **LOW** | Treasury endpoint exposes full wallet address in response |
| 26 | SEC-NEW-16 | `services/edge/src/mcp-server.ts:171-176` | **LOW** | MCP server creates new server+transport per request — resource exhaustion vector |

**~~Story: AUDIT-03 — Fix critical edge worker auth (SEC-NEW-01, SEC-NEW-02)~~** ✅ RESOLVED 2026-03-17. Edge worker routes require X-Cron-Secret. CRON_SECRET + CRON_OIDC_AUDIENCE added to deploy workflow.
**~~Story: AUDIT-04 — Fix SSRF, prompt injection, CORS (SEC-NEW-03/04/05)~~** ✅ RESOLVED 2026-03-17. Crawler SSRF blocklist expanded (IPv6, 169.254, 172.17-31, GCP metadata). AI prompt injection mitigated (system/user separation, input sanitization). MCP CORS restricted to configured origins.
**Story: AUDIT-05 — Fix TOCTOU races and rate limiting gaps (SEC-NEW-08/09/10/11/12)** (MEDIUM)

### Operational Tasks (from prior backlog + new)

| # | ID | Issue | Status |
|---|-----|-------|--------|
| 27 | OPS-01 | Apply migrations 0059-0065 to production Supabase | PENDING |
| 28 | OPS-02 | Run `scripts/strip-demo-seeds.sql` on production | PENDING |
| 29 | OPS-03 | Set Sentry DSN env vars (Vercel + Cloud Run) | PENDING |
| 30 | OPS-04 | Sentry source map upload plugin | PENDING |
| 31 | OPS-05 | AWS KMS key provisioning (mainnet signing) | PENDING |
| 32 | OPS-06 | Mainnet treasury funding | PENDING |
| 33 | OPS-07 | Key rotation (Stripe + Supabase service role) | PENDING |

**Note:** OPS-01 is blocked by AUDIT-01 (migration 0066 must be written and applied alongside 0059-0065).

---

## TIER 2: CI/CD GAPS — FIX THIS SPRINT

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 34 | CI-01 | `.github/workflows/ci.yml` | **CRITICAL** | No typecheck, lint, or test for `services/edge/` — edge worker TS never validated in CI |
| 35 | CI-02 | (missing) | **HIGH** | No edge worker deployment workflow (`deploy-edge.yml`). Manual `wrangler deploy` only. |
| 36 | CI-03 | `vitest.config.ts` | **MEDIUM** | Infra tests run under frontend vitest config but import edge code with different TS settings |
| 37 | CI-04 | CI + deploy workflows | **HIGH** | No Sentry source map upload step. Production errors show minified stack traces. |
| 38 | CI-05 | `.github/workflows/ci.yml` | **MEDIUM** | No `npm audit` step in CI despite Security Mandate requiring it |
| 39 | CI-06 | `playwright.config.ts:47` | **HIGH** | E2E tests don't start the worker — tests depending on worker endpoints will fail |

**Story: AUDIT-06 — Add edge worker CI + Sentry source maps + npm audit to pipeline** (HIGH)
**Story: AUDIT-07 — Fix E2E test infrastructure (worker startup, cross-browser)** (MEDIUM)

---

## TIER 3: WORKER BUGS (HIGH/MEDIUM)

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 40 | WRK-01 | `services/worker/src/index.ts` | **LOW** | `correlationIdMiddleware` imported but never mounted — all correlation ID functionality dead |
| 41 | WRK-02 | `services/worker/src/jobs/report.ts:158` | **LOW** | Report stores `file_size` but content never written to storage — artifact row references nonexistent file |
| 42 | WRK-03 | `services/worker/src/chain/client.ts` | **MEDIUM** | Chain index cache (`_cache` Map) grows without bound — no LRU or max-size eviction |
| 43 | WRK-04 | `services/worker/src/ai/review-queue.ts:258-261` | **MEDIUM** | `getReviewQueueStats` fetches ALL rows to count — should use COUNT query |
| 44 | WRK-05 | `services/worker/src/api/v1/batch.ts:170` | **MEDIUM** | `processAsyncJob` fire-and-forget — crashed jobs stay in PROCESSING forever |
| 45 | WRK-06 | `services/worker/src/api/v1/ai-review.ts:48` | **LOW** | Status param not validated against enum (passed raw to DB query) |
| 46 | WRK-07 | `services/worker/src/api/v1/ai-feedback.ts:86` | **LOW** | `days` param uses parseInt instead of Zod — inconsistent with all other endpoints |
| 47 | WRK-08 | Multiple `api/v1/ai-*.ts` files | **LOW** (systemic) | 30+ `(db as any)` casts bypass type safety. Caused real bugs (wrong column names) already. |

**Story: AUDIT-08 — Fix worker bugs (correlation ID, cache bounds, stuck jobs, stats query)** (MEDIUM)
**Story: AUDIT-09 — Regenerate database.types.ts to eliminate `as any` casts** (MEDIUM)

---

## TIER 4: EDGE/INFRA BUGS

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 48 | EDGE-01 | `services/edge/src/report-logic.ts:35` | **HIGH** | R2 key says `.pdf` but content is markdown with `Content-Type: text/markdown` — format mismatch |
| 49 | EDGE-02 | `services/edge/src/report-generator.ts:50` | **HIGH** | `signedUrl` is plain string concatenation, not an actual R2 presigned URL — either 403 or public access |
| 50 | EDGE-03 | `services/edge/src/ai-fallback.ts:51-73` | **MEDIUM** | Health check tests nothing — measures elapsed time of zero operations, always returns healthy |
| 51 | EDGE-04 | `services/edge/src/batch-queue-logic.ts:96-107` | **MEDIUM** | `processItem` is a stub — returns hardcoded success without calling any AI provider |
| 52 | EDGE-05 | `services/edge/src/batch-queue.ts:30` | **LOW** | Supabase RPC result not error-checked — failed status updates silently dropped |
| 53 | EDGE-06 | `services/edge/src/batch-queue.ts:47` | **MEDIUM** | Messages acked even on processing errors — failed items silently dropped from queue |
| 54 | EDGE-07 | `services/worker/entrypoint.sh:81` | **MEDIUM** | `wait -n` (bash 4.3+) used with `#!/bin/sh` shebang — fails on Alpine ash |

**Story: AUDIT-10 — Fix edge worker bugs (report gen, batch queue, health check, entrypoint)** (HIGH)

### Configuration Issues

| # | ID | File | Finding |
|---|-----|------|---------|
| 55 | CFG-01 | `services/worker/.env.example` | Severely incomplete — missing 9+ env vars (GEMINI_API_KEY, AI_PROVIDER, CRON_SECRET, etc.) |
| 56 | CFG-02 | `services/worker/docker-compose.yml` | Missing AI + Sentry env vars for local Docker dev |
| 57 | CFG-03 | `scripts/setup-gcp.sh:68-75` | SECRETS array missing `api-key-hmac-secret`, `sentry-dsn`, `gemini-api-key` |
| 58 | CFG-04 | `scripts/deploy-tunnel.sh` | References decommissioned domain `arkova.io` (should be `arkova.ai`) |
| 59 | CFG-05 | Root `wrangler.toml` | Entirely commented out — confusing. Either remove or add documentation comment. |
| 60 | CFG-06 | `supabase/config.toml` | Still references "Ralph" and `project_id = "ralph"` |
| 61 | CFG-07 | Two duplicate `strip-demo-seed(s).sql` scripts with different strategies | Consolidate to one |

**Story: AUDIT-11 — Fix all configuration gaps (env examples, scripts, config files)** (MEDIUM)

---

## TIER 5: FRONTEND BUGS

| # | ID | File | Severity | Finding |
|---|-----|------|----------|---------|
| 62 | FE-01 | `src/components/layout/Header.tsx:98-105` | **MEDIUM** | Both "Profile" and "Settings" navigate to `ROUTES.SETTINGS` — duplicate menu item |
| 63 | FE-02 | `src/pages/OrganizationPage.tsx:92-101` | **MEDIUM** | Missing Zod validation on role update — direct `supabase.update()` |
| 64 | FE-03 | `src/components/auth/SignUpForm.tsx:52-57` | **MEDIUM** | Race condition — `setTimeout(100ms)` to check error state after `signUp()` |
| 65 | FE-04 | `src/components/anchor/AssetDetailView.tsx:119` | **LOW** | Artificial 500ms setTimeout in `handleVerifyFile` — masks errors |
| 66 | FE-05 | `src/lib/proofPackage.ts:117` | **MEDIUM** | Non-null assertions on `chain_block_height!` and `chain_timestamp!` — can be null for PENDING |
| 67 | FE-06 | `src/components/anchor/SecureDocumentDialog.tsx:110` | **LOW** | Non-null assertion `inserted.public_id!` — undefined if DB doesn't generate |
| 68 | FE-07 | `src/components/embed/VerificationWidget.tsx:192` | **MEDIUM** | Banned font stack (Roboto, system-ui) — violates Constitution Section 5 |
| 69 | FE-08 | `src/lib/validators.ts:2` | **LOW** | Comment says "Ralph" instead of "Arkova" |
| 70 | FE-09 | `tests/rls/rls.test.ts:1` | **LOW** | Comment references "Ralph" instead of "Arkova" |
| 71 | FE-10 | `src/components/vault/VaultDashboard.tsx:68` | **LOW** | `handleDownloadProof` is a no-op callback — dead code |
| 72 | FE-11 | `src/pages/MyRecordsPage.tsx:269` | **LOW** | Download Proof menu item has no onClick handler — non-functional |
| 73 | FE-12 | `src/components/organization/InviteMemberModal.tsx` | **MEDIUM** | Missing Zod validation — uses inline validation only |
| 74 | FE-13 | `src/components/onboarding/OrgOnboardingForm.tsx` | **MEDIUM** | Missing Zod validation — uses inline regex validation |
| 75 | FE-14 | `src/components/webhooks/WebhookSettings.tsx:76` | **MEDIUM** | URL validation is just `!startsWith('https://')` — no Zod schema |

**Story: AUDIT-12 — Fix frontend bugs (Header dup, Zod validation, banned fonts, dead code)** (MEDIUM)

### Frontend Hardening — Copy Centralization

~35 files have hardcoded UI strings that should be in `src/lib/copy.ts`. Key offenders:
- `AssetDetailView.tsx` (30+ strings)
- `BillingOverview.tsx`, `PricingCard.tsx` (pricing data)
- `CredentialTemplatesManager.tsx`, `WebhookSettings.tsx`
- `VerificationForm.tsx`, `PublicVerifyPage.tsx`
- All page components (`DashboardPage`, `SettingsPage`, `HelpPage`, etc.)

**Story: AUDIT-13 — Centralize hardcoded UI strings to copy.ts (~35 files)** (LOW)

### Frontend Hardening — Nordic Vault Design System

| Finding | Files |
|---------|-------|
| Using `<Skeleton>` instead of `shimmer` class | StatCard, BillingOverview, CreditUsageWidget, RecordsList, MyRecordsPage, TreasuryAdminPage |
| Missing `shadow-card-rest`/`shadow-card-hover` | StatCard, BillingOverview, WebhookSettings, RecordsList, HelpPage |
| Missing `animate-in-view` entry animations | NotFoundPage, HelpPage, StatCard |
| Missing `bg-mesh-gradient` atmospheric styling | NotFoundPage |

**Story: AUDIT-14 — Apply Nordic Vault design system to remaining components** (LOW)

### Frontend Hardening — Code Quality

| Finding | Files |
|---------|-------|
| Duplicate CSV wizards | `BulkUploadWizard.tsx` + `CSVUploadWizard.tsx` |
| Duplicate `WORKER_URL` construction | `aiExtraction.ts`, `useSemanticSearch.ts` (should use `workerClient.ts`) |
| Duplicate `formatDate`/`formatFileSize` utilities | `MyRecordsPage`, `RecordsList`, `MemberDetailPage` |
| useState arrays that should be hooks | `BatchAIDashboard`, `ReportsList`, `MemberDetailPage` |

**Story: AUDIT-15 — Deduplicate frontend code (CSV wizards, utilities, worker URLs)** (LOW)

---

## TIER 6: DOCUMENTATION GAPS

### Tier 6A — Security Documentation (blocks SOC 2 evidence)

| # | ID | Finding |
|---|-----|---------|
| 76 | DOC-01 | `docs/confluence/03_security_rls.md` missing RLS docs for 12+ tables: `api_keys`, `batch_verification_jobs`, `ai_credits`, `ai_usage_events`, `credential_embeddings`, `anchor_recipients`, `ai_feedback_events`, `ai_integrity_scores`, `ai_review_queue`, `anchor_chain_index`, `credit_balances`, `credit_transactions` |
| 77 | DOC-02 | `docs/confluence/03_security_rls.md` SECURITY DEFINER inventory incomplete — missing 10+ functions from P4.5/P6/P8/UF sprints |
| 78 | DOC-03 | CLAUDE.md Section 1.9 lists only 2 feature flags — missing 7: `ENABLE_AI_EXTRACTION`, `ENABLE_SEMANTIC_SEARCH`, `ENABLE_AI_FRAUD`, `ENABLE_BATCH_ANCHORING`, `ENABLE_AI_FALLBACK`, `ENABLE_SYNTHETIC_DATA`, `ENABLE_AI_REPORTS` |
| 79 | DOC-04 | CLAUDE.md Section 13 missing env vars: `KMS_PROVIDER`, `GCP_KMS_KEY_RING`, `GCP_KMS_KEY_NAME`, `GCP_KMS_LOCATION`, `ENABLE_AI_REPORTS` |
| 80 | DOC-05 | `docs/confluence/12_verification_api.md` — referenced but does not exist. 13 complete P4.5 stories have no architecture doc. |
| 81 | DOC-06 | `docs/confluence/16_gcp_kms_operations.md` — referenced but does not exist. GcpKmsSigningProvider undocumented. |

**Story: AUDIT-16 — Update security documentation for SOC 2 readiness** (HIGH — blocks compliance)
**Story: AUDIT-17 — Create missing confluence docs (Verification API, GCP KMS)** (MEDIUM)
**Story: AUDIT-18 — Update CLAUDE.md feature flags and env vars** (MEDIUM)

### Tier 6B — Stale/Contradictory Documentation

| # | ID | Finding |
|---|-----|---------|
| 82 | DOC-07 | `01_architecture_overview.md` says 45 migrations, MockChainClient, missing 6+ directories — severely outdated |
| 83 | DOC-08 | `02_data_model.md` missing 10+ tables from schema catalog |
| 84 | DOC-09 | MVP-14 status contradicts across 3 documents (COMPLETE in stories index, NOT STARTED in CLAUDE.md, code exists and works) |
| 85 | DOC-10 | `docs/stories/11_mvp_launch_gaps.md` — 6 story detail sections still show NOT STARTED despite being COMPLETE |
| 86 | DOC-11 | `docs/stories/12_p8_ai_intelligence.md` references non-existent `GeminiADKProvider`, `openai.ts`, `anthropic.ts` |
| 87 | DOC-12 | `docs/confluence/15_zero_trust_edge_architecture.md` status says "PROPOSED" — should be "IMPLEMENTED" |
| 88 | DOC-13 | `docs/bugs/bug_log.md` header says "Active bugs: 21" — should be 0 |
| 89 | DOC-14 | 3 stale `agents.md` files: `services/edge/` (says "stubs"), `src/components/` (says widget "orphaned"), `services/worker/` (says 363 tests) |
| 90 | DOC-15 | `00_index.md` says 51 migrations, 20 tables — both wrong |
| 91 | DOC-16 | `ARCHIVE_memory.md` shows CRIT-3 as PARTIAL — resolved 2026-03-14 |
| 92 | DOC-17 | `seed.sql` missing `ENABLE_VERIFICATION_API` and `ENABLE_AI_REPORTS` flag entries |

**Story: AUDIT-19 — Fix all stale documentation (architecture, data model, story statuses, agents.md)** (MEDIUM)

---

## TIER 7: TEST COVERAGE GAPS

### RLS Test Gaps

| # | ID | Finding |
|---|-----|---------|
| 93 | TEST-01 | RLS tests missing coverage for 9 tables: `ai_credits`, `ai_usage_events`, `credential_embeddings`, `anchor_recipients`, `credit_transactions`, `ai_feedback_events`, `ai_integrity_scores`, `ai_review_queue`, `batch_verification_jobs` |

### Worker Test Gaps

| # | ID | Finding |
|---|-----|---------|
| 94 | TEST-02 | `account-delete.ts` — no dedicated test file |
| 95 | TEST-03 | `treasury.ts` — no dedicated test file |
| 96 | TEST-04 | `batch-anchor.ts` metadata clobbering behavior untested |

### Edge/Infra Test Gaps

| # | ID | Finding |
|---|-----|---------|
| 97 | TEST-05 | No SSRF bypass tests for crawler (IPv6, DNS rebinding, `169.254.*`) |
| 98 | TEST-06 | No edge worker integration tests (fetch handler end-to-end) |
| 99 | TEST-07 | Batch queue tests only exercise the stub (processItem is no-op) |
| 100 | TEST-08 | MCP server tests make real network calls instead of mocking Supabase |
| 101 | TEST-09 | Load tests use in-memory mocks, not actual infrastructure |
| 102 | TEST-10 | `db-query-performance.test.ts` tests JavaScript array ops, not DB queries — misleading name |

### E2E Test Gaps

| # | ID | Finding |
|---|-----|---------|
| 103 | TEST-11 | No E2E test for AI extraction flow |
| 104 | TEST-12 | No E2E test for API key management UI |
| 105 | TEST-13 | No E2E test for semantic search |
| 106 | TEST-14 | `concurrent-claims.test.ts` documents missing `SELECT FOR UPDATE SKIP LOCKED` in job claims — known gap, no backlog item |

### Frontend Test Gaps

~28 component/page files lack dedicated test files (see audit report for full list).

**Story: AUDIT-20 — Add RLS tests for 9 untested tables** (HIGH — Constitution 1.7)
**Story: AUDIT-21 — Add worker tests (account-delete, treasury, batch metadata)** (MEDIUM)
**Story: AUDIT-22 — Fix edge/infra test suite (SSRF, MCP mocks, batch queue)** (MEDIUM)
**Story: AUDIT-23 — Add E2E specs for AI extraction, API keys, semantic search** (MEDIUM)
**Story: AUDIT-24 — Add frontend component tests for untested pages** (LOW)

---

## TIER 8: EXISTING NOT STARTED STORIES (post-launch backlog)

### P7 Go-Live — 2 not started
| ID | Description | Notes |
|----|-------------|-------|
| P7-TS-04 | (No individual scope) | Placeholder |
| P7-TS-06 | (No individual scope) | Placeholder |

### MVP Launch Gaps — 2 not started (+ 1 reclassified)
| ID | Description | Priority |
|----|-------------|----------|
| MVP-12 | Dark mode toggle | LOW |
| MVP-14 | Embeddable verification widget | **COMPLETE** (reclassify — code exists, routed, tested) |
| MVP-20 | LinkedIn badge integration | LOW |
| MVP-30 | GCP CI/CD pipeline | MEDIUM |

### GEO & SEO — 5 not started, 2 partial
| ID | Description | Priority |
|----|-------------|----------|
| GEO-02 | LinkedIn entity + sameAs | PARTIAL (missing Wikidata) |
| GEO-03 | Publish /privacy and /terms on marketing site | CRITICAL |
| GEO-08 | Content expansion — 5 core pages | HIGH |
| GEO-09 | Community & brand presence launch | MEDIUM |
| GEO-10 | IndexNow for Bing/Copilot | MEDIUM |
| GEO-11 | YouTube explainers + VideoObject schema | MEDIUM |

### INFRA — 1 partial
| ID | Description | Remaining |
|----|-------------|-----------|
| INFRA-07 | Sentry integration | Source map upload + DSN env vars in production |

---

## TIER 9: HARDENING BACKLOG (nice-to-have)

| # | ID | Finding | Priority |
|---|-----|---------|----------|
| 107 | HARD-01 | Feature flag enablement items (dark-launched features with no ops item to enable) | MEDIUM |
| 108 | HARD-02 | Chain index cache LRU eviction | LOW |
| 109 | HARD-03 | Circuit breaker state persisted to DB (survives restart) | LOW |
| 110 | HARD-04 | Rate limiter `setInterval` cleanup for test isolation | LOW |
| 111 | HARD-05 | Cloudflared version parameterized as Dockerfile ARG | LOW |
| 112 | HARD-06 | Playwright cross-browser testing (Firefox, WebKit) | LOW |
| 113 | HARD-07 | `vitest.config.rls.ts` missing dotenv/setupFiles for env vars | LOW |
| 114 | HARD-08 | `@modelcontextprotocol/sdk` in devDependencies but used at runtime by edge worker | LOW |
| 115 | HARD-09 | `tailwind.config.ts` uses CJS `require()` in ESM project | LOW |
| 116 | HARD-10 | Dockerfile hardcoded to `amd64` architecture | LOW |
| 117 | HARD-11 | `select FOR UPDATE SKIP LOCKED` missing from anchor job claims (documented in test) | MEDIUM |
| 118 | HARD-12 | `generate_public_id()` uses non-cryptographic `random()` (comment claims "cryptographically secure") | LOW |
| 119 | HARD-13 | `chain_raw_tx` stored as TEXT — data minimization concern | LOW |
| 120 | HARD-14 | `credits.user_id` FK to `auth.users` inconsistent with rest of schema using `profiles` | LOW |
| 121 | HARD-15 | Duplicate `strip-demo-seed(s).sql` scripts | LOW |
| 122 | HARD-16 | ILIKE pattern not escaped for wildcards in `search_public_credentials` | LOW |
| 123 | HARD-17 | AI provider: add explicit prompt injection mitigation instructions | MEDIUM |
| 124 | HARD-18 | DUP: Verification lookup duplicated between verify.ts and batch.ts | LOW |
| 125 | HARD-19 | DUP: Profile org_id lookup pattern repeated in every AI endpoint (~10x) | MEDIUM |
| 126 | HARD-20 | DUP: Feature gate column name references duplicated in featureGate.ts + aiFeatureGate.ts | LOW |

---

## PRIOR RESOLVED ITEMS (archive)

### ~~Security Findings (CISO audit — ALL RESOLVED)~~
| ID | Severity | Issue | Resolution |
|-----|----------|-------|------------|
| ~~PII-01~~ | ~~CRITICAL~~ | ~~actor_email plaintext in audit_events~~ | ~~Migration 0061~~ |
| ~~PII-02~~ | ~~CRITICAL~~ | ~~No right-to-erasure~~ | ~~Migrations 0061+0065~~ |
| ~~INJ-01~~ | ~~HIGH~~ | ~~PostgREST filter injection~~ | ~~Migration 0062~~ |
| ~~RLS-01~~ | ~~HIGH~~ | ~~13 tables missing GRANT~~ | ~~Migration 0062~~ |
| ~~RLS-02~~ | ~~HIGH~~ | ~~api_keys readable by non-admin~~ | ~~Migration 0062~~ |
| ~~AUTH-01~~ | ~~HIGH~~ | ~~Cron endpoints unauthenticated~~ | ~~verifyCronAuth middleware~~ |
| ~~SEC-01~~ | ~~HIGH~~ | ~~Demo seed credentials in prod~~ | ~~strip-demo-seeds.sql~~ |
| ~~PII-03~~ | ~~HIGH~~ | ~~No data retention policy~~ | ~~Migration 0062~~ |

### ~~UAT Bugs — ALL 29 RESOLVED~~
See prior backlog version for full list. All fixed across PRs #48, #60-62, #80, #83, #87.

---

## NEW STORY SUMMARY (from this audit)

| Story ID | Title | Priority | Tier | Est. Effort |
|----------|-------|----------|------|-------------|
| **AUDIT-01** | Write migration 0066 — fix 6 critical SQL bugs | **CRITICAL** | 0 | 2h |
| **AUDIT-02** | Fix critical code bugs (infinite loop, shutdown, HMAC, metadata) | **HIGH** | 1 | 3h |
| **AUDIT-03** | Fix edge worker auth (unauthenticated routes, deploy secrets) | **CRITICAL** | 1 | 2h |
| **AUDIT-04** | Fix SSRF, prompt injection, CORS in edge workers | **HIGH** | 1 | 2h |
| **AUDIT-05** | Fix TOCTOU races and rate limiting gaps | **MEDIUM** | 1 | 3h |
| **AUDIT-06** | Add edge worker CI + Sentry source maps + npm audit | **HIGH** | 2 | 3h |
| **AUDIT-07** | Fix E2E test infrastructure (worker startup, cross-browser) | **MEDIUM** | 2 | 2h |
| **AUDIT-08** | Fix worker bugs (correlation ID, cache bounds, stuck jobs) | **MEDIUM** | 3 | 2h |
| **AUDIT-09** | Regenerate database.types.ts to eliminate `as any` casts | **MEDIUM** | 3 | 1h |
| **AUDIT-10** | Fix edge worker bugs (report gen, batch queue, entrypoint) | **HIGH** | 4 | 3h |
| **AUDIT-11** | Fix all configuration gaps (env examples, scripts, configs) | **MEDIUM** | 4 | 2h |
| **AUDIT-12** | Fix frontend bugs (Header dup, Zod validation, banned fonts) | **MEDIUM** | 5 | 3h |
| **AUDIT-13** | Centralize hardcoded UI strings to copy.ts (~35 files) | **LOW** | 5 | 6h |
| **AUDIT-14** | Apply Nordic Vault design system to remaining components | **LOW** | 5 | 4h |
| **AUDIT-15** | Deduplicate frontend code (CSV wizards, utilities) | **LOW** | 5 | 3h |
| **AUDIT-16** | Update security docs for SOC 2 readiness (RLS, SECURITY DEFINER) | **HIGH** | 6 | 4h |
| **AUDIT-17** | Create missing confluence docs (Verification API, GCP KMS) | **MEDIUM** | 6 | 3h |
| **AUDIT-18** | Update CLAUDE.md feature flags and env vars | **MEDIUM** | 6 | 1h |
| **AUDIT-19** | Fix stale docs (architecture, data model, story statuses, agents.md) | **MEDIUM** | 6 | 4h |
| **AUDIT-20** | Add RLS tests for 9 untested tables | **HIGH** | 7 | 4h |
| **AUDIT-21** | Add worker tests (account-delete, treasury, batch metadata) | **MEDIUM** | 7 | 2h |
| **AUDIT-22** | Fix edge/infra test suite (SSRF, MCP mocks, batch queue) | **MEDIUM** | 7 | 3h |
| **AUDIT-23** | Add E2E specs for AI extraction, API keys, semantic search | **MEDIUM** | 7 | 4h |
| **AUDIT-24** | Add frontend component tests for untested pages | **LOW** | 7 | 6h |

**Recommended execution order:**
1. AUDIT-01 (SQL bugs) + AUDIT-03 (edge auth) — blocks all deploys
2. AUDIT-02 (code bugs) + AUDIT-04 (SSRF/injection) — security critical
3. AUDIT-06 (CI gaps) + AUDIT-10 (edge bugs) — infrastructure
4. AUDIT-16 (security docs) + AUDIT-20 (RLS tests) — compliance
5. Everything else by tier

---

## Social Accounts (Reference)

| Platform | URL |
|----------|-----|
| LinkedIn | https://www.linkedin.com/company/arkovatech |
| X/Twitter | https://x.com/arkovatech |
| YouTube | https://www.youtube.com/channel/UCTTDFFSLxl85omCeJ9DBvrg |
| GitHub | https://github.com/carson-see/ArkovaCarson |
| Email | hello@arkova.ai |

---

_This document is the single source of truth for all open work. Re-prioritized each session._
_Generated from comprehensive 6-domain codebase audit: 2026-03-16_
