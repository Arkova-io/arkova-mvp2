#!/usr/bin/env tsx
/**
 * Mainnet Address Verification
 *
 * Derives the Bitcoin mainnet treasury address from the GCP KMS key
 * and optionally compares it to an expected address. Also checks
 * mempool.space for balance/UTXOs (no RPC node required).
 *
 * Usage:
 *   cd services/worker
 *   npx tsx scripts/verify-mainnet-address.ts [expected-address]
 *
 * Requires:
 *   - GCP authentication (gcloud auth application-default login)
 *   - GCP_KMS_KEY_RESOURCE_NAME env var or defaults to production key
 *
 * Story: P7-TS-04
 */

import * as bitcoin from 'bitcoinjs-lib';
import { GcpKmsSigningProvider } from '../src/chain/gcp-kms-signing-provider.js';

const PRODUCTION_KEY_RESOURCE =
  'projects/arkova1/locations/global/keyRings/arkova-signing/cryptoKeys/bitcoin-mainnet/cryptoKeyVersions/1';

async function main(): Promise<void> {
  console.log('=== Arkova Mainnet Address Verification ===\n');

  const keyResource = process.env.GCP_KMS_KEY_RESOURCE_NAME ?? PRODUCTION_KEY_RESOURCE;
  const expectedAddress = process.argv[2];

  console.log(`KMS Key:  ${keyResource.replace(/projects\/[^/]+/, 'projects/***')}`);
  console.log('');

  // 1. Derive address from GCP KMS
  console.log('--- Deriving address from GCP KMS ---');
  let address: string;
  try {
    const provider = await GcpKmsSigningProvider.create({
      keyResourceName: keyResource,
      projectId: 'arkova1',
    });

    const payment = bitcoin.payments.p2wpkh({
      pubkey: provider.getPublicKey(),
      network: bitcoin.networks.bitcoin, // mainnet
    });

    if (!payment.address) {
      throw new Error('Failed to derive P2WPKH address from KMS public key');
    }

    address = payment.address;
    console.log(`Derived:  ${address}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`FAILED: Cannot derive address from KMS — ${msg}`);
    console.error('');
    console.error('Ensure you have GCP authentication:');
    console.error('  gcloud auth application-default login');
    console.error('  gcloud config set project arkova1');
    process.exit(1);
  }

  // 2. Compare to expected address if provided
  if (expectedAddress) {
    console.log(`Expected: ${expectedAddress}`);
    if (address === expectedAddress) {
      console.log('MATCH ✓ — KMS-derived address matches expected address');
    } else {
      console.error('MISMATCH ✗ — addresses do not match!');
      console.error('The KMS key may have changed, or the expected address is incorrect.');
      process.exit(1);
    }
  }

  // 3. Check mempool.space for balance
  console.log('\n--- Checking mainnet balance (mempool.space) ---');
  try {
    const resp = await fetch(`https://mempool.space/api/address/${address}`);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = (await resp.json()) as {
      chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
      mempool_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
    };

    const confirmedBalance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    const mempoolBalance = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
    const totalSats = confirmedBalance + mempoolBalance;

    console.log(`Confirmed:  ${confirmedBalance} sats (${(confirmedBalance / 1e8).toFixed(8)} BTC)`);
    console.log(`Mempool:    ${mempoolBalance} sats`);
    console.log(`Total:      ${totalSats} sats (${(totalSats / 1e8).toFixed(8)} BTC)`);
    console.log(`Tx count:   ${data.chain_stats.tx_count} confirmed, ${data.mempool_stats.tx_count} pending`);

    // Estimate anchoring capacity: ~300-500 sats per OP_RETURN tx
    if (totalSats > 0) {
      const estimatedTxs = Math.floor(totalSats / 500);
      console.log(`\nEstimated anchoring capacity: ~${estimatedTxs.toLocaleString()} transactions`);
    } else {
      console.log('\nWARNING: Treasury is unfunded. Send BTC to this address before enabling mainnet.');
    }

    console.log(`\nExplorer: https://mempool.space/address/${address}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`Could not check balance: ${msg}`);
    console.log(`Check manually: https://mempool.space/address/${address}`);
  }

  // 4. Deployment readiness summary
  console.log('\n--- Mainnet Deployment Checklist ---');
  console.log(`[${address.startsWith('bc1q') ? '✓' : '✗'}] Address format is bc1q (P2WPKH mainnet)`);
  console.log(`[✓] KMS key accessible`);
  console.log(`[?] Treasury funded (check balance above)`);
  console.log(`[?] BITCOIN_NETWORK=mainnet in worker-deploy.yml`);
  console.log(`[?] Cross-project IAM (Cloud Run SA → KMS CryptoKey Signer)`);
  console.log('');
  console.log('To flip to mainnet:');
  console.log('  1. Fund treasury address with BTC');
  console.log('  2. Edit .github/workflows/worker-deploy.yml:');
  console.log('     BITCOIN_NETWORK=signet → BITCOIN_NETWORK=mainnet');
  console.log('  3. Push to main to trigger deploy');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
