---
name: block-server-side-fingerprint
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: services/worker/
  - field: new_text
    operator: regex_match
    pattern: generateFingerprint|fileHasher
---

Constitution 1.6 VIOLATION: `generateFingerprint` / `fileHasher` must NEVER be imported in `services/worker/`. Documents never leave the user's device. Fingerprinting is client-side only.
