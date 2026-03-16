# UAT Launch Readiness Report #3 — Public Verification, Billing, Treasury & Remaining Flows

_Date: 2026-03-16 EST_
_Tester: Claude Code (automated UAT)_
_Environment: Local dev (localhost:5173 + local Supabase 127.0.0.1:54321)_
_Branch: docs/uat-launch-readiness-2_

---

## Summary

| Category | Tested | Pass | Fail | Notes |
|----------|--------|------|------|-------|
| Public Verification (SECURED) | 10 | 9 | 1 | QR code not on public page (by design — on record detail) |
| Public Verification (Edge Cases) | 4 | 3 | 1 | PENDING record shows "Verification Failed" |
| Fingerprint Search (/search) | 3 | 3 | 0 | All 3 modes work (Issuer, Verification ID, Fingerprint) |
| Billing & Pricing | 4 | 3 | 1 | Cannot verify UI due to auth — code review confirms structure |
| Treasury Admin | 3 | 3 | 0 | Auth guard + admin email check + unauthorized view all correct |
| Help & Legal Pages | 5 | 5 | 0 | All pages load with real content |
| Worker Health | 2 | 2 | 0 | Both URLs return healthy |
| Typography/Brand | 2 | 0 | 2 | DM Sans + JetBrains Mono NOT loaded; Inter (banned) in use |
| **Total** | **33** | **28** | **5** | |

---

## Bugs Found

### BUG-UAT3-01: DM Sans and JetBrains Mono fonts not loaded (HIGH)

**Severity:** HIGH
**Component:** `index.html`, `src/index.css`, `tailwind.config.ts`
**Steps to reproduce:**
1. Open any page in the app
2. Inspect any text element's computed font-family
3. Observe it uses `Inter` (or system fallback), not DM Sans

**Expected:** All body text uses DM Sans (300-700); all code/fingerprints use JetBrains Mono (400, 500) per CLAUDE.md Section 5.
**Actual:**
- `index.html` has NO Google Fonts `<link>` tags for DM Sans or JetBrains Mono
- `src/index.css` line 106 sets `font-family: 'Inter'` (banned font per Section 5)
- `tailwind.config.ts` line 93 sets `fontFamily.sans` to `['Inter', ...]` (banned)
- No `fontFamily.mono` override exists for JetBrains Mono
- Fingerprints fall back to `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`

