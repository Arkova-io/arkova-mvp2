# P4-E2 Credential Metadata — Story Documentation
_Last updated: 2026-03-10 | 3/3 stories COMPLETE_

## Group Overview

P4-E2 Credential Metadata extends the anchors table with rich credential classification. Three migrations (0029-0032) add a `credential_type` enum, a `metadata` JSONB column with editability controls, and a `parent_anchor_id` + `version_number` lineage system for credential versioning. These features are fully integrated into validators, UI components, CSV import, and credential templates.

> **Note:** The Technical Backlog PDF marks these stories as "NOT STARTED". This is incorrect. All three are implemented and deployed — see migrations 0029-0032 and the component integrations below.

Key deliverables:
- `credential_type` enum (6 values) with column, index, Zod validation, and UI labels
- `metadata` JSONB with CHECK constraint (must be object), editability trigger (PENDING-only edits)
- `parent_anchor_id` self-referencing FK + `version_number` auto-computation with lineage guards

## Architecture Context

**Design Principle: Schema-Enforced Invariants.** Every metadata rule is enforced at the database level (CHECK, TRIGGER, FK), not just in application code. The editability trigger prevents metadata tampering after an anchor leaves PENDING status. The lineage constraints prevent circular references and version number manipulation.

**Credential Type Taxonomy:**
| Value | Label | Description |
|-------|-------|-------------|
| DEGREE | Degree | Academic degree (Bachelor's, Master's, Doctorate) |
| LICENSE | License | Professional or occupational license |
| CERTIFICATE | Certificate | Certificate of completion or achievement |
| TRANSCRIPT | Transcript | Academic transcript or record of courses |
| PROFESSIONAL | Professional Credential | Professional certification or accreditation |
| OTHER | Other | Other credential type |

---

## Stories

---

### P4-TS-04: credential_type Enum + Column

**Status:** COMPLETE
**Dependencies:** P1-TS-02 (anchors table)
**Blocked by:** None

#### What This Story Delivers

Adds a typed classification system for anchored credentials. A new `credential_type` PostgreSQL enum restricts values to a controlled vocabulary. The column is nullable (existing anchors pre-date the enum) and indexed for efficient filtering.

#### Implementation Files

| Layer | File | Lines | Purpose |
|-------|------|-------|---------|
| Migration | `supabase/migrations/0029_credential_type.sql` | 57 | CREATE TYPE + ALTER TABLE + index |
| Validator | `src/lib/validators.ts` | 363 | `CREDENTIAL_TYPES` array, enum validation in `AnchorCreateSchema` + `AnchorUpdateSchema` |
| Copy | `src/lib/copy.ts` | — | `CREDENTIAL_TYPE_LABELS` + `CREDENTIAL_TYPE_DESCRIPTIONS` |
| Types | `src/types/database.types.ts` | — | Auto-generated enum type |

#### Database Changes

| Object | Type | Migration | Description |
|--------|------|-----------|-------------|
| `credential_type` | ENUM | 0029 | Values: DEGREE, LICENSE, CERTIFICATE, TRANSCRIPT, PROFESSIONAL, OTHER |
| `credential_type` | Column | 0029 | Added to `anchors` table. Nullable, no default (existing records have NULL). |
| `idx_anchors_credential_type` | Index | 0029 | B-tree index for filtering by credential type |

#### Integration Points

| Component | How It Uses credential_type |
|-----------|---------------------------|
| `IssueCredentialForm` | Select dropdown for org admin anchor creation |
| `AssetDetailView` | Badge display with `CREDENTIAL_TYPE_LABELS` |
| `BulkUploadWizard` | Optional CSV column mapping |
| `CsvUploader` | Validation against `VALID_CREDENTIAL_TYPES` |
| `CredentialTemplatesManager` | Template default credential type |
| `PublicVerification` | Display on public verification page |
| `OrgRegistryTable` | Display in record list |

#### Security Considerations

- Enum type enforced at DB level — invalid values rejected by PostgreSQL regardless of client validation
- Nullable by design — does not break existing anchors or require backfill

#### Test Coverage

| Test File | Type | What It Validates |
|-----------|------|-------------------|
| `src/lib/validators.test.ts` | Unit | Valid/invalid credential_type values accepted/rejected by Zod |

**Untested areas:** DB-level enum constraint rejection (validated indirectly).

#### Acceptance Criteria

- [x] `credential_type` enum created with 6 values
- [x] Column added to `anchors` table (nullable)
- [x] Index created for filtering
- [x] Zod validators updated (`CREDENTIAL_TYPES` array, enum validation)
- [x] UI labels and descriptions in `copy.ts`
- [x] Types regenerated in `database.types.ts`

#### Known Issues

None.

#### How to Verify (Manual)

1. Start local Supabase: `supabase start && supabase db reset`
2. Connect to DB: `psql postgresql://postgres:postgres@localhost:54322/postgres`
3. Run: `SELECT unnest(enum_range(NULL::credential_type));` — expect 6 values
4. Run: `\d anchors` — verify `credential_type` column exists
5. Run: `INSERT INTO anchors (user_id, fingerprint, filename, credential_type) VALUES (...)` with invalid type — expect error

