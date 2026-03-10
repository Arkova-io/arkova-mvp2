# Arkova Story Documentation Index
_Last updated: 2026-03-10 5:20 PM EST_

## Overview

This directory contains architecture documentation for every story in the Arkova backlog. Stories are grouped by priority level, with one document per group. Each story includes: what it delivers, implementation files, database changes, security considerations, test coverage, acceptance criteria, known issues, and manual verification steps.

## Reading Order

For a new developer joining the project, read in this order:

1. **This index** — understand the story map and overall progress
2. **[CLAUDE.md](../../CLAUDE.md)** — engineering rules, Constitution, current sprint
3. **[01_architecture_overview.md](../confluence/01_architecture_overview.md)** — system architecture
4. **[02_data_model.md](../confluence/02_data_model.md)** — database schema
5. **Story docs below** — grouped by priority, in order

## Story Map

### Completion Summary

| Priority | Group | Stories | Complete | Partial | Not Started | Doc |
|----------|-------|---------|----------|---------|-------------|-----|
| P1 | Bedrock | 6 | 6 | 0 | 0 | [01_p1_bedrock.md](./01_p1_bedrock.md) |
| P2 | Identity & Access | 5 | 5 | 0 | 0 | [02_p2_identity.md](./02_p2_identity.md) |
| P3 | Vault & Dashboard | 3 | 3 | 0 | 0 | [03_p3_vault.md](./03_p3_vault.md) |
| P4-E1 | Anchor Engine | 3 | 3 | 0 | 0 | [04_p4e1_anchor_engine.md](./04_p4e1_anchor_engine.md) |
| P4-E2 | Credential Metadata | 3 | 3 | 0 | 0 | [05_p4e2_credential_metadata.md](./05_p4e2_credential_metadata.md) |
| P5 | Org Admin | 6 | 6 | 0 | 0 | [06_p5_org_admin.md](./06_p5_org_admin.md) |
| P6 | Verification | 6 | 4 | 2 | 0 | [07_p6_verification.md](./07_p6_verification.md) |
| P7 | Go-Live | 10 | 4 | 2 | 4 | [08_p7_go_live.md](./08_p7_go_live.md) |
| P4.5 | Verification API | 13 | 0 | 0 | 13 | [09_p45_verification_api.md](./09_p45_verification_api.md) |
| **Total** | | **55** | **34** | **4** | **17** | |

### All Stories by ID

| Story ID | Title | Status | Group Doc | Bug |
|----------|-------|--------|-----------|-----|
| P1-TS-01 | Core Enums | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P1-TS-02 | Core Tables (orgs, profiles, anchors) | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P1-TS-03 | Audit Events (append-only) | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P1-TS-04 | RLS Policies (all tables) | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P1-TS-05 | Zod Validators | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P1-TS-06 | Validation-on-Insert Wiring | COMPLETE | [P1](./01_p1_bedrock.md) | — |
| P2-TS-03 | React Router + Named Routes | COMPLETE | [P2](./02_p2_identity.md) | CRIT-4 |
| P2-TS-04 | AuthGuard + RouteGuard | COMPLETE | [P2](./02_p2_identity.md) | CRIT-4 |
| P2-TS-05 | useProfile Hook + DB Persistence | COMPLETE | [P2](./02_p2_identity.md) | — |
| P2-TS-06 | useOrganization Hook + OrgSettingsPage | COMPLETE | [P2](./02_p2_identity.md) | — |
| P2-TS-0X | Auth Forms + Onboarding Components | COMPLETE | [P2](./02_p2_identity.md) | CRIT-4 |
| P3-TS-01 | Dashboard + VaultDashboard (real queries) | COMPLETE | [P3](./03_p3_vault.md) | — |
| P3-TS-02 | Privacy Toggle (is_public_profile) | COMPLETE | [P3](./03_p3_vault.md) | — |
| P3-TS-03 | Sidebar Navigation | COMPLETE | [P3](./03_p3_vault.md) | — |
| P4-TS-01 | ConfirmAnchorModal (upload + insert) | COMPLETE | [P4-E1](./04_p4e1_anchor_engine.md) | CRIT-1 |
| P4-TS-02 | AssetDetailView (record display) | COMPLETE | [P4-E1](./04_p4e1_anchor_engine.md) | — |
| P4-TS-03 | RecordDetailPage (/records/:id) | COMPLETE | [P4-E1](./04_p4e1_anchor_engine.md) | — |
| P4-TS-04 | credential_type Enum + Column | COMPLETE | [P4-E2](./05_p4e2_credential_metadata.md) | — |
| P4-TS-05 | metadata JSONB + Editability Trigger | COMPLETE | [P4-E2](./05_p4e2_credential_metadata.md) | — |
| P4-TS-06 | parent_anchor_id + version_number Lineage | COMPLETE | [P4-E2](./05_p4e2_credential_metadata.md) | — |
| P5-TS-01 | OrgRegistryTable (filter, search, export) | COMPLETE | [P5](./06_p5_org_admin.md) | — |
| P5-TS-02 | RevokeDialog (reason + DB persist) | COMPLETE | [P5](./06_p5_org_admin.md) | — |
| P5-TS-03 | MembersTable (real Supabase query) | COMPLETE | [P5](./06_p5_org_admin.md) | — |
| P5-TS-05 | public_id Auto-Generation | COMPLETE | [P5](./06_p5_org_admin.md) | — |
| P5-TS-06 | BulkUploadWizard (credential_type + metadata) | COMPLETE | [P5](./06_p5_org_admin.md) | CRIT-6 |
| P5-TS-07 | credential_templates CRUD + Manager UI | COMPLETE | [P5](./06_p5_org_admin.md) | — |
| P6-TS-01 | get_public_anchor RPC + PublicVerification | COMPLETE | [P6](./07_p6_verification.md) | — |
| P6-TS-02 | QR Code in AssetDetailView | COMPLETE | [P6](./07_p6_verification.md) | — |
| P6-TS-03 | Embeddable VerificationWidget | PARTIAL | [P6](./07_p6_verification.md) | — |
| P6-TS-04 | Credential Lifecycle on Public Page | PARTIAL | [P6](./07_p6_verification.md) | — |
| P6-TS-05 | PDF Audit Report (jsPDF) | COMPLETE | [P6](./07_p6_verification.md) | — |
| P6-TS-06 | verification_events Table + RPC | COMPLETE | [P6](./07_p6_verification.md) | — |
| P7-TS-01 | Billing Schema (migration 0016) | COMPLETE | [P7](./08_p7_go_live.md) | — |
| P7-TS-02 | Stripe Checkout Flow | NOT STARTED | [P7](./08_p7_go_live.md) | CRIT-3 |
| P7-TS-03 | Stripe Webhook Verification | COMPLETE | [P7](./08_p7_go_live.md) | — |
| P7-TS-05 | Bitcoin Chain Client | NOT STARTED | [P7](./08_p7_go_live.md) | CRIT-2 |
| P7-TS-07 | Proof Package Download | PARTIAL | [P7](./08_p7_go_live.md) | CRIT-5 |
| P7-TS-08 | PDF Certificate (generateAuditReport) | COMPLETE | [P7](./08_p7_go_live.md) | — |
| P7-TS-09 | Webhook Settings UI | PARTIAL | [P7](./08_p7_go_live.md) | — |
| P7-TS-10 | Webhook Delivery Engine | COMPLETE | [P7](./08_p7_go_live.md) | — |
| P4.5-TS-01 | GET /api/v1/verify/:publicId | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-02 | POST /api/v1/verify/batch | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-03 | API Keys Table + HMAC + Rate Limiting | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-04 | OpenAPI Docs (/api/docs) | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-05 | Free Tier Enforcement (10K/month) | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-06 | GET /api/v1/jobs/:jobId | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-07 | Key CRUD Endpoints | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-08 | GET /api/v1/usage | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-09 | API Key Management UI | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-10 | API Usage Dashboard Widget | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-11 | API Key Scope Display | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-12 | Feature Flag Middleware | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |
| P4.5-TS-13 | Rate Limit Load Tests | NOT STARTED | [P4.5](./09_p45_verification_api.md) | — |

