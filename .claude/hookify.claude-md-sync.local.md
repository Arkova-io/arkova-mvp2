---
name: require-claude-md-sync
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: regex_match
    pattern: (git commit|COMPLETE|RESOLVED|new story|new migration|status changed)
  - field: transcript
    operator: not_contains
    pattern: CLAUDE.md updated|HANDOFF.md updated|docs updated|/revise-claude-md|Docs synced
---

## Documentation Sync Required

Story status, migrations, or completions occurred but **project docs were not updated**.

Before finishing, check and update:

1. **CLAUDE.md Section 8** — Story status table (if any story changed status)
2. **HANDOFF.md** — Session log entry with what was done
3. **docs/stories/** — Group doc for any changed stories
4. **00_stories_index.md** — Completion summary counts

Say "Docs synced" after updating to proceed.
