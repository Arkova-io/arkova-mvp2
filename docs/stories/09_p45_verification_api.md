# P4.5 Verification API — Story Documentation
_Last updated: 2026-03-10 | 0/13 stories — ALL NOT STARTED (intentionally deferred to post-launch)_

## Group Overview

P4.5 Verification API delivers a programmatic API for third-party credential verification. All 13 stories are behind the `ENABLE_VERIFICATION_API` feature flag (default: `false`). This group is intentionally deferred to post-launch — no work should begin until Phase 1 ships.

Key deliverables:
- Feature flag middleware gating all `/api/v1/*` endpoints
- API key lifecycle: creation, HMAC-SHA256 hashing, rotation, revocation, audit
- Single and batch verification endpoints with frozen response schema
- Free tier enforcement (10K requests/month)
- Rate limiting per API key tier
- API key management UI
- OpenAPI documentation
- Load testing suite

> **All stories in this group are NOT STARTED. This document serves as a reference for the planned architecture and dependencies.**

## Architecture Context

**Design Principle: Feature-Flagged API.** The entire API surface is gated behind `ENABLE_VERIFICATION_API`. When false, all `/api/v1/*` routes return HTTP 503. The `/health` endpoint is always available regardless of flag state.

**Frozen Response Schema (ADR-001):** The verification API response format is immutable once published. No field removals, type changes, or semantic changes without a new version prefix (`/api/v2/*`). Additive changes (new nullable fields) are allowed. The schema is defined in CLAUDE.md Section 10 and implemented in the `get_public_anchor` RPC (migration 0044).

**API Key Security Model:** Raw API keys are never stored. Keys are hashed with HMAC-SHA256 using `API_KEY_HMAC_SECRET` before persistence. On each request, the incoming key is hashed and compared against the stored hash. Key lifecycle events (create, revoke) are logged to `audit_events`.

**Rate Limiting Tiers:**
| Tier | Limit | Applies To |
|------|-------|-----------|
| Anonymous | 100 req/min per IP | Unauthenticated requests |
| API Key (Free) | 1,000 req/min per key | Free tier API keys |
| API Key (Paid) | Custom per plan | Paid tier API keys |
| Batch | 10 req/min per key | POST `/api/v1/verify/batch` |

## Existing Infrastructure

Significant foundational infrastructure already exists that P4.5 builds upon:

| Component | Status | Notes |
|-----------|--------|-------|
| Rate limiter middleware | Ready | `services/worker/src/utils/rateLimit.ts` (104 lines). In-memory store with configurable windows. Pre-configured `api` limiter exists. |
| Switchboard flags | Ready | `src/lib/switchboard.ts` + migration 0021. Flag table, history, `get_flag()` RPC. Just needs `ENABLE_VERIFICATION_API` entry. |
| Public verification RPC | Ready | `get_public_anchor()` (migration 0044). Returns frozen schema format. Granted to anon + authenticated. |
| Webhook delivery | Ready | `services/worker/src/webhooks/delivery.ts` (259 lines). HMAC signing, retry, idempotency. |
| Worker Express app | Ready | Health, Stripe webhook, job routes all working. Ready for `/api/v1/*` routes. |
| Worker DB utils | Ready | Supabase client, Pino logger, correlation ID, Zod config. |
| Proof package schema | Ready | `src/lib/proofPackage.ts` (171 lines). Zod-validated v1.0 format. |

## Dependency Chain

```
1. P4.5-TS-12 (Feature flag middleware) ← No dependencies
   |
2. P4.5-TS-03 (API keys + HMAC + rate limiting) ← P1-TS-03
   |
   ├── 3. P4.5-TS-01 (GET /verify/:publicId) ← P6-TS-01
   ├── 4. P4.5-TS-06 (GET /jobs/:jobId) ← P4.5-TS-03
   ├── 6. P4.5-TS-07 (Key CRUD endpoints) ← P4.5-TS-03
   └── 7. P4.5-TS-05 (Free tier enforcement) ← P4.5-TS-03
       |
5. P4.5-TS-02 (POST /verify/batch) ← P4.5-TS-01
       |
8. P4.5-TS-08 (GET /usage) ← P4.5-TS-05
       |
9. P4.5-TS-04 (OpenAPI docs) ← All above
       |
10. P4.5-TS-09 (API Key Management UI) ← P4.5-TS-07
11. P4.5-TS-10 (Usage Dashboard Widget) ← P4.5-TS-05
12. P4.5-TS-11 (Key Scope Display) ← P4.5-TS-09
13. P4.5-TS-13 (Load tests) ← All deployed
```

