# Arkova Bug Log
_Last updated: 2026-03-10 | Active bugs: 7 | Resolved: 0_

## Active Bugs Summary

| ID | Severity | Story | Summary | Status |
|----|----------|-------|---------|--------|
| CRIT-1 | HIGH | P4-E1 | SecureDocumentDialog fakes anchor creation | OPEN |
| CRIT-2 | HIGH | P7-TS-05 | No real Bitcoin chain client | OPEN |
| CRIT-3 | HIGH | P7-TS-02 | No Stripe checkout flow | OPEN |
| CRIT-4 | MEDIUM | P2 | Onboarding routes are placeholders | OPEN |
| CRIT-5 | MEDIUM | P7-TS-07 | JSON proof download is no-op | OPEN |
| CRIT-6 | MEDIUM | P5-TS-06 | CSVUploadWizard uses simulated processing | OPEN |
| CRIT-7 | LOW | — | Browser tab says "Ralph" | OPEN |

---

## Bug Details

---

### CRIT-1: SecureDocumentDialog Fakes Anchor Creation

- **Severity:** HIGH (production blocker)
- **Found:** 2026-03-10, codebase audit
- **Story:** P4-E1-TS-01 (affects individual user path only)
- **Component:** `src/components/anchor/SecureDocumentDialog.tsx`

#### Steps to Reproduce

1. Start local Supabase: `supabase start`
2. Reset database: `supabase db reset`
3. Login as `individual@demo.arkova.io` / `Demo1234!`
4. Navigate to Dashboard
5. Click "Secure Document" (opens SecureDocumentDialog)
6. Select any PDF file, confirm the anchor
7. Observe: UI shows progress animation and success after ~1.5 seconds
8. Query `anchors` table: `SELECT * FROM anchors WHERE user_id = '33333333-0000-0000-0000-000000000001' ORDER BY created_at DESC LIMIT 1;`
9. **Result:** No new row was inserted

#### Expected Behavior

Anchor row inserted into `anchors` table via Supabase client with status `PENDING`, matching the pattern in `IssueCredentialForm.tsx`: `validateAnchorCreate()` -> `supabase.from('anchors').insert()` -> `logAuditEvent()`.

#### Actual Behavior

`SecureDocumentDialog.tsx` lines 49-69 use `setTimeout` to simulate success:

```typescript
// Simulate anchor creation process
for (let i = 0; i <= 100; i += 20) {
  await new Promise(resolve => setTimeout(resolve, 300));
  setProgress(i);
}
setStep('success');
```

No Supabase call is made. The file fingerprint is computed correctly by `FileUpload` but never persisted.

#### Root Cause

Component was built as a UI prototype before the Supabase schema existed. Never updated to use real database calls. The org admin path (`IssueCredentialForm`) was built later with real integration.

#### Fix Pattern

Follow `src/components/organization/IssueCredentialForm.tsx` (lines 89-155):

1. Import `supabase` from `@/lib/supabase`
2. Call `validateAnchorCreate()` from `@/lib/validators`
3. `supabase.from('anchors').insert({ ...validated, user_id: user.id }).select('id').single()`
4. Call `logAuditEvent()` on success
5. Remove `setTimeout` simulation and fake progress loop

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. Documented in CLAUDE.md Section 8. |

#### Resolution

**Status:** OPEN

#### Regression Test

- Existing: `src/components/anchor/ConfirmAnchorModal.test.tsx` (covers the shared confirm modal)
- Needed: Integration test for `SecureDocumentDialog` that verifies anchor row appears in DB after submit

---

### CRIT-2: No Real Bitcoin Chain Client

- **Severity:** HIGH (production blocker)
- **Found:** 2026-03-10, codebase audit
- **Story:** P7-TS-05
- **Component:** `services/worker/src/chain/client.ts`

#### Steps to Reproduce

1. Read `services/worker/src/chain/client.ts` line 15-23
2. Observe: `getChainClient()` returns `MockChainClient` in all code paths, including when `config.useMocks = false`
3. No `bitcoinjs-lib` dependency in `services/worker/package.json`

#### Expected Behavior

