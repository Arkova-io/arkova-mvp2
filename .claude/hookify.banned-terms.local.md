---
name: warn-banned-ui-terms
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(tsx|jsx)$
  - field: new_text
    operator: regex_match
    pattern: \b(Wallet|Blockchain|Bitcoin|Crypto|Testnet|Mainnet|UTXO)\b
---

Constitution 1.3 WARNING: Banned UI term detected in a component file. These terms must never appear in user-visible strings. Use approved alternatives from `src/lib/copy.ts` (e.g., "Fee Account" not "Wallet", "Test Environment" not "Testnet").
