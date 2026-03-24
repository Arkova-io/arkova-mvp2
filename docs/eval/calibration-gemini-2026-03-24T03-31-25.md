# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.005 |
| Expected Calibration Error | 17.1% |
| Max Calibration Error | 81.9% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 3 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 9 | 10.3% | 92.2% | -81.9pp (underconfident) |
| 20-40% | 0 | — | — | — |
| 40-60% | 4 | 55.5% | 95.8% | -40.3pp (underconfident) |
| 60-80% | 176 | 73.6% | 92.0% | -18.4pp (underconfident) |
| 80-90% | 115 | 83.7% | 93.7% | -9.9pp |
| 90-100% | 6 | 92.5% | 90.5% | +2.0pp |

## Recalibration Recommendations

- Pearson r = 0.005 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- ECE = 17.1% — expected calibration error is high. Model is generally underconfident.
- Bucket 0-20%: underconfident by 81.9pp (reports 10% confidence, actual 92% accuracy).
- Bucket 40-60%: underconfident by 40.3pp (reports 56% confidence, actual 96% accuracy).
- Bucket 60-80%: underconfident by 18.4pp (reports 74% confidence, actual 92% accuracy).
- PROMPT FIX: Add instruction "Your confidence scores are 17pp lower than actual accuracy. Be more confident in your extractions."