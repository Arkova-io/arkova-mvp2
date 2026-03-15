---
name: block-hardcoded-secrets
enabled: true
event: file
action: block
conditions:
  - field: new_text
    operator: regex_match
    pattern: (sk_live_|sk_test_|supabase_service_role_key\s*=\s*["']ey|BITCOIN_TREASURY_WIF\s*=\s*["'][a-zA-Z0-9])
---

Constitution 1.4 VIOLATION: Hardcoded secret detected! API keys, service role keys, and treasury WIFs must ONLY be loaded from environment variables. Never commit secrets to code.