---

### P4-TS-05: metadata JSONB + Editability Trigger

**Status:** COMPLETE
**Dependencies:** P4-TS-04 (credential_type for context)
**Blocked by:** None

#### What This Story Delivers

Adds a flexible `metadata` JSONB column to anchors for arbitrary key-value credential data (e.g., institution name, degree field, GPA). A CHECK constraint ensures metadata is always a JSON object (not array or scalar). A trigger prevents metadata modification after the anchor leaves PENDING status — once secured, metadata is frozen.

#### Implementation Files

| Layer | File | Lines | Purpose |
|-------|------|-------|---------|
| Migration | `supabase/migrations/0030_metadata_jsonb.sql` | 75 | Column + CHECK + editability trigger |
| Validator | `src/lib/validators.ts` | 363 | Custom Zod validator: `typeof === 'object' && !Array.isArray()` |

#### Database Changes

| Object | Type | Migration | Description |
|--------|------|-----------|-------------|
| `metadata` | Column | 0030 | JSONB, nullable, on `anchors` table |
| `anchors_metadata_is_object` | CHECK | 0030 | Rejects arrays and scalars — metadata must be a JSON object or NULL |
| `prevent_metadata_edit_after_secured()` | Function | 0030 | BEFORE UPDATE trigger: blocks metadata changes when status != PENDING |
| `prevent_metadata_edit_trigger` | Trigger | 0030 | Fires on UPDATE of `anchors` — calls protection function |

#### Editability Rule

```
IF OLD.status != 'PENDING' AND NEW.metadata IS DISTINCT FROM OLD.metadata
THEN RAISE EXCEPTION 'Metadata cannot be modified after anchor is secured'
```