When `BITCOIN_NETWORK=mainnet` and `BITCOIN_TREASURY_WIF` is set, `getChainClient()` should return a real chain client that constructs OP_RETURN transactions, signs via AWS KMS, and submits to Bitcoin network.

#### Actual Behavior

```typescript
export function getChainClient(): ChainClient {
  if (config.useMocks || config.nodeEnv === 'test') {
    return new MockChainClient();
  }
  // TODO: Implement real chain client
  return new MockChainClient();
}
```

All paths return `MockChainClient` which uses `setTimeout(resolve, 100)` to simulate network calls, increments a fake block counter, and stores data in an in-memory Map.

#### Root Cause

Real Bitcoin integration was deferred. The interface contract exists (`ChainClient` in `types.ts`) but no implementation. Decision made to harden worker tests first (2026-03-10) before implementing real chain client.

#### Fix Pattern

1. Install `bitcoinjs-lib` in `services/worker/`
2. Create `services/worker/src/chain/real.ts` implementing `ChainClient` interface
3. Construct OP_RETURN transactions with document fingerprint
4. Sign via `BITCOIN_TREASURY_WIF` env var (later: AWS KMS)
5. Submit to Bitcoin network (Signet first, then Mainnet)
6. Update `getChainClient()` factory to return real client when not in test/mock mode
7. Gate behind `ENABLE_PROD_NETWORK_ANCHORING` switchboard flag

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. Decision: worker hardening sprint first (0% test coverage). |

#### Resolution

**Status:** OPEN — Blocked by worker hardening (Week 1), scheduled for Weeks 2-3.

#### Regression Test

- Needed: `ChainClient` interface contract test (mock and real both satisfy same interface)
- Needed: Integration test: PENDING -> job claimed -> chain submitted -> SECURED

---

### CRIT-3: No Stripe Checkout Flow

- **Severity:** HIGH (production blocker)
- **Found:** 2026-03-10, codebase audit
- **Story:** P7-TS-02
- **Components:** `services/worker/src/stripe/client.ts`, `services/worker/src/stripe/handlers.ts`, `src/components/billing/BillingOverview.tsx`

#### Steps to Reproduce

1. Login as any user
2. Navigate to settings — no billing/upgrade option is available
3. `BillingOverview.tsx` exists but is not routed to any page
4. No `/api/stripe/checkout` endpoint exists in worker
5. `handlers.ts` webhook handlers have database update logic commented out

#### Expected Behavior

Users can view pricing, select a plan, enter payment via Stripe Checkout, and have their subscription activated. Webhook handlers persist subscription data to profiles table.

#### Actual Behavior

- Stripe SDK is initialized in `client.ts` (line 21)
- `verifyWebhookSignature()` works (lines 34-51)
- Webhook handlers exist but database updates are commented out (lines 52-66)
- `isEventProcessed()` always returns `false` (no idempotency)
- `BillingOverview.tsx` renders but is orphaned (not routed, no data source)
- No checkout session creation endpoint

#### Root Cause

Billing was scaffolded (schema in migration 0016, SDK initialized, webhook verification) but the end-to-end checkout flow was never completed.

#### Fix Pattern

1. Create worker endpoint: `POST /api/stripe/checkout` calling `stripe.checkout.sessions.create()`
2. Define pricing plans in Stripe Dashboard
3. Add `stripe_customer_id`, `stripe_subscription_id` columns to profiles (new migration)
4. Uncomment database updates in `handlers.ts`
5. Implement `isEventProcessed()` for idempotent webhook handling
6. Route `BillingOverview` on a settings sub-page with real subscription data
7. Connect `onUpgrade()` callback to redirect to Stripe Checkout URL

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. |

#### Resolution

**Status:** OPEN — Scheduled for Weeks 1-2.

#### Regression Test

- Needed: Stripe webhook handler unit tests with mock Stripe events
- Needed: Checkout session creation test with mock Stripe SDK

---

### CRIT-4: Onboarding Routes Are Placeholders

- **Severity:** MEDIUM
- **Found:** 2026-03-10, codebase audit
- **Story:** P2 Identity (onboarding)
- **Component:** `src/App.tsx` (lines 95-130)