## File Placement (Planned)

```
services/worker/src/
  api/
    verify.ts              # GET /api/v1/verify/:publicId
    batch.ts               # POST /api/v1/verify/batch
    jobs.ts                # GET /api/v1/jobs/:jobId
    keys.ts                # POST/GET/PATCH/DELETE /api/v1/keys
  middleware/
    apiKeyAuth.ts          # API key extraction + HMAC validation
    featureGate.ts         # ENABLE_VERIFICATION_API enforcement
    usageTracking.ts       # Increment monthly usage counter
  schemas/
    api.ts                 # Zod schemas for API payloads
    types.ts               # TypeScript interfaces for API responses

src/components/
  ApiKeySettings.tsx       # Key management UI
  ApiUsageDashboard.tsx    # Usage display widget

src/pages/
  ApiKeySettingsPage.tsx   # Routed at /settings/api-keys

tests/load/                # K6 or Artillery load test scenarios
```

## Environment Variables (Required)

```bash
ENABLE_VERIFICATION_API=false    # Feature flag (default off)
API_KEY_HMAC_SECRET=             # HMAC-SHA256 secret for key hashing
CORS_ALLOWED_ORIGINS=*           # CORS configuration for API
```

---

## Stories

---

### P4.5-TS-12: Feature Flag Middleware

**Status:** NOT STARTED
**Dependencies:** None
**Blocked by:** Phase 1 launch

#### What This Story Delivers

Express middleware that gates all `/api/v1/*` routes behind the `ENABLE_VERIFICATION_API` switchboard flag. When the flag is false, all API routes return HTTP 503 Service Unavailable. The `/health` endpoint is always available.

#### What Exists

- Switchboard flag infrastructure (`switchboard_flags` table, `get_flag()` RPC)
- `ENABLE_VERIFICATION_API` referenced in CLAUDE.md but **not yet in the database**

#### What's Missing

- Flag entry in `switchboard_flags` seed data
- Express middleware function checking flag on each request
- 503 response format (JSON with `error` and `message`)

#### Acceptance Criteria

- [ ] `ENABLE_VERIFICATION_API` flag added to switchboard_flags (default: false)
- [ ] Middleware returns 503 for all `/api/v1/*` when flag is false
- [ ] `/health` always responds regardless of flag state
- [ ] Flag change takes effect without worker restart

---

### P4.5-TS-03: API Keys Table + HMAC + Rate Limiting

**Status:** NOT STARTED
**Dependencies:** P1-TS-03 (audit events)
**Blocked by:** P4.5-TS-12

#### What This Story Delivers

Database schema for API key management, HMAC-SHA256 key hashing middleware, and per-key rate limiting configuration.

#### What Exists

- Rate limiter middleware (`rateLimit.ts`) with configurable windows
- `audit_events` table for key lifecycle logging

#### What's Missing