This means:
- PENDING anchors: metadata freely editable
- SECURED/REVOKED/EXPIRED anchors: metadata frozen
- Status transition itself is not blocked by this trigger (that's handled by `protect_anchor_status_transition()`)

#### Security Considerations

- **Immutability after securing:** Once an anchor is secured on-chain, its metadata cannot be retroactively altered. This preserves the integrity of the attestation.
- **CHECK constraint:** Even if application validation is bypassed, PostgreSQL rejects non-object metadata
- **Trigger-enforced:** Database-level enforcement — not just application-level

#### Test Coverage

| Test File | Type | What It Validates |
|-----------|------|-------------------|
| `src/lib/validators.test.ts` | Unit | Zod rejects arrays and scalars for metadata field |

**Untested areas:** Trigger-level enforcement (SECURED anchor metadata modification blocked).

#### Acceptance Criteria

- [x] `metadata` JSONB column added to anchors
- [x] CHECK constraint rejects arrays and scalars
- [x] Trigger blocks metadata edits on non-PENDING anchors
- [x] Zod validator mirrors CHECK constraint
- [x] PENDING anchors allow free metadata editing
- [x] Rollback SQL provided in migration

#### Known Issues

None.

#### How to Verify (Manual)

1. Start local Supabase: `supabase start && supabase db reset`
2. Insert a PENDING anchor with metadata: `INSERT INTO anchors (..., metadata) VALUES (..., '{"field": "CS"}'::jsonb);`
3. Update metadata while PENDING: `UPDATE anchors SET metadata = '{"field": "EE"}' WHERE id = ...;` — expect success
4. Change status to SECURED (via service_role): `UPDATE anchors SET status = 'SECURED', chain_tx_id = 'test' WHERE id = ...;`
5. Try to update metadata again: `UPDATE anchors SET metadata = '{"field": "tampered"}' WHERE id = ...;` — expect error
6. Try inserting array metadata: `INSERT INTO anchors (..., metadata) VALUES (..., '[1,2,3]'::jsonb);` — expect CHECK violation

---

### P4-TS-06: parent_anchor_id + version_number Lineage

**Status:** COMPLETE
**Dependencies:** P4-TS-04, P4-TS-05 (metadata context)
**Blocked by:** None

#### What This Story Delivers

A versioning system for credentials. An anchor can reference a `parent_anchor_id` (self-referencing FK), and the `version_number` is auto-computed on INSERT (parent's version + 1). Constraints prevent circular references, enforce v1 for root anchors, and protect lineage fields from modification after creation. Two migrations implement this: 0031 for the columns/triggers and 0032 for FK tightening and UPDATE guards.

#### Implementation Files

| Layer | File | Lines | Purpose |
|-------|------|-------|---------|
| Migration | `supabase/migrations/0031_anchor_lineage.sql` | 111 | Columns + constraints + auto-version trigger |
| Migration | `supabase/migrations/0032_fix_lineage_constraints.sql` | 114 | FK action fix + UPDATE guards |

#### Database Changes

**Migration 0031:**

| Object | Type | Migration | Description |
|--------|------|-----------|-------------|
| `parent_anchor_id` | Column | 0031 | UUID, nullable, self-referencing FK to `anchors.id` |
| `version_number` | Column | 0031 | Integer, NOT NULL, DEFAULT 1 |
| `anchors_version_positive` | CHECK | 0031 | `version_number >= 1` |
| `anchors_lineage_root_is_v1` | CHECK | 0031 | `parent_anchor_id IS NULL → version_number = 1` |
| `anchors_no_self_reference` | CHECK | 0031 | `parent_anchor_id != id` |
| `idx_anchors_parent_anchor_id` | Index | 0031 | B-tree for lineage lookups |
| `set_anchor_version_number()` | Function | 0031 | BEFORE INSERT: computes version from parent |
| `set_anchor_version_trigger` | Trigger | 0031 | Fires on INSERT to auto-set version |

**Migration 0032:**

| Object | Type | Migration | Description |
|--------|------|-----------|-------------|
| FK action change | Constraint | 0032 | `parent_anchor_id` FK: ON DELETE SET NULL → ON DELETE RESTRICT |
| UPDATE guards | Trigger update | 0032 | Added to `protect_anchor_status_transition()`: blocks client modification of `parent_anchor_id` and `version_number` |

#### Version Auto-Computation Logic

```sql
-- In set_anchor_version_number():
IF NEW.parent_anchor_id IS NOT NULL THEN
  SELECT version_number INTO parent_version
  FROM anchors WHERE id = NEW.parent_anchor_id;
  NEW.version_number := parent_version + 1;
ELSE
  NEW.version_number := 1;  -- Root anchor
END IF;
```

#### Security Considerations

- **ON DELETE RESTRICT:** Prevents orphaning version chains — parent cannot be hard-deleted while children exist
- **UPDATE guards:** `parent_anchor_id` and `version_number` are immutable after INSERT — prevents reparenting attacks
- **Self-reference prevention:** CHECK constraint blocks `parent_anchor_id = id` (circular reference)
- **Lineage integrity:** Root anchors (no parent) are always v1; children are always parent_version + 1

#### Test Coverage

| Test File | Type | What It Validates |
|-----------|------|-------------------|
| — | — | No dedicated lineage tests |

**Untested areas:** Version auto-computation, circular reference prevention, FK RESTRICT behavior, UPDATE guard enforcement. These should be tested in integration tests.

#### Acceptance Criteria

- [x] `parent_anchor_id` column added (nullable, self-referencing FK)
- [x] `version_number` column added (integer, default 1)
- [x] Root anchors enforced as v1 (CHECK constraint)
- [x] Version auto-computed on INSERT from parent
- [x] Self-reference blocked (CHECK constraint)
- [x] FK uses ON DELETE RESTRICT (not SET NULL)
- [x] UPDATE guards block client modification of lineage fields
- [x] Rollback SQL provided in both migrations

#### Known Issues

None.

#### How to Verify (Manual)

1. Start local Supabase: `supabase start && supabase db reset`
2. Create a root anchor (no parent): verify `version_number = 1`
3. Create a child anchor with `parent_anchor_id = <root_id>`: verify `version_number = 2`
4. Create a grandchild with `parent_anchor_id = <child_id>`: verify `version_number = 3`
5. Try self-reference: `INSERT INTO anchors (..., parent_anchor_id) VALUES (..., <same_id>);` — expect CHECK violation
6. Try to UPDATE `parent_anchor_id` on existing anchor — expect trigger rejection
7. Try to DELETE parent while child exists — expect FK RESTRICT error

---

## Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Enum for credential_type (not free-text) | Controlled vocabulary prevents typos and enables filtering |
| JSONB for metadata (not separate table) | Flexible key-value pairs without schema migrations for each field |
| Metadata frozen after PENDING | Integrity — secured attestation must not be retroactively modified |
| Auto-computed version_number | Prevents client manipulation of version numbering |
| ON DELETE RESTRICT for lineage FK | Orphan prevention — version chains must be intact |
| Two migrations (0031 + 0032) for lineage | 0031 established columns; 0032 fixed FK action after review |

## Migration Inventory

| Migration | Story | Description |
|-----------|-------|-------------|
| 0029 | P4-TS-04 | `credential_type` enum + column + index |
| 0030 | P4-TS-05 | `metadata` JSONB + CHECK + editability trigger |
| 0031 | P4-TS-06 | `parent_anchor_id` + `version_number` + auto-version trigger |
| 0032 | P4-TS-06 | FK RESTRICT + UPDATE guards on lineage fields |

## Related Documentation

- [02_data_model.md](../confluence/02_data_model.md) — Anchors table schema (updated for credential metadata)
- [03_security_rls.md](../confluence/03_security_rls.md) — Trigger-based field protection
- [04_p4e1_anchor_engine.md](./04_p4e1_anchor_engine.md) — Anchor creation flow that populates these fields

## Change Log

| Date | Change |
|------|--------|
| 2026-03-10 | Initial P4-E2 story documentation created (Session 2 of 3). |