#### Steps to Reproduce

1. Create a new user account (signup)
2. Confirm email
3. Login — `useProfile` computes destination as `/onboarding/role`
4. Route guard redirects to `/onboarding/role`
5. **Result:** User sees the Dashboard page instead of role selection UI

#### Expected Behavior

- `/onboarding/role` renders `RoleSelector` component
- `/onboarding/org` renders `OrgOnboardingForm` component
- `/review-pending` renders `ManualReviewGate` component

#### Actual Behavior

All three routes in `App.tsx` render `<DashboardPage />` with TODO comments:

```typescript
<Route path={ROUTES.ONBOARDING_ROLE} element={
  <AuthGuard><RouteGuard allow={['/onboarding/role']}>
    {/* TODO: Wire OnboardingRolePage when implemented */}
    <DashboardPage />
  </RouteGuard></AuthGuard>
} />
```

#### Root Cause

Routes were scaffolded with placeholders. The actual components (`RoleSelector`, `OrgOnboardingForm`, `ManualReviewGate`) were built later but never wired into the router.

#### Fix Pattern

1. Create thin page wrappers in `src/pages/`:
   - `OnboardingRolePage.tsx` → renders `<RoleSelector onSelect={...} />`
   - `OnboardingOrgPage.tsx` → renders `<OrgOnboardingForm onSubmit={...} />`
   - `ReviewPendingPage.tsx` → renders `<ManualReviewGate />`
2. Import into `App.tsx` and replace `<DashboardPage />` on lines 102, 113, 126
3. Connect `RoleSelector.onSelect` to `useOnboarding().setRole()`
4. Connect `OrgOnboardingForm.onSubmit` to `useOnboarding().createOrg()`
5. Test: new user signup → role selection → org form (if ORG_ADMIN) → dashboard

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. Components confirmed to exist and be production-ready. |

#### Resolution

**Status:** OPEN — Quick fix (sub-day task).

#### Regression Test

- Existing: `e2e/onboarding.spec.ts` (9 tests), `e2e/route-guards.spec.ts` (8 tests)
- These tests will validate the fix once routes are wired

---

### CRIT-5: JSON Proof Package Download Is No-Op

- **Severity:** MEDIUM
- **Found:** 2026-03-10, codebase audit
- **Story:** P7-TS-07
- **Components:** `src/components/public/ProofDownload.tsx`, `src/lib/proofPackage.ts`

#### Steps to Reproduce