## Bug Cross-Reference

See [docs/bugs/bug_log.md](../bugs/bug_log.md) for full details on all bugs (including layman's summaries).

### Active Bugs

| Bug ID | Severity | Affects Stories | Summary |
|--------|----------|-----------------|---------|
| CRIT-1 | HIGH | P4-TS-01 | SecureDocumentDialog fakes anchor creation (setTimeout, no Supabase insert) |
| CRIT-2 | HIGH | P7-TS-05 | No real Bitcoin chain client (MockChainClient in all code paths) |
| CRIT-3 | HIGH | P7-TS-02 | No Stripe checkout flow (SDK initialized, no session endpoint) |
| CRIT-4 | MEDIUM | P2-TS-03, P2-TS-04, P2-TS-0X | Onboarding routes render DashboardPage placeholder |
| CRIT-5 | MEDIUM | P7-TS-07 | JSON proof download is no-op (PDF works) |
| CRIT-6 | MEDIUM | P5-TS-06 | CSVUploadWizard uses simulated processing |

### Resolved Bugs

| Bug ID | Severity | Resolution | Summary |
|--------|----------|------------|---------|
| CRIT-7 | LOW | FIXED 2026-03-10 | Browser tab says "Ralph" instead of "Arkova" |
| BUG-H1-01 | MEDIUM | FIXED 2026-03-10 | Silent audit event failure in processAnchor() |
| BUG-H1-02 | HIGH | REMOVED 2026-03-10 | Dead code (anchorWithClaim.ts) with nonexistent schema refs |
| BUG-H1-03 | HIGH | REMOVED 2026-03-10 | Batch loop bug in same dead code file |

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) — Engineering rules, Constitution, story status (Section 8)
- [MEMORY.md](../../MEMORY.md) — Living state, blockers, sprint context
- [docs/confluence/](../confluence/) — Architecture, data model, security, audit trail
- [docs/bugs/bug_log.md](../bugs/bug_log.md) — Full bug details with reproduction steps

## Document Conventions

Each story doc follows a consistent template:

- **Group Overview** — What the priority group delivers, shared architecture context
- **Per-Story Sections** — Status, dependencies, what it delivers, files, DB changes, security, tests, acceptance criteria, known issues, manual verification
- **PARTIAL stories** include "Completion Gaps" and "Remaining Work" sections
- **NOT STARTED stories** (P4.5) include requirements summary, planned file placement, and frozen contract references

## Change Log

| Date | Change |
|------|--------|
| 2026-03-10 | Initial index created. P1 and P2 story docs written (Session 1 of 3). |
| 2026-03-10 4:15 PM EDT | Added resolved bugs (BUG-H1-01, BUG-H1-02, BUG-H1-03) to cross-reference. Split bug table into Active/Resolved sections. |