- `api_keys` table: id, org_id, key_hash (HMAC-SHA256), name, scopes, rate_limit_tier, last_used_at, expires_at, is_active, created_at, created_by, revoked_at, revocation_reason
- `api_key_usage` table: org_id, month (YYYY-MM), request_count, last_reset_at
- API key extraction middleware (from `Authorization: Bearer` or `X-API-Key` header)
- HMAC-SHA256 comparison logic
- Per-key rate limit configuration
- RLS policies (users read own org's keys, service_role full access)

#### Acceptance Criteria

- [ ] `api_keys` table created with RLS
- [ ] `api_key_usage` table created for monthly quota tracking
- [ ] Raw keys never persisted — HMAC-SHA256 hash stored
- [ ] Key extraction from `Authorization: Bearer` and `X-API-Key` headers
- [ ] Rate limiting configured per key tier
- [ ] Key lifecycle events logged to `audit_events`

---

### P4.5-TS-01: GET /api/v1/verify/:publicId

**Status:** NOT STARTED
**Dependencies:** P6-TS-01 (get_public_anchor RPC)
**Blocked by:** P4.5-TS-03

#### What This Story Delivers

Single credential verification endpoint returning the frozen response schema.

#### What Exists

- `get_public_anchor()` RPC already returns data in frozen schema format
- Rate limiter middleware ready

#### What's Missing

- Express route handler
- Response formatting (match frozen schema exactly)
- API key authentication (optional — anonymous allowed at lower rate limit)
- Usage tracking increment

#### Acceptance Criteria

- [ ] GET `/api/v1/verify/:publicId` returns frozen schema response
- [ ] Anonymous access allowed at 100 req/min
- [ ] API key access at 1,000 req/min
- [ ] Rate limit headers on every response
- [ ] 404 for unknown publicId
- [ ] Verification event logged with method='api'

---

### P4.5-TS-02: POST /api/v1/verify/batch

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-01
**Blocked by:** P4.5-TS-03

#### What This Story Delivers

Batch verification endpoint accepting an array of public_ids and returning results for each. Rate limited to 10 req/min per API key.

#### Acceptance Criteria

- [ ] POST `/api/v1/verify/batch` accepts array of public_ids
- [ ] Returns array of verification results matching frozen schema
- [ ] Rate limited to 10 req/min per API key
- [ ] API key required (no anonymous batch access)
- [ ] Maximum batch size enforced
- [ ] Partial results on timeout (some verified, some pending)

---

### P4.5-TS-04: OpenAPI Documentation

**Status:** NOT STARTED
**Dependencies:** All API routes implemented
**Blocked by:** P4.5-TS-01, P4.5-TS-02, P4.5-TS-06, P4.5-TS-07, P4.5-TS-08

#### What This Story Delivers

OpenAPI/Swagger specification served at `/api/docs` documenting all API endpoints, request/response schemas, authentication, and rate limits.

#### Acceptance Criteria

- [ ] OpenAPI 3.0 spec generated from route definitions
- [ ] Swagger UI served at `/api/docs`
- [ ] All endpoints documented with request/response examples
- [ ] Authentication methods documented (API key, anonymous)
- [ ] Rate limiting documented per tier
- [ ] Frozen response schema included as VerificationResult component

---

### P4.5-TS-05: Free Tier Enforcement

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-03 (api_key_usage table)
**Blocked by:** P4.5-TS-03

#### What This Story Delivers

Monthly request quota enforcement for free tier API keys (10,000 requests/month). Returns HTTP 429 with upgrade instructions when quota exceeded.

#### Acceptance Criteria

- [ ] Monthly request counter tracked per org in `api_key_usage`
- [ ] Counter resets on 1st of each month
- [ ] HTTP 429 returned when free tier quota exceeded
- [ ] Response includes `upgrade_url` for plan change
- [ ] Paid tier keys exempt from monthly quota

---

### P4.5-TS-06: GET /api/v1/jobs/:jobId

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-03
**Blocked by:** P4.5-TS-03

#### What This Story Delivers

Batch job status polling endpoint. Returns the current state of a batch verification job (submitted, processing, complete, failed).

#### Acceptance Criteria

- [ ] GET `/api/v1/jobs/:jobId` returns job status
- [ ] Status values: submitted, processing, complete, failed
- [ ] Results included when status = complete
- [ ] API key required (must own the job)

---

### P4.5-TS-07: Key CRUD Endpoints

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-03 (api_keys table)
**Blocked by:** P4.5-TS-03

#### What This Story Delivers

REST endpoints for API key lifecycle management: create, list, update, and revoke.

#### Acceptance Criteria

- [ ] POST `/api/v1/keys` creates new key (returns raw key ONCE)
- [ ] GET `/api/v1/keys` lists org's keys (masked, never raw)
- [ ] PATCH `/api/v1/keys/:keyId` updates name, scopes
- [ ] DELETE `/api/v1/keys/:keyId` revokes key with optional reason
- [ ] All operations logged to `audit_events`
- [ ] RLS enforces org-scoped access

---

### P4.5-TS-08: GET /api/v1/usage

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-05 (usage tracking)
**Blocked by:** P4.5-TS-05

#### What This Story Delivers

Usage reporting endpoint showing current month's API request count, quota, and remaining allowance.

#### Acceptance Criteria

- [ ] GET `/api/v1/usage` returns current month usage
- [ ] Response includes: used, limit, remaining, reset_date
- [ ] API key required
- [ ] Scoped to requesting org

---

### P4.5-TS-09: API Key Management UI

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-07 (key CRUD endpoints)
**Blocked by:** P4.5-TS-07

#### What This Story Delivers

Frontend component for managing API keys: create, list, copy, revoke. Routed at `/settings/api-keys`.

#### Acceptance Criteria

- [ ] `ApiKeySettings.tsx` component created
- [ ] `ApiKeySettingsPage.tsx` routed at `/settings/api-keys`
- [ ] Create key dialog with name and scope selection
- [ ] Raw key shown once on creation with copy button
- [ ] Key list with masked keys, last used, status
- [ ] Revoke button with confirmation dialog
- [ ] Copy strings in `src/lib/copy.ts`

---

### P4.5-TS-10: API Usage Dashboard Widget

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-05 (usage tracking)
**Blocked by:** P4.5-TS-05

#### What This Story Delivers

Dashboard widget showing API usage for the current month with a progress bar and quota information.

#### Acceptance Criteria

- [ ] Widget component created
- [ ] Shows: requests used, limit, percentage, days remaining
- [ ] Progress bar with color thresholds (green/amber/red)
- [ ] Integrated into dashboard or settings page

---

### P4.5-TS-11: API Key Scope Display

**Status:** NOT STARTED
**Dependencies:** P4.5-TS-09 (key management UI)
**Blocked by:** P4.5-TS-09

#### What This Story Delivers

Visual display of API key scopes and permissions in the key management UI.

#### Acceptance Criteria

- [ ] Scope badges displayed per key
- [ ] Scope descriptions on hover
- [ ] Scope editing in key update flow

---

### P4.5-TS-13: Rate Limit Load Tests

**Status:** NOT STARTED
**Dependencies:** All API endpoints deployed
**Blocked by:** All other P4.5 stories

#### What This Story Delivers

Load testing suite validating rate limiting behavior, concurrent request handling, and performance under stress.

#### What Exists

- Nothing — `tests/load/` directory does not exist

#### Acceptance Criteria

- [ ] Load test framework selected and configured (K6, Artillery, or Autocannon)
- [ ] Spike test: burst above rate limit, verify 429 responses
- [ ] Sustained load test: hold at limit, verify consistent behavior
- [ ] Ramp-up test: gradual increase to identify breaking point
- [ ] Batch endpoint load test: verify 10 req/min enforcement
- [ ] Report generation with latency, throughput, error rate metrics

---

## Frozen Response Schema

```json
{
  "verified": true,
  "status": "ACTIVE | REVOKED | SUPERSEDED | EXPIRED",
  "issuer_name": "string",
  "recipient_identifier": "string (hashed, never raw PII)",
  "credential_type": "string",
  "issued_date": "string | null",
  "expiry_date": "string | null",
  "anchor_timestamp": "string",
  "bitcoin_block": "number | null",
  "network_receipt_id": "string | null",
  "merkle_proof_hash": "string | null",
  "record_uri": "https://app.arkova.io/verify/{public_id}",
  "jurisdiction": "string (omitted when null, not returned as null)"
}
```

**Immutability Rules:**
- No field removals
- No type changes
- No semantic changes
- Additive changes (new nullable fields) allowed
- Breaking changes require: v2+ URL prefix, 12-month deprecation notice, migration guide

---

## Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| All stories behind feature flag | API can be enabled/disabled without deployment |
| HMAC-SHA256 for key storage | Raw keys never at rest — only hash comparison |
| 503 when flag is false (not 404) | Communicates "service exists but is disabled" |
| Frozen schema immutability | API consumers depend on stable response format |
| record_uri uses HTTPS (ADR-001) | Universal browser/agent/HTTP client compatibility |
| Post-launch scheduling | Phase 1 launch is higher priority than API access |

## Related Documentation

- [12_verification_api.md](../confluence/12_verification_api.md) — Verification API architecture
- [13_switchboard.md](../confluence/13_switchboard.md) — Feature flag configuration
- [03_security_rls.md](../confluence/03_security_rls.md) — RLS patterns for new tables
- CLAUDE.md Section 10 — Frozen schema and build order

## Change Log

| Date | Change |
|------|--------|
| 2026-03-10 | Initial P4.5 story documentation created (Session 3 of 3). |
