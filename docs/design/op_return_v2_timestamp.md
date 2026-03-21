# OP_RETURN v2 — UTC Timestamp for eIDAS 2.0 Compliance

**Status:** DESIGN ONLY — Not implemented
**Author:** Carson Seeger
**Date:** 2026-03-21
**Related:** Constitution 1.5, `services/worker/src/chain/signet.ts`

---

## Motivation

eIDAS 2.0 (EU Electronic Identification and Trust Services Regulation) requires that qualified electronic time stamps include a UTC timestamp. Bitcoin's `block_time` is a Unix timestamp set by miners and is not guaranteed to be accurate (it only needs to be greater than the median of the last 11 blocks). Additionally, `block_time` is only available after a transaction is confirmed — not at submission time.

To provide a legally compliant timestamp chain, Arkova needs to embed a UTC timestamp in the OP_RETURN payload at the moment of attestation (when the worker creates and broadcasts the transaction).

## Current Format (v1)

```
Offset  Size   Field
0-3     4B     ARKV prefix (magic bytes: 0x41524B56)
4-35    32B    SHA-256 document fingerprint
36-43   8B     Truncated metadata hash (optional)
─────────────────────────────────────────────
Total:  36-44 bytes of 80-byte OP_RETURN limit
Unused: 36 bytes available
```

**Key file:** `services/worker/src/chain/signet.ts` — `buildOpReturnData()`

## Proposed Format (v2)

```
Offset  Size   Field
0-3     4B     ARKV prefix (magic bytes: 0x41524B56)
4       1B     Version byte (0x02)
5-36    32B    SHA-256 document fingerprint
37-40   4B     UTC timestamp (big-endian uint32, Unix epoch seconds)
41-48   8B     Truncated metadata hash (optional)
─────────────────────────────────────────────
Total:  41-49 bytes of 80-byte OP_RETURN limit
Unused: 31 bytes available for future extensions
```

### Version Detection

v1 payloads have no version byte — byte 4 is the first byte of the SHA-256 fingerprint (uniformly distributed). v2 payloads have `0x02` at byte 4.

**Detection logic:**
```
if payload.length >= 41 AND payload[4] == 0x02:
    → v2 format (parse fingerprint at offset 5, timestamp at offset 37)
else:
    → v1 format (parse fingerprint at offset 4)
```

The probability of a v1 fingerprint starting with `0x02` is 1/256. To disambiguate, also check total length: v2 payloads are at least 41 bytes, v1 are at most 44 bytes. Combined with the version byte check, this is deterministic.

### Timestamp Semantics

| Timestamp | Source | When Available | Meaning |
|-----------|--------|----------------|---------|
| **Attestation timestamp** (v2) | Arkova worker `Date.now()` | At broadcast | When Arkova attested the document |
| **Block timestamp** (`block_time`) | Bitcoin miner | After confirmation | When the network confirmed the proof |
| **Database timestamp** (`anchor_timestamp`) | Supabase `now()` | At record creation | When the record was created in Arkova |

For eIDAS 2.0:
- The **attestation timestamp** (embedded in OP_RETURN) proves when the organization submitted the document for verification
- The **block timestamp** (from Bitcoin) provides cryptographic proof that the attestation existed by that time
- Together they create a two-layer temporal proof chain

### UTC Guarantee

- `Date.now()` in Node.js returns milliseconds since Unix epoch in UTC (not local time)
- Divided by 1000 and truncated to uint32 for the 4-byte field
- Bitcoin `block_time` is also Unix epoch (UTC by definition)
- All timestamps in the Arkova database are stored as `timestamptz` (UTC)

## Implementation Plan (When Ready)

### 1. TLA+ Model Update
Add `attestationTimestamp` to `machines/bitcoinAnchor.machine.ts`:
- New variable tracking timestamp state
- Guard: timestamp must be set before SUBMITTED
- Invariant: timestamp is immutable once SUBMITTED

### 2. Chain Client Changes
`services/worker/src/chain/signet.ts`:
- Update `buildOpReturnData()` to accept optional `timestamp: number` parameter
- When timestamp provided, emit v2 format with version byte
- Update `parseOpReturnData()` to detect v1 vs v2 and extract timestamp

### 3. Anchor Job Changes
`services/worker/src/jobs/anchor.ts`:
- Pass `Math.floor(Date.now() / 1000)` as timestamp to `submitFingerprint()`

### 4. Database Migration
- Add `attestation_timestamp timestamptz` column to `anchors` table
- Populate from OP_RETURN data on existing records (if re-parseable)

### 5. Verification API Update
- Add `attestation_timestamp` to frozen verification schema (additive field, nullable — Constitution 1.8 allows this)
- Display on public verification page as "Attested at" alongside "Network confirmed at"

### 6. Documentation
- Update `docs/confluence/06_on_chain_policy.md` with v2 format
- Update proof package display to explain dual-timestamp chain

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| v1/v2 ambiguity | Version byte + length check provides deterministic detection |
| Timestamp accuracy | Server clock is NTP-synced; ±1 second is acceptable for legal purposes |
| Backward compatibility | All existing v1 records continue to work; verification detects format automatically |
| uint32 overflow (2106) | By then, this protocol will have been superseded many times over |

## Decision: Why Not Use Block Time Only?

Bitcoin block timestamps have known issues:
1. **Miners can manipulate** block time within a 2-hour window
2. **Only available after confirmation** — could be hours for low-fee transactions
3. **Not an "attestation"** — it proves when the miner included the tx, not when the organization submitted it

The embedded timestamp provides a verifiable attestation time that is:
- Available immediately at broadcast
- Independent of miner behavior
- Attributable to Arkova (the attesting party)
- Complemented by block time for cryptographic proof

---

_This design document is for planning purposes. Implementation requires review of the frozen OP_RETURN format and TLA+ model verification before any code changes._
