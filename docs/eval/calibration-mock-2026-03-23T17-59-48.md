# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | -0.000 |
| Expected Calibration Error | 54.3% |
| Max Calibration Error | 54.3% |
| Overconfident Buckets | 1 |
| Underconfident Buckets | 0 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 0 | — | — | — |
| 20-40% | 0 | — | — | — |
| 40-60% | 0 | — | — | — |
| 60-80% | 0 | — | — | — |
| 80-90% | 210 | 85.0% | 30.7% | +54.3pp (overconfident) |
| 90-100% | 0 | — | — | — |

## Recalibration Recommendations

- Pearson r = -0.000 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- ECE = 54.3% — expected calibration error is high. Model is generally overconfident.
- Bucket 80-90%: overconfident by 54.3pp (reports 85% confidence, actual 31% accuracy). Consider adding a prompt instruction to lower confidence when 80-90 confidence.
- PROMPT FIX: Add instruction "Your confidence scores tend to be 54pp higher than actual accuracy. Be more conservative — lower your confidence by approximately 54 points."