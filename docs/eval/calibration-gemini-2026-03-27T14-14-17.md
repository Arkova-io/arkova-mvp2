# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: CALIBRATED

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.859 |
| Expected Calibration Error | 16.9% |
| Max Calibration Error | 60.7% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 3 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 1003 | 0.0% | 17.0% | -16.9pp (underconfident) |
| 20-40% | 1 | 25.0% | 85.7% | -60.7pp (underconfident) |
| 40-60% | 0 | — | — | — |
| 60-80% | 10 | 73.9% | 91.7% | -17.8pp (underconfident) |
| 80-90% | 15 | 83.8% | 92.6% | -8.8pp |
| 90-100% | 1 | 93.0% | 100.0% | -7.0pp |

## Recalibration Recommendations

- ECE = 16.9% — expected calibration error is high. Model is generally underconfident.
- Bucket 0-20%: underconfident by 16.9pp (reports 0% confidence, actual 17% accuracy).
- Bucket 20-40%: underconfident by 60.7pp (reports 25% confidence, actual 86% accuracy).
- Bucket 60-80%: underconfident by 17.8pp (reports 74% confidence, actual 92% accuracy).