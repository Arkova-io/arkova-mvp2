# Proof Packages

## Overview

Proof packages are downloadable verification bundles that users can share to prove document authenticity. They contain all information needed to independently verify an anchor without accessing Ralph.

## Package Contents

A proof package is a ZIP archive containing:

```
proof_package_<anchor_id>.zip
├── proof.json           # Machine-readable proof data
├── proof.html           # Human-readable proof page
├── verification.txt     # Plain text verification instructions
└── README.md            # Package documentation
```

## Proof Data (proof.json)

```json
{
  "version": "1.0",
  "anchor": {
    "id": "a1111111-1111-1111-1111-111111111111",
    "fingerprint": "a1b2c3d4e5f6...",
    "filename": "contract_2024.pdf",
    "file_size": 1048576,
    "created_at": "2024-01-15T10:30:00Z",
    "secured_at": "2024-01-15T10:35:00Z"
  },
  "chain": {
    "network": "Production Network",
    "receipt_id": "btc_tx_001_demo",
    "block_height": 800000,
    "block_timestamp": "2024-01-15T10:35:00Z",
    "confirmations": 1000
  },
  "verification": {
    "url": "https://ralph.app/verify/<anchor_id>",
    "instructions": "To verify, hash your document with SHA-256..."
  },
  "generated_at": "2024-01-20T14:00:00Z",
  "generated_by": "ralph.app"
}
```

## Human-Readable Proof (proof.html)

A self-contained HTML page that displays:

1. **Document Information**
   - Filename
   - Fingerprint (SHA-256)
   - File size

2. **Anchor Timeline**
   - Created timestamp
   - Secured timestamp
   - Network receipt reference

3. **Verification Instructions**
   - How to compute SHA-256
   - How to check network receipt
   - Link to public verification page

4. **Network Receipt Details**
   - Receipt ID
   - Block reference
   - Confirmation count

## Verification Instructions (verification.txt)

```
DOCUMENT VERIFICATION INSTRUCTIONS
==================================

Document: contract_2024.pdf
Fingerprint: a1b2c3d4e5f6...

STEP 1: Compute Document Fingerprint
-------------------------------------
On macOS/Linux:
  shasum -a 256 contract_2024.pdf

On Windows (PowerShell):
  Get-FileHash contract_2024.pdf -Algorithm SHA256

STEP 2: Compare Fingerprints
-----------------------------
The computed fingerprint should match:
a1b2c3d4e5f6...

STEP 3: Verify Network Receipt
-------------------------------
Visit: https://ralph.app/verify/a1111111-1111-1111-1111-111111111111

Or independently verify receipt: btc_tx_001_demo
Block: 800000
Timestamp: 2024-01-15T10:35:00Z

VERIFICATION COMPLETE
=====================
If the fingerprints match, your document is authentic and
was secured on 2024-01-15T10:35:00Z.
```

## Generation

### API Endpoint

```typescript
// Worker service endpoint
GET /api/anchors/:id/proof-package

// Response: application/zip
// Filename: proof_package_<anchor_id>.zip
```

### Generation Logic

```typescript
async function generateProofPackage(anchorId: string): Promise<Buffer> {
  const anchor = await db.from('anchors')
    .select('*, organizations(*)')
    .eq('id', anchorId)
    .eq('status', 'SECURED')
    .single();

  if (!anchor.data) {
    throw new Error('Anchor not found or not secured');
  }

  const archive = new AdmZip();

  // Add proof.json
  archive.addFile('proof.json', Buffer.from(
    JSON.stringify(buildProofJson(anchor.data), null, 2)
  ));

  // Add proof.html
  archive.addFile('proof.html', Buffer.from(
    renderProofHtml(anchor.data)
  ));

  // Add verification.txt
  archive.addFile('verification.txt', Buffer.from(
    renderVerificationTxt(anchor.data)
  ));

  // Add README.md
  archive.addFile('README.md', Buffer.from(
    renderReadme(anchor.data)
  ));

  return archive.toBuffer();
}
```

## Public Verification

### Verification Page

Public URL: `https://ralph.app/verify/<anchor_id>`

This page allows anyone to:
1. View anchor details
2. Upload a document to verify
3. See verification result

### Verification API

```typescript
POST /api/verify

Body: {
  "anchor_id": "a1111111-...",
  "fingerprint": "computed_sha256_hash"
}

Response: {
  "verified": true,
  "anchor": {
    "id": "a1111111-...",
    "filename": "contract_2024.pdf",
    "secured_at": "2024-01-15T10:35:00Z"
  },
  "chain": {
    "receipt_id": "btc_tx_001_demo",
    "block_height": 800000
  }
}
```

### Client-Side Verification

The verification page computes fingerprints client-side:

```typescript
async function computeFingerprint(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

## Terminology Compliance

Per Constitution, proof packages use approved terminology:

| Internal | Display |
|----------|---------|
| `chain_tx_id` | Network Receipt ID |
| `chain_block_height` | Block Reference |
| `testnet` | Test Environment |
| `mainnet` | Production Network |

## Access Control

- **Own anchors**: Users can download proof packages for their anchors
- **Organization anchors**: ORG_ADMIN can download for any org anchor
- **Public verification**: Anyone can verify with anchor ID + fingerprint

## Report Ordering

Organizations on the Organization plan can order bulk reports:

### Report Types

1. **Monthly Summary**: All anchors secured in a month
2. **Compliance Report**: Detailed audit trail for compliance
3. **Custom Date Range**: User-specified period

### Order Flow

1. Organization admin requests report
2. Worker generates report asynchronously
3. Email notification when ready
4. Download from secure link (24-hour expiry)

### Report Format

Reports are delivered as:
- PDF summary
- CSV data export
- ZIP of individual proof packages

## Audit Events

All proof package operations are logged:

- `proof.package_generated`
- `proof.verification_attempted`
- `proof.verification_success`
- `proof.verification_failed`
- `report.ordered`
- `report.generated`
- `report.downloaded`

## Related Documentation

- [06_on_chain_policy.md](./06_on_chain_policy.md) - Content policy
- [08_payments_entitlements.md](./08_payments_entitlements.md) - Report ordering
- [10_anchoring_worker.md](./10_anchoring_worker.md) - Worker service
