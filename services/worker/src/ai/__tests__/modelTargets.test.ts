/**
 * AI-004: Dual-Model Target Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SERVER_MODEL,
  CLIENT_MODEL,
  MODEL_TARGETS,
  getExportConfigs,
  estimateModelSize,
  fitsVramBudget,
} from '../modelTargets.js';

describe('AI-004: Model Targets', () => {
  it('server model is 8B', () => {
    expect(SERVER_MODEL.parametersBillions).toBe(8);
    expect(SERVER_MODEL.environment).toBe('server');
    expect(SERVER_MODEL.exportFormat).toBe('safetensors');
  });

  it('client model is 3B', () => {
    expect(CLIENT_MODEL.parametersBillions).toBe(3);
    expect(CLIENT_MODEL.environment).toBe('client');
    expect(CLIENT_MODEL.exportFormat).toBe('onnx');
  });

  it('client model targets 4-bit quantization', () => {
    expect(CLIENT_MODEL.quantization).toBe('4bit');
  });

  it('client model stays under 2GB VRAM', () => {
    expect(CLIENT_MODEL.maxVramMb).toBeLessThanOrEqual(2048);
  });

  it('client model has minimum 4096 context window', () => {
    expect(CLIENT_MODEL.minContextTokens).toBeGreaterThanOrEqual(4096);
  });

  it('has exactly 2 model targets', () => {
    expect(MODEL_TARGETS).toHaveLength(2);
  });

  it('both targets are enabled by default', () => {
    expect(MODEL_TARGETS.every((t) => t.enabled)).toBe(true);
  });
});

describe('AI-004: getExportConfigs', () => {
  it('returns configs for both targets', () => {
    const configs = getExportConfigs('/tmp/training');
    expect(configs).toHaveLength(2);
  });

  it('creates correct output directories', () => {
    const configs = getExportConfigs('/tmp/training');
    const serverConfig = configs.find((c) => c.target.environment === 'server');
    const clientConfig = configs.find((c) => c.target.environment === 'client');

    expect(serverConfig?.outputDir).toBe('/tmp/training/server-8b');
    expect(clientConfig?.outputDir).toBe('/tmp/training/client-3b');
  });

  it('includes few-shot only for server', () => {
    const configs = getExportConfigs('/tmp/training');
    const serverConfig = configs.find((c) => c.target.environment === 'server');
    const clientConfig = configs.find((c) => c.target.environment === 'client');

    expect(serverConfig?.includeFewShot).toBe(true);
    expect(clientConfig?.includeFewShot).toBe(false);
  });

  it('sets maxSeqLength from target minContextTokens', () => {
    const configs = getExportConfigs('/tmp/training');
    const clientConfig = configs.find((c) => c.target.environment === 'client');
    expect(clientConfig?.maxSeqLength).toBe(CLIENT_MODEL.minContextTokens);
  });
});

describe('AI-004: estimateModelSize', () => {
  it('estimates 3B 4-bit model under 2GB', () => {
    const sizeMb = estimateModelSize(3, 4);
    expect(sizeMb).toBeLessThan(2048);
  });

  it('estimates 8B 4-bit model around 4.4GB', () => {
    const sizeMb = estimateModelSize(8, 4);
    expect(sizeMb).toBeGreaterThan(3000);
    expect(sizeMb).toBeLessThan(5000);
  });

  it('8-bit is roughly 2x 4-bit', () => {
    const size4 = estimateModelSize(3, 4);
    const size8 = estimateModelSize(3, 8);
    expect(size8 / size4).toBeCloseTo(2.0, 0);
  });
});

describe('AI-004: fitsVramBudget', () => {
  it('3B client fits in 2GB budget', () => {
    expect(fitsVramBudget(CLIENT_MODEL)).toBe(true);
  });

  it('8B server fits in 8GB budget', () => {
    expect(fitsVramBudget(SERVER_MODEL)).toBe(true);
  });

  it('detects when model exceeds budget', () => {
    const overbudget = {
      ...CLIENT_MODEL,
      parametersBillions: 8, // 8B won't fit in 2GB
    };
    expect(fitsVramBudget(overbudget)).toBe(false);
  });
});
