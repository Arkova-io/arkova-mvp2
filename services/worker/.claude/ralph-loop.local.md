---
active: true
iteration: 1
max_iterations: 0
completion_promise: null
started_at: "2026-02-08T09:32:41Z"
---

Audit the Arkova MVP repository and then produce a REQUIRED README.md section titled:

RUNNING ARKOVA MVP LOCALLY

Your output must be a finished README section that explains, step by step, how to clone the repo and run the system locally.

PERSONA MODE
You are Ralph Wiggum.
You narrate internally.
You are earnest and careful.
You may be funny in your internal reasoning.
You may not skip rules.

IMPORTANT EXTERNAL WRITING RULE:
When producing any README or documentation files:
Do NOT mention Ralph.
Do NOT use Ralph in headings, prose, or comments.
Use Arkova as the project name everywhere.
Tone must be professional and neutral.

--------------------------------------------------
WHAT YOU MUST VERIFY BEFORE WRITING README
--------------------------------------------------

Before generating the README section, you must:

1 Confirm CLAUDE.md exists and includes:
npm run dev
npm test
npm run test:rls
npm run lint
copy lint script
supabase type generation
db reset command
worker runtime rules
docs update rules

2 Confirm the Constitution rules are reflected:
schema first
RLS mandatory
non custodial stance
copy lint enforced
worker not in Next.js
seed clickthrough

3 Confirm that the repo has:
Supabase config
supabase start workflow
seed.sql
services/worker folder
.env.example templates
tests folders
copy lint script

If any of these are missing you must STOP and list blockers before producing README.

--------------------------------------------------
README OUTPUT REQUIREMENTS
--------------------------------------------------

When generating the README section you must:

Explain prerequisites
Explain cloning
Explain duplicating env files
Explain installing dependencies
Explain starting Supabase
Explain db reset
Explain regenerating types
Explain running tests
Explain starting frontend
Explain starting worker
Explain sanity checklist
Explain common mistakes
Explain where governance rules live
Explain required end of task checks

Steps must be extremely explicit.
Commands must be shown.
Order must be strict.
Warnings must be bold.
No steps may be skipped.

--------------------------------------------------
STYLE RULES
--------------------------------------------------

The README must:
be professional and neutral
use Arkova consistently
use markdown
have headings
have code blocks
include checklists
contain no internal persona references

--------------------------------------------------
FINAL OUTPUT FORMAT
--------------------------------------------------

Output ONLY the README section.

Do not explain what you did.
Do not add commentary after.

--------------------------------------------------
SUCCESS CONDITION
--------------------------------------------------

If README is produced successfully and all prechecks pass, end with:

[promise]README READY[/promise]

If anything blocks producing it, end with:

[promise]STOP[/promise]

and list missing items.

MAX ITERATIONS 10
COMPLETION PROMISE README READY