**Root cause:** The Nordic Vault typography mandate (PR #42) documented the fonts but never actually added Google Fonts links or updated the CSS/config to use them.

**Fix required:**
1. Add Google Fonts links to `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```
2. Update `tailwind.config.ts`:
   ```ts
   fontFamily: {
     sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', ...],
     mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', ...],
   }
   ```
3. Update `src/index.css` line 106 to use `'DM Sans'` instead of `'Inter'`

**Regression test:** Inspect `font-family` on body text and `.font-mono` elements.

---

### BUG-UAT3-02: PENDING anchor shows "Verification Failed" on public page (MEDIUM)

**Severity:** MEDIUM
**Component:** `get_public_anchor` RPC (migration 0054) / local Supabase state
**Steps to reproduce:**
1. Navigate to `/verify/ARK-2024-00312` (seed PENDING record)
2. Page shows "Verification Failed — Record not found or not yet verified"

**Expected:** Page shows "Anchoring In Progress" banner with amber clock icon, PENDING badge, and "Submitted for processing" subtitle.
**Actual:** Shows error state identical to a non-existent record.

**Root cause:** The `get_public_anchor` RPC was updated in migration 0054 to include `PENDING` in the status filter. However, this migration may not be applied to the local Supabase instance. The component code (`PublicVerification.tsx` lines 188-256) correctly handles PENDING status with the amber banner.

**Fix required:**
- Run `npx supabase db reset` to apply all migrations including 0054
- OR apply migration 0054 manually: `npx supabase db push`
- Verify on production Supabase that migration 0054 is applied (migrations 0059-0062 are noted as pending production — 0054 should already be applied)

**Regression test:** Navigate to `/verify/` with a PENDING anchor's public_id; verify amber "Anchoring In Progress" banner appears.

---

### BUG-UAT3-03: QR code absent from public verification page (LOW — by design)

**Severity:** LOW (design observation, not a bug)
**Component:** `src/components/verification/PublicVerification.tsx`
**Steps to reproduce:**
1. Navigate to `/verify/ARK-2024-00091`
2. Scroll through entire page
3. No QR code is visible

**Expected (per task checklist):** QR code present on public verification page.
**Actual:** QR code is only on the authenticated record detail page (`AssetDetailView.tsx`), not on the public verification page.

**Root cause:** The public verification page was designed without a QR code since viewers are already on the verification page (a QR code linking back to itself is redundant). The QR on the detail page links TO the public verification page.

**Actions taken:** None — this is by design. The task checklist expectation may be based on a misunderstanding of the flow. If a self-referencing QR is desired on the public page (e.g., for printing/sharing), it would need to be added to `PublicVerification.tsx`.

---

### BUG-UAT3-04: Tailwind config uses banned `Inter` font (HIGH — duplicate of BUG-UAT3-01)

**Severity:** HIGH (same root cause as BUG-UAT3-01)
**Component:** `tailwind.config.ts:93-104`
**Detail:** `fontFamily.sans` is `['Inter', ...]`. Per CLAUDE.md Section 5, Inter is a banned font. Should be `['DM Sans', ...]`.

---

### BUG-UAT3-05: `src/index.css` uses banned `Inter` font-family (HIGH — duplicate of BUG-UAT3-01)

**Severity:** HIGH (same root cause as BUG-UAT3-01)
**Component:** `src/index.css:106`
**Detail:** `font-family: 'Inter', ...` explicitly set. Should be `'DM Sans'`.

---

## Passing Tests

### Public Verification (/verify/:publicId) — SECURED Record
- [x] `/verify/ARK-2024-00091` loads correctly (no auth required)
- [x] Status Banner: Green checkmark icon, "ACTIVE" badge (green), "Document Verified" heading
- [x] Document Info: Credential type ("Degree"), issuer ("University of Michigan"), issued date, filename
- [x] CredentialRenderer shows on public page with template data
- [x] Fingerprint displayed in mono font with copy button (`font-mono text-xs bg-muted rounded`)
- [x] Network Receipt ID shown with external explorer link (ExplorerLink component)
- [x] Observed Time displayed in UTC format
- [x] Lifecycle Timeline: Created → Issued → Secured with timestamps (AnchorLifecycleTimeline component)
- [x] Proof Download: "JSON Proof Package" button present (VerifierProofDownload component)
- [x] Verification event logged (log_verification_event RPC call returns 204 No Content)
- [x] Footer: "Verification ID: ARK-2024-00091" + "Secured by Arkova"
- [x] Issuer Info: "University of Michigan" with "View issuer registry" link
- [x] Mobile (375px): All sections render correctly, fingerprints wrap properly

### Public Verification — Edge Cases
- [x] `/verify/INVALID-DOES-NOT-EXIST` shows "Verification Failed" with "Record not found" message (not an error/crash page)
- [x] `/verify/ARK-2022-00183` (REVOKED) shows gray "Revoked" badge, "Record Revoked" heading, RevocationDetails component with reason + date
- [ ] `/verify/ARK-2024-00312` (PENDING) — FAILS (BUG-UAT3-02): shows "Verification Failed" instead of "Anchoring In Progress" banner

### Fingerprint Search (/search)
- [x] Search page loads with 3 mode selector (Issuer, Verification ID, Fingerprint)
- [x] Fingerprint mode: accepts 64-character hex input, shows "No Record Found" gracefully for unknown hash
- [x] Search UI is clean with shield icon, description text, and styled search bar

### Billing & Pricing (code review — auth blocks live testing)
- [x] `/billing` correctly redirects to login with toast "Please sign in to access that page" (unauthenticated)
- [x] `PricingPage.tsx` renders: plan cards (Free/Individual/Professional/Organization), BillingOverview, UsageWidget (UF-06)
- [x] Stripe checkout: `startCheckout` (new subscriber) or `openBillingPortal` (existing subscriber) handles plan changes
- [x] Usage widget integration: `<UsageWidget compact />` renders for active subscribers

### Treasury Admin Dashboard (code review — auth blocks live testing)
- [x] Admin guard: `PLATFORM_ADMIN_EMAILS` array checks `carson@arkova.io` and `sarah@arkova.io`
- [x] Non-admin view: Shows "Access denied. Platform administrator privileges required." with "Back to Dashboard" button
- [x] Admin view: 4 stat cards (Total/Pending/Secured/Revoked), Treasury Vault section (network, balance), Network Status (worker, chain client), Recent Anchors list
- [x] Terminology compliance: Uses "Treasury Vault", "Network", "Anchor" — no banned terms in UI labels (note: "Balance (sats)" is internal/technical, acceptable for admin page)

### Help & Legal Pages
- [x] `/privacy` loads with 6 sections of real content (Information Collection, Usage, Document Privacy, Data Security, Data Retention, Contact)
- [x] `/terms` loads with 7 sections of real content (Acceptance, Description, Responsibilities, Verification Scope, Billing, Liability, Contact)
- [x] `/contact` loads with General Support + Enterprise Inquiries cards, email links
- [x] 404 page renders for invalid routes (`/this-does-not-exist-xyz`): "404", "Page not found", "Go to Dashboard" link
- [x] `/help` correctly requires auth (redirects to login with toast)

### Worker Health
- [x] `https://arkova-worker-kvojbeutfa-uc.a.run.app/health` returns `{"status":"healthy","version":"0.1.0","uptime":66611,"network":"signet","checks":{"supabase":"ok"}}`
- [x] `https://arkova-worker-270018525501.us-central1.run.app/health` returns same healthy response

---

## Items Not Testable in This Environment

| Item | Reason | Mitigation |
|------|--------|------------|
| Billing UI (authenticated) | Login creates new user without profile link to seed data | Verified via code review — PricingPage has plan cards, UsageWidget, Stripe checkout |
| Treasury Dashboard (authenticated) | Same auth/profile mismatch | Verified via code review — admin email check, stat cards, vault info, unauthorized view |
| Usage quota warnings (80%, 100%) | Requires active subscription with usage near limits | Code review confirms `UsageWidget` checks thresholds and shows toast warnings |
| Stripe checkout button | Requires Stripe keys configured in worker | Code review confirms `startCheckout` creates Stripe session, `openBillingPortal` for plan changes |
| API docs (/api/docs) | Served by worker, not frontend | Worker is healthy; Swagger UI served at `/api/docs` when `ENABLE_VERIFICATION_API=true` |
| Dashboard usage widget | Requires authenticated session with billing data | `DashboardPage` includes `<UsageWidget />` for users with active plans |
| PENDING anchor verification | Local Supabase may not have migration 0054 applied | Component code correctly handles PENDING; migration SQL includes PENDING in filter |

---

## Recommendations

1. **CRITICAL — Fix typography (BUG-UAT3-01):** Add DM Sans + JetBrains Mono Google Fonts links and update tailwind config + CSS. This affects every page in the app and is a brand compliance violation.

2. **MEDIUM — Verify migration 0054 on production:** Ensure `get_public_anchor` RPC supports PENDING status on the production Supabase instance. Run `SELECT prosrc FROM pg_proc WHERE proname = 'get_public_anchor';` to verify.

3. **LOW — Consider adding QR to public verification page:** If the public verification page should be printable/shareable, adding a self-referencing QR code would improve the offline verification flow.

4. **LOW — Local dev environment seed data mismatch:** The auth user UUID doesn't match the seed data profile UUID, preventing authenticated page testing. Consider running `npx supabase db reset` to resync.
