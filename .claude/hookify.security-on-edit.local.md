---
name: security-review-on-sensitive-files
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (auth|login|signup|stripe|webhook|chain|signing|kms|config|\.env|middleware|rls|security)
---

## Security Mandate — Sensitive File Edit

You're editing a security-sensitive file. Per the Security Mandate, before finalizing:

- [ ] Scan for hardcoded secrets, API keys, PII in logs
- [ ] Check for command injection, SQL injection, XSS, path traversal
- [ ] Confirm RLS policies cover new tables/columns
- [ ] Verify no PII leakage in error messages or Sentry events
