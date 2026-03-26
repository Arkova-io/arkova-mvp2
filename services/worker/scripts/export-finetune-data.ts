#!/usr/bin/env tsx
/**
 * Fine-Tune Data Export CLI
 *
 * Pulls production anchor data (PII-stripped metadata only) and exports
 * stratified JSONL for Nessie fine-tuning on Together AI.
 *
 * Usage:
 *   cd services/worker
 *   npx tsx scripts/export-finetune-data.ts [--max-per-type 200] [--output-dir ./training-data]
 *
 * Requires:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Output:
 *   ./training-data/finetune-server-8b.jsonl
 *   ./training-data/finetune-client-3b.jsonl
 *
 * Constitution 1.6: Only PII-stripped metadata flows through this pipeline.
 * Constitution 4A: Document bytes never leave the user's device.
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  exportForAllTargets,
  type RawTrainingRecord,
} from '../src/ai/training/finetune-exporter.js';

// Load .env from worker directory
dotenvConfig({ path: resolve(import.meta.dirname ?? '.', '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env');
  process.exit(1);
}

// Parse CLI args
const args = process.argv.slice(2);
const maxPerTypeIdx = args.indexOf('--max-per-type');
const maxPerType = maxPerTypeIdx >= 0 ? parseInt(args[maxPerTypeIdx + 1], 10) : undefined;

const outputDirIdx = args.indexOf('--output-dir');
const outputDir = outputDirIdx >= 0
  ? resolve(args[outputDirIdx + 1])
  : resolve(import.meta.dirname ?? '.', '../training-data');

async function main(): Promise<void> {
  console.log('=== Arkova Fine-Tune Data Export ===\n');
  console.log(`Output dir: ${outputDir}`);
  console.log(`Max per type: ${maxPerType ?? 'unlimited'}`);
  console.log('');

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Fetch anchors with AI extraction metadata (PII-stripped only)
  console.log('Fetching anchors with extracted metadata...');

  let allRecords: RawTrainingRecord[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('anchors')
      .select('id, fingerprint, extracted_fields, credential_type, stripped_text')
      .not('extracted_fields', 'is', null)
      .not('stripped_text', 'is', null)
      .not('credential_type', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error(`ERROR: Failed to fetch anchors (page ${page}): ${error.message}`);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      allRecords.push({
        id: row.id,
        text: row.stripped_text as string,
        credentialType: row.credential_type as string,
        extractedFields: row.extracted_fields as Record<string, unknown>,
        fingerprint: row.fingerprint,
      });
    }

    page++;
    hasMore = data.length === pageSize;
    console.log(`  Fetched page ${page}: ${data.length} records (total: ${allRecords.length})`);
  }

  console.log(`\nTotal records with extraction data: ${allRecords.length}`);

  if (allRecords.length === 0) {
    console.log('No records with extraction data found. Nothing to export.');
    console.log('\nTo generate extraction data, run anchors through the AI extraction pipeline first.');
    process.exit(0);
  }

  // Export for all model targets
  console.log('\nExporting JSONL for all model targets...\n');

  const results = exportForAllTargets(allRecords, outputDir);

  for (const stats of results) {
    console.log(`--- ${stats.outputPath} ---`);
    console.log(`  Exported: ${stats.totalExported}`);
    console.log(`  Filtered: ${stats.totalFiltered}`);
    console.log(`  By type:`);
    for (const [type, count] of Object.entries(stats.byCredentialType).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type}: ${count}`);
    }
    if (stats.warnings.length > 0) {
      console.log(`  Warnings:`);
      for (const w of stats.warnings) {
        console.log(`    ⚠ ${w}`);
      }
    }
    console.log('');
  }

  console.log('Export complete!');
  console.log('\nNext steps:');
  console.log('  1. Review the JSONL files for quality');
  console.log('  2. Upload to Together AI: together files upload <file.jsonl>');
  console.log('  3. Start fine-tune: together fine-tuning create --model meta-llama/Meta-Llama-3.1-8B-Instruct --training-file <file-id>');
  console.log('  4. After training, set TOGETHER_MODEL=<trained-model-id> in worker .env');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
