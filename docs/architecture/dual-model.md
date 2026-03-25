# Dual-Model Architecture (AI-004)

## Problem

Chrome caps WebGPU VRAM at ~4GB per tab. An 8B 4-bit quantized model at 3.5GB is borderline — leaves no room for KV cache. Browser inference with 8B models causes OOM crashes on mid-range hardware.

## Solution: Dual-Model Strategy

Maintain two fine-tuned model variants from the same training data:

| Property | Server Model | Client Model |
|----------|-------------|--------------|
| Base | Llama 3.2 8B | Llama 3.2 3B |
| Quantization | 4-bit (GPTQ) | 4-bit (GPTQ) |
| Export Format | SafeTensors | ONNX (WebGPU) |
| Estimated Size | ~4.4 GB | ~1.6 GB |
| VRAM Budget | 8 GB | 2 GB |
| Context Window | 8192 tokens | 4096 tokens |
| Use Case | Full accuracy extraction | In-browser inference |

## Training Pipeline

The training exporter (`services/worker/src/jobs/trainingExporter.ts`) produces JSONL data that feeds both model targets.

```
public_records (Supabase)
  ↓
trainingExporter.ts
  ↓
JSONL (shared format)
  ↓
┌────────────────────┬──────────────────────┐
│  server-8b/        │  client-3b/          │
│  - Full few-shot   │  - No few-shot       │
│  - 8192 max tokens │  - 4096 max tokens   │
│  - SafeTensors out │  - ONNX out          │
└────────────────────┴──────────────────────┘
```

## Configuration

Model targets are defined in `services/worker/src/ai/modelTargets.ts`:

- `SERVER_MODEL` — 8B server-side target
- `CLIENT_MODEL` — 3B client-side target
- `getExportConfigs(baseDir)` — returns export paths per target
- `estimateModelSize(params, bits)` — VRAM estimation
- `fitsVramBudget(target)` — budget validation

## Client-Side Constraints

- ONNX Runtime Web with WebGPU backend
- 4-bit quantization mandatory to stay under 2GB
- 4096 token context minimum (covers 95% of credential documents)
- No few-shot examples in training (saves context budget)
- Model loaded lazily on first extraction request

## Decision Log

- **Why 3B over Phi-3 mini?** Llama 3.2 3B has better instruction-following on structured extraction tasks. Phi-3 mini (3.8B) is close in size but Llama 3.2 family shares the same architecture, simplifying the training pipeline.
- **Why ONNX over GGUF?** ONNX Runtime Web has native WebGPU support. GGUF (llama.cpp) requires WASM compilation which adds ~2s cold start.
- **Why not fp16?** 3B at fp16 = ~6GB, far exceeding the 4GB Chrome VRAM cap.
