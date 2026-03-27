# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.230 |
| Expected Calibration Error | 6.3% |
| Max Calibration Error | 62.9% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 3 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 28 | 10.1% | 73.0% | -62.9pp (underconfident) |
| 20-40% | 26 | 29.0% | 76.3% | -47.3pp (underconfident) |
| 40-60% | 42 | 46.8% | 64.7% | -17.9pp (underconfident) |
| 60-80% | 428 | 75.2% | 79.3% | -4.1pp |
| 80-90% | 470 | 83.7% | 85.4% | -1.6pp |
| 90-100% | 36 | 92.0% | 86.0% | +6.0pp |

## Recalibration Recommendations

- Pearson r = 0.230 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 0-20%: underconfident by 62.9pp (reports 10% confidence, actual 73% accuracy).
- Bucket 20-40%: underconfident by 47.3pp (reports 29% confidence, actual 76% accuracy).
- Bucket 40-60%: underconfident by 17.9pp (reports 47% confidence, actual 65% accuracy).