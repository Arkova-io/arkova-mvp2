---
name: claude-md-freshness-check
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: (?i)(start|begin|continue|resume|pick up|what.s next|sprint|status)
---

## CLAUDE.md Freshness Reminder

Starting a new work session. If it's been a while since the last audit, run:

```
"audit my CLAUDE.md files"
```

This checks for stale sections, outdated counts, and missing context. Last audit results are in HANDOFF.md session logs.
