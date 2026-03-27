# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: CALIBRATED

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.944 |
| Expected Calibration Error | 16.7% |
| Max Calibration Error | 63.8% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 4 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 751 | 0.1% | 18.3% | -18.2pp (underconfident) |
| 20-40% | 3 | 26.7% | 90.5% | -63.8pp (underconfident) |
| 40-60% | 13 | 45.2% | 79.4% | -34.2pp (underconfident) |
| 60-80% | 137 | 75.1% | 90.1% | -15.0pp (underconfident) |
| 80-90% | 121 | 84.0% | 91.5% | -7.4pp |
| 90-100% | 5 | 92.2% | 90.3% | +1.9pp |

## Recalibration Recommendations

- ECE = 16.7% — expected calibration error is high. Model is generally underconfident.
- Bucket 0-20%: underconfident by 18.2pp (reports 0% confidence, actual 18% accuracy).
- Bucket 20-40%: underconfident by 63.8pp (reports 27% confidence, actual 90% accuracy).
- Bucket 40-60%: underconfident by 34.2pp (reports 45% confidence, actual 79% accuracy).
- Bucket 60-80%: underconfident by 15.0pp (reports 75% confidence, actual 90% accuracy).