# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.293 |
| Expected Calibration Error | 2.8% |
| Max Calibration Error | 75.0% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 4 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 4 | 12.0% | 58.3% | -46.3pp (underconfident) |
| 20-40% | 1 | 25.0% | 100.0% | -75.0pp (underconfident) |
| 40-60% | 1 | 45.0% | 60.0% | -15.0pp (underconfident) |
| 60-80% | 16 | 74.8% | 87.9% | -13.1pp (underconfident) |
| 80-90% | 168 | 85.5% | 85.0% | +0.5pp |
| 90-100% | 20 | 91.3% | 93.1% | -1.8pp |

## Recalibration Recommendations

- Pearson r = 0.293 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 0-20%: underconfident by 46.3pp (reports 12% confidence, actual 58% accuracy).
- Bucket 20-40%: underconfident by 75.0pp (reports 25% confidence, actual 100% accuracy).
- Bucket 40-60%: underconfident by 15.0pp (reports 45% confidence, actual 60% accuracy).
- Bucket 60-80%: underconfident by 13.1pp (reports 75% confidence, actual 88% accuracy).