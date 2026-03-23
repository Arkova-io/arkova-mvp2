# Confidence Calibration Report (AI-EVAL-02)

## Calibration Status: NEEDS RECALIBRATION

| Metric | Value |
|--------|-------|
| Pearson Correlation (r) | 0.426 |
| Expected Calibration Error | 13.5% |
| Max Calibration Error | 45.4% |
| Overconfident Buckets | 1 |
| Underconfident Buckets | 3 |

## Calibration Table

| Confidence Bucket | Count | Mean Confidence | Mean Accuracy | Gap |
|-------------------|-------|-----------------|---------------|-----|
| 0-20% | 3 | 3.3% | 15.9% | -12.5pp (underconfident) |
| 20-40% | 4 | 28.8% | 74.2% | -45.4pp (underconfident) |
| 40-60% | 1 | 45.0% | 50.0% | -5.0pp |
| 60-80% | 2 | 70.0% | 83.3% | -13.3pp (underconfident) |
| 80-90% | 10 | 85.0% | 77.3% | +7.7pp |
| 90-100% | 190 | 94.9% | 81.8% | +13.2pp (overconfident) |

## Recalibration Recommendations

- Pearson r = 0.426 (target >= 0.80). Confidence scores do not reliably predict accuracy.
- Bucket 90-100%: overconfident by 13.2pp (reports 95% confidence, actual 82% accuracy). Consider adding a prompt instruction to lower confidence when 90-100 confidence.
- Bucket 0-20%: underconfident by 12.5pp (reports 3% confidence, actual 16% accuracy).
- Bucket 20-40%: underconfident by 45.4pp (reports 29% confidence, actual 74% accuracy).
- Bucket 60-80%: underconfident by 13.3pp (reports 70% confidence, actual 83% accuracy).
- PROMPT FIX: Add instruction "Your confidence scores tend to be 11pp higher than actual accuracy. Be more conservative — lower your confidence by approximately 11 points."