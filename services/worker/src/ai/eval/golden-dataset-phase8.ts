/**
 * Golden Dataset Phase 8 — Bootstrap Strategy Corpus (EDGAR, Case Law, Attestations, OCR)
 *
 * Entries GD-1181 through GD-1330: 150 new entries aligned with the Verification
 * Bootstrap Strategy (Arkova-Verification-Bootstrap-Strategy.docx).
 *
 * Priority targets from the strategy:
 *   - SEC EDGAR filings (high-value corpus for financial AI agents)
 *   - Court records / case law (federal, state, local — PACER + state courts)
 *   - Attestations (employment verification, education verification, sworn statements)
 *   - OCR-corrupted variants (image detection improvement)
 *
 * Distribution:
 *   SEC_FILING (EDGAR):  40 entries — 10-K, 10-Q, 8-K, DEF 14A, S-1, 13F, 20-F, Form 4, SC 13D, Form ADV, 10-K/A, N-CSR
 *   LEGAL (Case Law):    40 entries — SCOTUS, Circuit, District, Bankruptcy, State Supreme, State Appellate, Municipal, ALJ, Arbitration
 *   ATTESTATION:         30 entries — Employment verification, education verification, sworn affidavits, character references, good standing letters, income verification
 *   OCR-corrupted:       20 entries — Scanned versions of SEC, legal, license, degree, attestation docs with realistic OCR artifacts
 *   REGULATION:          10 entries — Federal Register, state regs, enforcement actions (aligned with bootstrap Federal Register corpus)
 *   PATENT:              10 entries — USPTO, EPO, WIPO (aligned with bootstrap USPTO corpus)
 */

import type { GoldenDatasetEntry } from './types.js';