1. Login as `admin@umich-demo.arkova.io` / `Demo1234!`
2. Navigate to a SECURED anchor detail page (e.g., Maya Chen's BS Computer Science)
3. Find the proof download section
4. Click "PDF Certificate" — works, downloads PDF
5. Click "JSON Data" — nothing happens

#### Expected Behavior

Clicking "JSON Data" triggers download of a structured JSON proof package containing fingerprint, chain receipt, timestamps, and issuer information.

#### Actual Behavior

`ProofDownload.tsx` renders two buttons. The `onDownloadJSON` callback prop is either not provided by the parent component or provided as a no-op. The `downloadProofPackage()` function in `proofPackage.ts` (lines 158-170) exists and works — it creates a Blob, generates a URL, and triggers download — but no caller invokes it.

#### Root Cause

The PDF path was completed (`generateAuditReport.ts`), but the JSON path was never connected. `proofPackage.ts` has the generator and downloader functions, but the parent component never wires `onDownloadJSON` to call them.

#### Fix Pattern

In the parent component where `<ProofDownload>` is rendered:

```typescript
import { generateProofPackage, downloadProofPackage } from '@/lib/proofPackage';

const handleJsonDownload = () => {
  const pkg = generateProofPackage(anchor);
  downloadProofPackage(pkg, `arkova-proof-${anchor.public_id}.json`);
};

<ProofDownload
  proof={proof}
  onDownloadPDF={handlePdfDownload}
  onDownloadJSON={handleJsonDownload}
/>
```

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. Functions confirmed to exist in proofPackage.ts. |

#### Resolution

**Status:** OPEN — Scheduled for Weeks 1-2.

#### Regression Test

- Needed: Unit test verifying `generateProofPackage()` returns valid schema
- Needed: Integration test verifying JSON download triggers on button click

---

### CRIT-6: CSVUploadWizard Uses Simulated Processing

- **Severity:** MEDIUM
- **Found:** 2026-03-10, codebase audit
- **Story:** P5-TS-06
- **Components:** `src/components/upload/CSVUploadWizard.tsx`, `src/hooks/useBulkAnchors.ts`

#### Steps to Reproduce

1. Login as `admin@umich-demo.arkova.io` / `Demo1234!`
2. Navigate to Organization page
3. Open the CSV Upload Wizard
4. Upload any CSV file
5. **Result:** Wizard shows hardcoded mock columns (`filename`, `fingerprint`, `size`, `description`) regardless of file content
6. Click Validate — shows fake results (47 valid, 3 invalid) after 1.5s delay
7. Click Process — shows fake progress bar, claims `total - 2` successful
8. Query `anchors` table — no new rows inserted

#### Expected Behavior

Wizard parses actual CSV file, validates each row with `validateAnchorCreate()`, then calls `useBulkAnchors().createBulkAnchors()` to insert via `bulk_create_anchors` RPC.

#### Actual Behavior

`CSVUploadWizard.tsx` has three simulated stages:

- **handleFileUpload** (line 93): Ignores uploaded file, returns hardcoded mock columns
- **handleValidate** (line 118): Uses `setTimeout(resolve, 1500)` with hardcoded validation results
- **handleProcess** (line 137): Loops with `setTimeout(resolve, 50)` for fake progress, returns hardcoded results

The `useBulkAnchors` hook exists with real Supabase RPC integration but is never imported or called.

#### Root Cause

Wizard was built as a UI prototype with simulated data. The `useBulkAnchors` hook was built separately but the two were never connected.

#### Fix Pattern

1. Import a CSV parser (project already has `src/lib/csvParser.ts`)
2. In `handleFileUpload`: parse actual file, extract real columns
3. In `handleValidate`: call `validateAnchorCreate()` on each row
4. In `handleProcess`: call `useBulkAnchors().createBulkAnchors(validatedRecords)`
5. Use the hook's progress tracking and error handling
6. Remove all `setTimeout` simulations

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. Hook confirmed to have real Supabase integration. |

#### Resolution

**Status:** OPEN — Quick fix (sub-day task, hook already exists).

#### Regression Test

- Existing: `src/hooks/useBulkAnchors.test.ts`, `src/components/upload/BulkUploadWizard.test.tsx`, `src/components/upload/CsvUploader.test.tsx`
- Needed: Integration test for CSVUploadWizard end-to-end with real CSV parsing

---

### CRIT-7: Browser Tab Says "Ralph"

- **Severity:** LOW
- **Found:** 2026-03-10, codebase audit
- **Story:** N/A (branding)
- **Components:** `package.json`, `index.html`

#### Steps to Reproduce

1. Run `npm run dev`
2. Open browser at `localhost:5173`
3. Look at browser tab title
4. **Result:** Tab says "Ralph"

#### Expected Behavior

Browser tab says "Arkova".

#### Actual Behavior

- `package.json` line 2: `"name": "ralph"`
- `index.html` line 6: `<title>Ralph</title>`

#### Root Cause

Old codename "Ralph" was never updated to "Arkova" in these two files.

#### Fix Pattern

1. `package.json`: Change `"name": "ralph"` to `"name": "arkova"`
2. `index.html`: Change `<title>Ralph</title>` to `<title>Arkova</title>`

#### Actions Taken

| Date | Action |
|------|--------|
| 2026-03-10 | Identified during codebase audit. |

#### Resolution

**Status:** OPEN — 15-minute fix.

#### Regression Test

- None needed. Visual verification only.

---

## Resolved Bugs

_No resolved bugs yet._

## Change Log

| Date | Change |
|------|--------|
| 2026-03-10 | Initial bug log created with CRIT-1 through CRIT-7, migrated from CLAUDE.md Section 8 summary table. Full steps to reproduce, root cause analysis, and fix patterns documented for all 7 bugs. |
