# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | -0.050 |
| Expected Calibration Error | 17.9% |
| Max Calibration Error | 86.0% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 4 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 9 | 10.3% | 96.3% | -86.0pp (underconfident) |
| 20-40% | 0 | — | — | — |
| 40-60% | 4 | 55.5% | 95.8% | -40.3pp (underconfident) |
| 60-80% | 176 | 73.6% | 92.8% | -19.2pp (underconfident) |
| 80-90% | 114 | 83.8% | 94.2% | -10.5pp (underconfident) |
| 90-100% | 7 | 92.6% | 87.9% | +4.6pp |

## Recalibration Recommendations

- Pearson r = -0.050 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- ECE = 17.9% — expected calibration error is high. Model is generally underconfident.
- Bucket 0-20%: underconfident by 86.0pp (reports 10% confidence, actual 96% accuracy).
- Bucket 40-60%: underconfident by 40.3pp (reports 56% confidence, actual 96% accuracy).
- Bucket 60-80%: underconfident by 19.2pp (reports 74% confidence, actual 93% accuracy).
- Bucket 80-90%: underconfident by 10.5pp (reports 84% confidence, actual 94% accuracy).
- PROMPT FIX: Add instruction "Your confidence scores are 18pp lower than actual accuracy. Be more confident in your extractions."