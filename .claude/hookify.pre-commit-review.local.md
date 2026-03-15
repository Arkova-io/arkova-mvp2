---
name: require-pr-review-before-stop
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: regex_match
    pattern: (git commit|git add|Write\(|Edit\()
  - field: transcript
    operator: not_contains
    pattern: code-reviewer|pr-test-analyzer|silent-failure-hunter|/simplify|Review complete
---

## Pre-Commit Review Required

Code was written or edited in this session but **no review agents were run**.

Before finishing, systematically run through these checks:

1. **code-reviewer** — Check CLAUDE.md compliance, bugs, style
2. **pr-test-analyzer** — Verify test coverage for changed code
3. **silent-failure-hunter** — Check error handling in new code
4. **code-simplifier** — Look for unnecessary complexity

Say "Review complete" after running these to proceed.
