# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.299 |
| Expected Calibration Error | 3.0% |
| Max Calibration Error | 50.0% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 3 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 4 | 12.0% | 58.3% | -46.3pp (underconfident) |
| 20-40% | 2 | 30.0% | 80.0% | -50.0pp (underconfident) |
| 40-60% | 0 | — | — | — |
| 60-80% | 16 | 74.8% | 89.4% | -14.6pp (underconfident) |
| 80-90% | 166 | 85.5% | 85.0% | +0.4pp |
| 90-100% | 22 | 91.1% | 92.5% | -1.3pp |

## Recalibration Recommendations

- Pearson r = 0.299 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 0-20%: underconfident by 46.3pp (reports 12% confidence, actual 58% accuracy).
- Bucket 20-40%: underconfident by 50.0pp (reports 30% confidence, actual 80% accuracy).
- Bucket 60-80%: underconfident by 14.6pp (reports 75% confidence, actual 89% accuracy).