export const GOLDEN_DATASET_PHASE8: GoldenDatasetEntry[] = [
  // ============================================================
  // SEC_FILING / EDGAR (40 entries) — GD-1181 to GD-1220
  // ============================================================
  {
    id: 'GD-1181',
    description: '10-K annual report — large technology company',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. FORM 10-K. (Mark One) [X] ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934. For the fiscal year ended December 31, 2025. OR [ ] TRANSITION REPORT PURSUANT TO SECTION 13 OR 15(d). Commission File Number: 001-37580. [COMPANY_REDACTED] Inc. (Exact name of registrant as specified in its charter). Delaware (State of incorporation). [EIN_REDACTED] (IRS Employer Identification No.). [ADDRESS_REDACTED], Mountain View, California 94043. Registrant telephone: [PHONE_REDACTED]. Securities registered pursuant to Section 12(b) of the Act: Class A Common Stock, $0.001 par value per share. Trading Symbol: [REDACTED]. The NASDAQ Global Select Market.',
    credentialTypeHint: 'OTHER',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-37580', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar'],
  },
  {
    id: 'GD-1182',
    description: '10-K annual report — financial services company',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. FORM 10-K. ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934. For the fiscal year ended September 30, 2025. Commission File Number: 001-09466. [COMPANY_REDACTED] & Co. (Exact name of registrant). New York (State). [EIN_REDACTED]. [ADDRESS_REDACTED], New York, NY 10019. Total revenues: $56.1 billion. Net income: $12.3 billion. Total assets: $1.73 trillion.',
    credentialTypeHint: 'OTHER',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] & Co.', issuedDate: '2025-09-30', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-09466', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'financial'],
  },
  {
    id: 'GD-1183',
    description: '10-Q quarterly report — biotech company Q3',
    strippedText: 'FORM 10-Q. QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934. For the quarterly period ended September 30, 2025. Commission File Number: 000-50014. [COMPANY_REDACTED] Therapeutics, Inc. State of Incorporation: Massachusetts. [EIN_REDACTED]. [ADDRESS_REDACTED], Cambridge, MA 02142. Research and development expenses: $342 million. Net loss: $(189) million. Cash and equivalents: $2.1 billion.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Therapeutics, Inc.', issuedDate: '2025-09-30', fieldOfStudy: 'Quarterly Report (10-Q)', licenseNumber: '000-50014', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-Q', 'edgar', 'biotech'],
  },
  {
    id: 'GD-1184',
    description: '10-Q quarterly report — retail company Q1',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. FORM 10-Q. For the quarterly period ended March 31, 2026. Commission File Number: 001-11330. [COMPANY_REDACTED] Corporation. Incorporated in Virginia. Net revenues: $43.9 billion. Operating income: $1.8 billion. Stores: 8,900+ locations worldwide.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corporation', issuedDate: '2026-03-31', fieldOfStudy: 'Quarterly Report (10-Q)', licenseNumber: '001-11330', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-Q', 'edgar', 'retail'],
  },
  {
    id: 'GD-1185',
    description: '8-K current report — CEO change material event',
    strippedText: 'FORM 8-K. CURRENT REPORT. Pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934. Date of Report (Date of earliest event reported): February 10, 2026. Commission File Number: 001-16681. [COMPANY_REDACTED] Corp. State of Incorporation: Delaware. Item 5.02 Departure of Directors or Certain Officers; Election of Directors; Appointment of Certain Officers. On February 10, 2026, the Board of Directors announced that [NAME_REDACTED] will step down as Chief Executive Officer effective March 31, 2026. [NAME_REDACTED], currently Chief Operating Officer, has been appointed as CEO effective April 1, 2026.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-02-10', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-16681', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'executive'],
  },
  {
    id: 'GD-1186',
    description: '8-K current report — bankruptcy filing',
    strippedText: 'FORM 8-K. CURRENT REPORT. Date of Report: January 28, 2026. Commission File Number: 001-33977. [COMPANY_REDACTED] Holdings, Inc. Item 1.03 Bankruptcy or Receivership. On January 28, 2026, [COMPANY_REDACTED] Holdings, Inc. and certain of its subsidiaries filed voluntary petitions for relief under Chapter 11 of Title 11 of the United States Code in the United States Bankruptcy Court for the Southern District of Texas (Case No. 26-30001). The Debtors will continue to operate their businesses as debtors in possession.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Holdings, Inc.', issuedDate: '2026-01-28', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-33977', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'bankruptcy'],
  },
  {
    id: 'GD-1187',
    description: '8-K current report — earnings results',
    strippedText: 'FORM 8-K. CURRENT REPORT. Date of Report: January 30, 2026. Commission File Number: 001-04321. [COMPANY_REDACTED] Inc. Item 2.02 Results of Operations and Financial Condition. On January 30, 2026, [COMPANY_REDACTED] Inc. issued a press release reporting its financial results for the fiscal quarter ended December 31, 2025. Fourth quarter revenue: $24.5 billion, up 18% year-over-year. GAAP diluted EPS: $2.45. Non-GAAP diluted EPS: $2.78. The press release is furnished as Exhibit 99.1.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-01-30', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-04321', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'earnings'],
  },
  {
    id: 'GD-1188',
    description: 'DEF 14A proxy statement — executive compensation focus',
    strippedText: 'SCHEDULE 14A INFORMATION. Proxy Statement Pursuant to Section 14(a) of the Securities Exchange Act of 1934. Filed by the Registrant: [X] Yes. [COMPANY_REDACTED] Industries, Inc. Commission File Number: 001-08858. Notice of 2026 Annual Meeting of Shareholders. Date: May 15, 2026. Time: 9:00 a.m. CT. Place: Virtual Annual Meeting. Record Date: March 20, 2026. Filed: March 28, 2026. Proposals: 1. Election of 12 Directors. 2. Ratification of Ernst & Young LLP. 3. Advisory Vote on Named Executive Officer Compensation. 4. Shareholder Proposal: Report on Lobbying Activities.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Industries, Inc.', issuedDate: '2026-03-28', fieldOfStudy: 'Proxy Statement (DEF 14A)', licenseNumber: '001-08858', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'DEF-14A', 'edgar', 'proxy'],
  },
  {
    id: 'GD-1189',
    description: 'S-1 registration statement — IPO filing',
    strippedText: 'FORM S-1. REGISTRATION STATEMENT UNDER THE SECURITIES ACT OF 1933. [COMPANY_REDACTED] AI, Inc. (Exact name of registrant). State of Incorporation: Delaware. SIC: 7372 — Prepackaged Software. Filed: March 1, 2026. Proposed Maximum Aggregate Offering Price: $750,000,000. Title of Securities: Class A Common Stock, par value $0.0001 per share. The registrant hereby amends this Registration Statement on such date or dates as may be necessary to delay its effective date until the registrant shall file a further amendment.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] AI, Inc.', issuedDate: '2026-03-01', fieldOfStudy: 'Registration Statement (S-1)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'S-1', 'edgar', 'ipo'],
  },
  {
    id: 'GD-1190',
    description: '13F institutional holdings report — hedge fund',
    strippedText: 'FORM 13F. REPORT FILED BY INSTITUTIONAL INVESTMENT MANAGERS. INFORMATION TABLE. Filed by: [COMPANY_REDACTED] Capital Management, L.P. Filing period: December 31, 2025. Manager CIK: [CIK_REDACTED]. Total value of holdings: $28,456,789,000. Number of holdings: 47. Commission File Number: 028-17345. Top holdings include positions in technology, healthcare, and financial services sectors.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Capital Management, L.P.', issuedDate: '2025-12-31', fieldOfStudy: 'Institutional Holdings Report (13F)', licenseNumber: '028-17345', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '13F', 'edgar', 'institutional'],
  },
  {
    id: 'GD-1191',
    description: '20-F foreign private issuer — European pharmaceutical',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. FORM 20-F. [X] ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934. For the fiscal year ended December 31, 2025. Commission File Number: 001-15152. [COMPANY_REDACTED] plc. (Exact Name of Registrant). Jurisdiction of Incorporation: England and Wales. Company Number: [REDACTED]. [ADDRESS_REDACTED], London, United Kingdom. Total Revenue: €43.2 billion. R&D Expenditures: €7.8 billion.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] plc', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report - Foreign (20-F)', licenseNumber: '001-15152', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '20-F', 'edgar', 'foreign'],
  },
  {
    id: 'GD-1192',
    description: 'Form 4 insider transaction — stock purchase by director',
    strippedText: 'FORM 4. UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. STATEMENT OF CHANGES IN BENEFICIAL OWNERSHIP. Filed pursuant to Section 16(a) of the Securities Exchange Act of 1934. 1. Name and Address of Reporting Person: [NAME_REDACTED]. 2. Issuer Name and Ticker or Trading Symbol: [COMPANY_REDACTED] Technologies Inc. ([REDACTED]). 3. Date of Earliest Transaction: March 5, 2026. 4. Relationship to Issuer: Director. Table I — Non-Derivative Securities. Transaction Code: P (Open market purchase). Amount: 5,000 shares. Price: $89.25. Ownership: Direct.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Technologies Inc.', issuedDate: '2026-03-05', fieldOfStudy: 'Insider Transaction (Form 4)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'form-4', 'edgar', 'insider'],
  },
  {
    id: 'GD-1193',
    description: 'Form 4 insider transaction — option exercise by CFO',
    strippedText: 'FORM 4. STATEMENT OF CHANGES IN BENEFICIAL OWNERSHIP. Issuer: [COMPANY_REDACTED] Corp. Reporting Person: [NAME_REDACTED]. Relationship: Officer (Chief Financial Officer). Date of Transaction: February 20, 2026. Table II — Derivative Securities. Transaction Code: M (Exercise of options). Shares Acquired on Exercise: 25,000. Exercise Price: $45.00. Disposition: S (Sale). Shares Sold: 25,000. Sale Price: $112.75.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-02-20', fieldOfStudy: 'Insider Transaction (Form 4)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'form-4', 'edgar', 'options'],
  },
  {
    id: 'GD-1194',
    description: 'SC 13D beneficial ownership — activist investor',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. SCHEDULE 13D. Under the Securities Exchange Act of 1934. [COMPANY_REDACTED] Corp. (Name of Issuer). Common Stock, $0.01 par value per share (Title of Class). CUSIP Number: [REDACTED]. Date of Event Which Requires Filing: February 15, 2026. Filed by: [PARTY_REDACTED] Partners Fund I, L.P. and [PARTY_REDACTED] Partners Management, LLC. Percent of Class: 9.8%. Item 4 — Purpose of Transaction: The Reporting Persons acquired the Shares for investment purposes. The Reporting Persons intend to engage in discussions with the Board regarding strategic alternatives to maximize shareholder value.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-02-15', fieldOfStudy: 'Beneficial Ownership (SC 13D)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'SC-13D', 'edgar', 'activist'],
  },
  {
    id: 'GD-1195',
    description: 'SC 13G beneficial ownership — passive institutional holder',
    strippedText: 'SCHEDULE 13G. AMENDMENT NO. 2. Under the Securities Exchange Act of 1934. [COMPANY_REDACTED] Inc. (Name of Issuer). Common Stock (Title of Class of Securities). CUSIP: [REDACTED]. Date of event: December 31, 2025. Filed by: [PARTY_REDACTED] Asset Management, Inc. Item 9: Number of Shares Beneficially Owned by Each Reporting Person: 45,678,901 shares. Item 11: Percent of Class: 6.2%. Item 10: This statement is filed pursuant to Rule 13d-1(b) as the shares were acquired in the ordinary course of business and not with the purpose or effect of changing control.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Beneficial Ownership (SC 13G)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'SC-13G', 'edgar', 'passive'],
  },
  {
    id: 'GD-1196',
    description: '10-K/A amendment — restatement of financials',
    strippedText: 'FORM 10-K/A. (Amendment No. 1). ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d). For the fiscal year ended December 31, 2024. Commission File Number: 001-14693. [COMPANY_REDACTED] Group, Inc. (Exact name of registrant). State of incorporation: Delaware. This Amendment No. 1 to the Annual Report on Form 10-K, originally filed on February 28, 2025, is being filed to restate certain financial statements for the fiscal years ended December 31, 2024, 2023, and 2022 as described in Note 2 — Restatement of Previously Issued Financial Statements.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Group, Inc.', issuedDate: '2024-12-31', fieldOfStudy: 'Annual Report Amendment (10-K/A)', licenseNumber: '001-14693', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K/A', 'edgar', 'amendment'],
  },
  {
    id: 'GD-1197',
    description: 'N-CSR annual report — mutual fund',
    strippedText: 'UNITED STATES SECURITIES AND EXCHANGE COMMISSION. Washington, D.C. 20549. FORM N-CSR. CERTIFIED SHAREHOLDER REPORT OF REGISTERED MANAGEMENT INVESTMENT COMPANIES. Investment Company Act file number: 811-08510. [COMPANY_REDACTED] Funds Trust. (Exact name of registrant). [ADDRESS_REDACTED], Boston, MA 02109. Date of reporting period: October 31, 2025. Annual Report. [COMPANY_REDACTED] Growth Fund. Net assets: $12.4 billion. NAV per share: $87.45. Total return (1 year): 24.3%.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Funds Trust', issuedDate: '2025-10-31', fieldOfStudy: 'Investment Company Report (N-CSR)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'N-CSR', 'edgar', 'fund'],
  },
  {
    id: 'GD-1198',
    description: 'Form ADV — investment advisor registration',
    strippedText: 'FORM ADV. UNIFORM APPLICATION FOR INVESTMENT ADVISER REGISTRATION AND REPORT BY EXEMPT REPORTING ADVISERS. Part 1A. Item 1: Identifying Information. A. [COMPANY_REDACTED] Wealth Management, LLC. CRD Number: 123456. SEC File Number: 801-78901. B. Principal Office: [ADDRESS_REDACTED], Chicago, IL 60611. Item 5: Information About Your Advisory Business. A. Total number of employees: 85. B. AUM: $4.2 billion (discretionary), $800 million (non-discretionary). C. Total clients: 1,200. Filing date: January 30, 2026.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Wealth Management, LLC', issuedDate: '2026-01-30', fieldOfStudy: 'Investment Advisor Registration (Form ADV)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'Form-ADV', 'edgar', 'advisor'],
  },
  {
    id: 'GD-1199',
    description: '8-K — cybersecurity incident disclosure (new SEC rule)',
    strippedText: 'FORM 8-K. CURRENT REPORT. Date of Report: March 12, 2026. Commission File Number: 001-35551. [COMPANY_REDACTED] Inc. Item 1.05 Material Cybersecurity Incidents. On March 10, 2026, [COMPANY_REDACTED] Inc. determined that it experienced a material cybersecurity incident involving unauthorized access to certain internal systems. The incident was detected on March 8, 2026. The Company has engaged third-party cybersecurity experts and has notified federal law enforcement. The Company is still assessing the nature and scope of the data involved.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-12', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-35551', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'cybersecurity'],
  },
  {
    id: 'GD-1200',
    description: '8-K — merger agreement',
    strippedText: 'FORM 8-K. CURRENT REPORT. Date of Report: March 18, 2026. Commission File Number: 001-12345. [COMPANY_REDACTED] Holdings, Inc. Item 1.01 Entry into a Material Definitive Agreement. On March 18, 2026, [COMPANY_REDACTED] Holdings, Inc. entered into an Agreement and Plan of Merger with [PARTY_REDACTED] Corporation, pursuant to which [PARTY_REDACTED] Corporation will acquire all outstanding shares of [COMPANY_REDACTED] Holdings for $52.00 per share in cash, representing a total enterprise value of approximately $8.4 billion. The transaction is expected to close in Q3 2026, subject to regulatory approvals.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Holdings, Inc.', issuedDate: '2026-03-18', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-12345', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'merger'],
  },
  // 20 more EDGAR entries with varied form types
  {
    id: 'GD-1201',
    description: 'S-1/A amendment — pre-IPO amendment',
    strippedText: 'FORM S-1/A. (Amendment No. 3). REGISTRATION STATEMENT UNDER THE SECURITIES ACT OF 1933. [COMPANY_REDACTED] Robotics Corp. Filed: February 28, 2026. Proposed Maximum Aggregate Offering Price: $400,000,000. This Amendment No. 3 updates risk factors, financial statements for Q4 2025, and the estimated price range of $18.00 to $21.00 per share.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Robotics Corp.', issuedDate: '2026-02-28', fieldOfStudy: 'Registration Statement (S-1)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'S-1', 'edgar', 'ipo'],
  },
  {
    id: 'GD-1202',
    description: '10-K — energy company with complex segments',
    strippedText: 'FORM 10-K. For the fiscal year ended December 31, 2025. Commission File Number: 001-02267. [COMPANY_REDACTED] Energy Corporation. State: Texas. Business Segments: Upstream (exploration & production), Midstream (pipeline & transportation), Downstream (refining & marketing), Chemical (petrochemicals). Total Revenues: $265.4 billion. Net Income: $31.2 billion. Proved Reserves: 25.7 billion barrels of oil equivalent.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Energy Corporation', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-02267', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'energy'],
  },
  {
    id: 'GD-1203',
    description: 'DEF 14A — contested proxy fight',
    strippedText: 'SCHEDULE 14A. Proxy Statement Pursuant to Section 14(a). [COMPANY_REDACTED] Inc. Commission File Number: 001-98765. Filed: April 5, 2026. PROXY STATEMENT FOR SPECIAL MEETING OF SHAREHOLDERS. Notice is hereby given that a Special Meeting of Shareholders of [COMPANY_REDACTED] Inc. will be held on May 1, 2026. Proposals: 1. Removal of [NAME_REDACTED] as Director. 2. Election of [NAME_REDACTED] as Director (Dissident Nominee). THE BOARD RECOMMENDS A VOTE AGAINST ALL DISSIDENT PROPOSALS.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-04-05', fieldOfStudy: 'Proxy Statement (DEF 14A)', licenseNumber: '001-98765', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'DEF-14A', 'edgar', 'proxy-fight'],
  },
  {
    id: 'GD-1204',
    description: '13F — large asset manager quarterly holdings',
    strippedText: 'FORM 13F INFORMATION TABLE. Filed by: [COMPANY_REDACTED] Group, Inc. CIK: [CIK_REDACTED]. Filing Period: March 31, 2026. Commission File Number: 028-00456. Total holdings value: $9,876,543,210,000. Total number of other included managers: 12. Confidential treatment requested for certain holdings (attached as CT ORDER). This filing covers discretionary investment management authority over 13F securities.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Group, Inc.', issuedDate: '2026-03-31', fieldOfStudy: 'Institutional Holdings Report (13F)', licenseNumber: '028-00456', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '13F', 'edgar', 'asset-manager'],
  },
  {
    id: 'GD-1205',
    description: '20-F — Asian tech conglomerate',
    strippedText: 'FORM 20-F. ANNUAL REPORT. For the fiscal year ended March 31, 2026. Commission File Number: 001-14862. [COMPANY_REDACTED] Holdings K.K. (Incorporated in Japan). Registered office: [ADDRESS_REDACTED], Minato-ku, Tokyo 105-7140, Japan. ADS: Each ADS represents one common share. ADR Depositary: Bank of New York Mellon. Revenue: ¥12.3 trillion. Operating Income: ¥1.8 trillion. Employees: 195,000.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Holdings K.K.', issuedDate: '2026-03-31', fieldOfStudy: 'Annual Report - Foreign (20-F)', licenseNumber: '001-14862', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '20-F', 'edgar', 'foreign', 'japan'],
  },
  {
    id: 'GD-1206',
    description: 'Form 144 — proposed sale of restricted securities',
    strippedText: 'FORM 144. NOTICE OF PROPOSED SALE OF SECURITIES PURSUANT TO RULE 144. Issuer: [COMPANY_REDACTED] Inc. Name of person for whose account securities are to be sold: [NAME_REDACTED]. Relationship: Vice President, Engineering. Number of shares to be sold: 15,000. Approximate date of sale: March 20, 2026. Title of class: Common Stock. Date of acquisition: March 2023 (RSU vesting). Brokerage firm: [COMPANY_REDACTED] Securities LLC.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-20', fieldOfStudy: 'Restricted Securities Sale (Form 144)', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'Form-144', 'edgar'],
  },
  {
    id: 'GD-1207',
    description: '10-K — SPAC post-merger',
    strippedText: 'FORM 10-K. For the fiscal year ended December 31, 2025. Commission File Number: 001-40123. [COMPANY_REDACTED] Technologies, Inc. (formerly known as [COMPANY_REDACTED] Acquisition Corp., a blank check company). On July 15, 2025, [COMPANY_REDACTED] Acquisition Corp. completed its business combination with [COMPANY_REDACTED] Technologies, Inc., a privately held electric vehicle charging infrastructure company. State of incorporation: Delaware. Revenue: $180 million. Net loss: $(42) million.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Technologies, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-40123', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'spac'],
  },
  {
    id: 'GD-1208',
    description: '10-Q — cannabis company (emerging industry)',
    strippedText: 'FORM 10-Q. For the quarterly period ended June 30, 2025. Commission File Number: 000-56789. [COMPANY_REDACTED] Cannabis Corp. State of Incorporation: Colorado. Quarterly Revenue: $45.2 million. Gross Margin: 52%. Dispensary locations: 34. Cultivation facilities: 3. This filing contains forward-looking statements regarding the legalization landscape.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Cannabis Corp.', issuedDate: '2025-06-30', fieldOfStudy: 'Quarterly Report (10-Q)', licenseNumber: '000-56789', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-Q', 'edgar'],
  },
  {
    id: 'GD-1209',
    description: '8-K — dividend declaration',
    strippedText: 'FORM 8-K. Date of Report: March 25, 2026. Commission File Number: 001-02217. [COMPANY_REDACTED] & Co. Item 8.01 Other Events. On March 25, 2026, the Board of Directors declared a quarterly cash dividend of $1.63 per share on common stock, payable June 10, 2026 to shareholders of record on May 15, 2026. This represents a 5% increase from the prior quarterly dividend.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] & Co.', issuedDate: '2026-03-25', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-02217', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'dividend'],
  },
  {
    id: 'GD-1210',
    description: '10-K — healthcare REIT',
    strippedText: 'FORM 10-K. For the fiscal year ended December 31, 2025. Commission File Number: 001-11852. [COMPANY_REDACTED] Health Properties, Inc. Maryland (State of organization). The Company is a self-administered real estate investment trust (REIT). Portfolio: 1,200+ healthcare facilities across 46 states. Total revenues: $5.8 billion. Funds from operations (FFO): $2.1 billion. Occupancy rate: 82.4%.',
    credentialTypeHint: 'SEC_FILING',
    groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Health Properties, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-11852', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'reit'],
  },
  // Continue EDGAR entries
  {
    id: 'GD-1211', description: 'S-3 shelf registration', strippedText: 'FORM S-3. REGISTRATION STATEMENT UNDER THE SECURITIES ACT OF 1933. [COMPANY_REDACTED] Corp. Commission File Number: 001-23456. This registration statement covers the offer and sale from time to time of up to $2,000,000,000 in aggregate offering price of: Common Stock, Preferred Stock, Debt Securities, Warrants, and Units. Filed: January 15, 2026.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-01-15', fieldOfStudy: 'Shelf Registration (S-3)', licenseNumber: '001-23456', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'S-3', 'edgar'],
  },
  {
    id: 'GD-1212', description: '10-Q/A amendment — quarterly correction', strippedText: 'FORM 10-Q/A. (Amendment No. 1). For the quarterly period ended June 30, 2025. Commission File Number: 001-34567. [COMPANY_REDACTED] Systems, Inc. This Amendment corrects an error in the previously reported revenue recognition for the cloud services segment. Restated Q2 revenue: $1.2 billion (previously: $1.3 billion). The restatement results from the misapplication of ASC 606.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Systems, Inc.', issuedDate: '2025-06-30', fieldOfStudy: 'Quarterly Report Amendment (10-Q/A)', licenseNumber: '001-34567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-Q/A', 'edgar', 'amendment'],
  },
  {
    id: 'GD-1213', description: 'Form 3 — initial statement of beneficial ownership', strippedText: 'FORM 3. INITIAL STATEMENT OF BENEFICIAL OWNERSHIP OF SECURITIES. Filed pursuant to Section 16(a) of the Securities Exchange Act. Issuer: [COMPANY_REDACTED] Inc. Reporting Person: [NAME_REDACTED]. Date of Event: March 1, 2026. Relationship: Director (newly appointed). No securities beneficially owned at time of reporting.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-01', fieldOfStudy: 'Initial Beneficial Ownership (Form 3)', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'Form-3', 'edgar'],
  },
  {
    id: 'GD-1214', description: '10-K — small-cap company with going concern', strippedText: 'FORM 10-K. For the fiscal year ended December 31, 2025. Commission File Number: 000-78901. [COMPANY_REDACTED] Biotech, Inc. State: Nevada. Net loss: $(28.5) million. Cash: $3.2 million. The report of our independent auditors includes an explanatory paragraph that expresses substantial doubt about our ability to continue as a going concern. We will need to raise additional capital within the next 12 months.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Biotech, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '000-78901', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'going-concern'],
  },
  {
    id: 'GD-1215', description: '8-K — stock split announcement', strippedText: 'FORM 8-K. Date of Report: February 5, 2026. Commission File Number: 001-09576. [COMPANY_REDACTED] Holdings Inc. Item 8.01 Other Events. On February 5, 2026, the Board approved a 4-for-1 forward stock split of the Common Stock. Record date: March 15, 2026. Distribution date: March 22, 2026.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Holdings Inc.', issuedDate: '2026-02-05', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-09576', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'stock-split'],
  },
  {
    id: 'GD-1216', description: 'SC 14D-9 — tender offer recommendation', strippedText: 'SCHEDULE 14D-9. SOLICITATION/RECOMMENDATION STATEMENT UNDER SECTION 14(d)(4). Subject Company: [COMPANY_REDACTED] Corp. Commission File Number: 001-22345. Filed: March 10, 2026. Bidder: [PARTY_REDACTED] Holdings, LLC. Offer Price: $38.50 per share. THE BOARD OF DIRECTORS RECOMMENDS THAT STOCKHOLDERS ACCEPT THE OFFER AND TENDER THEIR SHARES.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-03-10', fieldOfStudy: 'Tender Offer Response (SC 14D-9)', licenseNumber: '001-22345', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'SC-14D-9', 'edgar', 'tender'],
  },
  {
    id: 'GD-1217', description: '8-K — SEC comment letter response', strippedText: 'FORM 8-K. Date of Report: January 18, 2026. Commission File Number: 001-55555. [COMPANY_REDACTED] Financial Corp. Item 4.02 Non-Reliance on Previously Issued Financial Statements. In response to comments received from the SEC Division of Corporation Finance regarding the Company\'s Form 10-K for fiscal year 2024, management concluded that revenue from certain insurance brokerage arrangements was incorrectly recognized. The Company will restate its financial statements for fiscal years 2024 and 2023.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Financial Corp.', issuedDate: '2026-01-18', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-55555', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '8-K', 'edgar', 'restatement'],
  },
  {
    id: 'GD-1218', description: '10-K — insurance company', strippedText: 'FORM 10-K. For fiscal year ended December 31, 2025. Commission File Number: 001-11523. [COMPANY_REDACTED] Insurance Group, Inc. Connecticut (State). Gross written premiums: $48.3 billion. Combined ratio: 94.2%. Net investment income: $6.1 billion. Statutory surplus: $32.8 billion. A.M. Best Rating: A++ (Superior).',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Insurance Group, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-11523', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'insurance'],
  },
  {
    id: 'GD-1219', description: '10-K — bank holding company', strippedText: 'FORM 10-K. For fiscal year ended December 31, 2025. Commission File Number: 001-03710. [COMPANY_REDACTED] Bancshares, Inc. North Carolina (State). Total assets: $3.1 trillion. Total deposits: $2.4 trillion. Net interest income: $54.2 billion. Tier 1 capital ratio: 12.1%. CET1 ratio: 11.4%. Total branches: 4,200.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Bancshares, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-03710', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', '10-K', 'edgar', 'banking'],
  },
  {
    id: 'GD-1220', description: 'DEF 14A — ESG shareholder proposal', strippedText: 'SCHEDULE 14A. [COMPANY_REDACTED] Corp. Filed: April 10, 2026. Annual Meeting: June 5, 2026. Shareholder Proposal No. 5 — Report on Climate Risk. WHEREAS, the Company has significant exposure to climate-related financial risks... RESOLVED, shareholders request the Company issue an annual report assessing the physical and transitional climate risks. THE BOARD RECOMMENDS A VOTE AGAINST THIS PROPOSAL. Supporting Statement: Filed by [PARTY_REDACTED] Pension Fund.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-04-10', fieldOfStudy: 'Proxy Statement (DEF 14A)', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-edgar', category: 'sec-filing', tags: ['synthetic', 'sec-filing', 'DEF-14A', 'edgar', 'esg'],
  },

  // ============================================================
  // LEGAL / CASE LAW (40 entries) — GD-1221 to GD-1260
  // ============================================================
  {
    id: 'GD-1221',
    description: 'SCOTUS opinion — Fourth Amendment digital privacy',
    strippedText: 'SUPREME COURT OF THE UNITED STATES. No. 24-891. [PARTY_REDACTED], PETITIONER v. UNITED STATES. ON WRIT OF CERTIORARI TO THE UNITED STATES COURT OF APPEALS FOR THE FOURTH CIRCUIT. [March 3, 2026]. JUSTICE [JUDGE_REDACTED] delivered the opinion of the Court. The Fourth Amendment protects "[t]he right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures." We hold that law enforcement\'s warrantless access to real-time location data from a cellular provider constitutes a search within the meaning of the Fourth Amendment. The judgment of the Court of Appeals is reversed. It is so ordered.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of the United States', issuedDate: '2026-03-03', fieldOfStudy: 'Constitutional Law', licenseNumber: 'No. 24-891', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'scotus', 'federal', 'fourth-amendment'],
  },
  {
    id: 'GD-1222',
    description: 'SCOTUS opinion — administrative law / Chevron doctrine',
    strippedText: 'SUPREME COURT OF THE UNITED STATES. No. 23-1025. [PARTY_REDACTED] FISHERIES, INC., ET AL., PETITIONERS v. [PARTY_REDACTED], SECRETARY OF COMMERCE. ON WRIT OF CERTIORARI TO THE UNITED STATES COURT OF APPEALS FOR THE FIRST CIRCUIT. [January 15, 2026]. Syllabus: The question presented is whether the Court should overrule Chevron U.S.A. Inc. v. Natural Resources Defense Council, Inc., 467 U.S. 837 (1984). Held: Chevron is overruled. Courts must exercise their independent judgment in deciding whether an agency has acted within its statutory authority. 6-3 decision.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of the United States', issuedDate: '2026-01-15', fieldOfStudy: 'Administrative Law', licenseNumber: 'No. 23-1025', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'scotus', 'federal', 'chevron'],
  },
  {
    id: 'GD-1223',
    description: 'Second Circuit — securities fraud class action',
    strippedText: 'UNITED STATES COURT OF APPEALS FOR THE SECOND CIRCUIT. No. 24-2345. [PARTY_REDACTED] PENSION FUND, on behalf of itself and all others similarly situated, Plaintiff-Appellant, v. [PARTY_REDACTED] CORPORATION and [NAME_REDACTED], Defendants-Appellees. Argued: October 15, 2025. Decided: February 8, 2026. Before: [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. [JUDGE_REDACTED], Circuit Judge: We consider whether allegations that a pharmaceutical company\'s CEO made optimistic statements about a drug pipeline suffice to plead scienter under the Private Securities Litigation Reform Act. We hold that they do. REVERSED AND REMANDED.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Second Circuit', issuedDate: '2026-02-08', fieldOfStudy: 'Securities Law', licenseNumber: 'No. 24-2345', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'securities'],
  },
  {
    id: 'GD-1224',
    description: 'Fifth Circuit — employment discrimination Title VII',
    strippedText: 'IN THE UNITED STATES COURT OF APPEALS FOR THE FIFTH CIRCUIT. No. 25-10234. [PARTY_REDACTED], Plaintiff-Appellant, v. [PARTY_REDACTED] HEALTH SYSTEM, Defendant-Appellee. Appeal from the United States District Court for the Northern District of Texas. Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. Filed: January 28, 2026. PER CURIAM: Plaintiff brought claims of race discrimination and retaliation under Title VII of the Civil Rights Act of 1964. The district court granted summary judgment to the employer. We AFFIRM in part and REVERSE in part.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Fifth Circuit', issuedDate: '2026-01-28', fieldOfStudy: 'Employment Law', licenseNumber: 'No. 25-10234', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'employment'],
  },
  {
    id: 'GD-1225',
    description: 'Ninth Circuit — patent infringement en banc',
    strippedText: 'UNITED STATES COURT OF APPEALS FOR THE NINTH CIRCUIT. No. 23-16789. EN BANC. [PARTY_REDACTED] INC., Plaintiff-Appellee, v. [PARTY_REDACTED] TECHNOLOGIES LTD., Defendant-Appellant. Argued and Submitted En Banc December 2, 2025. Filed: March 12, 2026. Before: [JUDGE_REDACTED], Chief Judge, and [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. Opinion by [JUDGE_REDACTED]. VACATED AND REMANDED. The panel majority\'s interpretation of the doctrine of equivalents in the context of AI-generated inventions is overruled.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Ninth Circuit', issuedDate: '2026-03-12', fieldOfStudy: 'Intellectual Property', licenseNumber: 'No. 23-16789', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'patent', 'en-banc'],
  },
  {
    id: 'GD-1226',
    description: 'D.C. Circuit — EPA clean air regulation challenge',
    strippedText: 'UNITED STATES COURT OF APPEALS FOR THE DISTRICT OF COLUMBIA CIRCUIT. No. 25-1089. [PARTY_REDACTED] MANUFACTURING ASSOCIATION, et al., Petitioners, v. ENVIRONMENTAL PROTECTION AGENCY, Respondent. Argued: November 18, 2025. Decided: February 20, 2026. Before: [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. [JUDGE_REDACTED], Circuit Judge: Petitioners challenge EPA\'s final rule establishing National Ambient Air Quality Standards for fine particulate matter (PM2.5). We deny the petition for review.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the District of Columbia Circuit', issuedDate: '2026-02-20', fieldOfStudy: 'Environmental Law', licenseNumber: 'No. 25-1089', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'environmental', 'dc-circuit'],
  },
  {
    id: 'GD-1227',
    description: 'SDNY District Court — antitrust class action',
    strippedText: 'UNITED STATES DISTRICT COURT SOUTHERN DISTRICT OF NEW YORK. Case No. 1:23-cv-08765-ABC-DEF. IN RE [PARTY_REDACTED] ANTITRUST LITIGATION. This Document Relates to: ALL ACTIONS. OPINION AND ORDER. [JUDGE_REDACTED], United States District Judge. Before the Court is Defendants\' Motion to Dismiss the Consolidated Class Action Complaint. Plaintiffs allege violations of Sections 1 and 2 of the Sherman Act, 15 U.S.C. §§ 1-2. For the reasons set forth below, the motion is GRANTED IN PART and DENIED IN PART. Dated: March 5, 2026. New York, New York.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States District Court for the Southern District of New York', issuedDate: '2026-03-05', fieldOfStudy: 'Antitrust Law', licenseNumber: '1:23-cv-08765-ABC-DEF', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'district', 'federal', 'antitrust', 'sdny'],
  },
  {
    id: 'GD-1228',
    description: 'N.D. Cal. District Court — tech IP dispute',
    strippedText: 'UNITED STATES DISTRICT COURT FOR THE NORTHERN DISTRICT OF CALIFORNIA. San Jose Division. Case No. 5:24-cv-01234-EJD. [PARTY_REDACTED] LLC, Plaintiff, v. [PARTY_REDACTED] INC., Defendant. ORDER GRANTING IN PART PLAINTIFF\'S MOTION FOR PRELIMINARY INJUNCTION. [JUDGE_REDACTED], United States District Judge. Plaintiff seeks to enjoin Defendant from using certain machine learning algorithms that Plaintiff alleges infringe U.S. Patent Nos. [REDACTED] and [REDACTED]. The Court finds that Plaintiff has demonstrated a likelihood of success on the merits. IT IS SO ORDERED. Dated: January 22, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States District Court for the Northern District of California', issuedDate: '2026-01-22', fieldOfStudy: 'Intellectual Property', licenseNumber: '5:24-cv-01234-EJD', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'district', 'federal', 'patent', 'ndcal'],
  },
  {
    id: 'GD-1229',
    description: 'Delaware Bankruptcy Court — Chapter 11 plan confirmation',
    strippedText: 'UNITED STATES BANKRUPTCY COURT FOR THE DISTRICT OF DELAWARE. Case No. 25-10234 (KBO). Chapter 11. In re: [COMPANY_REDACTED] RETAIL, INC., et al., Debtors. FINDINGS OF FACT, CONCLUSIONS OF LAW, AND ORDER CONFIRMING THE DEBTORS\' SECOND AMENDED JOINT CHAPTER 11 PLAN. [JUDGE_REDACTED], United States Bankruptcy Judge. The Court having considered the Plan, the Disclosure Statement, the ballots, and the evidence and argument presented at the Confirmation Hearing held on February 10-12, 2026. The Plan is CONFIRMED. Effective Date: March 1, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Bankruptcy Court for the District of Delaware', issuedDate: '2026-02-12', fieldOfStudy: 'Bankruptcy Law', licenseNumber: '25-10234', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'bankruptcy', 'federal', 'chapter-11'],
  },
  {
    id: 'GD-1230',
    description: 'California Supreme Court — data privacy opinion',
    strippedText: 'IN THE SUPREME COURT OF CALIFORNIA. [PARTY_REDACTED] et al., Plaintiffs and Appellants, v. [PARTY_REDACTED], INC., Defendant and Respondent. S284567. Filed March 18, 2026. Opinion of the Court by [JUDGE_REDACTED], C.J. We granted review to address whether the California Consumer Privacy Act (CCPA) creates a private right of action for violations of its opt-out provisions, independent of the data breach provision in Civil Code section 1798.150. We hold that it does not. The judgment of the Court of Appeal is affirmed.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of California', issuedDate: '2026-03-18', fieldOfStudy: 'Privacy Law', licenseNumber: 'S284567', jurisdiction: 'California, USA', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'california', 'privacy'],
  },
  {
    id: 'GD-1231',
    description: 'New York Court of Appeals — contract interpretation',
    strippedText: 'COURT OF APPEALS OF THE STATE OF NEW YORK. [PARTY_REDACTED] CORP., Appellant, v. [PARTY_REDACTED] LLC, Respondent. No. 23. Decided: February 6, 2026. OPINION OF THE COURT. [JUDGE_REDACTED], J. The question before us is whether an arbitration clause in a commercial lease survives the expiration of the lease term. We hold that it does, consistent with this Court\'s longstanding principle that arbitration clauses are presumptively severable. Order affirmed, with costs.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Court of Appeals of the State of New York', issuedDate: '2026-02-06', fieldOfStudy: 'Contract Law', licenseNumber: 'No. 23', jurisdiction: 'New York, USA', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'new-york', 'contract'],
  },
  {
    id: 'GD-1232',
    description: 'Texas Supreme Court — oil and gas royalty dispute',
    strippedText: 'IN THE SUPREME COURT OF TEXAS. No. 24-0567. [PARTY_REDACTED], Petitioner, v. [PARTY_REDACTED] ENERGY LLC, Respondent. ON PETITION FOR REVIEW FROM THE COURT OF APPEALS FOR THE SEVENTH DISTRICT OF TEXAS. JUSTICE [JUDGE_REDACTED] delivered the opinion of the Court. ARGUED October 8, 2025. DECIDED January 24, 2026. This case presents the question whether a mineral lessee\'s deduction of post-production costs from royalty payments violates the implied covenant to market. We reverse the court of appeals and render judgment for the lessee.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of Texas', issuedDate: '2026-01-24', fieldOfStudy: 'Property Law', licenseNumber: 'No. 24-0567', jurisdiction: 'Texas, USA', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'texas', 'oil-gas'],
  },
  {
    id: 'GD-1233',
    description: 'Florida District Court of Appeal — personal injury',
    strippedText: 'IN THE DISTRICT COURT OF APPEAL OF THE STATE OF FLORIDA. FOURTH DISTRICT. Case No. 4D24-1234. [PARTY_REDACTED], Appellant, v. [PARTY_REDACTED] HOSPITAL, INC., Appellee. Opinion filed February 12, 2026. Appeal from the Circuit Court for the Seventeenth Judicial Circuit, Broward County; [JUDGE_REDACTED], Judge. [JUDGE_REDACTED], J. Appellant appeals from a final judgment entered after a jury verdict in favor of the hospital in this medical malpractice action. We find no reversible error and AFFIRM.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'District Court of Appeal of Florida, Fourth District', issuedDate: '2026-02-12', fieldOfStudy: 'Tort Law', licenseNumber: '4D24-1234', jurisdiction: 'Florida, USA', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'florida', 'malpractice'],
  },
  {
    id: 'GD-1234',
    description: 'Illinois Appellate Court — criminal sentencing',
    strippedText: 'APPELLATE COURT OF ILLINOIS. FIRST DISTRICT. No. 1-24-0789. THE PEOPLE OF THE STATE OF ILLINOIS, Plaintiff-Appellee, v. [PARTY_REDACTED], Defendant-Appellant. JUSTICE [JUDGE_REDACTED] delivered the judgment of the court, with opinion. Presiding Justice [JUDGE_REDACTED] and Justice [JUDGE_REDACTED] concurred. Filed: March 1, 2026. Defendant appeals his conviction for aggravated battery, arguing that the trial court abused its discretion in imposing a 12-year sentence. We affirm.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Appellate Court of Illinois, First District', issuedDate: '2026-03-01', fieldOfStudy: 'Criminal Law', licenseNumber: '1-24-0789', jurisdiction: 'Illinois, USA', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'illinois', 'criminal'],
  },
  {
    id: 'GD-1235',
    description: 'NLRB administrative decision — unfair labor practice',
    strippedText: 'NATIONAL LABOR RELATIONS BOARD. DECISION AND ORDER. Cases 14-CA-345678 and 14-CA-345679. [COMPANY_REDACTED], Respondent, and [PARTY_REDACTED] Workers United, Charging Party. The Board has considered the decision of Administrative Law Judge [JUDGE_REDACTED] and the record in light of the exceptions and briefs. The Board adopts the judge\'s findings that Respondent violated Section 8(a)(1), (3), and (5) of the National Labor Relations Act by: (1) interrogating employees about their union activities; (2) terminating [NAME_REDACTED] for protected activity; (3) refusing to bargain with the Union. ORDER: Respondent shall cease and desist, reinstate [NAME_REDACTED], and make whole. Decided: February 25, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'National Labor Relations Board', issuedDate: '2026-02-25', fieldOfStudy: 'Labor Relations', licenseNumber: '14-CA-345678', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'administrative', 'nlrb', 'labor'],
  },
  {
    id: 'GD-1236',
    description: 'FTC administrative complaint — deceptive practices',
    strippedText: 'FEDERAL TRADE COMMISSION. In the Matter of [COMPANY_REDACTED], INC., a corporation. DOCKET NO. C-4789. COMPLAINT. The Federal Trade Commission, having reason to believe that [COMPANY_REDACTED], Inc. has violated the provisions of the Federal Trade Commission Act, and it appearing that a proceeding would be in the public interest, hereby issues its complaint: COUNT I: Deceptive Claims About AI-Generated Content. Respondent has represented that its AI tool generates 100% original content, when in fact significant portions are reproduced from copyrighted works. Filed: March 8, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Federal Trade Commission', issuedDate: '2026-03-08', fieldOfStudy: 'Consumer Protection', licenseNumber: 'C-4789', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'administrative', 'ftc', 'deceptive-practices'],
  },
  {
    id: 'GD-1237',
    description: 'Immigration Court — asylum decision',
    strippedText: 'UNITED STATES DEPARTMENT OF JUSTICE. EXECUTIVE OFFICE FOR IMMIGRATION REVIEW. IMMIGRATION COURT. [CITY_REDACTED], [STATE_REDACTED]. In the Matter of: [PARTY_REDACTED], Respondent. File No. A[REDACTED]. ORAL DECISION OF THE IMMIGRATION JUDGE. Date: January 30, 2026. [JUDGE_REDACTED], Immigration Judge. The respondent has applied for asylum under INA § 208, withholding of removal under INA § 241(b)(3), and protection under the Convention Against Torture. After considering the testimony and country conditions evidence, the Court GRANTS the application for asylum.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Immigration Court', issuedDate: '2026-01-30', fieldOfStudy: 'Immigration Law', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'administrative', 'immigration'],
  },
  {
    id: 'GD-1238',
    description: 'SEC ALJ decision — insider trading',
    strippedText: 'SECURITIES AND EXCHANGE COMMISSION. ADMINISTRATIVE PROCEEDING File No. 3-21456. In the Matter of [NAME_REDACTED], Respondent. INITIAL DECISION. [JUDGE_REDACTED], Administrative Law Judge. This matter involves insider trading by a former employee of [COMPANY_REDACTED] who traded on material nonpublic information about a pending acquisition. The Division of Enforcement proved by a preponderance of the evidence that Respondent violated Section 10(b) of the Exchange Act and Rule 10b-5. ORDERED: Respondent shall pay disgorgement of $245,000, prejudgment interest of $18,500, and a civil penalty of $245,000. Date: February 14, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Securities and Exchange Commission', issuedDate: '2026-02-14', fieldOfStudy: 'Securities Law', licenseNumber: '3-21456', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'administrative', 'sec', 'insider-trading'],
  },
  {
    id: 'GD-1239',
    description: 'Arbitration award — commercial dispute (AAA)',
    strippedText: 'AMERICAN ARBITRATION ASSOCIATION. Commercial Arbitration Division. Case No. 01-26-0001-2345. [PARTY_REDACTED] LLC, Claimant, v. [PARTY_REDACTED] CORP., Respondent. FINAL AWARD. [NAME_REDACTED], Arbitrator. Having considered the evidence, testimony, and post-hearing briefs, the Arbitrator finds in favor of Claimant. Respondent breached the Software License Agreement dated March 1, 2023. AWARD: Respondent shall pay $3,450,000 in damages plus $125,000 in arbitrator fees. This Award is in full and final resolution of all claims. Date: March 20, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'American Arbitration Association', issuedDate: '2026-03-20', fieldOfStudy: 'Contract Law', licenseNumber: '01-26-0001-2345', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'arbitration', 'commercial'],
  },
  {
    id: 'GD-1240',
    description: 'Social Security disability ALJ decision',
    strippedText: 'SOCIAL SECURITY ADMINISTRATION. OFFICE OF HEARINGS OPERATIONS. In the Case of: [NAME_REDACTED], Claimant. [NAME_REDACTED], Administrative Law Judge. DECISION. The claimant filed applications for disability insurance benefits and supplemental security income on May 15, 2024, alleging disability beginning January 1, 2024. After considering the entire record, I find that the claimant has been disabled within the meaning of the Social Security Act since January 1, 2024. The claimant has the severe impairments of degenerative disc disease and major depressive disorder. Decision Date: February 28, 2026.',
    credentialTypeHint: 'LEGAL',
    groundTruth: { credentialType: 'LEGAL', issuerName: 'Social Security Administration Office of Hearings Operations', issuedDate: '2026-02-28', fieldOfStudy: 'Social Security Disability', jurisdiction: 'United States', fraudSignals: [] },
    source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'administrative', 'ssa', 'disability'],
  },
  // More case law entries
  {
    id: 'GD-1241', description: 'Eleventh Circuit — habeas corpus', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE ELEVENTH CIRCUIT. No. 24-14567. [PARTY_REDACTED], Petitioner-Appellant, v. WARDEN, [FACILITY_REDACTED], Respondent-Appellee. Filed: March 15, 2026. Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. Petitioner appeals the denial of his 28 U.S.C. § 2254 petition challenging his state murder conviction. He argues ineffective assistance of counsel. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Eleventh Circuit', issuedDate: '2026-03-15', fieldOfStudy: 'Criminal Law', licenseNumber: 'No. 24-14567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'habeas'],
  },
  {
    id: 'GD-1242', description: 'Third Circuit — ERISA benefits dispute', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE THIRD CIRCUIT. No. 25-1890. [PARTY_REDACTED], Appellant, v. [PARTY_REDACTED] EMPLOYEE BENEFIT PLAN, Appellee. Filed: February 18, 2026. OPINION. [JUDGE_REDACTED], Circuit Judge. Appellant challenges the denial of long-term disability benefits under ERISA § 502(a)(1)(B), 29 U.S.C. § 1132(a)(1)(B). Applying the abuse of discretion standard, we REVERSE.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Third Circuit', issuedDate: '2026-02-18', fieldOfStudy: 'Employment Law', licenseNumber: 'No. 25-1890', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'erisa'],
  },
  {
    id: 'GD-1243', description: 'E.D. Pa. — False Claims Act qui tam', strippedText: 'UNITED STATES DISTRICT COURT FOR THE EASTERN DISTRICT OF PENNSYLVANIA. Civil Action No. 2:22-cv-04567. UNITED STATES OF AMERICA, ex rel. [PARTY_REDACTED], Relator, v. [PARTY_REDACTED] HEALTH SERVICES INC., Defendant. MEMORANDUM AND ORDER. [JUDGE_REDACTED], J. March 10, 2026. The Government intervened and moves for partial summary judgment on counts alleging Defendant submitted false claims to Medicare. GRANTED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States District Court for the Eastern District of Pennsylvania', issuedDate: '2026-03-10', fieldOfStudy: 'Healthcare Law', licenseNumber: '2:22-cv-04567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'district', 'federal', 'false-claims'],
  },
  {
    id: 'GD-1244', description: 'Georgia Supreme Court — wrongful death', strippedText: 'IN THE SUPREME COURT OF GEORGIA. Case No. S25A1234. [PARTY_REDACTED], Appellant, v. [PARTY_REDACTED] TRUCKING CO., Appellee. Decided: January 6, 2026. All the Justices concur. [JUDGE_REDACTED], Justice. This appeal involves the cap on noneconomic damages in wrongful death actions under OCGA § 51-12-12. We hold that the statutory cap is constitutional. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of Georgia', issuedDate: '2026-01-06', fieldOfStudy: 'Tort Law', licenseNumber: 'S25A1234', jurisdiction: 'Georgia, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'georgia', 'wrongful-death'],
  },
  {
    id: 'GD-1245', description: 'Massachusetts Appeals Court — landlord-tenant', strippedText: 'COMMONWEALTH OF MASSACHUSETTS. APPEALS COURT. No. 24-P-0456. [PARTY_REDACTED], Plaintiff, v. [PARTY_REDACTED], Defendant. Entered: February 25, 2026. MEMORANDUM AND ORDER PURSUANT TO RULE 23.0. Following a bench trial, the Housing Court judge found that the landlord violated G. L. c. 186, § 14 (interference with quiet enjoyment) and awarded the tenant treble damages of $18,000. We AFFIRM.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Massachusetts Appeals Court', issuedDate: '2026-02-25', fieldOfStudy: 'Property Law', licenseNumber: '24-P-0456', jurisdiction: 'Massachusetts, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'massachusetts', 'landlord-tenant'],
  },
  {
    id: 'GD-1246', description: 'Washington State Supreme Court — workers comp', strippedText: 'IN THE SUPREME COURT OF THE STATE OF WASHINGTON. No. 102345-6. [PARTY_REDACTED], Respondent, v. DEPARTMENT OF LABOR AND INDUSTRIES, Appellant. Filed March 5, 2026. En Banc. [JUDGE_REDACTED], J. We accepted review to determine whether the Industrial Insurance Act, RCW 51.08.013, covers repetitive stress injuries from remote work. We hold that it does. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court of the State of Washington', issuedDate: '2026-03-05', fieldOfStudy: 'Employment Law', licenseNumber: '102345-6', jurisdiction: 'Washington, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'washington', 'workers-comp'],
  },
  {
    id: 'GD-1247', description: 'Tax Court — IRS deduction dispute', strippedText: 'UNITED STATES TAX COURT. T.C. Memo. 2026-15. [PARTY_REDACTED], Petitioner v. COMMISSIONER OF INTERNAL REVENUE, Respondent. Docket No. 12345-24. Filed: February 10, 2026. [JUDGE_REDACTED], Judge. Petitioner claimed deductions of $1.2 million for purported charitable contributions. The IRS disallowed the deductions in a notice of deficiency. We sustain the deficiency determination. Decision will be entered for respondent.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Tax Court', issuedDate: '2026-02-10', fieldOfStudy: 'Tax Law', licenseNumber: '12345-24', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'tax-court', 'federal', 'tax'],
  },
  {
    id: 'GD-1248', description: 'Colorado Supreme Court — cannabis regulation', strippedText: 'SUPREME COURT, STATE OF COLORADO. Case No. 24SC567. [PARTY_REDACTED], LLC, Petitioner v. COLORADO DEPARTMENT OF REVENUE, MARIJUANA ENFORCEMENT DIVISION, Respondent. Opinion of the Court by JUSTICE [JUDGE_REDACTED]. Announced March 15, 2026. We hold that the Marijuana Enforcement Division exceeded its authority under the Colorado Marijuana Code when it revoked Petitioner\'s license. REVERSED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Supreme Court, State of Colorado', issuedDate: '2026-03-15', fieldOfStudy: 'Administrative Law', licenseNumber: '24SC567', jurisdiction: 'Colorado, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-supreme', 'colorado', 'cannabis'],
  },
  {
    id: 'GD-1249', description: 'Seventh Circuit — ADA discrimination', strippedText: 'IN THE UNITED STATES COURT OF APPEALS FOR THE SEVENTH CIRCUIT. No. 25-1567. [PARTY_REDACTED], Plaintiff-Appellant, v. [PARTY_REDACTED] UNIVERSITY, Defendant-Appellee. Argued January 15, 2026. Decided March 8, 2026. Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. [JUDGE_REDACTED], Circuit Judge. Plaintiff-Appellant, a student with ADHD, alleges that the university violated Title III of the Americans with Disabilities Act by denying reasonable accommodations for standardized examinations. We REVERSE.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Seventh Circuit', issuedDate: '2026-03-08', fieldOfStudy: 'Civil Rights Law', licenseNumber: 'No. 25-1567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'ada', 'disability'],
  },
  {
    id: 'GD-1250', description: 'Federal Circuit — trade secret (ITC)', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE FEDERAL CIRCUIT. No. 2025-1789. [PARTY_REDACTED] INC., Appellant, v. INTERNATIONAL TRADE COMMISSION, Appellee. Decided: January 30, 2026. Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. The Commission found a violation of Section 337 of the Tariff Act based on misappropriation of trade secrets relating to semiconductor manufacturing processes. We AFFIRM the limited exclusion order.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Federal Circuit', issuedDate: '2026-01-30', fieldOfStudy: 'Intellectual Property', licenseNumber: 'No. 2025-1789', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'trade-secret', 'itc'],
  },
  // Additional case law
  {
    id: 'GD-1251', description: 'Ohio appellate — family law custody', strippedText: 'COURT OF APPEALS OF OHIO, EIGHTH APPELLATE DISTRICT. COUNTY OF CUYAHOGA. Case No. 113456. [PARTY_REDACTED], Plaintiff-Appellant v. [PARTY_REDACTED], Defendant-Appellee. JOURNAL ENTRY AND OPINION. Released: March 20, 2026. [JUDGE_REDACTED], P.J. Father appeals the domestic relations court\'s custody modification awarding primary custody to Mother. Applying the abuse of discretion standard, we AFFIRM.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Court of Appeals of Ohio, Eighth Appellate District', issuedDate: '2026-03-20', fieldOfStudy: 'Family Law', licenseNumber: '113456', jurisdiction: 'Ohio, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'ohio', 'family'],
  },
  {
    id: 'GD-1252', description: 'New Jersey Superior Court — zoning appeal', strippedText: 'SUPERIOR COURT OF NEW JERSEY. APPELLATE DIVISION. DOCKET NO. A-1234-24T4. [PARTY_REDACTED], Plaintiff-Appellant, v. ZONING BOARD OF ADJUSTMENT OF THE TOWNSHIP OF [TOWNSHIP_REDACTED], Defendant-Respondent. Submitted: February 10, 2026. Decided: March 12, 2026. Before Judges [JUDGE_REDACTED] and [JUDGE_REDACTED]. PER CURIAM. Plaintiff appeals the Board\'s denial of a use variance for a mixed-use development. We find the Board\'s decision was supported by substantial credible evidence in the record. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Superior Court of New Jersey, Appellate Division', issuedDate: '2026-03-12', fieldOfStudy: 'Property Law', licenseNumber: 'A-1234-24T4', jurisdiction: 'New Jersey, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'new-jersey', 'zoning'],
  },
  {
    id: 'GD-1253', description: 'Sixth Circuit — First Amendment / social media', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE SIXTH CIRCUIT. No. 25-3456. [PARTY_REDACTED], Plaintiff-Appellee, v. [PARTY_REDACTED] SCHOOL DISTRICT, Defendant-Appellant. Filed: February 28, 2026. OPINION. [JUDGE_REDACTED], Circuit Judge. The school district suspended a teacher for social media posts criticizing district policies. We hold the posts constituted speech on matters of public concern protected by the First Amendment. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Sixth Circuit', issuedDate: '2026-02-28', fieldOfStudy: 'Constitutional Law', licenseNumber: 'No. 25-3456', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'first-amendment'],
  },
  {
    id: 'GD-1254', description: 'D. Del. — Hatch-Waxman patent litigation', strippedText: 'IN THE UNITED STATES DISTRICT COURT FOR THE DISTRICT OF DELAWARE. C.A. No. 24-123-GBW. [PARTY_REDACTED] INC., Plaintiff, v. [PARTY_REDACTED] PHARMACEUTICALS LLC, Defendant. MEMORANDUM OPINION. [JUDGE_REDACTED], District Judge. March 5, 2026. This is a Hatch-Waxman Act patent infringement case. Defendant filed an ANDA seeking approval to market a generic version of Plaintiff\'s drug. The Court finds Claims 1-5 of U.S. Patent No. [REDACTED] are NOT INVALID and are INFRINGED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States District Court for the District of Delaware', issuedDate: '2026-03-05', fieldOfStudy: 'Intellectual Property', licenseNumber: '24-123-GBW', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'district', 'federal', 'patent', 'hatch-waxman'],
  },
  {
    id: 'GD-1255', description: 'Virginia Circuit Court — breach of fiduciary duty', strippedText: 'CIRCUIT COURT OF THE CITY OF RICHMOND. Case No. CL24-5678. [PARTY_REDACTED], Plaintiff, v. [PARTY_REDACTED], Defendant. OPINION LETTER. [JUDGE_REDACTED], Judge. February 20, 2026. Plaintiff alleges Defendant, as trustee of the [NAME_REDACTED] Family Trust, breached fiduciary duties through self-dealing transactions totaling $2.3 million. The Court finds for Plaintiff and orders Defendant removed as trustee.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Circuit Court of the City of Richmond', issuedDate: '2026-02-20', fieldOfStudy: 'Trust Law', licenseNumber: 'CL24-5678', jurisdiction: 'Virginia, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-trial', 'virginia', 'fiduciary'],
  },
  {
    id: 'GD-1256', description: 'Tenth Circuit — immigration / BIA appeal', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE TENTH CIRCUIT. No. 25-9567. [PARTY_REDACTED], Petitioner, v. MERRICK B. GARLAND, Attorney General, Respondent. Filed: March 22, 2026. ON PETITION FOR REVIEW OF AN ORDER OF THE BOARD OF IMMIGRATION APPEALS (BIA No. A[REDACTED]). Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. Petitioner seeks review of the BIA\'s denial of cancellation of removal. PETITION DENIED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Tenth Circuit', issuedDate: '2026-03-22', fieldOfStudy: 'Immigration Law', licenseNumber: 'No. 25-9567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'immigration'],
  },
  {
    id: 'GD-1257', description: 'Michigan Court of Appeals — DUI / OWI', strippedText: 'STATE OF MICHIGAN COURT OF APPEALS. No. 367890. PEOPLE OF THE STATE OF MICHIGAN, Plaintiff-Appellee, v. [PARTY_REDACTED], Defendant-Appellant. UNPUBLISHED. Per Curiam. Submitted: January 20, 2026. Decided: February 15, 2026. Defendant appeals as of right his conviction for operating while intoxicated (OWI), third offense, MCL 257.625(9)(c). He argues the traffic stop was unconstitutional. We disagree. AFFIRMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Michigan Court of Appeals', issuedDate: '2026-02-15', fieldOfStudy: 'Criminal Law', licenseNumber: '367890', jurisdiction: 'Michigan, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'state-appellate', 'michigan', 'criminal', 'dui'],
  },
  {
    id: 'GD-1258', description: 'S.D. Tex. — securities class action settlement', strippedText: 'UNITED STATES DISTRICT COURT SOUTHERN DISTRICT OF TEXAS HOUSTON DIVISION. Civil Action No. 4:23-cv-04567. IN RE [COMPANY_REDACTED] SECURITIES LITIGATION. ORDER GRANTING FINAL APPROVAL OF CLASS ACTION SETTLEMENT. [JUDGE_REDACTED], United States District Judge. March 25, 2026. The Court hereby approves the Settlement of $125,000,000, finds it fair, reasonable, and adequate, and certifies the Settlement Class. Lead Counsel awarded fees of 25% plus expenses.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States District Court for the Southern District of Texas', issuedDate: '2026-03-25', fieldOfStudy: 'Securities Law', licenseNumber: '4:23-cv-04567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'district', 'federal', 'securities', 'settlement'],
  },
  {
    id: 'GD-1259', description: 'Arizona municipal court — code violation', strippedText: 'PHOENIX MUNICIPAL COURT. CITY OF PHOENIX, Plaintiff v. [PARTY_REDACTED], Defendant. Case No. MC-2025-98765. JUDGMENT AND ORDER. The Court finds Defendant guilty of violating Phoenix City Code § 36-142 (noise ordinance) and § 36-143 (nuisance). Fine: $500. Community service: 40 hours. Date: February 5, 2026. [JUDGE_REDACTED], Municipal Court Judge.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Phoenix Municipal Court', issuedDate: '2026-02-05', fieldOfStudy: 'Administrative Law', licenseNumber: 'MC-2025-98765', jurisdiction: 'Arizona, USA', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'municipal', 'arizona', 'local'],
  },
  {
    id: 'GD-1260', description: 'Eighth Circuit — environmental enforcement', strippedText: 'UNITED STATES COURT OF APPEALS FOR THE EIGHTH CIRCUIT. No. 25-2345. UNITED STATES OF AMERICA, Plaintiff-Appellee, v. [PARTY_REDACTED] MINING CORP., Defendant-Appellant. Submitted: December 10, 2025. Filed: February 22, 2026. Before [JUDGE_REDACTED], [JUDGE_REDACTED], and [JUDGE_REDACTED], Circuit Judges. [JUDGE_REDACTED], Circuit Judge. The district court imposed a $4.5 million civil penalty for violations of the Clean Water Act. We AFFIRM.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Eighth Circuit', issuedDate: '2026-02-22', fieldOfStudy: 'Environmental Law', licenseNumber: 'No. 25-2345', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-case-law', category: 'case-law', tags: ['synthetic', 'case-law', 'circuit', 'federal', 'environmental'],
  },

  // ============================================================
  // ATTESTATION (30 entries) — GD-1261 to GD-1290
  // ============================================================
  {
    id: 'GD-1261', description: 'Employment verification — tech company senior engineer', strippedText: 'EMPLOYMENT VERIFICATION. Date: March 15, 2026. To Whom It May Concern: This letter confirms that [NAME_REDACTED] has been employed by [COMPANY_REDACTED] Inc. since June 15, 2020 as a Senior Software Engineer in the Platform Engineering division. Current annual compensation: [SALARY_REDACTED]. Employment status: Full-time, active employee in good standing. This letter is provided at the employee\'s request for mortgage application purposes. Human Resources Department, [COMPANY_REDACTED] Inc., Seattle, WA.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-15', fieldOfStudy: 'Software Engineering', jurisdiction: 'Washington, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'employment-verification'],
  },
  {
    id: 'GD-1262', description: 'Employment verification — hospital nurse', strippedText: 'TO WHOM IT MAY CONCERN. Date: February 20, 2026. Re: Verification of Employment for [NAME_REDACTED], RN. This is to verify that [NAME_REDACTED] has been employed at [HOSPITAL_REDACTED] Medical Center since August 1, 2018. Position: Registered Nurse, Intensive Care Unit. Employment Status: Full-time. Average Weekly Hours: 36. [NAME_REDACTED] is in good standing and currently active. Signed: [NAME_REDACTED], RN, MSN, Director of Nursing. [HOSPITAL_REDACTED] Medical Center, Houston, TX 77030.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[HOSPITAL_REDACTED] Medical Center', issuedDate: '2026-02-20', fieldOfStudy: 'Nursing', jurisdiction: 'Texas, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'employment-verification', 'healthcare'],
  },
  {
    id: 'GD-1263', description: 'Education verification — master\'s degree', strippedText: 'OFFICE OF THE REGISTRAR. [UNIVERSITY_REDACTED]. TO WHOM IT MAY CONCERN. Date: January 10, 2026. This letter verifies that [NAME_REDACTED] was enrolled in the Master of Science in Data Science program at [UNIVERSITY_REDACTED] from August 2022 through December 2024. Degree Awarded: Master of Science. Major: Data Science. Date Conferred: December 15, 2024. Final GPA: [GPA_REDACTED]. This verification is provided for employment background check purposes. Registrar\'s Office, [UNIVERSITY_REDACTED], Boston, MA.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[UNIVERSITY_REDACTED]', issuedDate: '2026-01-10', fieldOfStudy: 'Data Science', degreeLevel: 'Master', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'education-verification'],
  },
  {
    id: 'GD-1264', description: 'Sworn affidavit — immigration support', strippedText: 'AFFIDAVIT OF SUPPORT. I, [NAME_REDACTED], being duly sworn, depose and state: 1. I am a citizen of the United States, residing at [ADDRESS_REDACTED], New York, NY. 2. I have known [NAME_REDACTED] for twelve (12) years. 3. I am employed as a Civil Engineer at [COMPANY_REDACTED]. Annual income: [INCOME_REDACTED]. 4. I agree to sponsor [NAME_REDACTED] and maintain them at an income level at or above 125% of the Federal Poverty Guidelines. Sworn before me this 5th day of March, 2026. [NAME_REDACTED], Notary Public, State of New York. Commission expires: September 30, 2028.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[NAME_REDACTED]', issuedDate: '2026-03-05', fieldOfStudy: 'Civil Engineering', jurisdiction: 'New York, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'affidavit', 'immigration'],
  },
  {
    id: 'GD-1265', description: 'Letter of good standing — bar association', strippedText: 'STATE BAR OF CALIFORNIA. CERTIFICATE OF STANDING. Date: March 1, 2026. TO WHOM IT MAY CONCERN: This is to certify that [NAME_REDACTED], State Bar Number [REDACTED], was admitted to practice law in the State of California on November 15, 2015 and is currently an ACTIVE member in GOOD STANDING. There are no disciplinary actions, pending charges, or complaints on record. This certificate is issued for pro hac vice admission purposes. The State Bar of California, 180 Howard Street, San Francisco, CA 94105.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'State Bar of California', issuedDate: '2026-03-01', fieldOfStudy: 'Law', jurisdiction: 'California, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'good-standing', 'bar'],
  },
  {
    id: 'GD-1266', description: 'Income verification letter — bank loan', strippedText: 'INCOME AND EMPLOYMENT VERIFICATION. [COMPANY_REDACTED] Financial Services, LLC. Date: February 28, 2026. To: [BANK_REDACTED] Mortgage Division. Re: Income Verification for [NAME_REDACTED]. This letter confirms: Employee Name: [NAME_REDACTED]. Position: Vice President, Investment Banking. Start Date: March 1, 2021. Employment Status: Full-time. Base Annual Salary: [SALARY_REDACTED]. Most Recent Bonus: [BONUS_REDACTED]. Total W-2 Compensation (2025): [COMP_REDACTED]. This information is confidential. Signed: [NAME_REDACTED], Managing Director, Human Capital Management.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Financial Services, LLC', issuedDate: '2026-02-28', fieldOfStudy: 'Investment Banking', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'income-verification'],
  },
  {
    id: 'GD-1267', description: 'Character reference — court proceeding', strippedText: 'CHARACTER REFERENCE LETTER. March 10, 2026. The Honorable [JUDGE_REDACTED], Superior Court of [COUNTY_REDACTED] County, State of [STATE_REDACTED]. Re: [NAME_REDACTED], Case No. [REDACTED]. Dear Judge [JUDGE_REDACTED]: I write to provide a character reference for [NAME_REDACTED], whom I have known for twenty years as a colleague, neighbor, and fellow volunteer at [ORGANIZATION_REDACTED] Soup Kitchen. [NAME_REDACTED] has consistently demonstrated integrity, compassion, and commitment to community service. Respectfully, [NAME_REDACTED], PhD, Professor of Psychology, [UNIVERSITY_REDACTED].',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[UNIVERSITY_REDACTED]', issuedDate: '2026-03-10', fieldOfStudy: 'Psychology', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'character-reference', 'court'],
  },
  {
    id: 'GD-1268', description: 'Enrollment verification — current student', strippedText: 'ENROLLMENT VERIFICATION. [UNIVERSITY_REDACTED] School of Law. Date: January 15, 2026. This certifies that [NAME_REDACTED] is currently enrolled as a full-time student at [UNIVERSITY_REDACTED] School of Law. Program: Juris Doctor (J.D.). Expected Graduation: May 2027. Current Enrollment Status: Full-time (15 credit hours). Academic Standing: Good Standing. This letter is issued for student loan deferment purposes. Office of the Registrar.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[UNIVERSITY_REDACTED] School of Law', issuedDate: '2026-01-15', fieldOfStudy: 'Law', degreeLevel: 'Doctorate', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'enrollment-verification'],
  },
  {
    id: 'GD-1269', description: 'Professional reference — engineering manager', strippedText: 'PROFESSIONAL REFERENCE. Date: February 5, 2026. To Whom It May Concern: I am writing in support of [NAME_REDACTED]\'s application for the Principal Engineer position at your organization. As the VP of Engineering at [COMPANY_REDACTED], I managed [NAME_REDACTED] directly from 2021 to 2025. During this time, [NAME_REDACTED] led the redesign of our distributed systems infrastructure, reducing latency by 40% and saving $2M annually in cloud costs. [NAME_REDACTED] consistently performed at the highest level and was promoted twice. Sincerely, [NAME_REDACTED], VP Engineering, [COMPANY_REDACTED], San Francisco, CA.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED]', issuedDate: '2026-02-05', fieldOfStudy: 'Engineering', jurisdiction: 'California, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'professional-reference'],
  },
  {
    id: 'GD-1270', description: 'Notarized statement — property ownership', strippedText: 'NOTARIZED STATEMENT. STATE OF TEXAS. COUNTY OF HARRIS. Before me, [NAME_REDACTED], a Notary Public in and for the State of Texas, personally appeared [NAME_REDACTED], known to me to be the person who executed the following statement: I, [NAME_REDACTED], do hereby state under oath that I am the sole owner of the property located at [ADDRESS_REDACTED], Houston, TX 77001, described as Lot [REDACTED], Block [REDACTED]. The property is free and clear of all liens and encumbrances. Subscribed and sworn before me on this 15th day of February, 2026. [SEAL]. Notary Public, State of Texas. My Commission Expires: July 31, 2029.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Notary Public, State of Texas', issuedDate: '2026-02-15', jurisdiction: 'Texas, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'notarized', 'property'],
  },
  {
    id: 'GD-1271', description: 'Employment verification — government employee', strippedText: 'DEPARTMENT OF DEFENSE. DEFENSE FINANCE AND ACCOUNTING SERVICE. EMPLOYMENT AND INCOME VERIFICATION. Date: March 20, 2026. Employee: [NAME_REDACTED]. Agency: Department of the Army. Position: GS-13, Program Analyst. Start Date: January 10, 2018. Employment Type: Full-time, Permanent. Annual Salary: [SALARY_REDACTED]. Security Clearance: [REDACTED]. This verification is provided pursuant to the employee\'s written authorization. DFAS Indianapolis, IN 46249.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Defense Finance and Accounting Service', issuedDate: '2026-03-20', fieldOfStudy: 'Program Analysis', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'employment-verification', 'government'],
  },
  {
    id: 'GD-1272', description: 'Academic recommendation — PhD application', strippedText: 'LETTER OF RECOMMENDATION. [UNIVERSITY_REDACTED] Department of Computer Science. March 1, 2026. To the PhD Admissions Committee: It is my privilege to recommend [NAME_REDACTED] for your doctoral program in Artificial Intelligence. I supervised [NAME_REDACTED]\'s master\'s thesis on efficient transformer architectures, which resulted in a publication at NeurIPS 2025. [NAME_REDACTED] is among the top 5% of graduate students I have mentored in my 20-year career. [NAME_REDACTED], PhD, Distinguished Professor of Computer Science.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[UNIVERSITY_REDACTED]', issuedDate: '2026-03-01', fieldOfStudy: 'Artificial Intelligence', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'recommendation', 'academic'],
  },
  {
    id: 'GD-1273', description: 'Sworn declaration — patent prosecution', strippedText: 'DECLARATION UNDER 37 C.F.R. § 1.132. IN THE UNITED STATES PATENT AND TRADEMARK OFFICE. Application No.: [REDACTED]. Filing Date: [REDACTED]. Title: Machine Learning-Based Document Authentication. I, [NAME_REDACTED], declare as follows: 1. I am a named inventor on the above-referenced application. 2. I have a PhD in Computer Science from [UNIVERSITY_REDACTED]. 3. I have over 15 years of experience in machine learning and document analysis. 4. The claimed invention would not have been obvious to one of ordinary skill in the art. I declare under penalty of perjury that the foregoing is true and correct. Date: February 10, 2026.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-02-10', fieldOfStudy: 'Machine Learning', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'declaration', 'patent'],
  },
  {
    id: 'GD-1274', description: 'Verification of professional experience — PE licensure', strippedText: 'VERIFICATION OF QUALIFYING EXPERIENCE. Date: January 25, 2026. To: State Board of Professional Engineers. Re: [NAME_REDACTED] — Application for PE Licensure. I, [NAME_REDACTED], PE, License No. [REDACTED], certify that [NAME_REDACTED] has worked under my direct supervision at [COMPANY_REDACTED] Engineering from July 2020 to December 2025. During this period, [NAME_REDACTED] performed qualifying engineering work including structural analysis, foundation design, and construction inspection. Total qualifying experience: 5 years, 6 months. [NAME_REDACTED], PE, Principal Engineer.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Engineering', issuedDate: '2026-01-25', fieldOfStudy: 'Structural Engineering', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'professional-experience', 'engineering'],
  },
  {
    id: 'GD-1275', description: 'Tenant reference letter', strippedText: 'TENANT REFERENCE LETTER. [COMPANY_REDACTED] Property Management. Date: March 8, 2026. To Whom It May Concern: This letter confirms that [NAME_REDACTED] was a tenant at [ADDRESS_REDACTED], Apt [REDACTED], Chicago, IL 60614 from April 1, 2023 through February 28, 2026. Monthly rent: [RENT_REDACTED]. Payment history: All payments made on time. Lease violations: None. Move-out condition: Excellent. We would rent to [NAME_REDACTED] again without reservation. [NAME_REDACTED], Property Manager.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Property Management', issuedDate: '2026-03-08', jurisdiction: 'Illinois, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'tenant-reference'],
  },
  {
    id: 'GD-1276', description: 'Volunteer service verification', strippedText: 'VERIFICATION OF VOLUNTEER SERVICE. [ORGANIZATION_REDACTED] International. Date: February 15, 2026. This certifies that [NAME_REDACTED] has served as a volunteer with [ORGANIZATION_REDACTED] International from January 2023 to present. Role: Pro Bono Legal Advisor. Total Hours: 450+. Projects: Asylum case support (12 cases), Know Your Rights presentations (8 sessions). [NAME_REDACTED]\'s contributions have been invaluable. Signed: [NAME_REDACTED], Executive Director.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[ORGANIZATION_REDACTED] International', issuedDate: '2026-02-15', fieldOfStudy: 'Law', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'volunteer'],
  },
  {
    id: 'GD-1277', description: 'Expert witness declaration', strippedText: 'EXPERT DECLARATION OF [NAME_REDACTED], PhD. I, [NAME_REDACTED], declare under penalty of perjury: 1. I have been retained by counsel for [PARTY_REDACTED] as an expert witness. 2. Qualifications: PhD in Economics, [UNIVERSITY_REDACTED] (2005). 20+ years experience in financial damages analysis. 3. I have authored 45 peer-reviewed publications. 4. Compensation: $750/hour for testimony, $500/hour for research. 5. Based on my analysis, the economic damages total $12.5 million. Date: March 18, 2026.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[UNIVERSITY_REDACTED]', issuedDate: '2026-03-18', fieldOfStudy: 'Economics', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'expert-witness'],
  },
  {
    id: 'GD-1278', description: 'Internship completion letter', strippedText: 'INTERNSHIP COMPLETION CERTIFICATE. [COMPANY_REDACTED] Consulting Group. Date: August 30, 2025. This letter certifies that [NAME_REDACTED] successfully completed a 12-week summer internship with [COMPANY_REDACTED] Consulting Group from June 3, 2025 through August 23, 2025. Department: Strategy & Operations. Performance Rating: Exceeds Expectations. The intern contributed to 3 client engagements and delivered a capstone presentation to senior partners. Signed: [NAME_REDACTED], Partner, [COMPANY_REDACTED] Consulting Group, New York, NY.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Consulting Group', issuedDate: '2025-08-30', fieldOfStudy: 'Strategy and Operations', jurisdiction: 'New York, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'internship'],
  },
  {
    id: 'GD-1279', description: 'Apostille — document authentication', strippedText: 'APOSTILLE (Convention de La Haye du 5 octobre 1961). 1. Country: United States of America. This public document: 2. Has been signed by [NAME_REDACTED]. 3. Acting in the capacity of Notary Public. 4. Bears the seal/stamp of the State of New York. Certified: 5. At Albany. 6. On March 12, 2026. 7. By the Secretary of State. 8. No. APO-2026-NY-045678. 9. Seal: State of New York. 10. Signature: [NAME_REDACTED], Deputy Secretary of State.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Secretary of State of New York', issuedDate: '2026-03-12', jurisdiction: 'New York, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'apostille'],
  },
  {
    id: 'GD-1280', description: 'Background check authorization result', strippedText: 'CONSUMER REPORT — BACKGROUND CHECK RESULTS. [COMPANY_REDACTED] Background Services, Inc. Report Date: February 25, 2026. Subject: [NAME_REDACTED]. Report No. [REDACTED]. Criminal Records: No records found (nationwide search). Sex Offender Registry: Clear. Education Verification: Confirmed — BS Computer Science, [UNIVERSITY_REDACTED], 2018. Employment Verification: Confirmed — [COMPANY_REDACTED], Software Engineer, 2018-2025. Credit Check: Not requested. This report was prepared in compliance with the FCRA.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Background Services, Inc.', issuedDate: '2026-02-25', fieldOfStudy: 'Computer Science', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'background-check'],
  },
  {
    id: 'GD-1281', description: 'Medical fitness attestation — pilot', strippedText: 'FEDERAL AVIATION ADMINISTRATION. OFFICE OF AEROSPACE MEDICINE. MEDICAL CERTIFICATE ATTESTATION. Date: January 20, 2026. This attests that [NAME_REDACTED], Certificate No. [REDACTED], has met all medical requirements for a First-Class Airman Medical Certificate as of the examination date of January 15, 2026. Valid through: January 31, 2027. Examining physician: [NAME_REDACTED], MD, AME Designation No. [REDACTED]. No waivers or limitations. Oklahoma City, OK.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Federal Aviation Administration', issuedDate: '2026-01-20', fieldOfStudy: 'Aviation Medicine', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'medical-fitness', 'faa'],
  },
  {
    id: 'GD-1282', description: 'CPA firm attestation — financial statement review', strippedText: 'INDEPENDENT ACCOUNTANT\'S REVIEW REPORT. To the Board of Directors and Shareholders of [COMPANY_REDACTED] Inc. We have reviewed the accompanying financial statements of [COMPANY_REDACTED] Inc. for the year ended December 31, 2025. A review consists principally of applying analytical procedures and making inquiries. A review is substantially less in scope than an audit. Based on our review, we are not aware of any material modifications that should be made. [COMPANY_REDACTED] LLP, Certified Public Accountants. March 15, 2026. Chicago, IL.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] LLP', issuedDate: '2026-03-15', fieldOfStudy: 'Accounting', jurisdiction: 'Illinois, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'cpa-review', 'financial'],
  },
  {
    id: 'GD-1283', description: 'Clinical hours verification — therapist licensure', strippedText: 'VERIFICATION OF SUPERVISED CLINICAL HOURS. Date: February 1, 2026. To: State Board of Licensed Professional Counselors. Re: [NAME_REDACTED] — Application for LPC Licensure. I certify that [NAME_REDACTED] completed 3,000 hours of post-master\'s supervised clinical experience under my supervision from January 2023 through January 2026. Settings: Individual therapy (1,800 hours), Group therapy (600 hours), Assessment (400 hours), Crisis intervention (200 hours). Supervisor: [NAME_REDACTED], LPC-S, License No. [REDACTED].',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[NAME_REDACTED], LPC-S', issuedDate: '2026-02-01', fieldOfStudy: 'Professional Counseling', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'clinical-hours', 'counseling'],
  },
  {
    id: 'GD-1284', description: 'Employment termination verification', strippedText: 'VERIFICATION OF EMPLOYMENT — SEPARATION. [COMPANY_REDACTED] Corp. Human Resources. Date: March 5, 2026. To Whom It May Concern: This confirms that [NAME_REDACTED] was employed by [COMPANY_REDACTED] Corp. from April 15, 2019 through February 28, 2026. Last position held: Director of Product Management. Reason for separation: Voluntary resignation. Eligible for rehire: Yes. This letter is provided at the former employee\'s request and does not constitute a recommendation. HR Services, [COMPANY_REDACTED] Corp.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Corp.', issuedDate: '2026-03-05', fieldOfStudy: 'Product Management', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'employment-separation'],
  },
  {
    id: 'GD-1285', description: 'Residency training verification — physician', strippedText: 'VERIFICATION OF GRADUATE MEDICAL EDUCATION. [HOSPITAL_REDACTED] Medical Center. Department of Medical Education. Date: January 30, 2026. This certifies that [NAME_REDACTED], MD completed the following training: Program: Internal Medicine Residency. Duration: July 1, 2022 — June 30, 2025. Board Eligible: Yes (ABIM). Completed in good standing. Program Director: [NAME_REDACTED], MD, FACP. ACGME Program Number: [REDACTED]. This verification is issued for credentialing purposes.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[HOSPITAL_REDACTED] Medical Center', issuedDate: '2026-01-30', fieldOfStudy: 'Internal Medicine', accreditingBody: 'ACGME', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'residency-verification', 'medical'],
  },
  {
    id: 'GD-1286', description: 'Proof of address — utility company', strippedText: 'PROOF OF RESIDENCE. [COMPANY_REDACTED] Electric Company. Account Holder: [NAME_REDACTED]. Service Address: [ADDRESS_REDACTED], San Diego, CA 92101. Account Number: [REDACTED]. Account Status: Active, current. Service Start Date: September 1, 2024. This statement is issued to verify residence at the above address. Statement Date: March 1, 2026. [COMPANY_REDACTED] Electric Company, Customer Services.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Electric Company', issuedDate: '2026-03-01', jurisdiction: 'California, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'proof-of-address'],
  },
  {
    id: 'GD-1287', description: 'Board resolution attestation', strippedText: 'SECRETARY\'S CERTIFICATE. I, [NAME_REDACTED], Secretary of [COMPANY_REDACTED] Inc., a Delaware corporation, hereby certify that the following is a true and correct copy of resolutions duly adopted by the Board of Directors at a meeting held on March 15, 2026, at which a quorum was present: RESOLVED, that the Corporation is hereby authorized to enter into the Credit Agreement with [BANK_REDACTED] for a revolving credit facility not to exceed $50,000,000. IN WITNESS WHEREOF, I have executed this certificate on March 16, 2026. [NAME_REDACTED], Secretary.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-16', jurisdiction: 'Delaware, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'board-resolution', 'corporate'],
  },
  {
    id: 'GD-1288', description: 'Police clearance certificate', strippedText: 'POLICE CLEARANCE CERTIFICATE. METROPOLITAN POLICE DEPARTMENT. DISTRICT OF COLUMBIA. Date: February 20, 2026. Certificate No. PCC-2026-DC-12345. This is to certify that a search of the records of the Metropolitan Police Department reveals NO CRIMINAL RECORD for [NAME_REDACTED], Date of Birth: [DATE_REDACTED]. This certificate is valid for 6 months from the date of issuance. Issued for: Immigration/visa purposes. [NAME_REDACTED], Records Division, MPD.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Metropolitan Police Department, District of Columbia', issuedDate: '2026-02-20', jurisdiction: 'District of Columbia, USA', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'police-clearance'],
  },
  {
    id: 'GD-1289', description: 'Compliance attestation — SOC 2', strippedText: 'MANAGEMENT ASSERTION AND ATTESTATION. [COMPANY_REDACTED] Inc. Management of [COMPANY_REDACTED] Inc. asserts that, during the period from January 1, 2025 through December 31, 2025, the controls within [COMPANY_REDACTED] Inc.\'s cloud infrastructure platform were suitably designed and operating effectively to meet the Security, Availability, and Confidentiality trust services criteria (SOC 2 Type II). This assertion is based on the criteria set forth by the AICPA. Date: February 15, 2026. [NAME_REDACTED], Chief Information Security Officer.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-02-15', fieldOfStudy: 'Information Security', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'soc2', 'compliance'],
  },
  {
    id: 'GD-1290', description: 'Clergy attestation — marriage counseling completion', strippedText: 'ATTESTATION OF MARRIAGE PREPARATION COMPLETION. [CHURCH_REDACTED] Catholic Church. Diocese of [DIOCESE_REDACTED]. Date: March 22, 2026. This certifies that [NAME_REDACTED] and [NAME_REDACTED] have completed the required marriage preparation program, including: Pre-Cana Weekend (February 8-9, 2026). Six individual sessions with clergy counselor. Natural Family Planning seminar. Compatibility assessment. They are hereby approved for the Sacrament of Matrimony. [NAME_REDACTED], Pastor.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[CHURCH_REDACTED] Catholic Church', issuedDate: '2026-03-22', fraudSignals: [] }, source: 'synthetic-attestation', category: 'attestation', tags: ['synthetic', 'attestation', 'religious'],
  },

  // ============================================================
  // OCR-CORRUPTED DOCUMENTS (20 entries) — GD-1291 to GD-1310
  // ============================================================
  {
    id: 'GD-1291', description: 'OCR-corrupted 10-K filing', strippedText: 'UN1TED STATES SECUR1T1ES AND EXCHANGE C0MMISS1ON. Wash1ngton, D.C. 2O549. F0RM 1O-K. ANNUAL REP0RT PURSUANT T0 SECT1ON 13 0R 15(d). For the fisca1 year ended Decernber 31, 2O25. Cornrnission Fi1e Nurnber: OO1-23456. [C0MPANY_REDACTED] Techno1ogies, 1nc. State of 1ncorporation: Ca1ifornia. T0ta1 Revenue: $8.9 bi11ion. Net 1ncorne: $1.2 bi11ion.',
    credentialTypeHint: 'OTHER', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Technologies, Inc.', issuedDate: '2025-12-31', fieldOfStudy: 'Annual Report (10-K)', licenseNumber: '001-23456', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'sec-filing', 'image'],
  },
  {
    id: 'GD-1292', description: 'OCR-corrupted federal court opinion', strippedText: 'UN1TED STATES C0URT 0F APPEALS F0R THE N1NTH C1RCU1T. No. 24-35l89. [PARTY_REDACTED], P1aintiff-Appe11ant, v. [PARTY_REDACTED], 1NC., Defendant-Appe11ee. Appea1 frorn the Un1ted States D1strict Court for the Northern D1strict of Ca1ifornia. Fi1ed: February 3, 2O26. REVERSED AND REMANDED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'United States Court of Appeals for the Ninth Circuit', issuedDate: '2026-02-03', fieldOfStudy: 'General Litigation', licenseNumber: 'No. 24-35189', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'case-law', 'image'],
  },
  {
    id: 'GD-1293', description: 'OCR-corrupted employment verification', strippedText: 'EMPL0YMENT VER1F1CAT1ON. Date: March l5, 2O26. T0 Whorn lt May C0ncern: Th1s 1etter confirrns that [NAME_REDACTED] has been ernp1oyed by [C0MPANY_REDACTED] 1nc. s1nce June l5, 2O2O as a Sen1or Software Eng1neer. Current annua1 cornpensat1on: [SALARY_REDACTED]. Ernp1oyrnent status: Fu11-tirne, act1ve ernp1oyee 1n good stand1ng.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-15', fieldOfStudy: 'Software Engineering', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'attestation', 'image'],
  },
  {
    id: 'GD-1294', description: 'OCR-corrupted nursing license (scanned card)', strippedText: 'STATE 0F FL0R1DA. B0ARD 0F NURS1NG. L1CENSE T0 PRACT1CE. [NAME_REDACTED], RN. L1cense No. RN-4567890. 0r1g1na1 1ssue: Ju1y l, 2O22. Exp1rat1on: June 3O, 2O26. STATUS: ACT1VE. Spec1a1ty: Cr1t1ca1 Care. [SEAL]',
    credentialTypeHint: 'LICENSE', groundTruth: { credentialType: 'LICENSE', issuerName: 'Florida Board of Nursing', issuedDate: '2022-07-01', expiryDate: '2026-06-30', fieldOfStudy: 'Nursing', licenseNumber: 'RN-4567890', jurisdiction: 'Florida, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'license', 'image'],
  },
  {
    id: 'GD-1295', description: 'OCR-corrupted university diploma', strippedText: 'THE REGENTS 0F THE UN1VERS1TY 0F M1CH1GAN. On the recornrnendat1on of the Facu1ty of the Co11ege of Eng1neer1ng, have conferred upon [NAME_REDACTED] the degree of Bache1or of Sc1ence 1n E1ectr1ca1 Eng1neer1ng w1th a11 the r1ghts, pr1v11eges, and respons1b111t1es thereunto apperta1n1ng. Conferred on the Th1rd Day of May, Two Thousand Twenty-F1ve. Ann Arbor, M1ch1gan.',
    credentialTypeHint: 'DEGREE', groundTruth: { credentialType: 'DEGREE', issuerName: 'University of Michigan', issuedDate: '2025-05-03', fieldOfStudy: 'Electrical Engineering', degreeLevel: 'Bachelor', jurisdiction: 'Michigan, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'degree', 'image'],
  },
  {
    id: 'GD-1296', description: 'OCR-corrupted CLE certificate', strippedText: 'THE STATE BAR 0F CAL1F0RN1A. C0NT1NU1NG LEGAL EDUCAT1ON PR0GRAM. Cert1f1cate of Cornp1et1on. [NAME_REDACTED], Esq. State Bar No. [REDACTED]. Course: Prof ess1ona1 Respons1b111ty and Eth1cs. Cred1t Hours: 3.O CLE Hours (Eth1cs). Date Cornp1eted: March l5, 2O26. Prov1der: Ca11forn1a Lawyers Assoc1at1on CLE. Act1v1ty Nurnber: CA-CLE-2O26-O892.',
    credentialTypeHint: 'CLE', groundTruth: { credentialType: 'CLE', issuerName: 'California Lawyers Association CLE', issuedDate: '2026-03-15', fieldOfStudy: 'Professional Responsibility and Ethics', accreditingBody: 'The State Bar of California', jurisdiction: 'California, USA', creditHours: 3.0, creditType: 'Ethics', providerName: 'California Lawyers Association CLE', approvedBy: 'The State Bar of California', activityNumber: 'CA-CLE-2026-0892', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'cle', 'image'],
  },
  {
    id: 'GD-1297', description: 'OCR-corrupted patent grant', strippedText: 'Un1ted States Patent. Patent No.: US l1,234,567 B2. Date of Patent: Jun. l5, 2O25. [NAME_REDACTED]. T1t1e: Method and Systern for D1str1buted Consensus Ver1f1cat1on. Ass1gnee: [C0MPANY_REDACTED]. F11ed: Mar. 1O, 2O23.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2025-06-15', fieldOfStudy: 'Distributed Computing', licenseNumber: 'US 11,234,567 B2', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'patent', 'image'],
  },
  {
    id: 'GD-1298', description: 'OCR-corrupted insurance COI', strippedText: 'CERT1F1CATE 0F L1AB1L1TY 1NSURANCE. [C0MPANY_REDACTED] 1nsurance Co. Narned 1nsured: [C0MPANY_REDACTED]. Po11cy Nurnber: GL0-2O26-789Ol. Effect1ve: January l, 2O26. Exp1rat1on: January l, 2O27. Coverage: Cornrnerc1a1 Genera1 L1ab111ty. Each 0ccurrence: $l,OOO,OOO.',
    credentialTypeHint: 'INSURANCE', groundTruth: { credentialType: 'INSURANCE', issuerName: '[COMPANY_REDACTED] Insurance Co.', issuedDate: '2026-01-01', expiryDate: '2027-01-01', fieldOfStudy: 'Commercial General Liability', licenseNumber: 'GLO-2026-78901', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'insurance', 'image'],
  },
  {
    id: 'GD-1299', description: 'OCR-corrupted state appellate opinion', strippedText: 'C0URT 0F APPEALS 0F TEXAS, F1FTH D1STR1CT, DALLAS. No. O5-24-OO789-CV. [PARTY_REDACTED], Appe11ant v. [PARTY_REDACTED], Appe11ee. 0n Appea1 frorn the 1O1st Jud1c1a1 D1str1ct Court, Da11as County. 0p1n1on by Just1ce [JUDGE_REDACTED]. F11ed: Decernber 5, 2O25. AFF1RMED.',
    credentialTypeHint: 'LEGAL', groundTruth: { credentialType: 'LEGAL', issuerName: 'Court of Appeals of Texas, Fifth District', issuedDate: '2025-12-05', fieldOfStudy: 'General Litigation', licenseNumber: '05-24-00789-CV', jurisdiction: 'Texas, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'case-law', 'image'],
  },
  {
    id: 'GD-1300', description: 'OCR-corrupted affidavit (heavy noise)', strippedText: 'AFF1DAV1T 0F [NAME_REDACTED]. STATE 0F FL0R1DA. C0UNTY 0F M1AM1-DADE. Before rne, the unders1gned N0tary Pub11c, persona11y appeared [NAME_REDACTED], who be1ng f1rst du1y sworn, deposes and states: l. I arn over l8 years of age. 2. I have persona1 know1edge that [NAME_REDACTED] perforrned eng1neer1ng serv1ces. Sworn to and subscr1bed before rne th1s lOth day of March, 2O26.',
    credentialTypeHint: 'ATTESTATION', groundTruth: { credentialType: 'ATTESTATION', issuerName: 'Notary Public, State of Florida', issuedDate: '2026-03-10', fieldOfStudy: 'Engineering', jurisdiction: 'Florida, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'attestation', 'image'],
  },
  {
    id: 'GD-1301', description: 'OCR-corrupted AWS certificate', strippedText: 'Arnazon Web Serv1ces. AWS Cert1f1ed So1ut1ons Arch1tect - Profess1ona1. [NAME_REDACTED]. Cert1f1cate 1D: [REDACTED]. Date Ach1eved: March l5, 2O25. Exp1rat1on: March l5, 2O28.',
    credentialTypeHint: 'CERTIFICATE', groundTruth: { credentialType: 'CERTIFICATE', issuerName: 'Amazon Web Services', issuedDate: '2025-03-15', expiryDate: '2028-03-15', fieldOfStudy: 'Cloud Architecture', accreditingBody: 'Amazon Web Services', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'certificate', 'image'],
  },
  {
    id: 'GD-1302', description: 'OCR-corrupted bar admission', strippedText: 'SUPRENE C0URT 0F THE STATE 0F NEW Y0RK. APPELLATE D1V1S10N. [NAME_REDACTED] ... adrnitted to pract1ce as an Attorney and Counse1or-at-Law ... Date of Adrn1ss1on: January 5, 2O24.',
    credentialTypeHint: 'LICENSE', groundTruth: { credentialType: 'LICENSE', issuerName: 'Supreme Court of the State of New York', issuedDate: '2024-01-05', fieldOfStudy: 'Law', jurisdiction: 'New York, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'license', 'image'],
  },
  {
    id: 'GD-1303', description: 'OCR-corrupted 8-K filing (scanned)', strippedText: 'F0RM 8-K. CURRENT REP0RT. Date of Report: March l2, 2O26. Cornrn1ss1on F11e Nurnber: OOl-35551. [C0MPANY_REDACTED] 1nc. 1tern l.O5 Mater1a1 Cybersecur1ty 1nc1dents. 0n March lO, 2O26, [C0MPANY_REDACTED] 1nc. deternined that 1t exper1enced a rnater1a1 cybersecur1ty 1nc1dent 1nvo1v1ng unauthor1zed access.',
    credentialTypeHint: 'SEC_FILING', groundTruth: { credentialType: 'SEC_FILING', issuerName: '[COMPANY_REDACTED] Inc.', issuedDate: '2026-03-12', fieldOfStudy: 'Current Report (8-K)', licenseNumber: '001-35551', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'sec-filing', 'image'],
  },
  {
    id: 'GD-1304', description: 'OCR-corrupted regulation (Federal Register)', strippedText: 'Federa1 Reg1ster / Vo1. 91, No. 45. Env1ronrnenta1 Protect1on Agency. 4O CFR Part 63. Nat1ona1 Ern1ss1on Standards for Hazardous A1r Po11utants. F1na1 Ru1e. Effect1ve Date: Ju1y l, 2O26. EPA-HQ-0AR-2O24-Ol23.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Environmental Protection Agency', issuedDate: '2026-07-01', fieldOfStudy: 'Air Quality Regulation', licenseNumber: '40 CFR Part 63', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'regulation', 'image'],
  },
  {
    id: 'GD-1305', description: 'OCR-corrupted medical license (wallet card)', strippedText: 'TEXAS MED1CAL B0ARD. [NAME_REDACTED], M.D. L1c. No. Q-[REDACTED]. 0r1g. 1ssued: 2Ol9-O6-Ol. Exp: 2O27-O5-3l. STATUS: ACT1VE. Spec: 1nterna1 Med1c1ne.',
    credentialTypeHint: 'LICENSE', groundTruth: { credentialType: 'LICENSE', issuerName: 'Texas Medical Board', issuedDate: '2019-06-01', expiryDate: '2027-05-31', fieldOfStudy: 'Internal Medicine', jurisdiction: 'Texas, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'license', 'image', 'medical'],
  },
  {
    id: 'GD-1306', description: 'OCR-corrupted birth certificate', strippedText: 'CERT1F1CATE 0F L1VE B1RTH. STATE 0F CAL1F0RN1A. DEPARTNENT 0F PUBL1C HEALTH. Ch11d: [NAME_REDACTED]. Date of B1rth: [DATE_REDACTED]. P1ace of B1rth: Los Ange1es County. F11e Nurnber: [REDACTED]. Date F11ed: January l5, 2O25.',
    credentialTypeHint: 'IDENTITY', groundTruth: { credentialType: 'IDENTITY', issuerName: 'California Department of Public Health', issuedDate: '2025-01-15', jurisdiction: 'California, USA', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'identity', 'image'],
  },
  {
    id: 'GD-1307', description: 'OCR-corrupted DD-214 military discharge', strippedText: 'DD F0RM 2l4. CERT1F1CATE 0F RELEASE 0R D1SCHARGE FR0M ACT1VE DUTY. [NAME_REDACTED]. Branch: Un1ted States Mar1ne Corps. Separat1on Date: 0ctober l5, 2O25. Character of Serv1ce: Honorab1e. Pr1rnary Spec1a1ty: O3ll 1nfantry 0ff1cer. Decorat1ons: Navy and Mar1ne Corps Achleverment Meda1.',
    credentialTypeHint: 'MILITARY', groundTruth: { credentialType: 'MILITARY', issuerName: 'United States Marine Corps', issuedDate: '2025-10-15', fieldOfStudy: 'Infantry', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'military', 'image'],
  },
  {
    id: 'GD-1308', description: 'OCR-corrupted PMP certificate', strippedText: 'PR0JECT MANAGENENT 1NST1TUTE. Project Managernent Profess1ona1 (PMP). [NAME_REDACTED]. PMP Nurnber: 345678g. Date Granted: January l8, 2O26. Exp1rat1on Date: January l7, 2O29. PDU Cyc1e: 6O PDUs / 3 Years.',
    credentialTypeHint: 'CERTIFICATE', groundTruth: { credentialType: 'CERTIFICATE', issuerName: 'Project Management Institute', issuedDate: '2026-01-18', expiryDate: '2029-01-17', fieldOfStudy: 'Project Management', accreditingBody: 'Project Management Institute', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'certificate', 'image'],
  },
  {
    id: 'GD-1309', description: 'OCR-corrupted foreign degree (German)', strippedText: 'TECHN1SCHE UN1VERS1TÄT MÜNCHEN. Bache1orzeu gn1s. [NAME_REDACTED]. Stud1engang: 1nformat1k. Absch1uss: Bache1or of Sc1ence. Daturn: l5. Ju1i 2O24.',
    credentialTypeHint: 'DEGREE', groundTruth: { credentialType: 'DEGREE', issuerName: 'Technische Universität München', issuedDate: '2024-07-15', fieldOfStudy: 'Computer Science', degreeLevel: 'Bachelor', jurisdiction: 'Germany', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'degree', 'image', 'non-english'],
  },
  {
    id: 'GD-1310', description: 'OCR-corrupted W-2 tax form', strippedText: 'Forrn W-2. Wage and Tax Staternent 2O25. Ernp1oyer: [C0MPANY_REDACTED]. E1N: [REDACTED]. Ernp1oyee: [NAME_REDACTED]. SSN: [REDACTED]. Wages: $95,OOO.OO. Federa1 Tax W1thhe1d: $l4,25O.OO. State: Ca1iforn1a. State Wages: $95,OOO.OO.',
    credentialTypeHint: 'FINANCIAL', groundTruth: { credentialType: 'FINANCIAL', issuerName: '[COMPANY_REDACTED]', issuedDate: '2025-12-31', jurisdiction: 'California, USA', fieldOfStudy: 'Tax Documentation', fraudSignals: [] }, source: 'synthetic-ocr', category: 'ocr-corrupted', tags: ['synthetic', 'ocr-corrupted', 'financial', 'image'],
  },

  // ============================================================
  // REGULATION (10 entries) — GD-1311 to GD-1320
  // ============================================================
  {
    id: 'GD-1311', description: 'SEC final rule — cybersecurity disclosure', strippedText: 'SECURITIES AND EXCHANGE COMMISSION. 17 CFR Parts 229, 232, 239, 240, and 249. Release Nos. 33-11216; 34-97989. RIN 3235-AM89. Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure. AGENCY: Securities and Exchange Commission. ACTION: Final rule. EFFECTIVE DATE: September 5, 2025. SUMMARY: The Commission is adopting new rules requiring registrants to disclose material cybersecurity incidents within four business days.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Securities and Exchange Commission', issuedDate: '2025-09-05', fieldOfStudy: 'Securities Regulation', licenseNumber: '17 CFR Parts 229, 232, 239, 240, 249', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'sec', 'cybersecurity'],
  },
  {
    id: 'GD-1312', description: 'CFPB proposed rule — open banking', strippedText: 'CONSUMER FINANCIAL PROTECTION BUREAU. 12 CFR Part 1033. Docket No. CFPB-2025-0015. RIN 3170-AB17. Required Rulemaking on Personal Financial Data Rights. AGENCY: Consumer Financial Protection Bureau. ACTION: Proposed rule. Federal Register Vol. 91, No. 82. Published: March 15, 2026. COMMENT PERIOD: 60 days. SUMMARY: The Bureau proposes rules to implement Section 1033 of the Dodd-Frank Act, giving consumers rights to access their financial data.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Consumer Financial Protection Bureau', issuedDate: '2026-03-15', fieldOfStudy: 'Consumer Finance Regulation', licenseNumber: '12 CFR Part 1033', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'cfpb', 'open-banking'],
  },
  {
    id: 'GD-1313', description: 'FTC enforcement action — AI deception', strippedText: 'FEDERAL TRADE COMMISSION. File No. 232-3456. In the Matter of [COMPANY_REDACTED] AI, Inc. AGREEMENT CONTAINING CONSENT ORDER. The Federal Trade Commission has conducted an investigation of [COMPANY_REDACTED] AI, Inc. relating to its AI-powered hiring tool. The investigation found that the tool had a disparate impact on protected classes. ORDERED: Respondent shall delete all algorithmic models trained on biased data. Civil penalty: $25 million. Effective: February 28, 2026.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Federal Trade Commission', issuedDate: '2026-02-28', fieldOfStudy: 'AI Regulation', licenseNumber: '232-3456', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'ftc', 'ai'],
  },
  {
    id: 'GD-1314', description: 'OCC guidance — bank AI risk management', strippedText: 'OFFICE OF THE COMPTROLLER OF THE CURRENCY. OCC Bulletin 2026-5. Subject: Model Risk Management: Guidance for Artificial Intelligence and Machine Learning Models. Date: January 15, 2026. TO: Chief Executive Officers and Senior Management of All National Banks and Federal Savings Associations. This bulletin supplements OCC Bulletin 2011-12 (SR 11-7) with additional guidance specific to AI/ML models used in credit underwriting, fraud detection, and customer service.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Office of the Comptroller of the Currency', issuedDate: '2026-01-15', fieldOfStudy: 'Banking Regulation', licenseNumber: 'OCC Bulletin 2026-5', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'occ', 'banking', 'ai'],
  },
  {
    id: 'GD-1315', description: 'New York State DFS regulation — crypto', strippedText: 'NEW YORK STATE DEPARTMENT OF FINANCIAL SERVICES. 23 NYCRR Part 200. Regulation of the Conduct of Virtual Currency Business Activity. Final Rule Amendments. Superintendent of Financial Services. Effective Date: April 1, 2026. These amendments update the 2015 BitLicense framework to address decentralized finance (DeFi) protocols, stablecoins, and custody of digital assets by licensed entities.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'New York State Department of Financial Services', issuedDate: '2026-04-01', fieldOfStudy: 'Financial Regulation', licenseNumber: '23 NYCRR Part 200', jurisdiction: 'New York, USA', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'state', 'crypto', 'new-york'],
  },
  {
    id: 'GD-1316', description: 'DOJ antitrust consent decree', strippedText: 'UNITED STATES OF AMERICA, Plaintiff, v. [COMPANY_REDACTED] INC. and [COMPANY_REDACTED] CORP., Defendants. FINAL JUDGMENT. Case No. 1:26-cv-00123 (D.D.C.). The Court, having considered the Competitive Impact Statement, the public comments, and the response of the United States, enters this Final Judgment to prevent the anticompetitive effects of the proposed acquisition. Dated: March 25, 2026.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Department of Justice', issuedDate: '2026-03-25', fieldOfStudy: 'Antitrust Regulation', licenseNumber: '1:26-cv-00123', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'doj', 'antitrust'],
  },
  {
    id: 'GD-1317', description: 'California privacy regulation — CPRA', strippedText: 'CALIFORNIA PRIVACY PROTECTION AGENCY. Title 11, Division 6, California Code of Regulations. Sections 7000-7304. California Consumer Privacy Act Regulations (CPRA). Final Text of Regulations. Approved: January 10, 2026. Effective: April 1, 2026. These regulations implement the California Privacy Rights Act of 2020, including requirements for automated decision-making technology and data minimization.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'California Privacy Protection Agency', issuedDate: '2026-04-01', fieldOfStudy: 'Privacy Regulation', jurisdiction: 'California, USA', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'state', 'privacy', 'california'],
  },
  {
    id: 'GD-1318', description: 'FDA drug approval letter', strippedText: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES. FOOD AND DRUG ADMINISTRATION. NDA 216789. [COMPANY_REDACTED] Pharmaceuticals, Inc. APPROVAL LETTER. Date: March 5, 2026. Dear [NAME_REDACTED]: We refer to your New Drug Application dated June 15, 2025, submitted under section 505(b) of the Federal Food, Drug, and Cosmetic Act, for [DRUG_REDACTED] (generic: [REDACTED]) tablets. We have completed our review and this application is approved for the treatment of moderate-to-severe plaque psoriasis in adults.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'U.S. Food and Drug Administration', issuedDate: '2026-03-05', fieldOfStudy: 'Pharmaceutical Regulation', licenseNumber: 'NDA 216789', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'fda', 'drug-approval'],
  },
  {
    id: 'GD-1319', description: 'FERC order — natural gas pipeline', strippedText: 'FEDERAL ENERGY REGULATORY COMMISSION. Docket No. CP25-234-000. ORDER ISSUING CERTIFICATE AND APPROVING ABANDONMENT. [COMPANY_REDACTED] Pipeline Company, LLC. Issued: February 15, 2026. The Commission authorizes the construction and operation of approximately 45 miles of 30-inch diameter natural gas pipeline in [STATE_REDACTED]. Environmental Assessment completed per NEPA. Certificate issued under Section 7(c) of the Natural Gas Act.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'Federal Energy Regulatory Commission', issuedDate: '2026-02-15', fieldOfStudy: 'Energy Regulation', licenseNumber: 'CP25-234-000', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'ferc', 'energy'],
  },
  {
    id: 'GD-1320', description: 'EU AI Act implementation (REGULATION type)', strippedText: 'EUROPEAN COMMISSION. Commission Delegated Regulation (EU) 2026/234. Of 15 January 2026. Supplementing Regulation (EU) 2024/1689 of the European Parliament and of the Council as regards rules for classification of AI systems as high-risk. Official Journal of the European Union. L 34/1. 28.1.2026. THE EUROPEAN COMMISSION, Having regard to the Treaty on the Functioning of the European Union, Having regard to Regulation (EU) 2024/1689 (the AI Act), HAS ADOPTED THIS REGULATION.',
    credentialTypeHint: 'REGULATION', groundTruth: { credentialType: 'REGULATION', issuerName: 'European Commission', issuedDate: '2026-01-28', fieldOfStudy: 'AI Regulation', licenseNumber: '(EU) 2026/234', jurisdiction: 'European Union', fraudSignals: [] }, source: 'synthetic-regulation', category: 'regulation', tags: ['synthetic', 'regulation', 'eu', 'ai-act', 'international'],
  },

  // ============================================================
  // PATENT (10 entries) — GD-1321 to GD-1330
  // ============================================================
  {
    id: 'GD-1321', description: 'USPTO utility patent — AI/ML method', strippedText: 'United States Patent. Patent No.: US 12,345,678 B2. Date of Patent: January 14, 2026. Inventors: [NAME_REDACTED] et al. Title: Neural Network Architecture for Real-Time Document Authentication Using Blockchain-Anchored Fingerprints. Assignee: [COMPANY_REDACTED] Inc. Filed: March 15, 2023. Int. Cl. G06N 3/08 (2006.01). U.S. Cl. 706/20. 24 Claims, 12 Drawing Sheets.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-01-14', fieldOfStudy: 'Artificial Intelligence', licenseNumber: 'US 12,345,678 B2', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'utility', 'ai'],
  },
  {
    id: 'GD-1322', description: 'USPTO continuation patent — pharma', strippedText: 'United States Patent. Patent No.: US 11,987,654 B1. Date of Patent: February 25, 2026. Title: Modified mRNA Encoding Stabilized Spike Protein for Coronavirus Vaccine Compositions. Inventors: [NAME_REDACTED], [NAME_REDACTED], [NAME_REDACTED]. Assignee: [COMPANY_REDACTED] Inc. Filed: August 10, 2023 (Continuation of application No. 17/234,567, filed March 19, 2021). 45 Claims.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-02-25', fieldOfStudy: 'Biotechnology', licenseNumber: 'US 11,987,654 B1', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'utility', 'pharma'],
  },
  {
    id: 'GD-1323', description: 'EPO granted patent — semiconductor', strippedText: 'European Patent Office. Publication number: EP 4 123 456 B1. Date of publication: 12.03.2026. Bulletin 2026/11. Title: Three-Dimensional Stacked Semiconductor Device with Through-Silicon Via Interconnects. Applicant: [COMPANY_REDACTED] Semiconductor Co., Ltd. (KR). Inventor: [NAME_REDACTED]. Date of filing: 15.06.2023. Priority: KR 10-2022-0089012 23.07.2022. Designated Contracting States: AT BE CH DE ES FR GB IT NL SE.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'European Patent Office', issuedDate: '2026-03-12', fieldOfStudy: 'Semiconductor Manufacturing', licenseNumber: 'EP 4 123 456 B1', jurisdiction: 'European Union', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'epo', 'semiconductor'],
  },
  {
    id: 'GD-1324', description: 'Japan Patent Office — robotics', strippedText: 'JAPAN PATENT OFFICE. Patent Number: JP 7,234,567 B2. Date of Patent: 2026-02-14. Title: Autonomous Mobile Robot with Adaptive Path Planning Using Reinforcement Learning. Inventor: [NAME_REDACTED]. Applicant: [COMPANY_REDACTED] Corporation. Filing Date: 2023-04-20. Application No.: 2023-078901. IPC: B25J 9/16.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'Japan Patent Office', issuedDate: '2026-02-14', fieldOfStudy: 'Robotics', licenseNumber: 'JP 7,234,567 B2', jurisdiction: 'Japan', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'jpo', 'robotics', 'international'],
  },
  {
    id: 'GD-1325', description: 'WIPO PCT application — clean energy', strippedText: 'WORLD INTELLECTUAL PROPERTY ORGANIZATION. International Application Published Under the Patent Cooperation Treaty (PCT). WO 2026/012345 A1. Publication Date: 22 January 2026. International Filing Date: 15 July 2025. Application Number: PCT/US2025/027890. Title: High-Efficiency Perovskite-Silicon Tandem Solar Cell with Self-Healing Encapsulation Layer. Applicant: [COMPANY_REDACTED] Energy Labs (US). International Search Authority: USPTO.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'World Intellectual Property Organization', issuedDate: '2026-01-22', fieldOfStudy: 'Renewable Energy', licenseNumber: 'PCT/US2025/027890', jurisdiction: 'International', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'wipo', 'pct', 'solar'],
  },
  {
    id: 'GD-1326', description: 'USPTO plant patent — agriculture', strippedText: 'United States Patent. Plant Patent. Patent No.: USPP 36,789 P3. Date of Patent: March 4, 2026. Title: Blueberry Plant Named \'[VARIETY_REDACTED]\'. Inventor: [NAME_REDACTED]. Assignee: [COMPANY_REDACTED] Berry Genetics, LLC. Filed: June 1, 2024. Term: 20 years from filing date. Claims: 1. A new and distinct cultivar of blueberry plant substantially as herein shown and described.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-03-04', fieldOfStudy: 'Agricultural Biotechnology', licenseNumber: 'USPP 36,789 P3', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'plant-patent', 'agriculture'],
  },
  {
    id: 'GD-1327', description: 'USPTO notice of allowance (pre-grant)', strippedText: 'UNITED STATES PATENT AND TRADEMARK OFFICE. Application Number: 18/234,567. Filing Date: August 10, 2024. NOTICE OF ALLOWANCE AND FEE(S) DUE. Title: Quantum Error Correction Method for Topological Qubits. Applicant: [COMPANY_REDACTED] Quantum Computing Inc. The above-identified application has been examined and is allowed for issuance as a patent. Issue Fee: $1,200.00. Due Date: June 15, 2026. Examiner: [NAME_REDACTED]. Art Unit: 2135. Date Mailed: March 15, 2026.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-03-15', fieldOfStudy: 'Quantum Computing', licenseNumber: '18/234,567', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'notice-of-allowance', 'quantum'],
  },
  {
    id: 'GD-1328', description: 'Chinese patent (CNIPA) — battery technology', strippedText: 'CHINA NATIONAL INTELLECTUAL PROPERTY ADMINISTRATION (CNIPA). Patent for Invention. Patent Number: CN 118,234,567 B. Date of Grant: 2026-01-30. Title: Solid-State Lithium Battery with Sulfide Electrolyte and Silicon Anode. Inventor: [NAME_REDACTED], [NAME_REDACTED]. Patentee: [COMPANY_REDACTED] New Energy Technology Co., Ltd. Application Date: 2023-09-15. Application No.: 202310123456.7.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'China National Intellectual Property Administration', issuedDate: '2026-01-30', fieldOfStudy: 'Battery Technology', licenseNumber: 'CN 118,234,567 B', jurisdiction: 'China', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'cnipa', 'battery', 'international'],
  },
  {
    id: 'GD-1329', description: 'USPTO design patent — consumer electronics', strippedText: 'United States Patent. Design Patent. Patent No.: USD 1,023,456. Date of Patent: March 18, 2026. Title: Display Screen or Portion Thereof with Animated Graphical User Interface. Inventors: [NAME_REDACTED], [NAME_REDACTED]. Assignee: [COMPANY_REDACTED] Inc. Filed: September 1, 2024. Term: 15 Years. 7 Drawing Sheets.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-03-18', expiryDate: '2041-03-18', fieldOfStudy: 'Industrial Design', licenseNumber: 'USD 1,023,456', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'design-patent', 'gui'],
  },
  {
    id: 'GD-1330', description: 'USPTO reexamination certificate', strippedText: 'UNITED STATES PATENT AND TRADEMARK OFFICE. REEXAMINATION CERTIFICATE (6789th). United States Patent Number: 10,987,654. Certificate Issued: February 10, 2026. Reexamination Request No. 90/015,234. Reexamination Certificate for: Patent No. 10,987,654. Issued: April 5, 2022. Title: Method for Secure Multi-Party Computation in Federated Learning. THE PATENT IS HEREBY AMENDED. Claims 1-10 are confirmed. Claims 11-15 are cancelled. New claims 16-20 are added.',
    credentialTypeHint: 'PATENT', groundTruth: { credentialType: 'PATENT', issuerName: 'United States Patent and Trademark Office', issuedDate: '2026-02-10', fieldOfStudy: 'Cryptography', licenseNumber: '10,987,654', jurisdiction: 'United States', fraudSignals: [] }, source: 'synthetic-patent', category: 'patent', tags: ['synthetic', 'patent', 'reexamination', 'cryptography'],
  },
];
