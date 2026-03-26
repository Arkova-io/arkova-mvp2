# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.172 |
| Expected Calibration Error | 10.9% |
| Max Calibration Error | 65.2% |
| Overconfident Buckets | 0 |
| Underconfident Buckets | 4 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 18 | 7.6% | 72.8% | -65.2pp (underconfident) |
| 20-40% | 7 | 31.4% | 87.6% | -56.2pp (underconfident) |
| 40-60% | 11 | 50.2% | 85.4% | -35.2pp (underconfident) |
| 60-80% | 502 | 73.9% | 86.2% | -12.2pp (underconfident) |
| 80-90% | 371 | 84.1% | 89.4% | -5.3pp |
| 90-100% | 41 | 92.0% | 85.4% | +6.5pp |

## Recalibration Recommendations

- Pearson r = 0.172 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 0-20%: underconfident by 65.2pp (reports 8% confidence, actual 73% accuracy).
- Bucket 20-40%: underconfident by 56.2pp (reports 31% confidence, actual 88% accuracy).
- Bucket 40-60%: underconfident by 35.2pp (reports 50% confidence, actual 85% accuracy).
- Bucket 60-80%: underconfident by 12.2pp (reports 74% confidence, actual 86% accuracy).
- PROMPT FIX: Add instruction "Your confidence scores are 10pp lower than actual accuracy. Be more confident in your extractions."