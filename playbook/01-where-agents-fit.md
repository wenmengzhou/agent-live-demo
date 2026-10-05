# Where agents fit

## What an agent is

**Agent = model + tools + loop + environment.**

| Part | What it does |
|---|---|
| Model | Understands the task and plans the next step |
| Tools | Reads and edits files, runs commands, calls APIs |
| Loop | Acts, checks the result, and tries again |
| Environment | A repo, sandbox or workspace where it can run safely |

Autocomplete finishes your line. A chat assistant answers your question. An agent takes a goal and keeps working until it's done, checking its own work along the way. Because of the loop, the most important property of a task is whether its result can be checked.

## Four questions before you hand off a task

1. **Is the goal clear?** You can describe what "done" looks like.
2. **Can it be verified?** Tests, builds, linters or another runnable check.
3. **Is the context there?** What it needs is in the code and docs, not only in someone's head.
4. **Is a mistake cheap?** Easy to roll back; no production data, money or security at stake.

Four yeses: hand it off, even asynchronously. Any no: you can still use an agent, but a human covers that gap. No tests? Have the agent write characterization tests first. Unclear goal? Clarify it before you delegate.

## Scenario map: clear scope × easy to verify

| | Easy to verify | Hard to verify |
|---|---|---|
| **Clear scope** | **Hand it to the agent.** Bug fixes with tests, red CI, dependency upgrades. *You:* write the brief, review the PR. | **Agent does it, you review closely.** Docs, comments, renames, UI copy. *You:* read every line. |
| **Fuzzy scope** | **Explore together.** Prototypes, proofs of concept, experiments. *You:* pair and steer. | **You lead, the agent assists.** Architecture, requirements, security design. *You:* decide; the agent researches and drafts. |

## What agents can take on today

**In the codebase:** fix bugs and red CI; upgrade dependencies and migrate deprecated APIs; write unit tests and documentation; explain unfamiliar code with file references; build prototypes, scripts and internal tools; review pull requests.

**Around the codebase:** deploy to a test environment and run end-to-end tests; research tools and draft design docs; analyze logs and data; triage alerts; draft status reports and follow-ups.

## Where the biggest gains are

| Task | Why it pays off |
|---|---|
| Fixing red CI and bugs with tests | The agent loops on its own until the tests pass; you only review the result |
| Large mechanical changes | Upgrades and migrations: high volume, clear rules, and the compiler catches what's missed |
| Tests and documentation | Work that used to be skipped now gets done; the code is the source of truth |
| Understanding unfamiliar code | Read-only, so almost no risk, and ramp-up gets much faster |

The common thread is a **tight feedback loop**. Gains are smallest, or negative because of rework, where nobody can check the result.
