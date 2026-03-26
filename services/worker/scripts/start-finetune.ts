#!/usr/bin/env tsx
/**
 * Together AI Fine-Tune Launcher
 *
 * Uploads JSONL training data to Together AI and starts a fine-tune job.
 *
 * Usage:
 *   cd services/worker
 *   npx tsx scripts/start-finetune.ts [--file ./training-data/finetune-server-8b.jsonl]
 *
 * Requires:
 *   TOGETHER_API_KEY in .env
 *
 * After completion, set the resulting model ID as TOGETHER_MODEL in production.
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

dotenvConfig({ path: resolve(import.meta.dirname ?? '.', '../.env') });

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const BASE_URL = 'https://api.together.xyz/v1';
const BASE_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';

if (!TOGETHER_API_KEY) {
  console.error('ERROR: TOGETHER_API_KEY required in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
const filePath = fileIdx >= 0
  ? resolve(args[fileIdx + 1])
  : resolve(import.meta.dirname ?? '.', '../training-data/finetune-server-8b.jsonl');

async function main(): Promise<void> {
  console.log('=== Arkova Nessie Fine-Tune Launcher ===\n');
  console.log(`Training file: ${filePath}`);
  console.log(`Base model: ${BASE_MODEL}`);
  console.log('');

  // Validate file exists and count examples
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(`ERROR: Cannot read file: ${filePath}`);
    console.error('Run export-finetune-data.ts first to generate training data.');
    process.exit(1);
  }

  const lines = content.trim().split('\n').filter(l => l.length > 0);
  console.log(`Training examples: ${lines.length}`);

  if (lines.length < 10) {
    console.error('ERROR: Too few training examples (minimum 10 recommended)');
    process.exit(1);
  }

  // Step 1: Upload file
  console.log('\n--- Uploading training file ---');
  const formData = new FormData();
  formData.append('file', new Blob([content], { type: 'application/jsonl' }), 'training.jsonl');
  formData.append('purpose', 'fine-tune');

  const uploadRes = await fetch(`${BASE_URL}/files`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error(`Upload failed: ${uploadRes.status} ${err}`);
    process.exit(1);
  }

  const uploadData = await uploadRes.json() as { id: string; filename: string };
  console.log(`File uploaded: ${uploadData.id} (${uploadData.filename})`);

  // Step 2: Start fine-tune
  console.log('\n--- Starting fine-tune job ---');
  const ftRes = await fetch(`${BASE_URL}/fine-tunes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      training_file: uploadData.id,
      model: BASE_MODEL,
      n_epochs: 3,
      learning_rate: 1e-5,
      batch_size: 4,
      suffix: 'arkova-nessie',
    }),
  });

  if (!ftRes.ok) {
    const err = await ftRes.text();
    console.error(`Fine-tune creation failed: ${ftRes.status} ${err}`);
    process.exit(1);
  }

  const ftData = await ftRes.json() as { id: string; status: string; model_output_name: string };
  console.log(`Fine-tune job created: ${ftData.id}`);
  console.log(`Status: ${ftData.status}`);
  console.log(`Output model: ${ftData.model_output_name}`);

  console.log('\n--- Next steps ---');
  console.log(`1. Monitor: curl -H "Authorization: Bearer $TOGETHER_API_KEY" ${BASE_URL}/fine-tunes/${ftData.id}`);
  console.log(`2. When complete, set in worker .env:`);
  console.log(`   TOGETHER_MODEL=${ftData.model_output_name}`);
  console.log(`3. Redeploy worker to use the fine-tuned model`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
