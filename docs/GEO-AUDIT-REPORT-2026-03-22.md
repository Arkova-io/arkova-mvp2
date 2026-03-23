# GEO Audit Report: Arkova

**Audit Date:** 2026-03-22
**URL:** https://arkova.ai
**Business Type:** SaaS (Credential Verification Platform)
**Pages Analyzed:** 12
**Subagent Analyses:** 5 (Technical, E-E-A-T, Schema, AI Visibility, Platform Optimization)

---

## Executive Summary

**Overall GEO Score: 68/100 (Fair)**

Arkova has best-in-class technical infrastructure — perfect AI crawler access, 8+ schema types, SSR prerendering, and an llms.txt file that most sites don't have. The content is well-written, technically deep, and genuinely citable. However, the site is held back by one fundamental problem: **no external brand authority**. Zero Wikipedia, zero Reddit, zero G2/Capterra, zero press coverage. AI models can find the content and parse it perfectly, but they won't cite it because nothing outside arkova.ai corroborates that Arkova exists as a credible entity. Fixing brand presence is the single highest-leverage action.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 72/100 | 25% | 18.0 |
| Brand Authority | 18/100 | 20% | 3.6 |
| Content E-E-A-T | 72/100 | 20% | 14.4 |
| Technical GEO | 88/100 | 15% | 13.2 |
| Schema & Structured Data | 72/100 | 10% | 7.2 |
| Platform Optimization | 59/100 | 10% | 5.9 |
| **Overall GEO Score** | | | **62.3 → 68/100** (SaaS adjustment) |

### Platform Readiness

| Platform | Score | Status |
|---|---|---|
| Google AI Overviews | 68/100 | Fair |
| Google Gemini | 62/100 | Fair |
| ChatGPT Web Search | 55/100 | Poor |
| Bing Copilot | 52/100 | Poor |
| Perplexity AI | 48/100 | Poor |

### The Core Paradox

Arkova has built content that *deserves* to be cited (72/100 citability) and infrastructure that *allows* it to be cited (100/100 crawler access, 88/100 technical), but lacks the external authority signals (18/100 brand mentions) that would cause AI models to *choose* to cite it. The content quality is ahead of the brand authority — which is the easier problem to solve.

---

## Critical Issues (Fix Immediately)

### C1: Zero third-party brand presence
**Score Impact:** -30 points across all categories
**Detail:** No Wikipedia, no Wikidata, no Reddit mentions, no G2/Capterra listings, no ProductHunt, no press coverage, no industry analyst mentions. AI models fundamentally rely on corroboration — they cite sources that other sources also reference. With zero external signals, Arkova is invisible to AI recommendation systems regardless of how good the content is.
**Fix:** Create Wikidata entry (free, 1 hour), submit to ProductHunt, create G2/Capterra listings, post research articles to relevant subreddits.

### C2: "Arkova Technologies" brand confusion
**Detail:** An unrelated Indian company "Arkova Technologies LLP" (academic thesis services) dominates search results for "Arkova Technologies." This pollutes entity recognition.
**Fix:** Use "Arkova" consistently (not "Arkova Technologies") in public content. Pursue Wikidata entry to establish disambiguation. Claim listings on review platforms under the precise name "Arkova."

---

## High Priority Issues

### H1: FAQ answers hidden behind JavaScript accordion
**Score Impact:** -8 for Google AI Overviews
**Detail:** FAQ answers only render on click (React useState). SSR prerender likely only contains question buttons with answers invisible. Google AI Overviews extracts FAQ from static HTML.
**Fix:** Use `<details>/<summary>` HTML elements or render answers visible in SSR with CSS collapse.

### H2: llms.txt is product documentation format, not standard
**Score Impact:** -8 for AI Visibility
**Detail:** Reads like marketing copy with research links and use cases. MCP server marked "Coming Soon" when it's actually live at edge.arkova.ai.
**Fix:** Rewrite to concise link-index format. Update MCP endpoint to actual URL. Keep detailed content in llms-full.txt.

### H3: Meta descriptions identical across pages
**Score Impact:** -5 for Technical GEO
**Detail:** Research, whitepaper, roadmap, and contact pages share the homepage meta description.
**Fix:** Write unique meta descriptions per page via the prerender script.

### H4: OG image is SVG format
**Score Impact:** -5 cross-platform
**Detail:** Facebook, LinkedIn, WhatsApp, Bing, and many platforms don't render SVG for social previews.
**Fix:** Convert to 1200x630 PNG.

### H5: No HowTo schema for 3-step verification process
**Score Impact:** -5 for Schema
**Detail:** "Upload & Fingerprint → Anchor to Network → Verify Anytime" is a natural HowTo candidate.
**Fix:** Add HowTo JSON-LD. (Note: HowTo rich results were removed Sept 2023, but the schema still helps AI extraction.)

### H6: No "What is Arkova?" definition paragraph
**Score Impact:** -5 for AI Citability
**Detail:** No concise, self-contained definition paragraph exists that AI can directly quote.
**Fix:** Add 40-60 word paragraph below H1: "Arkova is a privacy-first document verification platform that creates tamper-proof cryptographic fingerprints..."

### H7: No IndexNow for Bing/Copilot
**Score Impact:** -10 for Bing Copilot
**Detail:** IndexNow key file exists but pinging is not implemented.
**Fix:** Enable Vercel IndexNow integration or add ping to build pipeline.

---

