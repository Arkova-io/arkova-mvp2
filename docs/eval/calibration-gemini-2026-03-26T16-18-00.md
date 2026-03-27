# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.317 |
| Expected Calibration Error | 10.6% |
| Max Calibration Error | 51.2% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 4 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 15 | 7.2% | 50.6% | -43.4pp (underconfident) |
| 20-40% | 4 | 25.0% | 76.2% | -51.2pp (underconfident) |
| 40-60% | 9 | 51.9% | 77.8% | -25.9pp (underconfident) |
| 60-80% | 383 | 74.2% | 87.6% | -13.4pp (underconfident) |
| 80-90% | 299 | 84.4% | 89.3% | -5.0pp |
| 90-100% | 40 | 92.1% | 87.0% | +5.0pp |

## Recalibration Recommendations

- Pearson r = 0.317 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 0-20%: underconfident by 43.4pp (reports 7% confidence, actual 51% accuracy).
- Bucket 20-40%: underconfident by 51.2pp (reports 25% confidence, actual 76% accuracy).
- Bucket 40-60%: underconfident by 25.9pp (reports 52% confidence, actual 78% accuracy).
- Bucket 60-80%: underconfident by 13.4pp (reports 74% confidence, actual 88% accuracy).
- PROMPT FIX: Add instruction "Your confidence scores are 10pp lower than actual accuracy. Be more confident in your extractions."