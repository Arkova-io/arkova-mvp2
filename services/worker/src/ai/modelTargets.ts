/**
 * Dual-Model Target Configuration (AI-004)
 *
 * Chrome caps WebGPU VRAM at ~4GB per tab. An 8B 4-bit quantized model
 * at 3.5GB is borderline — leaves no room for KV cache. Use 3B for
 * browser, 8B for server.
 *
 * Server model: Llama 3.2 8B — full accuracy, no VRAM constraints
 * Client model: Llama 3.2 3B — 4-bit quantized, ONNX export, <2GB
 *
 * This module defines the target configurations for both models and
 * provides helpers for the training exporter to produce compatible
 * training data formats.
 */

/** Model deployment target */
export interface ModelTarget {
  /** Display name */
  name: string;
  /** Model identifier (HuggingFace-style) */
  baseModel: string;
  /** Parameter count in billions */
  parametersBillions: number;
  /** Target quantization level */
  quantization: '4bit' | '8bit' | 'fp16' | 'fp32';
  /** Target export format */
  exportFormat: 'safetensors' | 'onnx' | 'gguf';
  /** Maximum VRAM budget in MB */
  maxVramMb: number;
  /** Minimum context window in tokens */
  minContextTokens: number;
  /** Deployment environment */
  environment: 'server' | 'client';
  /** Whether this target is enabled */
  enabled: boolean;
}

/** Server-side model target (8B, full accuracy) */
export const SERVER_MODEL: ModelTarget = {
  name: 'Nessie Server (8B)',
  baseModel: 'meta-llama/Llama-3.2-8B',
  parametersBillions: 8,
  quantization: '4bit',
  exportFormat: 'safetensors',
  maxVramMb: 8192,
  minContextTokens: 8192,
  environment: 'server',
  enabled: true,
};

/** Client-side model target (3B, browser-optimized) */
export const CLIENT_MODEL: ModelTarget = {
  name: 'Nessie Client (3B)',
  baseModel: 'meta-llama/Llama-3.2-3B',
  parametersBillions: 3,
  quantization: '4bit',
  exportFormat: 'onnx',
  maxVramMb: 2048, // Must stay under 2GB for Chrome WebGPU
  minContextTokens: 4096,
  environment: 'client',
  enabled: true,
};

/** All configured model targets */
export const MODEL_TARGETS: ModelTarget[] = [SERVER_MODEL, CLIENT_MODEL];

/** Training data format for fine-tuning */
export interface TrainingExample {
  /** Input prompt (PII-stripped credential text) */
  input: string;
  /** Expected structured output (JSON string) */
  output: string;
  /** Credential type for stratified sampling */
  credentialType: string;
  /** Source record fingerprint */
  fingerprint: string;
}

/** Export configuration per model target */
export interface ExportConfig {
  target: ModelTarget;
  /** Output directory for this target's training data */
  outputDir: string;
  /** Maximum sequence length for this target */
  maxSeqLength: number;
  /** Whether to include few-shot examples in training data */
  includeFewShot: boolean;
}

/**
 * Get export configurations for all enabled model targets.
 *
 * @param baseOutputDir - Base directory for training data exports
 * @returns Array of export configs, one per enabled target
 */
export function getExportConfigs(baseOutputDir: string): ExportConfig[] {
  return MODEL_TARGETS
    .filter((t) => t.enabled)
    .map((target) => ({
      target,
      outputDir: `${baseOutputDir}/${target.environment}-${target.parametersBillions}b`,
      maxSeqLength: target.minContextTokens,
      includeFewShot: target.environment === 'server', // Only server gets few-shot
    }));
}

/**
 * Estimate quantized model size in MB.
 *
 * @param paramBillions - Parameter count in billions
 * @param quantBits - Quantization bits (4 or 8)
 * @returns Estimated size in MB
 */
export function estimateModelSize(paramBillions: number, quantBits: 4 | 8): number {
  // Each parameter takes quantBits / 8 bytes
  // Plus ~10% overhead for metadata, embeddings, etc.
  const bytesPerParam = quantBits / 8;
  const rawSizeMb = (paramBillions * 1e9 * bytesPerParam) / (1024 * 1024);
  return Math.round(rawSizeMb * 1.1);
}

/**
 * Check if a model target fits within its VRAM budget.
 */
export function fitsVramBudget(target: ModelTarget): boolean {
  const quantBits = target.quantization === '4bit' ? 4 : target.quantization === '8bit' ? 8 : 16;
  const estimatedSize = estimateModelSize(target.parametersBillions, quantBits as 4 | 8);
  return estimatedSize <= target.maxVramMb;
}