## Medium Priority Issues

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| M1 | No About page (GEO-04) | -5 E-E-A-T | Create /about with expanded team bios, company story |
| M2 | Research articles lack inline source hyperlinks | -5 Citability | Add URLs to all statistical claims |
| M3 | Person schemas missing `image` property | -4 Schema | Add headshot URLs to all 3 Person schemas |
| M4 | Person schemas have only 1 sameAs each | -4 Schema | Add ORCID for Dr. Petscher, GitHub for Carson |
| M5 | Organization schema missing `address` | -3 Schema | Add at minimum city/state/country |
| M6 | Article images use logo fallback | -3 Schema | Create unique featured images per research article |
| M7 | No `speakable` on article/whitepaper pages | -3 Schema | Add SpeakableSpecification to Article schemas |
| M8 | Schema duplicated across all pages | -2 Schema | Move global schemas to shared, page-specific only where needed |
| M9 | No visible "Last updated" timestamps | -3 ChatGPT/Perplexity | Add visible dates to homepage and whitepaper |
| M10 | No Google Business Profile | -3 Gemini | Create even as virtual/remote business |

---

## Low Priority Issues

| # | Issue | Fix |
|---|-------|-----|
| L1 | Copyright "2026" should be "2025-2026" | Update footer |
| L2 | Whitepaper dateModified hardcoded | Generate from file mtime during prerender |
| L3 | LinkedIn entity collision (GEO-02 partial) | Verify sameAs URL resolves correctly |
| L4 | No BreadcrumbList on whitepaper page | Add JSON-LD |
| L5 | CSP uses `unsafe-inline` for scripts | Consider nonce-based CSP |
| L6 | OAI-SearchBot not explicitly listed in robots.txt | Add for completeness |
| L7 | Team bios lack specific metrics | Add credentials, publications, project counts |
| L8 | No comparison tables/pages | Create Arkova vs. traditional verification |

---

## Top 5 Most Citable Passages (Current)

| # | Passage | Citability Score |
|---|---------|-----------------|
| 1 | FAQ: "How does Arkova verify documents without seeing them?" | 84/100 |
| 2 | Whitepaper: Fraud statistics (7,600 diplomas, $3.01M audit costs) | 82/100 |
| 3 | Research: Gartner 33% agentic AI stat + three weaknesses | 79/100 |
| 4 | FAQ: "How is this different from DocuSign?" | 77/100 |
| 5 | Privacy: Zero-knowledge architecture claim | 74/100 |

---

## Quick Wins (Implement This Week)

1. **Create Wikidata entry** for Arkova Technologies, Inc. Add to Organization sameAs. Free, 1 hour, impacts all 5 platforms. (+10 brand authority)
2. **Submit to ProductHunt** — creates permanent third-party listing. (+5 brand authority)
3. **Add "What is Arkova?" definition paragraph** below H1 on homepage. (+5 citability)
4. **Fix FAQ accordion SSR** — render answers in initial HTML. (+5 Google AIO)
5. **Convert og-image.svg to PNG** — fixes social previews across all platforms. (+3 cross-platform)

## 30-Day Action Plan

### Week 1: Technical Quick Fixes
- [ ] Create Wikidata entry with Organization properties
- [ ] Fix FAQ to render answers in SSR HTML
- [ ] Add "What is Arkova?" definition paragraph
- [ ] Convert og-image to PNG
- [ ] Write unique meta descriptions for all pages
- [ ] Update llms.txt (concise format, live MCP endpoint)

### Week 2: Schema & Content
- [ ] Add HowTo schema to homepage
- [ ] Add `image` and expanded `sameAs` to Person schemas
- [ ] Add `address` to Organization schema
- [ ] Add inline source hyperlinks to research articles
- [ ] Add visible "Last updated" timestamps
- [ ] Create /about page (GEO-04)

### Week 3: Brand Building
- [ ] Submit to ProductHunt
- [ ] Create G2 and Capterra profiles
- [ ] Post research articles to r/compliance, r/artificial, Hacker News
- [ ] Create Crunchbase profile
- [ ] Create Google Business Profile
- [ ] Implement IndexNow for Bing

### Week 4: Platform-Specific
- [ ] Publish 2-3 YouTube explainer videos
- [ ] Add VideoObject schema when videos are live
- [ ] Fix LinkedIn entity collision (GEO-02)
- [ ] Test AI citations across ChatGPT, Perplexity, Gemini
- [ ] Create unique featured images for research articles
- [ ] Add `speakable` to Article schemas

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| https://arkova.ai/ | Arkova — Issue Once. Verify Forever. | 4 (FAQ SSR, no definition, meta desc, HowTo) |
| https://arkova.ai/research | Research & Insights | 1 (shared meta desc) |
| https://arkova.ai/research/anchoring-compliance-bitcoin | Anchoring Compliance to Bitcoin | 2 (no source links, logo image) |
| https://arkova.ai/research/agentic-recordkeeping | Agentic Recordkeeping | 2 (no source links, logo image) |
| https://arkova.ai/research/convergence-stack | The Convergence Stack | 2 (no source links, logo image) |
| https://arkova.ai/research/government-records | Government Records | 2 (no source links, logo image) |
| https://arkova.ai/research/real-cost-of-audit-verification | Real Cost of Audit Verification | 2 (no source links, logo image) |
| https://arkova.ai/whitepaper | The Universal Verification Layer | 2 (dateModified hardcoded, no speakable) |
| https://arkova.ai/roadmap | Product Roadmap | 1 (shared meta desc) |
| https://arkova.ai/contact | Contact | 1 (shared meta desc) |
| https://arkova.ai/privacy | Privacy Policy | 0 |
| https://arkova.ai/terms | Terms of Service | 0 |

---

*GEO Audit performed by Claude Code with 5 specialized subagents. Previous score: ~72/100 (2026-03-16). Current: 68/100 — decrease reflects more rigorous brand authority scoring and platform-specific analysis that was not included in the prior audit.*
