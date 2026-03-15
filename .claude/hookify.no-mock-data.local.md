---
name: warn-mock-data-in-hooks
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/hooks/
  - field: new_text
    operator: regex_match
    pattern: useState\(\[|mockData|fakeData|dummyData
---

Constitution 1.2 WARNING: Mock data or useState arrays detected in a hook file. Once a Supabase table exists for this data, hooks must query Supabase — never use mock arrays or useState to represent real data.
