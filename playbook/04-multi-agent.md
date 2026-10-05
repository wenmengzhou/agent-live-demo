# Multi-agent patterns

## Why more than one agent

A single agent hits three limits:
- Its context fills up on long tasks, and it starts forgetting earlier decisions.
- It does one thing at a time.
- It has blind spots reviewing its own work.

## Four patterns

| Pattern | Shape | Good for |
|---|---|---|
| 1. Parallel fan-out | You → agents A, B, C (each on its own branch) → you review | Independent tasks at once |
| 2. Orchestrator | A lead agent splits the work, sub-agents do the pieces, the lead merges | Broad research, large refactors |
| 3. Writer + reviewer | One agent writes, a different one reviews, the writer fixes, a human approves | Every PR |
| 4. Relay handoff | A stuck agent writes a handoff doc; a fresh agent continues from it | Long or stuck tasks |

### Pattern 3: writer + reviewer

1. **Agent A writes** (e.g. Claude Code implements and opens the PR).
2. **Agent B reviews** (e.g. Codex, a different model, reviews the diff).
3. **Agent A fixes** the findings until CI is green.
4. **A human approves**, focusing on design and intent.

Why a different model: each model has its own blind spots, and a second one catches what the first missed. Agent reviews are cheap, so every PR gets one.
Humans still own: is this the right change at all, design and architecture, and the final approval.

Typical catch: a writer agent added a retry around a payment-style API call. Clean code, green tests. The reviewer pointed out the call wasn't idempotent, so a retry after a timeout could charge twice. The writer added an idempotency key and a test before any human looked.

Try it: [`demo/writer-reviewer.sh`](../demo/writer-reviewer.sh). Review prompt: [demo/prompts/review.md](../demo/prompts/review.md).

### Pattern 4: relay handoff

Pass the baton, not the mess. When an agent is going in circles or its context is long, don't keep pushing. Ask it to write a [handoff note](handoff-template.md), then start a fresh agent, often a different tool, from the note and the branch alone. The second agent gets the decisions, not the noise.

When to hand off: the agent is going in circles; its context is long and it starts forgetting; you want a fresh pair of eyes; work should continue somewhere else.

Typical case: an agent spent a long session on a flaky integration test, alternating between the same two fixes, its context full of old logs. Its handoff note listed the goal, the changes, and the two theories it had ruled out. A fresh agent read only that, noticed the test depended on map ordering, and fixed it in minutes.

Try it: [`demo/handoff.sh`](../demo/handoff.sh). Prompt: [demo/prompts/handoff.md](../demo/prompts/handoff.md).

## The cost of more agents

| Cost | What happens |
|---|---|
| Higher spend | More tokens and compute for every extra agent |
| Conflicts | Parallel agents edit the same files |
| Coordination | Someone has to split, merge and review it all, usually you |
| Compounding errors | One agent's mistake becomes another's input |

**Rule of thumb:** if one agent can do it, use one agent. Add agents when you hit a real limit: context, speed, or the need for an independent review.
