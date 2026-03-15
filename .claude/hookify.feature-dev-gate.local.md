---
name: require-feature-dev-for-new-features
enabled: true
event: prompt
action: warn
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: (?i)(implement|build|create|add)\s+(a |the |new )?(feature|component|page|endpoint|hook|migration|story|module)
---

## Feature Dev Workflow Available

This looks like a new feature request. Consider using the structured `/feature-dev` workflow:

```
/feature-dev <description>
```

This runs a 7-phase process: Discovery → Codebase Exploration → Clarifying Questions → Architecture Design → Implementation → Quality Review → Summary.

Skip this for simple bug fixes, doc updates, or single-file changes.
